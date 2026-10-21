/* ═══════════════ ADMIN USUARIOS ═══════════════ */
var _rolSelU='mesero';var _emojiSelU='⭐';
var EMOJIS_U=['⭐','🙂','😎','👑','💰','🌸','👨‍🍳','🍺','🍸','👽','👾','🛸','🐙','🦠','🌵','🫧','🔮','🌌','🪐','☄️','🌠','🤖','🦎','🐸','🦑','🧿','💚','👑','💰','🤝','🧑','👩','👩🏿','👩🏾','👩🏽','👨🏿','🧔','👨','👱‍♀️','👩🏿‍🍳','🧑‍🍳','👨‍🍳','👩‍🍳','🎯','⭐','🌟','🦋','🌙','🔥','💫','🚀','🛰️','🎸','🎧','🍺','🍻','💼','🏆','😎','🦄','🐺','🦅','🐲','💎','⚡','🎩','🕶️'];
function toggleTurnoUsuario(id){
  var u=usuarios.find(function(x){return x.id===id;});
  if(!u)return;
  if(u.rol==='admin'){return;}  // admin siempre activo
  u.activo=(u.activo===false)?true:false;
  // Guardar en Firebase
  var ob={};usuarios.forEach(function(x){ob[x.id]=x;});
  fbSet('usuarios',ob);
  showToast(u.activo?('🟢 '+esc(u.nombre)+' entró en turno'):('⚪ '+esc(u.nombre)+' salió de turno'),u.activo?'#22c55e':'#888');
  render();
}

function nuevoUsuario(){abrirModalUsuario(null);}
function editarUsuario(id){abrirModalUsuario(usuarios.find(function(u){return u.id===id;}));}
function borrarUsuario(id){if(id==='admin')return;if(!confirm('¿Eliminar usuario?'))return;usuarios=usuarios.filter(function(u){return u.id!==id;});fbSet('usuarios',usuarios);render();}
function abrirModalUsuario(u){
  var isNew=!u;
  _rolSelU=u?u.rol:'mesero';_emojiSelU=u?u.emoji:'⭐';
  var emjBtns=EMOJIS_U.map(function(e){return'<button class="emj-btn'+(_emojiSelU===e?' sel':'')+'" onclick="selEmojiU(this.getAttribute(\'data-e\'))" data-e="'+e+'">'+e+'</button>';}).join('');
  var rolBtns=Object.entries(ROLES).map(function(kv){
    var r=kv[0],info=kv[1];
    return'<button id="rol-'+r+'" onclick="selRolU(\''+r+'\')" style="flex:1;background:'+(_rolSelU===r?info.color+'22':'transparent')+';border:2px solid '+(_rolSelU===r?info.color:'var(--border)')+';border-radius:10px;padding:8px 4px;cursor:pointer;font-size:11px;font-weight:700;color:'+(_rolSelU===r?info.color:'var(--muted)')+'">'+info.label+'</button>';
  }).join('');
  modal1('<div style="color:var(--accent);font-weight:900;font-size:16px;margin-bottom:16px">'+(isNew?'Nuevo usuario':'Editar '+esc(u&&u.nombre||''))+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nombre</div><input class="inp inp-sm" id="u-nombre" value="'+esc((u&&u.nombre)||'')+'"/></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">PIN (4 dígitos)</div><input class="inp inp-sm" id="u-pin" type="number" placeholder="'+(u?'(sin cambio)':'0000')+'" value="" autocomplete="off"/></div>'
    +'</div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:7px">Rol</div><div style="display:flex;gap:8px">'+rolBtns+'</div></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:6px">Emoji (toca uno o escribe el tuyo)</div><div class="emoji-grid" id="emj-u">'+emjBtns+'</div>'
      +'<div style="display:flex;gap:8px;align-items:center;margin-top:8px"><span style="color:var(--muted);font-size:11px">O escribe/pega:</span>'
        +'<input id="u-emoji" value="'+esc(_emojiSelU)+'" maxlength="4" oninput="_emojiSelU=this.value;document.querySelectorAll(\'#emj-u .emj-btn\').forEach(function(b){b.classList.toggle(\'sel\',b.getAttribute(\'data-e\')===this.value);}.bind(this))" style="width:60px;text-align:center;font-size:20px;background:var(--bg);border:2px solid var(--accent)44;border-radius:8px;padding:4px;color:#fff"/></div>'
    +'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-green btn-full" onclick="guardarUsuario(\''+( isNew?'nuevo':(u&&u.id||'') )+'\')">Guardar</button>'
      +'<button class="btn btn-outline btn-full" onclick="closeModal1()">Cancelar</button>'
    +'</div>');
}
function selRolU(r){
  _rolSelU=r;document.getElementById('u-rol')||0;
  Object.entries(ROLES).forEach(function(kv){
    var b=document.getElementById('rol-'+kv[0]);if(!b)return;
    var info=kv[1];var sel=kv[0]===r;
    b.style.background=sel?info.color+'22':'transparent';b.style.borderColor=sel?info.color:'var(--border)';b.style.color=sel?info.color:'var(--muted)';
  });
}
function selEmojiU(e){
  _emojiSelU=e;var hid=document.getElementById('u-emoji');if(hid)hid.value=e;
  document.querySelectorAll('#emj-u .emj-btn').forEach(function(b){b.classList.toggle('sel',b.getAttribute('data-e')===e);});
}
function guardarUsuario(idParam){
  var nombre=((document.getElementById('u-nombre')||{}).value||'').trim();
  var pinTxt=String((document.getElementById('u-pin')||{}).value||'').trim();
  var pin=pinTxt?pinTxt.padStart(4,'0').slice(0,4):'';
  var emoji=(document.getElementById('u-emoji')||{}).value||'⭐';
  if(!nombre||(idParam==='nuevo'&&pin.length<4)){alert('Completa nombre y PIN de 4 dígitos.');return;}
  if(pinTxt&&pin.length<4){alert('El PIN debe tener 4 dígitos.');return;}
  var uid=idParam==='nuevo'?'u'+a52Ahora():idParam;
  (pin?a52HashPin(pin,uid):Promise.resolve(null)).then(function(h){
    if(idParam==='nuevo'){usuarios.push({id:uid,nombre:nombre,pinHash:h,pinLen:4,rol:_rolSelU,emoji:emoji});}
    else{var idx=usuarios.findIndex(function(u){return u.id===idParam;});if(idx<0)return;var nu=Object.assign({},usuarios[idx],{nombre:nombre,rol:_rolSelU,emoji:emoji});if(h){nu.pinHash=h;nu.pinLen=4;delete nu.pin;}usuarios[idx]=nu;}
    var uObj={};usuarios.forEach(function(u){uObj[u.id]=u;});
    fbSet('usuarios',uObj);
    closeModal1();render();
  }).catch(function(e){alert(String(e&&e.message||e));});
}

/* ═══════════════ EDITOR MESA ═══════════════ */
function abrirNuevaMesa(){abrirEditorMesaModal(null);}
function abrirEditorMesa(id){abrirEditorMesaModal(mesas.find(function(m){return m.id===id;}));}
function abrirEditorMesaModal(mesa){
  var isNew=!mesa;
  var m=mesa||{num:mesas.filter(function(m){return m.zona===zonaActual;}).length+1,nombre:'Mesa '+(mesas.filter(function(m){return m.zona===zonaActual;}).length+1),cap:4,forma:'rectangular',ori:'horizontal'};
  _formaSel=m.forma||'rectangular';_oriSel=m.ori||'horizontal';
  var formasBtns=[['redonda','Redonda'],['rectangular','Rectangular'],['cuadrada','Cuadrada']].map(function(x){
    var f=x[0],l=x[1];var sel=_formaSel===f;
    return'<button class="forma-btn'+(sel?' sel':'')+'" id="fm-'+f+'" onclick="selForma(\''+f+'\')">'
      +(f==='redonda'?'<svg width="28" height="28"><circle cx="14" cy="14" r="12" fill="none" stroke="'+(sel?'#a855f7':'#55558a')+'" stroke-width="2.5"/></svg>':f==='rectangular'?'<svg width="34" height="22"><rect x="2" y="2" width="30" height="18" rx="3" fill="none" stroke="'+(sel?'#a855f7':'#55558a')+'" stroke-width="2.5"/></svg>':'<svg width="28" height="28"><rect x="2" y="2" width="24" height="24" rx="3" fill="none" stroke="'+(sel?'#a855f7':'#55558a')+'" stroke-width="2.5"/></svg>')
      +'<span style="color:'+(sel?'#a855f7':'var(--muted)')+';font-size:11px;font-weight:700">'+l+'</span></button>';
  }).join('');
  modal1('<div style="color:var(--accent);font-weight:900;font-size:16px;margin-bottom:16px">'+(isNew?'Nueva mesa':'Editar mesa')+'</div>'
    +'<div style="margin-bottom:12px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nombre de la mesa</div>'
      +'<input class="inp" id="em-nombre" value="'+esc(m.nombre||'Mesa '+m.num)+'" placeholder="Ej: VIP, Terraza, Barra..."/></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Número</div><input class="inp inp-sm" id="em-num" type="number" value="'+m.num+'"/></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Capacidad</div>'
        +'<select class="inp inp-sm" id="em-cap">'+[2,3,4,5,6,8,10,12].map(function(n){return'<option'+(n==m.cap?' selected':'')+'>'+n+'</option>';}).join('')+'</select></div>'
    +'</div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:8px">Forma</div>'
      +'<div style="display:flex;gap:8px">'+formasBtns+'</div></div>'
    +'<div id="ori-sec" style="'+(m.forma==='rectangular'?'':'display:none;')+'margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:8px">Orientación</div>'
      +'<div style="display:flex;gap:8px">'
        +'<button class="ori-btn'+(m.ori==='horizontal'?' sel':'')+'" id="ori-h" onclick="selOri(\'horizontal\')">Horizontal ↔</button>'
        +'<button class="ori-btn'+(m.ori==='vertical'?' sel':'')+'"   id="ori-v" onclick="selOri(\'vertical\')">Vertical ↕</button>'
      +'</div></div>'
    +'<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;color:var(--muted);font-size:11px;margin-bottom:6px"><span>Tamaño de esta mesa</span><span id="em-size-val" style="color:var(--accent);font-weight:700">'+(m.size||mesaSize)+'px</span></div>'
      +'<input type="range" id="em-size" min="20" max="160" value="'+(m.size||mesaSize)+'" style="width:100%;accent-color:var(--accent)" oninput="document.getElementById(\'em-size-val\').textContent=this.value+\'px\'"/></div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-green btn-full" onclick="guardarMesa('+(isNew?'null':(mesa&&mesa.id))+')">Guardar</button>'
      +(!isNew?'<button class="btn btn-red" onclick="eliminarMesa('+(mesa&&mesa.id)+')">Eliminar</button>':'')
      +'<button class="btn btn-outline" onclick="closeModal1()">Cancelar</button>'
    +'</div>');
}
function selForma(f){
  _formaSel=f;
  ['redonda','rectangular','cuadrada'].forEach(function(x){
    var b=document.getElementById('fm-'+x);if(!b)return;
    b.className='forma-btn'+(x===f?' sel':'');
    var s=b.querySelector('circle')||b.querySelector('rect');if(s)s.setAttribute('stroke',x===f?'#a855f7':'#55558a');
    var sp=b.querySelector('span');if(sp)sp.style.color=x===f?'#a855f7':'var(--muted)';
  });
  var os=document.getElementById('ori-sec');if(os)os.style.display=f==='rectangular'?'':'none';
}
function selOri(o){
  _oriSel=o;
  ['h','v'].forEach(function(x){var b=document.getElementById('ori-'+x);if(b)b.className='ori-btn'+(o===(x==='h'?'horizontal':'vertical')?' sel':'');});
}
function guardarMesa(id){
  var num=parseInt((document.getElementById('em-num')||{}).value)||1;
  var cap=parseInt((document.getElementById('em-cap')||{}).value)||4;
  var nombre=((document.getElementById('em-nombre')||{}).value||'').trim()||('Mesa '+num);
  var size=parseInt((document.getElementById('em-size')||{}).value)||mesaSize;
  if(id===null){var maxId=0;mesas.forEach(function(m){if(m.id>maxId)maxId=m.id;});mesas.push({id:maxId+1,num:num,nombre:nombre,zona:zonaActual,cap:cap,x:20,y:20,forma:_formaSel,ori:_oriSel,size:size});}
  else{var m=mesas.find(function(m){return m.id===id;});if(m){m.num=num;m.nombre=nombre;m.cap=cap;m.forma=_formaSel;m.ori=_oriSel;m.size=size;}}
  fbSet('mesas',mesasObj());closeModal1();render();
}
function eliminarMesa(id){
  if(!confirm('¿Eliminar esta mesa? Si tiene pedidos sin cobrar el stock se devolverá al inventario.'))return;
  // Return stock for any pedidos in this mesa
  var rawP=pedidos[id]||[];
  var ped=Array.isArray(rawP)?rawP:Object.values(rawP);
  ped.forEach(function(it){ajustarStockItem(it,+(it.qty||1),'Mesa eliminada: devolución');});
  mesas=mesas.filter(function(m){return m.id!==id;});
  delete pedidos[id];if(abonosMesa[id]){delete abonosMesa[id];fbSet('abonosMesa',abonosMesa);}if(pedidoLog[id]){delete pedidoLog[id];fbSet('pedidoLog/'+id,null);}limpiarCocinaMesa(id);if(mesaActiva&&mesaActiva.id===id)mesaActiva=null;
  fbSet('mesas',mesasObj());
  var rp=ref('pedidos/'+id);if(rp)rp.set(null);
  closeModal1();render();
}

/* ═══════════════ TICKET ═══════════════ */
function imprimirPrecuenta(){
  if(!mesaActiva)return;
  var mesa=mesaActiva;
  var ped=pedidos[mesa.id]||[];
  if(!ped.length){alert('La mesa no tiene productos.');return;}
  var total=totalPedido(mesa.id);
  if(MODO_IMPRESION==='estacion'){
    // Construir items y mandar a la estación como PRE-ORDEN (sin forma de pago)
    var items=ped.map(function(it){
      var nombre,pr;
      if(it.isCustom){nombre='✏️ '+(it.customNombre||'');pr=it.customPrecio||0;}
      else if(it.isCombo){nombre='🎁 '+(it.comboNombre||'Combo');pr=it.comboPrecio||0;}
      else if(it.isCubetazoMix){nombre='🪣 '+(it.cubMixNombre||'Cubetazo mixto');pr=it.cubMixPrecio||0;}
      else{var p=menu.find(function(m){return m.id==it.pid;});nombre=(it.cubeta?'[Cubetazo] ':'')+((p&&p.nombre)||it.nombre||'?')+(it.varianteNombre?' ('+it.varianteNombre+')':'')+(it.cubeta?' x5':'')+(it.es2x1Gratis?' [2x1 GRATIS]':'')+_promoNotaTicket(it);pr=precioItem(it);}
      return {nombre:nombre,qty:it.qty||1,total:pr*(it.qty||1)};
    });
    var r=ref('impresion');
    if(r){r.push({mesa:(mesa.nombre||('Mesa '+mesa.num)),items:items,total:total,preorden:true,ts:a52Ahora()});showToast('🖨️ Pre-orden enviada a la impresora','#38bdf8');}
    else{alert('No hay conexión para enviar a la impresora.');}
    return;
  }
  // Modo local (ventana de impresión) - respaldo
  var zona=ZONAS.find(function(z){return z.id===mesa.zona;});
  var rows=ped.map(function(it){
    var nombre,pr;
    if(it.isCustom){nombre='✏️ '+esc(it.customNombre||'');pr=it.customPrecio||0;}
    else if(it.isCombo){nombre='🎁 '+esc(it.comboNombre||'');pr=it.comboPrecio||0;}
    else if(it.isCubetazoMix){nombre='🪣 '+(it.cubMixNombre||'Cubetazo mixto');pr=it.cubMixPrecio||0;}
    else{var p=menu.find(function(m){return m.id==it.pid;});nombre=(it.cubeta?'[Cubetazo] ':'')+esc((p&&p.nombre)||it.nombre||'?')+(it.varianteNombre?' ('+esc(it.varianteNombre)+')':'')+(it.cubeta?' x5':'')+(it.es2x1Gratis?' <b>[2x1 GRATIS]</b>':'');var notaPre=_promoNotaTicket(it);if(notaPre)nombre+='<br><span style="font-size:.82em">🏷️'+esc(notaPre)+'</span>';pr=precioItem(it);}
    return'<tr><td>'+nombre+'</td><td align="center">'+it.qty+'</td><td align="right">'+fmt(pr*it.qty)+'</td></tr>';
  }).join('');
  var w=window.open('','_blank','width=340,height=600');
  if(!w)return;
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{margin:0;size:280px auto}html,body{margin:0;padding:0;width:280px}body{font-family:"Courier New",monospace;font-size:13px;padding:8px 10px 16px}.t{font-size:17px;font-weight:900;text-align:center}.pre{text-align:center;padding:5px;font-weight:900;border:2px dashed #333;margin-bottom:8px}table{width:100%}td{padding:2px 0}</style></head><body>');
  w.document.write('<div class="pre">PRE-ORDEN</div><div class="t">'+M('nombreSimple')+'</div><hr/>');
  w.document.write('<p style="text-align:center">'+esc((zona?zona.label:'')+' · '+(mesa.nombre||'Mesa '+mesa.num))+'</p>');
  w.document.write('<table>'+rows+'</table><hr/><div style="text-align:right;font-weight:900">TOTAL: '+fmt(total)+'</div>');
  w.document.write('<p style="text-align:center;font-size:10px;color:#777">** No es comprobante de pago **</p></body></html>');
  w.document.close();w.print();
}

/* ═══ Imprimir inventario actual (solo lo que queda, sin ceros) ═══ */
/* ═══ 📋 CUADRE FÍSICO: conteo de inventario + dinero, valoriza faltantes ═══ */
function _resumenOtros(desde,hasta){
  // Agrupa ventas personalizadas del PERIODO (excluye asume-socio); lo conciliado se descuenta del total histórico
  desde=desde||0;if(hasta==null)hasta=Infinity;
  var grupos={};
  var totalHist={};   // vendidas de todos los tiempos por nombre (para pendientes globales)
  ventas.forEach(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    its.forEach(function(it){
      if(!it.isCustom||it.esAsumeSocio)return;
      var nom=(it.customNombre||'Personalizado').trim();
      var k=_normTxt(nom);
      totalHist[k]=(totalHist[k]||0)+(it.qty||1);
      if(v.ts<desde||v.ts>hasta)return;
      if(!grupos[k])grupos[k]={key:k,nombre:nom,qty:0,total:0,nVentas:0,primera:v.ts,ultima:v.ts};
      var g=grupos[k];
      g.qty+=(it.qty||1);
      g.total+=(it.customPrecio||0)*(it.qty||1);
      g.nVentas++;
      if(v.ts<g.primera)g.primera=v.ts;
      if(v.ts>g.ultima)g.ultima=v.ts;
    });
  });
  var conc={};
  otrosConciliados.forEach(function(c){conc[c.key]=(conc[c.key]||0)+(c.cant||0);});
  return Object.values(grupos).map(function(g){
    g.conciliadas=conc[g.key]||0;
    g.pendGlobal=Math.max(0,(totalHist[g.key]||0)-g.conciliadas);   // lo que falta por cuadrar en total
    g.pendientes=Math.min(g.qty,g.pendGlobal);                      // lo cuadrable de este periodo
    return g;
  }).sort(function(a,b){return b.pendientes-a.pendientes||b.total-a.total;});
}
function abrirVentasOtros(){
  if(!window._otrosPeriodo)window._otrosPeriodo='ult';
  var per=window._otrosPeriodo;
  var cs=cierres.slice().sort(function(a,b){return (a.ts||0)-(b.ts||0);});
  var desde=0,hasta=Infinity,perTxt='';
  if(per==='ult'&&cs.length){
    var uc=cs[cs.length-1];
    desde=uc.turnoInicio||0;hasta=uc.ts||Infinity;
    perTxt='🔒 Último cierre · '+fmtFechaCorta(uc.ts);
  }else if(per==='ult5'&&cs.length){
    var c5=cs[Math.max(0,cs.length-5)];
    desde=c5.turnoInicio||0;hasta=cs[cs.length-1].ts||Infinity;
    perTxt='🔒 Últimos '+Math.min(5,cs.length)+' cierres';
  }else if(per==='turno'){
    desde=turnoInicio||0;hasta=Infinity;
    perTxt='🟢 Turno actual (sin cerrar)';
  }else{
    per='todo';perTxt='📜 Todo el historial';
  }
  var chips=[['ult','🔒 Último cierre'],['ult5','5 cierres'],['turno','🟢 Turno actual'],['todo','📜 Todo']].map(function(x){
    var sel=x[0]===per;
    return'<button onclick="window._otrosPeriodo=\''+x[0]+'\';abrirVentasOtros()" style="flex:1;background:'+(sel?'#ef4444':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'#ef4444':'var(--border)')+';border-radius:8px;padding:7px 2px;font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap">'+x[1]+'</button>';
  }).join('');
  var lista=_resumenOtros(desde,hasta);
  var totPend=lista.reduce(function(a,g){return a+(g.pendientes>0?g.total*(g.pendientes/g.qty):0);},0);
  var filas=lista.length?lista.map(function(g){
    var listo=g.pendientes===0;
    return'<div style="padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
        +'<div style="flex:1;min-width:0">'
          +'<div style="font-size:13px;font-weight:800;'+(listo?'color:var(--muted)':'')+'">✏️ '+esc(g.nombre)+'</div>'
          +'<div style="color:var(--muted);font-size:10px">'+g.qty+' und vendidas · '+fmt(g.total)+' · '+fmtFechaCorta(g.primera)+(g.ultima!==g.primera?' → '+fmtFechaCorta(g.ultima):'')
            +(g.conciliadas?' · <span style="color:#22c55e;font-weight:800">✔ '+g.conciliadas+' cuadradas</span>':'')+'</div>'
        +'</div>'
        +(listo
          ?'<span style="color:#22c55e;font-size:11px;font-weight:900;white-space:nowrap">✔ al día</span>'
          :'<button onclick="abrirCuadrarOtro(\''+g.key+'\')" style="background:#a855f7;color:#fff;border:none;border-radius:7px;padding:6px 11px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap">🔗 Cuadrar '+g.pendientes+'</button>')
      +'</div>'
    +'</div>';
  }).join(''):'<div style="color:var(--dim);text-align:center;padding:14px;font-size:12px">No hay ventas en "Otros" 🎉</div>';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">✏️ Ventas en Otros</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:8px">Lo que los cajeros vendieron como personalizado NO descontó inventario. Cuadra cada uno asignándolo a su producto real — y si se repite mucho, créalo en la Carta para que no vuelva a pasar.</div>'
    +'<div style="display:flex;gap:5px;margin-bottom:6px">'+chips+'</div>'
    +'<div style="color:#38bdf8;font-size:10.5px;font-weight:800;margin-bottom:8px">'+perTxt+'</div>'
    +(totPend>0?'<div style="background:#ef444412;border:1px solid #ef444433;border-radius:9px;padding:7px 11px;margin-bottom:10px;font-size:12px;font-weight:800;color:#ef4444">⚠️ Pendiente por cuadrar: ~'+fmt(Math.round(totPend))+'</div>':'')
    +filas
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:12px">Cerrar</button>');
}
function abrirCuadrarOtro(key){
  var g=_resumenOtros().find(function(x){return x.key===key;});   // global: aquí viven los pendientes reales
  if(!g)return;
  var vista=_resumenOtros.call?null:null;
  // pendientes del periodo en pantalla (para el valor sugerido)
  g.pendientes=g.pendGlobal!=null?g.pendGlobal:g.pendientes;
  if(!g.pendientes)return;
  var opts=menu.slice().sort(function(a,b){return (a.nombre||'').localeCompare(b.nombre||'');}).map(function(p){
    return'<option value="'+p.id+'">'+(p.emoji||'')+' '+esc(p.nombre)+(p.sinStock?' (por receta)':' · stock '+(parseInt(p.stock)||0))+'</option>';
  }).join('');
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:4px">🔗 Cuadrar "'+esc(g.nombre)+'"</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">'+g.pendientes+' und pendientes · el inventario descontará como si se hubieran vendido del producto real (con su receta incluida).</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Qué producto era en realidad?</div>'
    +'<select class="inp" id="co-prod" style="margin-bottom:10px">'+opts+'</select>'
    +'<div style="display:flex;gap:8px;margin-bottom:12px">'
      +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Ventas a cuadrar</div><input class="inp" id="co-cant" type="number" min="1" max="'+g.pendientes+'" value="'+g.pendientes+'"/></div>'
      +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Unidades c/u</div><input class="inp" id="co-unds" type="number" min="1" value="1"/></div>'
    +'</div>'
    +'<div style="color:var(--muted);font-size:9.5px;margin-bottom:10px">💡 "Unidades c/u": si cada venta en Otros era, por ejemplo, una cubeta de 5, pon 5.</div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarCuadrarOtro(\''+key+'\')">✓ Descontar del inventario</button>');
}
function confirmarCuadrarOtro(key){
  var g=_resumenOtros().find(function(x){return x.key===key;});
  if(!g)return;
  g.pendientes=g.pendGlobal!=null?g.pendGlobal:g.pendientes;
  var pid=parseInt((document.getElementById('co-prod')||{}).value);
  var cant=parseInt((document.getElementById('co-cant')||{}).value)||0;
  var unds=parseInt((document.getElementById('co-unds')||{}).value)||1;
  var p=menu.find(function(m){return m.id===pid;});
  if(!p||cant<=0||cant>g.pendientes){alert('Revisa el producto y la cantidad.');return;}
  // Descontar como una venta real: producto + receta (usa el motor central; el delta lleva la cantidad)
  ajustarStockItem({pid:pid,qty:1},-(cant*unds));
  var reg={id:'oc'+a52Ahora(),ts:a52Ahora(),key:key,nombre:g.nombre,cant:cant,unds:unds,prodId:pid,prodNombre:p.nombre,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  otrosConciliados.push(reg);
  var r=ref('otrosConciliados');if(r)r.push(reg);else fbSet('otrosConciliados',otrosConciliados);
  logKardex('p',pid,p.nombre,-(cant*unds),'🔗 Cuadre de OTROS: "'+g.nombre+'" ('+cant+' venta'+(cant!==1?'s':'')+')',null);
  closeModal2();
  showToast('🔗 Cuadrado: '+cant+'× "'+esc(g.nombre)+'" → '+p.emoji+' '+esc(p.nombre)+'<br><span style="font-size:12px;opacity:.85">'+(cant*unds)+' und descontadas del inventario (receta incluida)</span>','#a855f7');
  abrirVentasOtros();
}
function abrirCuadreInventario(){
  if(!usuarioActivo||usuarioActivo.rol!=='admin'){alert('Solo el administrador puede hacer el cuadre.');return;}
  window._cfVals={};window._cfDin={};window._cfBusq='';
  window._cfAjInv=true;window._cfAjCaja=false;
  renderCuadreInv();
}
function _ultimoArqueoReciente(){
  // Arqueo de las últimas 12 horas, para jalar el conteo de billetes al cuadre
  var corte=a52Ahora()-12*3600000;
  var recientes=(arqueos||[]).filter(function(a){return a.ts>=corte;}).sort(function(a,b){return b.ts-a.ts;});
  return recientes[0]||null;
}
function usarArqueoEnCuadre(){
  var a=_ultimoArqueoReciente();if(!a)return;
  window._cfDin['efectivo']=moneyFmt(a.total);
  renderCuadreInv();
}
function _cfDif(){
  // Calcula diferencias con lo digitado hasta ahora
  var faltItems=[],sobrItems=[],totalFalt=0;
  Object.keys(window._cfVals||{}).forEach(function(pid){
    var v=window._cfVals[pid];
    if(v===''||v==null)return;
    var p=menu.find(function(m){return String(m.id)===String(pid);});
    if(!p||p.sinStock)return;
    var fis=parseInt(v)||0;
    var dif=fis-(parseInt(p.stock)||0);
    if(dif<0){var val=(-dif)*(p.precio||0);faltItems.push({p:p,dif:dif,valor:val});totalFalt+=val;}
    else if(dif>0)sobrItems.push({p:p,dif:dif});
  });
  var dinFalt=0,dinDet=[];
  FPAGO.forEach(function(f){
    var v=window._cfDin[f.id];
    if(v===''||v==null)return;
    var fis=parseInt(String(v).replace(/[^0-9]/g,''))||0;
    var sis=saldoActualFP(f.id);
    var dif=fis-sis;
    dinDet.push({f:f,sis:sis,fis:fis,dif:dif});
    if(dif<0)dinFalt+=(-dif);
  });
  return{faltItems:faltItems,sobrItems:sobrItems,totalFaltInv:totalFalt,dinDet:dinDet,dinFalt:dinFalt};
}
function renderCuadreInv(){
  var q=_normTxt((window._cfBusq||'').trim());
  var lista=menu.filter(function(p){return !p.sinStock;})
    .filter(function(p){return !q||_normTxt(p.nombre).indexOf(q)>=0;})
    .sort(function(a,b){return (a.cat||'').localeCompare(b.cat||'')||a.nombre.localeCompare(b.nombre);});
  var filas=lista.map(function(p){
    var v=(window._cfVals[p.id]!=null)?window._cfVals[p.id]:'';
    var dif=(v!==''&&v!=null)?((parseInt(v)||0)-(parseInt(p.stock)||0)):null;
    return'<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0"><span style="font-size:12px;font-weight:700">'+p.emoji+' '+esc(p.nombre)+'</span>'
      +'<span style="color:var(--muted);font-size:10px"> · sistema: '+p.stock+'</span></div>'
      +'<input type="number" inputmode="numeric" placeholder="'+p.stock+'" value="'+v+'" oninput="window._cfVals['+p.id+']=this.value;_cfUpd()" style="width:64px;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:6px;text-align:center;font-weight:800;font-size:13px"/>'
      +'<span id="cf-dif-p-'+p.id+'" style="width:74px;text-align:right;font-size:11px;font-weight:800;color:'+(dif===null?'var(--dim)':dif<0?'#ef4444':dif>0?'#f5a623':'#22c55e')+'">'
        +(dif===null?'—':dif<0?dif+' · '+fmt((-dif)*(p.precio||0)):dif>0?'+'+dif:'✓')+'</span>'
    +'</div>';
  }).join('');
  var _arq=_ultimoArqueoReciente();
  var din=FPAGO.map(function(f){
    var sis=saldoActualFP(f.id);
    var v=(window._cfDin[f.id]!=null)?window._cfDin[f.id]:'';
    var fis=(v!==''&&v!=null)?(parseInt(String(v).replace(/[^0-9]/g,''))||0):null;
    var dif=(fis!=null)?fis-sis:null;
    return'<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1"><span style="font-size:12px;font-weight:700">'+f.emoji+' '+f.label+'</span>'
      +'<span style="color:var(--muted);font-size:10px"> · sistema: '+fmt(sis)+'</span>'
      +(f.id==='efectivo'&&_arq?'<button onclick="usarArqueoEnCuadre()" style="display:block;background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:5px;padding:1px 7px;font-size:9px;font-weight:800;cursor:pointer;margin-top:2px">🧮 Usar arqueo de '+fmtTime(_arq.ts)+': '+fmt(_arq.total)+'</button>':'')
      +'</div>'
      +'<input type="text" inputmode="numeric" placeholder="contado" value="'+v+'" oninput="this.value=moneyFmt(this.value);window._cfDin[\''+f.id+'\']=this.value;_cfUpd()" style="width:92px;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:6px;text-align:right;font-weight:800;font-size:12px"/>'
      +'<span id="cf-dif-d-'+f.id+'" style="width:82px;text-align:right;font-size:11px;font-weight:800;color:'+(dif===null?'var(--dim)':dif<0?'#ef4444':dif>0?'#f5a623':'#22c55e')+'">'+(dif===null?'—':dif===0?'✓':(dif>0?'+':'−')+fmt(Math.abs(dif)))+'</span>'
    +'</div>';
  }).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">📋 Cuadre físico de inventario y dinero</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Escribe solo lo que contaste (lo vacío no se toca). Los faltantes se valorizan a precio de venta.</div>'
    +'<div style="font-weight:800;font-size:13px;color:#a855f7;margin-bottom:4px">📦 Productos</div>'
    +'<input class="inp" placeholder="🔍 Filtrar producto..." value="'+esc(window._cfBusq||'')+'" oninput="window._cfBusq=this.value;renderCuadreInv()" style="margin-bottom:6px"/>'
    +'<div style="max-height:260px;overflow-y:auto;background:var(--card2);border-radius:9px;padding:4px 10px;margin-bottom:12px">'+(filas||'<div style="color:var(--dim);text-align:center;padding:10px;font-size:11px">Sin resultados</div>')+'</div>'
    +'<div style="font-weight:800;font-size:13px;color:#a855f7;margin-bottom:4px">💵 Dinero por medio de pago</div>'
    +'<div style="background:var(--card2);border-radius:9px;padding:4px 10px;margin-bottom:12px">'+din+'</div>'
    +'<div id="cf-resumen" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 13px;margin-bottom:12px">'+_cfResumenHTML()+'</div>'
    +'<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;margin-bottom:6px"><input type="checkbox" '+(window._cfAjInv?'checked':'')+' onchange="window._cfAjInv=this.checked"/> 📦 Ajustar el <b>inventario</b> al conteo (kardex con motivo)</label>'
    +'<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;margin-bottom:12px"><input type="checkbox" '+(window._cfAjCaja?'checked':'')+' onchange="window._cfAjCaja=this.checked"/> 💵 Ajustar la <b>caja</b> al conteo (los saldos quedan en lo contado)</label>'
    +'<button class="btn btn-green btn-full" onclick="guardarCuadreInv()">💾 Guardar cuadre</button>'
    +'<button class="btn btn-full" onclick="imprimirCuadre()" style="background:#a855f718;border:1px solid #a855f744;color:#a855f7;margin-top:8px">🖨️ Imprimir comparativo</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function _cfResumenHTML(){
  var r=_cfDif();
  var totalGeneral=r.totalFaltInv+r.dinFalt;
  return '<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0"><span>📦 Faltante en productos ('+r.faltItems.reduce(function(a,x){return a-x.dif;},0)+' und)</span><b style="color:#ef4444">'+fmt(r.totalFaltInv)+'</b></div>'
    +'<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0"><span>💵 Faltante en dinero</span><b style="color:#ef4444">'+fmt(r.dinFalt)+'</b></div>'
    +(r.sobrItems.length?'<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0;color:#f5a623"><span>Sobrantes</span><span>'+r.sobrItems.map(function(x){return'+'+x.dif+' '+esc(x.p.nombre);}).join(', ')+'</span></div>':'')
    +(r.dinDet.some(function(d){return d.dif>0;})?'<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0;color:#f5a623"><span>Dinero sobrante</span><span>'+r.dinDet.filter(function(d){return d.dif>0;}).map(function(d){return d.f.label+' +'+fmt(d.dif).replace(/\u00A0/g,' ');}).join(', ')+'</span></div>':'')
    +'<div style="display:flex;justify-content:space-between;font-size:14px;padding-top:6px;border-top:1px solid var(--border);margin-top:4px"><b>TOTAL FALTANTE</b><b style="color:'+(totalGeneral>0?'#ef4444':'#22c55e')+';font-size:16px">'+fmt(totalGeneral)+'</b></div>';
}
function _cfUpd(){
  // Actualiza en vivo el resumen y los indicadores de cada fila SIN redibujar el modal (no se pierde el foco)
  var res=document.getElementById('cf-resumen');
  if(res)res.innerHTML=_cfResumenHTML();
  Object.keys(window._cfVals||{}).forEach(function(pid){
    var el=document.getElementById('cf-dif-p-'+pid);if(!el)return;
    var p=menu.find(function(m){return String(m.id)===String(pid);});if(!p)return;
    var v=window._cfVals[pid];
    if(v===''||v==null){el.style.color='var(--dim)';el.innerHTML='—';return;}
    var dif=(parseInt(v)||0)-(parseInt(p.stock)||0);
    el.style.color=dif<0?'#ef4444':dif>0?'#f5a623':'#22c55e';
    el.innerHTML=dif<0?dif+' · '+fmt((-dif)*(p.precio||0)):dif>0?'+'+dif:'✓';
  });
  FPAGO.forEach(function(f){
    var el=document.getElementById('cf-dif-d-'+f.id);if(!el)return;
    var v=(window._cfDin||{})[f.id];
    if(v===''||v==null){el.style.color='var(--dim)';el.innerHTML='—';return;}
    var dif=(parseInt(String(v).replace(/[^0-9]/g,''))||0)-saldoActualFP(f.id);
    el.style.color=dif<0?'#ef4444':dif>0?'#f5a623':'#22c55e';
    el.innerHTML=dif===0?'✓':(dif>0?'+':'−')+fmt(Math.abs(dif));
  });
}
function guardarCuadreInv(){
  var r=_cfDif();
  if(!r.faltItems.length&&!r.sobrItems.length&&!r.dinDet.length){alert('No digitaste ningún conteo.');return;}
  var ajInv=!!window._cfAjInv;var ajCaja=!!window._cfAjCaja;
  var items=[];
  Object.keys(window._cfVals||{}).forEach(function(pid){
    var v=window._cfVals[pid];
    if(v===''||v==null)return;
    var p=menu.find(function(m){return String(m.id)===String(pid);});
    if(!p||p.sinStock)return;
    var fis=parseInt(v)||0;var sis=parseInt(p.stock)||0;var dif=fis-sis;
    if(dif!==0)items.push({pid:p.id,nombre:p.nombre,sis:sis,fis:fis,dif:dif,valor:dif<0?(-dif)*(p.precio||0):0});
  });
  var reg={id:'cf_'+a52Ahora(),ts:a52Ahora(),uidNombre:usuarioActivo.nombre,
    items:items,
    dinero:r.dinDet.map(function(d){return{fp:d.f.id,label:d.f.label,sis:d.sis,fis:d.fis,dif:d.dif};}),
    faltInv:r.totalFaltInv,faltDin:r.dinFalt,total:r.totalFaltInv+r.dinFalt,ajustado:ajInv,ajustadoCaja:ajCaja};
  fbPush('conteosInv',reg);
  if(ajInv){
    items.forEach(function(it){
      cambiarStock('p',it.pid,it.dif,'📋 Cuadre físico ('+(it.dif<0?'faltante':'sobrante')+')');
    });
  }
  if(ajCaja){
    var tocada=false;
    r.dinDet.forEach(function(d){
      if(d.dif!==0){cajaHoy['ini_'+d.f.id]=(cajaHoy['ini_'+d.f.id]||0)+d.dif;tocada=true;}
    });
    if(tocada)fbSet('cajaHoy',cajaHoy);
  }
  window._cfReg=reg;
  closeModal1();
  showToast('📋 Cuadre guardado'+(ajInv?' · stock ajustado':'')+(ajCaja?' · caja ajustada':'')+'<br><span style="font-size:12px;opacity:.85">Faltante total: '+fmt(reg.total)+' ('+fmt(reg.faltInv)+' productos + '+fmt(reg.faltDin)+' dinero)</span>',reg.total>0?'#ef4444':'#22c55e');
  imprimirCuadre(reg);
  render();
}
/* 🖨️ Comparativo imprimible: SOLO lo digitado en el conteo */
function imprimirCuadre(reg){
  var items,dinero,faltInv,faltDin,ts,quien;
  if(reg&&reg.items){
    items=reg.items;dinero=reg.dinero;faltInv=reg.faltInv;faltDin=reg.faltDin;ts=reg.ts;quien=reg.uidNombre;
  }else{
    var r=_cfDif();
    if(!r.faltItems.length&&!r.sobrItems.length&&!r.dinDet.length){alert('No digitaste ningún conteo para imprimir.');return;}
    items=[];
    Object.keys(window._cfVals||{}).forEach(function(pid){
      var v=window._cfVals[pid];if(v===''||v==null)return;
      var p=menu.find(function(m){return String(m.id)===String(pid);});
      if(!p||p.sinStock)return;
      var fis=parseInt(v)||0;var sis=parseInt(p.stock)||0;var dif=fis-sis;
      if(dif!==0)items.push({nombre:p.nombre,sis:sis,fis:fis,dif:dif,valor:dif<0?(-dif)*(p.precio||0):0});
    });
    dinero=r.dinDet.map(function(d){return{label:d.f.label,sis:d.sis,fis:d.fis,dif:d.dif};});
    faltInv=r.totalFaltInv;faltDin=r.dinFalt;ts=a52Ahora();quien=usuarioActivo.nombre;
  }
  var fmtP=function(n){return '$'+(n||0).toLocaleString('es-CO');};
  var filasP=items.map(function(it){
    return'<tr><td>'+esc(it.nombre)+'</td><td style="text-align:center">'+it.sis+'</td><td style="text-align:center">'+it.fis+'</td><td style="text-align:center;font-weight:bold">'+(it.dif>0?'+':'')+it.dif+'</td><td style="text-align:right">'+(it.dif<0?fmtP(it.valor):'—')+'</td></tr>';
  }).join('');
  var filasD=(dinero||[]).map(function(d){
    return'<tr><td>'+esc(d.label)+'</td><td style="text-align:right">'+fmtP(d.sis)+'</td><td style="text-align:right">'+fmtP(d.fis)+'</td><td style="text-align:right;font-weight:bold">'+(d.dif===0?'✓':(d.dif>0?'+':'−')+fmtP(Math.abs(d.dif)))+'</td></tr>';
  }).join('');
  var w=window.open('','_blank');
  if(!w){alert('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes.');return;}
  w.document.write('<html><head><title>Cuadre físico</title><style>'
    +'body{font-family:monospace;font-size:12px;margin:16px;color:#000}'
    +'h2{margin:0 0 2px;font-size:15px}table{width:100%;border-collapse:collapse;margin:8px 0}'
    +'th,td{border-bottom:1px solid #999;padding:3px 4px;font-size:11px;text-align:left}'
    +'th{border-bottom:2px solid #000}.tot{font-size:13px;font-weight:bold}'
    +'</style></head><body>'
    +'<h2>'+M('nombreSimple')+' — CUADRE FÍSICO</h2>'
    +'<div>'+new Date(ts).toLocaleString('es-CO')+' · realizó: '+esc(quien||'')+'</div>'
    +(items.length?'<h3 style="margin:10px 0 0">📦 Productos (solo diferencias)</h3>'
      +'<table><tr><th>Producto</th><th style="text-align:center">Sistema</th><th style="text-align:center">Físico</th><th style="text-align:center">Dif</th><th style="text-align:right">Faltante $</th></tr>'+filasP+'</table>':'')
    +((dinero||[]).length?'<h3 style="margin:10px 0 0">💵 Dinero</h3>'
      +'<table><tr><th>Medio</th><th style="text-align:right">Sistema</th><th style="text-align:right">Contado</th><th style="text-align:right">Dif</th></tr>'+filasD+'</table>':'')
    +'<div class="tot">Faltante en productos: '+fmtP(faltInv)+'</div>'
    +'<div class="tot">Faltante en dinero: '+fmtP(faltDin)+'</div>'
    +'<div class="tot" style="font-size:15px;border-top:2px solid #000;margin-top:4px;padding-top:4px">TOTAL FALTANTE: '+fmtP((faltInv||0)+(faltDin||0))+'</div>'
    +'<br/><div>Firma: ________________________</div>'
    +'</body></html>');
  w.document.close();
  setTimeout(function(){try{w.print();}catch(e){}},300);
}

function elegirImpresionInventario(){
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🖨️ Imprimir inventario</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:14px">¿Qué quieres revisar?</div>'
    +'<button class="btn btn-full" onclick="closeModal1();imprimirInventario(true)" style="background:#f5a623;color:#1a1a22;border:none;font-weight:800">🔥 Solo lo que rota<br><span style="font-size:11px;font-weight:600;opacity:.8">Productos vendidos en los últimos 30 días</span></button>'
    +'<button class="btn btn-full" onclick="closeModal1();imprimirInventario(false)" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">📦 Inventario completo<br><span style="font-size:11px;font-weight:600;opacity:.7">Todos los productos e insumos con unidades</span></button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--muted);margin-top:8px">Cancelar</button>');
}
function _pidsQueRotan(dias){
  // Productos con al menos una venta en los últimos N días (incluye cubetazos y variantes)
  var corte=a52Ahora()-dias*86400000;
  var set={};
  ventas.forEach(function(v){
    if((v.ts||0)<corte)return;
    (v.items||[]).forEach(function(it){
      if(it.pid)set[it.pid]=true;
      // Cubetazos mixtos y combos con lista interna de productos
      (it.items||[]).forEach(function(sub){if(sub.pid)set[sub.pid]=true;});
      (it.comboItems||[]).forEach(function(sub){if(sub.pid)set[sub.pid]=true;});
    });
  });
  return set;
}
function imprimirInventario(soloRotan){
  // Solo productos/ingredientes con unidades restantes (stock > 0)
  var conStock=menu.filter(function(p){return !p.sinStock&&(parseInt(p.stock)||0)>0;});
  var ingsStock=ingredientes.filter(function(x){return (parseInt(x.stock)||0)>0;});
  if(soloRotan){
    var rota=_pidsQueRotan(30);
    conStock=conStock.filter(function(p){return rota[p.id];});
    ingsStock=[];  // el conteo de rotación es de productos de la carta
    if(!conStock.length){alert('Ningún producto con stock se ha vendido en los últimos 30 días.');return;}
  }
  if(!conStock.length&&!ingsStock.length){alert('No hay productos con unidades en inventario.');return;}
  // Agrupar por categoría
  var porCat={};
  conStock.forEach(function(p){
    var c=p.cat||'Sin categoría';
    if(!porCat[c])porCat[c]=[];
    porCat[c].push(p);
  });
  var cats=Object.keys(porCat).sort();
  var cuerpo='';var totalUnd=0;
  cats.forEach(function(c){
    cuerpo+='<tr><td colspan="2" style="font-weight:900;border-bottom:1px solid #000;padding-top:6px">'+esc(c.toUpperCase())+'</td></tr>';
    porCat[c].sort(function(a,b){return (a.nombre||'').localeCompare(b.nombre||'');}).forEach(function(p){
      var st=parseInt(p.stock)||0;totalUnd+=st;
      cuerpo+='<tr><td>'+esc(p.nombre)+'</td><td align="right" style="font-weight:900">'+st+'</td></tr>';
    });
  });
  if(ingsStock.length){
    cuerpo+='<tr><td colspan="2" style="font-weight:900;border-bottom:1px solid #000;padding-top:6px">INSUMOS</td></tr>';
    ingsStock.sort(function(a,b){return (a.nombre||'').localeCompare(b.nombre||'');}).forEach(function(x){
      var st=parseInt(x.stock)||0;
      cuerpo+='<tr><td>'+esc(x.nombre)+'</td><td align="right" style="font-weight:900">'+st+'</td></tr>';
    });
  }
  var w=window.open('','_blank','width=340,height=700');
  var fs=ticketConfig.fontSize||14;
  var pw=ticketConfig.paperWidth||280;
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
    +'@page{margin:0;size:'+pw+'px auto}'
    +'html,body{margin:0;padding:0;width:'+pw+'px}'
    +'body{font-family:"Courier New",monospace;font-size:'+fs+'px;padding:8px 10px 16px}'
    +'.t{font-size:'+(fs+6)+'px;font-weight:900;letter-spacing:4px;text-align:center}'
    +'.s{text-align:center;font-size:'+(fs-3)+'px;letter-spacing:3px;color:#555;margin-bottom:4px}'
    +'p{text-align:center;margin:2px 0;font-size:'+(fs-2)+'px}'
    +'hr{border:none;border-top:1px dashed #000;margin:6px 0}'
    +'table{width:100%;border-collapse:collapse}'
    +'td{padding:2px 0;font-size:'+(fs-1)+'px}'
    +'.tot{font-size:'+(fs+2)+'px;font-weight:900;text-align:right;margin-top:6px}'
    +'.pie{text-align:center;font-size:'+(fs-3)+'px;margin-top:8px;color:#777}'
    +'</style></head><body>');
  w.document.write('<div style="text-align:center;font-size:26px">'+NEGOCIO.emoji+'</div><div class="t">'+M('nombreSimple')+'</div><div class="s">'+MU('tipo')+'</div><hr/>'
    +'<p style="font-weight:900">'+(soloRotan?'INVENTARIO — SOLO ROTACION (vendidos ult. 30 dias)':'INVENTARIO ACTUAL')+'</p>'
    +'<p>'+new Date().toLocaleString('es-CO')+'</p>'
    +'<p>Imprimió: '+esc(usuarioActivo?usuarioActivo.nombre:'')+'</p><hr/>'
    +'<table>'+cuerpo+'</table><hr/>'
    +'<div class="tot">'+conStock.length+' productos · '+totalUnd+' und</div>'
    +'<p class="pie">Solo se listan productos con unidades. Los agotados (0) no aparecen.</p>');
  w.document.write('</body></html>');
  w.document.close();
  setTimeout(function(){w.print();},300);
}
function imprimirTicket(mesa,ped,total,fpId,abonos){
  // fpId can be array of {fp,label,monto} or string
  var pagosList=Array.isArray(fpId)?fpId:null;
  var fp=pagosList?null:FPAGO.find(function(f){return f.id===fpId;});
  var zona=ZONAS.find(function(z){return z.id===mesa.zona;});
  var rows=ped.map(function(it){
    var nombre,pr,nota='';
    if(it.isCustom){
      nombre=esc(it.customNombre||'Personalizado');
      pr=it.customPrecio||0;
    } else if(it.isCombo){
      nombre=it.comboEmoji+' '+esc(it.comboNombre||'Combo');
      pr=it.comboPrecio||0;
    } else if(it.isCubetazoMix){
      nombre='🪣 '+esc(it.cubMixNombre||'Cubetazo mixto');
      pr=it.cubMixPrecio||0;
    } else {
      var p=menu.find(function(m){return m.id==it.pid;});
      nombre=(it.cubeta?'[Cubetazo] ':'')+esc((p&&p.nombre)||it.nombre||'?')+(it.varianteNombre?' ('+esc(it.varianteNombre)+')':'')+(it.cubeta?' x5':'')+(it.es2x1Gratis?' <b>[2x1 GRATIS]</b>':'');
      pr=precioItem(it);
      var notaP=_promoNotaTicket(it);
      if(notaP)nota='<br><span style="font-size:.82em">🏷️'+esc(notaP)+'</span>';
    }
    return'<tr><td>'+nombre+nota+'</td><td align="center">'+it.qty+'</td><td align="right">'+fmt(pr*it.qty)+'</td></tr>';
  }).join('');
  var w=window.open('','_blank','width=340,height=700');
  var fs=ticketConfig.fontSize||14;
  var pw=ticketConfig.paperWidth||280;
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
    +'@page{margin:0;size:'+pw+'px auto}'
    +'html,body{margin:0;padding:0;width:'+pw+'px}'
    +'body{font-family:"Courier New",monospace;font-size:'+fs+'px;padding:8px 10px 16px}'
    +'.t{font-size:'+(fs+6)+'px;font-weight:900;letter-spacing:4px;text-align:center}'
    +'.s{text-align:center;font-size:'+(fs-3)+'px;letter-spacing:3px;color:#555;margin-bottom:4px}'
    +'p{text-align:center;margin:2px 0;font-size:'+(fs-2)+'px}'
    +'hr{border:none;border-top:1px dashed #000;margin:6px 0}'
    +'table{width:100%;border-collapse:collapse}'
    +'th{font-size:'+(fs-2)+'px;border-bottom:1px solid #000;padding:2px 0}'
    +'td{padding:2px 0;font-size:'+(fs-1)+'px}'
    +'.tot{font-size:'+(fs+4)+'px;font-weight:900;text-align:right;margin-top:6px}'
    +'.pago{background:#000;color:#fff;text-align:center;padding:4px;font-size:'+(fs-1)+'px;margin-top:6px}'
    +'.pie{text-align:center;font-size:'+(fs-3)+'px;margin-top:8px;color:#777}'
    +'</style></head><body>');
    w.document.write('<div style="text-align:center;font-size:26px">'+NEGOCIO.emoji+'</div><div class="t">'+M('nombreSimple')+'</div><div class="s">'+MU('tipo')+'</div><hr/>'
    +'<p>'+(zona?zona.label:'')+' - '+esc(mesa.nombre||'Mesa '+mesa.num)+'</p>'
    +'<p>'+new Date().toLocaleString('es-CO')+'</p>'
    +'<p style="color:#555">'+usuarioActivo.emoji+' '+esc(usuarioActivo.nombre)+'</p><hr/>'
    +'<table><thead><tr><th align="left">Producto</th><th>Cant</th><th align="right">Valor</th></tr></thead><tbody>'+rows+'</tbody></table><hr/>'
    +'<div class="tot">TOTAL: '+fmt(total)+'</div>'
    +((abonos&&abonos.length)
      ?'<hr/><p style="text-align:left;font-weight:bold;margin:2px 0">ABONOS PREVIOS:</p>'
        +abonos.map(function(ab){var f=FPAGO.find(function(x){return x.id===ab.fp;});return'<p style="text-align:left;margin:1px 0">&nbsp;• '+esc(ab.nombre||'Abono')+(f?' ('+f.label+')':'')+': '+fmt(ab.monto||0)+(ab.ts?' <span style="color:#777">'+fmtFechaCorta(ab.ts)+'</span>':'')+'</p>';}).join('')
        +'<p style="text-align:left;margin:2px 0">&nbsp;Total abonado: <b>'+fmt(abonos.reduce(function(a,x){return a+(x.monto||0);},0))+'</b></p>'
        +'<p style="text-align:left;margin:2px 0">&nbsp;Pagado al cobrar: <b>'+fmt(Math.max(0,total-abonos.reduce(function(a,x){return a+(x.monto||0);},0)))+'</b></p>'
      :'')
    +(pagosList
    ?'<div class="pago">'+pagosList.map(function(p){var f=FPAGO.find(function(x){return x.id===p.fp;});return(f?f.emoji+' ':'')+p.label+': '+fmt(p.monto);}).join(' | ')+'</div>'
    :'<div class="pago">'+(fp?fp.emoji+' Pago: '+fp.label:String(fpId))+'</div>')
    +'<div class="pie">¡Gracias!'+(NEGOCIO.instagram?' @'+M('instagram'):'')+'</div>'
    +'</body></html>');
  w.document.close();w.print();
}


