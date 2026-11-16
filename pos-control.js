/* ═══════════ 🛡 CONTROL DE MESAS Y VENTAS ═══════════
   1. Quitar un producto de una mesa pide motivo; pasado un rato solo lo quita caja o administración.
   2. Cada mesa tiene responsable, hora de apertura y número de personas; la venta los guarda.
   3. El cierre de turno avisa de las mesas que siguen abiertas.
   4. Al imprimir la preorden la mesa queda «con la cuenta pedida» y avisa si le agregan después.
   5. Notas por producto y traslado de parte de la mesa.
   6. Ventas con número consecutivo; eliminar o devolver una venta pide motivo y solo vale en el día. */
var mesaInfo={},quitados=[],_ctl={oyendo:false,MIN_MESERO:5};
var CTL_MOTIVOS_QUITAR=['Error al anotar','El cliente lo devolvió','Cortesía de la casa','Se agotó, no había'];
var CTL_MOTIVOS_VENTA=['Cobro duplicado','Error en la forma de pago','Se cobró a la mesa equivocada','El cliente reclamó la cuenta'];
function ctlEscuchar(){
  if(_ctl.oyendo||!getDb())return;_ctl.oyendo=true;
  fbOn('mesaInfo',function(v){mesaInfo=v||{};if(tabActual==='mesas'&&!document.querySelector('#modal1[style*="flex"],#modal2[style*="flex"]'))render();});
  getDb().ref('quitados').limitToLast(400).on('value',function(s){var v=s.val();quitados=v?Object.keys(v).map(function(k){var o=v[k]||{};o._k=k;return o;}).sort(function(a,b){return b.ts-a.ts;}):[];if(tabActual==='ventas')render();});
}
function ctlInfo(mid){return mesaInfo[mid]||null;}
function ctlSet(mid,campo,val){if(!mesaInfo[mid])mesaInfo[mid]={};if(val==null)delete mesaInfo[mid][campo];else mesaInfo[mid][campo]=val;var r=ref('mesaInfo/'+mid+'/'+campo);if(r){if(val==null)r.remove();else r.set(val);}}
function ctlMin(ts){return Math.max(0,Math.round((a52Ahora()-ts)/60000));}
function ctlDur(m){return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min';}
function _ctlTsItem(it){var t=parseInt(String(it&&it.uidItem||'').substr(2,8),36);return (t>1.6e12&&t<4e12)?t:0;}
function ctlEsCaja(){return !!usuarioActivo&&usuarioActivo.rol!=='mesero';}

/* ══ Elegir de una lista corta (motivos, personas, meseros) ══ */
var _ctlPick=null;
function ctlElegir(titulo,sub,opciones,cb,conOtro){
  _ctlPick={cb:cb,op:opciones};
  setTimeout(function(){
    modal2('<div style="text-align:center;margin-bottom:12px"><div style="font-weight:800;font-size:16px">'+titulo+'</div>'+(sub?'<div style="color:var(--muted);font-size:12.5px;margin-top:3px">'+sub+'</div>':'')+'</div>'
      +'<div style="display:grid;gap:8px;'+(opciones.length>6?'grid-template-columns:repeat(5,1fr)':'')+'">'+opciones.map(function(o,i){return '<button class="btn btn-full" data-ctl-op="'+i+'" style="background:var(--card2);border:1px solid var(--border);color:var(--text);'+(opciones.length>6?'padding:14px 0;font-size:17px;font-weight:800':'text-align:left;padding:13px 14px')+'">'+esc(String(o.t!=null?o.t:o))+'</button>';}).join('')+'</div>'
      +(conOtro?'<div style="display:flex;gap:8px;margin-top:10px"><input class="inp" id="ctl-otro" placeholder="Otro motivo…" autocomplete="off" style="flex:1"><button class="btn" data-ctl-otro style="background:var(--accent);color:#fff;border:none">Usar</button></div>':'')
      +'<button class="btn btn-full" data-ctl-no style="background:none;border:1px solid var(--border);color:var(--muted);margin-top:10px">Cancelar</button>');
  },40);
}
document.addEventListener('click',function(e){
  if(!_ctlPick||!e.target.closest)return;
  var o=e.target.closest('[data-ctl-op]'),p=_ctlPick;
  if(o){_ctlPick=null;closeModal2();var x=p.op[Number(o.dataset.ctlOp)];p.cb(x.v!=null?x.v:x);return;}
  if(e.target.closest('[data-ctl-otro]')){var t=((document.getElementById('ctl-otro')||{}).value||'').trim();if(t.length<3){var i=document.getElementById('ctl-otro');if(i){i.placeholder='Escribe el motivo (mínimo 3 letras)';i.focus();}return;}_ctlPick=null;closeModal2();p.cb(t);return;}
  if(e.target.closest('[data-ctl-no]')){_ctlPick=null;closeModal2();}
});

/* ══ 1. Quitar productos de una mesa: motivo y permiso ══ */
var _aplicar0=_aplicarNuevaCantidad;
_aplicarNuevaCantidad=function(idx,nueva){
  if(!mesaActiva)return;
  var ped=pedidos[mesaActiva.id]||[],it=ped[idx];
  if(!it||isNaN(nueva)||nueva>=it.qty||window._ctlPaso)return _aplicar0(idx,nueva);
  if(it.esAsumeSocio)return _aplicar0(idx,nueva);
  var ts=_ctlTsItem(it),min=ts?ctlMin(ts):999,mesa=mesaActiva,quita=it.qty-Math.max(0,nueva),nom=String(nombreItemPed(it)).replace(/<[^>]*>/g,'');
  if(!ctlEsCaja()&&min>_ctl.MIN_MESERO){
    closeModal2();
    showToast('🔒 Ese producto se anotó hace '+ctlDur(min)+'.<br><span style="font-size:12px;opacity:.85">Pasados '+_ctl.MIN_MESERO+' minutos solo lo quita la caja o el administrador.</span>','#ef4444',5000);
    return;
  }
  ctlElegir('¿Por qué se quita?',quita+' × '+esc(nom)+' · queda registrado con tu nombre',CTL_MOTIVOS_QUITAR,function(mot){
    var cur=(pedidos[mesa.id]||[])[idx];
    if(!cur||cur.uidItem!==it.uidItem||!mesaActiva||mesaActiva.id!==mesa.id){showToast('La mesa cambió mientras elegías. Vuelve a intentarlo.','#f5a623');return;}
    var valor=precioItem(cur)*quita;
    window._ctlPaso=true;try{_aplicar0(idx,Math.max(0,nueva));}finally{window._ctlPaso=false;}
    logPedido(mesa.id,'↳ Motivo: '+mot,null);
    fbPush('quitados',{ts:a52Ahora(),mesaId:mesa.id,mesa:mesa.nombre||('Mesa '+mesa.num),zona:mesa.zona||'',producto:nom,cant:quita,valor:valor,motivo:mot,minDesdeAnotado:ts?min:null,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,rol:usuarioActivo.rol});
    if(typeof cmdPintar==='function'&&_cmd.abierta)cmdPintar();
  },true);
};
quitarItem=function(pid,cubeta){
  if(!mesaActiva)return;
  var ped=pedidos[mesaActiva.id]||[],idx=ped.findIndex(function(it){return it.pid===pid&&it.cubeta===cubeta;});
  if(idx>=0)_aplicarNuevaCantidad(idx,ped[idx].qty-1);
};
function ctlQuitadosHTML(){
  var hoy=hoyNegocioStr(),l=quitados.filter(function(q){return diaNegocioStr(q.ts)===hoy;});
  var tot=l.reduce(function(a,q){return a+(q.valor||0);},0),ab=_secOpen.quitados;
  var h='<button data-act="toggle-sec" data-sec="quitados" style="width:100%;text-align:left;background:#ef444418;border:1px solid #ef444433;border-radius:10px;padding:10px 14px;margin:14px 0 8px;font-size:12px;color:#ef4444;font-weight:700;cursor:pointer">'+(ab?'▼':'▶')+' 🗑 Productos quitados de mesas hoy: '+l.length+' · '+fmt(tot)+'</button>';
  if(!ab)return h;
  if(!l.length)return h+'<div class="res-card full-col" style="color:var(--muted);font-size:13px;text-align:center">Hoy no se ha quitado nada de ninguna mesa.</div>';
  var porQuien={};l.forEach(function(q){var k=q.uidNombre||'?';if(!porQuien[k])porQuien[k]={n:0,v:0};porQuien[k].n+=q.cant||1;porQuien[k].v+=q.valor||0;});
  return h+'<div class="res-card full-col">'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:8px">'+Object.keys(porQuien).map(function(k){return '<b style="color:var(--text)">'+esc(k)+'</b>: '+porQuien[k].n+' und · '+fmt(porQuien[k].v);}).join(' &nbsp;·&nbsp; ')+'</div>'
    +l.map(function(q){return '<div style="display:flex;gap:10px;font-size:12.5px;padding:6px 0;border-top:1px solid var(--border)"><span style="color:var(--muted);min-width:62px">'+new Date(q.ts).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'})+'</span>'
      +'<div style="flex:1"><b>'+q.cant+' × '+esc(q.producto||'')+'</b> · '+esc(q.mesa||'')+'<div style="color:var(--muted)">'+esc(q.motivo||'')+' · lo quitó '+esc(q.uidNombre||'')+(q.minDesdeAnotado!=null?' · '+ctlDur(q.minDesdeAnotado)+' después de anotarlo':'')+'</div></div>'
      +'<b style="color:#ef4444;white-space:nowrap">'+fmt(q.valor||0)+'</b></div>';}).join('')+'</div>';
}

/* ══ 2, 4 y 5. Franja de la mesa: responsable, tiempo, personas, cuenta pedida, mover parte ══ */
function ctlFranjaHTML(){
  if(!mesaActiva||mesaActiva.rapida)return '';
  var mid=mesaActiva.id,inf=ctlInfo(mid)||{},ped=pedidos[mid]||[];
  if(!ped.length)return '';
  var ch='background:var(--card2);border:1px solid var(--border);color:var(--text);border-radius:99px;padding:6px 11px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap';
  var h='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">'
    +'<button data-ctl="resp" style="'+ch+'">👤 '+(inf.resp?esc(inf.resp.nombre):'Sin mesero')+'</button>'
    +(inf.abre?'<span style="'+ch+';cursor:default;color:var(--muted)">🕒 '+ctlDur(ctlMin(inf.abre))+'</span>':'')
    +'<button data-ctl="pers" style="'+ch+'">👥 '+(inf.personas?inf.personas+' persona'+(inf.personas>1?'s':''):'¿Cuántos son?')+'</button>'
    +'<button data-ctl="mover" style="'+ch+'">↔ Mover parte</button></div>';
  if(inf.cuenta)h+='<div style="background:'+(inf.cuentaCambio?'#ef444418':'#38bdf818')+';border:1px solid '+(inf.cuentaCambio?'#ef444455':'#38bdf855')+';color:'+(inf.cuentaCambio?'#ef4444':'#38bdf8')+';border-radius:10px;padding:8px 12px;font-size:12.5px;font-weight:700;margin-bottom:8px">'
    +(inf.cuentaCambio?'⚠️ Se agregaron productos DESPUÉS de entregar la cuenta ('+new Date(inf.cuenta).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'})+'). Imprime la preorden otra vez y avísale al cliente.'
                     :'🧾 Pidió la cuenta a las '+new Date(inf.cuenta).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'})+'. Si agregas algo, hay que entregarle una cuenta nueva.')+'</div>';
  return h;
}
var _panel0=renderPanelPedido;
renderPanelPedido=function(){return ctlFranjaHTML()+_panel0.apply(this,arguments);};
var _color0=colorMesa;
colorMesa=function(id){var c=_color0(id),inf=ctlInfo(id);if(inf&&inf.cuenta&&pedidos[id]&&pedidos[id].length&&!(mesaActiva&&mesaActiva.id===id))return inf.cuentaCambio?'#ef4444':'#a855f7';return c;};
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-ctl]');if(!b||!mesaActiva)return;
  var mid=mesaActiva.id,a=b.dataset.ctl;
  if(a==='pers'){ctlElegir('¿Cuántas personas hay en la mesa?','',[1,2,3,4,5,6,7,8,10,12],function(n){ctlSet(mid,'personas',n);renderSoloPedido();});return;}
  if(a==='resp'){
    if(!ctlEsCaja()&&ctlInfo(mid)&&ctlInfo(mid).resp&&ctlInfo(mid).resp.id!==usuarioActivo.id){showToast('🔒 Solo la caja o el administrador cambian el mesero de una mesa.','#ef4444');return;}
    var us=usuarios.filter(function(u){return u.activo!==false;}).map(function(u){return {t:(u.emoji?u.emoji+' ':'')+u.nombre,v:u};});
    ctlElegir('¿Quién atiende esta mesa?','La venta queda a su nombre',us,function(u){ctlSet(mid,'resp',{id:u.id,nombre:u.nombre});renderSoloPedido();});return;
  }
  if(a==='mover')ctlAbrirMover();
});
/* la mesa nace con responsable y hora cuando recibe su primer producto; y avisa si le agregan con la cuenta ya pedida */
var _log0=logPedido;
logPedido=function(mesaId,texto,delta){
  _log0.apply(this,arguments);
  if(mesaId==null||String(mesaId).indexOf('vr_')===0||!usuarioActivo)return;
  var inf=ctlInfo(mesaId);
  if(!inf||!inf.abre){ctlSet(mesaId,'abre',a52Ahora());if(!inf||!inf.resp)ctlSet(mesaId,'resp',{id:usuarioActivo.id,nombre:usuarioActivo.nombre});}
  else if(inf.cuenta&&!inf.cuentaCambio&&typeof delta==='number'&&delta>0){
    ctlSet(mesaId,'cuentaCambio',true);
    showToast('⚠️ Esta mesa ya había pedido la cuenta<br><span style="font-size:12px;opacity:.85">Lo que agregaste no está en la cuenta que tiene el cliente. Entrégale una nueva.</span>','#ef4444',6000);
  }
};
var _prec0=imprimirPrecuenta;
imprimirPrecuenta=function(){
  if(mesaActiva&&(pedidos[mesaActiva.id]||[]).length&&!mesaActiva.rapida){ctlSet(mesaActiva.id,'cuenta',a52Ahora());ctlSet(mesaActiva.id,'cuentaCambio',null);}
  return _prec0.apply(this,arguments);
};

/* ══ 6. Notas por producto ══ */
var _nom0=nombreItemPed;
nombreItemPed=function(it){return _nom0(it)+(it&&it.nota?' <span style="color:#f5a623;font-size:11px;font-weight:700">📝 '+esc(it.nota)+'</span>':'');};
var _editCant0=editarCantidadPedido;
editarCantidadPedido=function(idx){
  _editCant0(idx);
  var it=mesaActiva&&(pedidos[mesaActiva.id]||[])[idx],box=document.querySelector('#modal2 .modal,#modal2>div')||document.getElementById('modal2');
  if(!it||!box)return;
  box.insertAdjacentHTML('beforeend','<div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px"><div style="color:var(--muted);font-size:11px;margin-bottom:6px;text-align:center">📝 Nota para cocina o barra</div>'
    +'<div style="display:flex;gap:8px"><input class="inp" id="ctl-nota" maxlength="60" placeholder="Sin hielo, término medio, para llevar…" value="'+esc(it.nota||'')+'" autocomplete="off" style="flex:1"><button class="btn" onclick="ctlGuardarNota('+idx+')" style="background:#f5a623;color:#000;border:none;font-weight:800">Guardar</button></div></div>');
};
var _sumar0=typeof abrirSumarCantidad==='function'?abrirSumarCantidad:null;
if(_sumar0)abrirSumarCantidad=function(idx){
  _sumar0(idx);
  var it=mesaActiva&&(pedidos[mesaActiva.id]||[])[idx],box=document.querySelector('#modal2 .modal,#modal2>div')||document.getElementById('modal2');
  if(!it||!box||document.getElementById('ctl-nota'))return;
  box.insertAdjacentHTML('beforeend','<div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px"><div style="color:var(--muted);font-size:11px;margin-bottom:6px;text-align:center">📝 Nota para cocina o barra</div>'
    +'<div style="display:flex;gap:8px"><input class="inp" id="ctl-nota" maxlength="60" placeholder="Sin hielo, término medio, para llevar…" value="'+esc(it.nota||'')+'" autocomplete="off" style="flex:1"><button class="btn" onclick="ctlGuardarNota('+idx+')" style="background:#f5a623;color:#000;border:none;font-weight:800">Guardar</button></div></div>');
};
function ctlGuardarNota(idx){
  if(!mesaActiva)return;var ped=pedidos[mesaActiva.id]||[],it=ped[idx];if(!it)return;
  var t=((document.getElementById('ctl-nota')||{}).value||'').trim().slice(0,60);
  if(t)it.nota=t;else delete it.nota;
  var r=ref('pedidos/'+mesaActiva.id);if(r)r.set(ped);
  logPedido(mesaActiva.id,(t?'📝 Nota en ':'📝 Nota quitada de ')+String(_nom0(it)).replace(/<[^>]*>/g,'')+(t?': '+t:''),null);
  closeModal2();renderSoloPedido();
}

/* ══ 7. Mover solo parte de la mesa ══ */
var _mv={sel:{},dest:''};
function ctlAbrirMover(){_mv={sel:{},dest:''};_ctlPintarMover();}
function _ctlPintarMover(){
  if(!mesaActiva)return;
  var ped=pedidos[mesaActiva.id]||[],n=Object.keys(_mv.sel).reduce(function(a,k){return a+(_mv.sel[k]||0);},0);
  var dest=mesas.filter(function(m){return m.id!==mesaActiva.id;}).sort(function(a,b){return (a.zona||'').localeCompare(b.zona||'')||(parseInt(a.num)||0)-(parseInt(b.num)||0);});
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:2px">↔ Mover parte de la mesa</div>'
    +'<div style="color:var(--muted);font-size:11.5px;margin-bottom:10px">Elige cuántas unidades de cada producto se van y a qué mesa. El inventario no cambia.</div>'
    +ped.map(function(it,i){var q=_mv.sel[i]||0,fijo=it.isCombo||it.isCubetazoMix||it.recGrupos;
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><span style="flex:1;font-size:13px">'+it.qty+'× '+nombreItemPed(it)+'</span>'
        +'<button data-mv="-" data-i="'+i+'" style="width:36px;height:36px;border-radius:9px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:18px;font-weight:900">−</button>'
        +'<b style="min-width:26px;text-align:center;color:'+(q?'#38bdf8':'var(--muted)')+'">'+q+'</b>'
        +'<button data-mv="+" data-i="'+i+'" style="width:36px;height:36px;border-radius:9px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:18px;font-weight:900">+</button>'
        +'<button data-mv="t" data-i="'+i+'" style="border-radius:9px;border:1px solid var(--border);background:var(--card2);color:var(--muted);font-size:11px;font-weight:700;padding:8px">Todo</button></div>';}).join('')
    +'<div style="color:var(--muted);font-size:11px;margin:10px 0 3px">Mesa de destino</div>'
    +'<select class="inp" id="mv-dest" onchange="_mv.dest=this.value" style="margin-bottom:10px"><option value="">— Elige —</option>'+dest.map(function(m){var z=ZONAS.find(function(x){return x.id===m.zona;}),oc=(pedidos[m.id]||[]).length;return '<option value="'+esc(m.id)+'"'+(_mv.dest===String(m.id)?' selected':'')+'>'+(z?esc(z.label)+' · ':'')+esc(m.nombre||('Mesa '+m.num))+(oc?' (ocupada: se le suma)':' (libre)')+'</option>';}).join('')+'</select>'
    +'<div id="mv-error" role="alert" style="color:#ef4444;font-weight:700;font-size:12.5px;margin-bottom:8px"></div>'
    +'<button class="btn btn-green btn-full" onclick="ctlConfirmarMover()" '+(n?'':'disabled')+'>Mover '+n+' unidad'+(n!==1?'es':'')+'</button>');
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-mv]');if(!b||!mesaActiva)return;
  var i=Number(b.dataset.i),it=(pedidos[mesaActiva.id]||[])[i];if(!it)return;
  var q=_mv.sel[i]||0;
  if(b.dataset.mv==='+')q=Math.min(it.qty,q+1);else if(b.dataset.mv==='-')q=Math.max(0,q-1);else q=q===it.qty?0:it.qty;
  if(q)_mv.sel[i]=q;else delete _mv.sel[i];
  _ctlPintarMover();
});
function ctlConfirmarMover(){
  if(!mesaActiva)return;
  var or=mesaActiva,ped=pedidos[or.id]||[],dId=_mv.dest||((document.getElementById('mv-dest')||{}).value||''),er=document.getElementById('mv-error');
  var de=mesas.find(function(m){return String(m.id)===String(dId);});
  if(!de){if(er)er.textContent='Elige la mesa a la que se mueven los productos.';return;}
  var mov=[],det=[];
  Object.keys(_mv.sel).map(Number).sort(function(a,b){return b-a;}).forEach(function(i){
    var it=ped[i],q=_mv.sel[i];if(!it||!q)return;
    var copia=JSON.parse(JSON.stringify(it));copia.qty=q;copia.uidItem='it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36);
    mov.push(copia);det.push(q+'× '+String(_nom0(it)).replace(/<[^>]*>/g,''));
    it.qty-=q;if(it.qty<=0)ped.splice(i,1);
  });
  if(!mov.length)return;
  var pd=(pedidos[de.id]||[]).concat(mov);pedidos[de.id]=pd;
  var r1=ref('pedidos/'+or.id),r2=ref('pedidos/'+de.id);if(r1)r1.set(ped.length?ped:null);if(r2)r2.set(pd);
  var nO=or.nombre||('Mesa '+or.num),nD=de.nombre||('Mesa '+de.num);
  _log0(or.id,'↔ Movido a '+nD+': '+det.join(', '),-mov.length);
  logPedido(de.id,'↔ Llegó de '+nO+': '+det.join(', '),mov.length);
  closeModal1();
  showToast('↔ '+det.length+' producto'+(det.length!==1?'s':'')+' movido'+(det.length!==1?'s':'')+' a '+esc(nD),'#38bdf8');
  if(!ped.length)mesaActiva=null;
  render();
}

/* ══ Ventas: mesero, consecutivo y limpieza de la mesa ══ */
var _push0=fbPush;
fbPush=function(path,val){
  if(path==='ventas'&&val&&typeof val==='object'){
    var inf=val.mesaId!=null?ctlInfo(val.mesaId):null;
    if(inf){if(inf.resp){val.meseroId=inf.resp.id;val.meseroNombre=inf.resp.nombre;}if(inf.abre)val.abre=inf.abre;if(inf.personas)val.personas=inf.personas;if(inf.cuenta)val.cuentaPedida=inf.cuenta;}
    var r=ref('ventas');
    if(r){
      var nr=r.push(val);if(nr&&nr.catch)nr.catch(function(e){a52Falla('ventas',e);});
      // 🔢 Número consecutivo: una venta eliminada deja el hueco a la vista
      var c=ref('contadores/venta');
      if(c&&nr&&nr.key)c.transaction(function(n){return (parseInt(n)||0)+1;}).then(function(res){var n=res&&res.snapshot?res.snapshot.val():null;if(n){var rn=ref('ventas/'+nr.key+'/num');if(rn)rn.set(n);}}).catch(function(){});
      return;
    }
  }
  if((path==='novedades'||path==='anulaciones')&&val&&window._ctlMotVenta){
    val.motivoVenta=window._ctlMotVenta;if(val.nota!=null)val.nota='Motivo: '+window._ctlMotVenta+' · '+val.nota;else if(val.motivo!=null)val.motivo=window._ctlMotVenta+' · '+val.motivo;
  }
  return _push0.apply(this,arguments);
};
/* cuando la mesa queda vacía, su información se borra (con margen, para no borrar la de una mesa que apenas abre) */
function ctlLimpiar(){
  Object.keys(mesaInfo).forEach(function(mid){
    var inf=mesaInfo[mid];if(!inf||(pedidos[mid]&&pedidos[mid].length))return;
    if(a52Ahora()-(inf.abre||0)<20000)return;
    delete mesaInfo[mid];var r=ref('mesaInfo/'+mid);if(r)r.remove();
  });
}

/* ══ Eliminar o devolver una venta: solo del día y con motivo ══ */
function _ctlVentaGuardia(fbkey,accion,sigue){
  var v=ventas.find(function(x){return x._fbkey===fbkey;});if(!v)return;
  if(diaNegocioStr(v.ts)!==hoyNegocioStr()){
    alert('Esa venta es del '+diaNegocioStr(v.ts)+'. Solo se pueden '+accion+' ventas del día en curso: las de días ya cerrados quedan como están.\n\nSi hay un error en una venta vieja, regístrelo como novedad en Caja.');
    return;
  }
  ctlElegir('¿Por qué se va a '+accion.replace(/r$/,'r')+' esta venta?',esc(v.mesa||'')+' · '+fmt(v.total||0)+(v.num?' · venta n.º '+v.num:''),CTL_MOTIVOS_VENTA,function(mot){
    window._ctlMotVenta=mot;try{sigue();}finally{setTimeout(function(){window._ctlMotVenta=null;},1500);}
  },true);
}
var _elim0=eliminarVentaDuplicada;
eliminarVentaDuplicada=function(fbkey){if(!usuarioActivo||usuarioActivo.rol!=='admin')return;_ctlVentaGuardia(fbkey,'eliminar',function(){_elim0(fbkey);});};
var _devol0=abrirDevolverVenta;
abrirDevolverVenta=function(fbkey){_ctlVentaGuardia(fbkey,'devolver',function(){window._ctlMotDev=window._ctlMotVenta;_devol0(fbkey);});};
var _devolC0=confirmarDevolverVenta;
confirmarDevolverVenta=function(fbkey){window._ctlMotVenta=window._ctlMotDev||window._ctlMotVenta;try{return _devolC0(fbkey);}finally{window._ctlMotVenta=null;window._ctlMotDev=null;}};

/* ══ 3. Cierre de turno con mesas abiertas ══ */
function ctlMesasAbiertas(){
  var l=[];
  Object.keys(pedidos).forEach(function(mid){
    var p=pedidos[mid];if(!p||!p.length)return;
    var m=mesas.find(function(x){return String(x.id)===String(mid);}),inf=ctlInfo(mid)||{};
    l.push({id:mid,nombre:m?(m.nombre||('Mesa '+m.num)):(String(mid).indexOf('vr_')===0?'Venta rápida':'Mesa '+mid),zona:m?m.zona:'',total:totalPedido(mid),items:p.reduce(function(a,it){return a+(it.qty||0);},0),resp:inf.resp?inf.resp.nombre:'',abre:inf.abre||0});
  });
  return l.sort(function(a,b){return b.total-a.total;});
}
var _cierre0=confirmarCierre;
confirmarCierre=function(){
  var ab=ctlMesasAbiertas();
  if(!ab.length||window._ctlCierreOk){window._ctlCierreOk=false;return _cierre0.apply(this,arguments);}
  var tot=ab.reduce(function(a,m){return a+m.total;},0),args=arguments,yo=this;
  window._ctlCierreSigue=function(){
    fbPush('novedades',{id:'nov_'+a52Ahora(),ts:a52Ahora(),mesa:ab.map(function(m){return m.nombre;}).join(', '),tipo:'otra',tipoLabel:'⚠️ Cierre con mesas abiertas',monto:tot,
      nota:'Se cerró el turno con '+ab.length+' mesa(s) sin cobrar: '+ab.map(function(m){return m.nombre+' '+fmt(m.total).replace(/ /g,' ')+(m.resp?' ('+m.resp+')':'');}).join(' · '),uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre});
    closeModal2();window._ctlCierreOk=true;confirmarCierre.apply(yo,args);
  };
  setTimeout(function(){
    modal2('<div style="text-align:center;margin-bottom:10px"><div style="font-size:26px">⚠️</div><div style="font-weight:900;font-size:17px">Hay '+ab.length+' mesa'+(ab.length>1?'s':'')+' sin cobrar</div>'
      +'<div style="color:var(--muted);font-size:12.5px;margin-top:4px">Son '+fmt(tot)+' servidos que no están en la caja ni en ninguna cuenta.</div></div>'
      +ab.map(function(m){var z=ZONAS.find(function(x){return x.id===m.zona;});return '<div style="display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-top:1px solid var(--border);font-size:13px"><div><b>'+(z?esc(z.label)+' · ':'')+esc(m.nombre)+'</b><div style="color:var(--muted);font-size:11.5px">'+m.items+' ítems'+(m.resp?' · atiende '+esc(m.resp):'')+(m.abre?' · abierta hace '+ctlDur(ctlMin(m.abre)):'')+'</div></div><b style="color:var(--gold);white-space:nowrap">'+fmt(m.total)+'</b></div>';}).join('')
      +'<button class="btn btn-green btn-full" onclick="closeModal2()" style="margin-top:12px">Volver y cobrarlas primero</button>'
      +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button class="btn btn-full" onclick="window._ctlCierreSigue()" style="background:#ef444418;color:#ef4444;border:1px solid #ef444455;margin-top:8px">Cerrar de todas formas (queda como novedad)</button>'
        :'<div style="color:var(--muted);font-size:11.5px;text-align:center;margin-top:8px">Solo el administrador puede cerrar el turno con mesas abiertas.</div>'));
  },40);
};

/* ══ Enganches con el resto del sistema ══ */
(function(){
  var r0=render;
  render=function(){ctlEscuchar();ctlLimpiar();return r0.apply(this,arguments);};
  var v0=renderVentas;
  renderVentas=function(){return v0.apply(this,arguments)+ctlQuitadosHTML();};
  var c0=cerrarSesion;
  cerrarSesion=function(){_ctl.oyendo=false;try{fbOff('mesaInfo');fbOff('quitados');}catch(e){}return c0.apply(this,arguments);};
})();
