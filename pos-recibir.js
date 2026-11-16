/* ═══════════ 📦 RECIBIR MERCANCÍA · BAJAS · MOTIVOS · QUÉ PEDIR ═══════════
   Un solo camino para que la mercancía entre bien: una factura con varias líneas, que suma al inventario,
   promedia el costo y registra el pago (caja, a crédito o lo pagó un socio). Además: todo ajuste a mano pide
   motivo, las bajas (rotura, vencido, cortesía) son un movimiento propio y cada producto tiene su mínimo. */

/* ── Mínimo por producto, según lo que de verdad se vende ──
   Si el administrador no fijó un mínimo, se calcula con el consumo de los últimos 30 días: el mínimo cubre
   INV_DIAS.min días de venta y el ideal INV_DIAS.ideal. Lo que no se vende queda en 0 y no molesta en las alertas. */
var INV_DIAS={min:3,ideal:7,ventana:30};
var _invCons={ts:0,n:-1,p:{},i:{}};
function invConsumo(){
  // unidades por día de cada producto e insumo (combos, cubetazos y recetas incluidos)
  if(_invCons.n===ventas.length&&Date.now()-_invCons.ts<120000)return _invCons;
  var desde=a52Ahora()-INV_DIAS.ventana*86400000,vs=ventas.filter(function(v){return v.ts>=desde;});
  var primera=vs.reduce(function(a,v){return Math.min(a,v.ts);},a52Ahora());
  var dias=Math.max(7,Math.min(INV_DIAS.ventana,Math.ceil((a52Ahora()-primera)/86400000)));   // un negocio que apenas empieza no divide entre 30
  var p={},i={};
  if(typeof expUnidades==='function')expUnidades(vs).forEach(function(f){
    var prod=menu.find(function(m){return _normTxt(m.nombre)===_normTxt(f.nombre)||_normTxt(f.nombre).indexOf(_normTxt(m.nombre)+' (')===0;});
    if(!prod)return;
    p[prod.id]=(p[prod.id]||0)+f.und/dias;
    (prod.receta||[]).forEach(function(ri){
      if(ri.grupo||ri.pid==null)return;
      var c=ri.porCada>0?f.und*ri.cantidad/ri.porCada:f.und*(ri.cantidad||1);
      if(menu.some(function(m){return Number(m.id)===Number(ri.pid);}))p[ri.pid]=(p[ri.pid]||0)+c/dias;else i[ri.pid]=(i[ri.pid]||0)+c/dias;
    });
  });
  _invCons={ts:Date.now(),n:ventas.length,p:p,i:i,dias:dias};
  return _invCons;
}
function invPorDia(x){var c=invConsumo();return (ingredientes.indexOf(x)>=0?c.i[x.id]:c.p[x.id])||0;}
function invMinAuto(x){return Math.ceil(invPorDia(x)*INV_DIAS.min);}
function invIdealAuto(x){return Math.max(Math.ceil(invPorDia(x)*INV_DIAS.ideal),invMinAuto(x)+(invPorDia(x)>0?1:0));}
function invMin(x){var m=parseInt(x&&x.min);return isNaN(m)?invMinAuto(x):m;}
function invIdeal(x){var m=parseInt(x&&x.ideal);return isNaN(m)?Math.max(invIdealAuto(x),invMin(x)):m;}
function invBajo(x){var m=invMin(x);return m>0&&(parseInt(x.stock)||0)<=m;}
function rmPuede(){return !!usuarioActivo&&usuarioActivo.rol!=='mesero';}

/* ══ 1. Recibir mercancía ══ */
var _rm={lineas:[],totalManual:false};
function _rmItems(){
  var l=[];
  menu.forEach(function(m){if(!m.sinStock&&m.activo!==false)l.push({t:'p',id:m.id,nombre:m.nombre,emoji:m.emoji||'📦',und:m.und||'und',costo:m.costo||0});});
  ingredientes.forEach(function(i){l.push({t:'i',id:i.id,nombre:i.nombre,emoji:'🧂',und:i.und||'und',costo:0});});
  return l;
}
function rmSugerir(q){
  var box=document.getElementById('rm-sug');if(!box)return;
  q=_normTxt(q||'').trim();
  if(q.length<2){box.innerHTML='';return;}
  var ya={};_rm.lineas.forEach(function(l){ya[l.t+'|'+l.id]=1;});
  var r=_rmItems().filter(function(x){return !ya[x.t+'|'+x.id]&&_normTxt(x.nombre).indexOf(q)>=0;}).slice(0,8);
  window._rmSug=r;
  box.innerHTML=r.map(function(x,k){return '<button type="button" data-rm-add="'+k+'" style="background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:99px;padding:7px 12px;font-size:13px;font-weight:700;cursor:pointer">'+x.emoji+' '+esc(x.nombre)+'</button>';}).join('')
    ||'<div style="color:var(--muted);font-size:12px">Nada con ese nombre. Si es un producto nuevo, créelo primero en la carta.</div>';
}
function _rmSuma(){return _rm.lineas.reduce(function(a,l){return a+(parseInt(l.cant)||0)*(parseInt(l.costo)||0);},0);}
function rmPintarLineas(){
  var box=document.getElementById('rm-lineas');if(!box)return;
  var inp='background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:8px;font-size:14px;text-align:right';
  box.innerHTML=_rm.lineas.length?_rm.lineas.map(function(l,k){
    return '<div style="display:grid;grid-template-columns:minmax(0,1fr) 70px 104px 30px;gap:6px;align-items:center;padding:6px 0;border-top:1px solid var(--border)">'
      +'<div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+l.emoji+' '+esc(l.nombre)+'<div style="color:var(--muted);font-size:10.5px;font-weight:600" id="rm-sub-'+k+'">'+(l.cant*l.costo?fmt(l.cant*l.costo):esc(l.und))+'</div></div>'
      +'<input type="number" inputmode="numeric" min="1" value="'+(l.cant||'')+'" data-rm-cant="'+k+'" aria-label="Cantidad" placeholder="Cant." style="'+inp+';width:100%">'
      +(l.t==='p'?'<input type="text" inputmode="numeric" value="'+(l.costo?moneyFmt(l.costo):'')+'" data-rm-costo="'+k+'" aria-label="Costo por unidad" placeholder="$ c/u" style="'+inp+';width:100%">':'<span style="color:var(--muted);font-size:10.5px;text-align:center">insumo</span>')
      +'<button type="button" data-rm-del="'+k+'" aria-label="Quitar" style="background:#ef444418;color:#ef4444;border:none;border-radius:7px;width:30px;height:30px;cursor:pointer">✕</button></div>';
  }).join(''):'<div style="color:var(--muted);font-size:12px;padding:8px 0">Busca arriba cada producto de la factura y agrégalo.</div>';
  rmTotal();
}
function rmTotal(){
  var t=document.getElementById('rm-total');if(t&&!_rm.totalManual){var s=_rmSuma();t.value=s?moneyFmt(s):'';}
  var n=document.getElementById('rm-cuenta');if(n){var u=_rm.lineas.reduce(function(a,l){return a+(parseInt(l.cant)||0);},0);n.textContent=_rm.lineas.length+' producto'+(_rm.lineas.length!==1?'s':'')+' · '+u+' unidad'+(u!==1?'es':'');}
}
function rmFp(){
  var fp=(document.getElementById('rm-fp')||{}).value||'';
  var v=document.getElementById('rm-vence-w'),s=document.getElementById('rm-socio-w'),t=document.getElementById('rm-total-w');
  if(v)v.style.display=fp==='credito'?'block':'none';
  if(s)s.style.display=fp==='socio'?'block':'none';
  if(t)t.style.display=fp==='nada'?'none':'block';
}
function abrirRecibirMercancia(){
  if(!rmPuede()){alert('Los meseros no registran entradas de mercancía.');return;}
  _rm={lineas:[],totalManual:false};
  var inp='class="inp"',lab='style="color:var(--muted);font-size:11px;margin-bottom:3px"',hoy=_fechaKey(new Date());
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:2px">📦 Recibir mercancía</div>'
    +'<div style="color:var(--muted);font-size:11.5px;margin-bottom:10px">Una factura, todos sus productos. Suma al inventario, actualiza el costo y registra cómo se pagó.</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
      +'<div style="grid-column:1/-1"><div '+lab+'>Proveedor</div><select '+inp+' id="rm-prov"><option value="">— Sin proveedor —</option>'+proveedores.map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.nombre)+'</option>';}).join('')+'</select></div>'
      +'<div><div '+lab+'>N.º de factura</div><input '+inp+' id="rm-factura" placeholder="Ej: 00123" autocomplete="off"></div>'
      +'<div><div '+lab+'>Fecha de la factura</div><input '+inp+' id="rm-fecha" type="date" value="'+hoy+'"></div>'
    +'</div>'
    +'<div '+lab+'>Productos que llegaron</div>'
    +'<input '+inp+' id="rm-busq" type="search" placeholder="🔍 Buscar producto o insumo…" autocomplete="off" style="margin-bottom:6px">'
    +'<div id="rm-sug" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px"></div>'
    +'<div id="rm-lineas"></div>'
    +'<div id="rm-cuenta" style="color:var(--muted);font-size:11.5px;margin:6px 0 10px"></div>'
    +'<div '+lab+'>¿Cómo se pagó?</div>'
    +'<select '+inp+' id="rm-fp" onchange="rmFp()" style="margin-bottom:8px"><option value="">— Elige —</option>'
      +FPV().map(function(f){return '<option value="'+f.id+'">'+f.emoji+' '+esc(f.label)+' (sale de la caja)</option>';}).join('')
      +'<option value="credito">🧾 A crédito: queda por pagar al proveedor</option>'
      +(SOCIOS.length?'<option value="socio">🤝 Lo pagó un socio con su plata</option>':'')
      +'<option value="nada">📦 Solo inventario: no registrar pago</option></select>'
    +'<div id="rm-vence-w" style="display:none;margin-bottom:8px"><div '+lab+'>¿Cuándo hay que pagarla?</div><input '+inp+' id="rm-vence" type="date"></div>'
    +'<div id="rm-socio-w" style="display:none;margin-bottom:8px"><div '+lab+'>¿Cuál socio?</div><select '+inp+' id="rm-socio">'+SOCIOS.map(function(s){return '<option value="'+esc(s.id)+'">'+esc(socNom(s.id))+'</option>';}).join('')+'</select></div>'
    +'<div id="rm-total-w" style="margin-bottom:12px"><div '+lab+'>Valor total de la factura</div><input class="inp money" id="rm-total" type="text" inputmode="numeric" placeholder="0" oninput="_rm.totalManual=true;this.value=moneyFmt(this.value)"><div style="color:var(--muted);font-size:10.5px;margin-top:3px">Se llena solo con cantidad × costo. Corrígelo si la factura trae IVA, fletes o descuentos.</div></div>'
    +'<div id="rm-error" role="alert" style="color:#ef4444;font-weight:700;font-size:12.5px;margin-bottom:8px"></div>'
    +'<button class="btn btn-green btn-full" onclick="guardarRecibirMercancia()">✓ Registrar entrada</button>');
  rmPintarLineas();rmFp();
}
function guardarRecibirMercancia(){
  var err=function(t,id){var e=document.getElementById('rm-error');if(e)e.textContent=t;var f=id&&document.getElementById(id);if(f)f.focus();};
  var g=function(id){return ((document.getElementById(id)||{}).value||'').trim();};
  var ent=_rm.lineas.filter(function(l){return (parseInt(l.cant)||0)>0;}).map(function(l){return {t:l.t,id:l.id,nombre:l.nombre,cant:parseInt(l.cant)||0,costo:l.t==='p'?(parseInt(l.costo)||0):0};});
  if(!ent.length){err('Agrega al menos un producto con su cantidad.','rm-busq');return;}
  var fp=g('rm-fp'),provId=g('rm-prov'),factura=g('rm-factura'),fecha=g('rm-fecha'),valor=moneyVal('rm-total')||0;
  if(!fp){err('Elige cómo se pagó la factura.','rm-fp');return;}
  if(fp!=='nada'&&valor<=0){err('Escribe el valor total de la factura, o el costo de cada producto.','rm-total');return;}
  var pv=provId?proveedores.find(function(p){return p.id===provId;}):null;
  if(fp==='credito'&&!pv){err('Para dejarla a crédito elige el proveedor al que se le queda debiendo.','rm-prov');return;}
  var vence=g('rm-vence');
  if(fp==='credito'&&!vence){err('Pon la fecha en que hay que pagar la factura.','rm-vence');return;}
  var concepto=(pv?pv.nombre:'Compra sin proveedor')+(factura?' · Fact '+factura:'');
  var categoria=ent.every(function(l){return l.t==='i';})?'Insumos':'Mercancía';
  var base={ts:a52Ahora(),concepto:concepto,categoria:categoria,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,entradas:ent};
  if(factura)base.factura=factura;if(fecha)base.fechaFactura=fecha;
  if(pv){base.provId=pv.id;base.provNombre=pv.nombre;}
  gInvAplicar(ent,concepto,1);
  var aviso;
  if(fp==='socio'){
    var socId=g('rm-socio')||socDef();
    var regS=Object.assign({id:'ps_'+a52Ahora(),socio:socId,tipo:'compra',monto:valor,fp:'',devuelto:0,devoluciones:[]},base);regS.concepto=concepto+' ('+categoria+')';
    prestamosSocios.push(regS);var rS=ref('prestamosSocios');if(rS)rS.push(regS);else fbSet('prestamosSocios',prestamosSocios);
    aviso='🤝 '+esc(socNom(socId))+' pagó '+fmt(valor)+' · el negocio se lo debe';
  }else if(fp==='credito'){
    fbPush('cuentasPorPagar',Object.assign({id:'cxp'+a52Ahora(),valor:valor,abonado:0,pagado:false,vence:vence,notas:''},base));
    aviso='🧾 Queda por pagar '+fmt(valor)+' a '+esc(pv.nombre)+' · vence '+vence.split('-').reverse().join('/');
  }else if(fp!=='nada'){
    fbPush('gastos',Object.assign({id:'g'+a52Ahora(),valor:valor,notas:'',fp:fp},base));
    aviso='💵 Gasto de '+fmt(valor)+' registrado';
  }else aviso='Sin movimiento de plata';
  ent.forEach(function(l,i){fbPush('ingresosInv',{id:'ing_'+a52Ahora()+'_'+i,ts:a52Ahora(),fecha:fecha,prodTipo:l.t,prodId:l.id,prodNombre:l.nombre,cantidad:l.cant,proveedor:pv?pv.nombre:'',factura:factura,valorFactura:0,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre});});
  var und=ent.reduce(function(a,l){return a+l.cant;},0);
  closeModal1();
  showToast('📦 Entraron '+und+' unidad'+(und!==1?'es':'')+' ('+ent.length+' producto'+(ent.length!==1?'s':'')+')<br><span style="font-size:12px;opacity:.85">'+aviso+'</span>','#22c55e');
  render();
}
document.addEventListener('click',function(e){
  if(!e.target.closest)return;
  var a=e.target.closest('[data-rm-add]');
  if(a){var x=(window._rmSug||[])[Number(a.dataset.rmAdd)];if(!x)return;_rm.lineas.push({t:x.t,id:x.id,nombre:x.nombre,emoji:x.emoji,und:x.und,cant:1,costo:x.costo||0});
    var b=document.getElementById('rm-busq');if(b){b.value='';b.focus();}var s=document.getElementById('rm-sug');if(s)s.innerHTML='';rmPintarLineas();return;}
  var d=e.target.closest('[data-rm-del]');if(d){_rm.lineas.splice(Number(d.dataset.rmDel),1);rmPintarLineas();return;}
});
document.addEventListener('input',function(e){
  var t=e.target;if(!t||!t.dataset)return;
  if(t.id==='rm-busq'){rmSugerir(t.value);return;}
  var k=t.dataset.rmCant!=null?Number(t.dataset.rmCant):(t.dataset.rmCosto!=null?Number(t.dataset.rmCosto):-1);if(k<0)return;
  var l=_rm.lineas[k];if(!l)return;
  if(t.dataset.rmCant!=null)l.cant=parseInt(t.value)||0;else{t.value=moneyFmt(t.value);l.costo=parseInt(String(t.value).replace(/[^0-9]/g,''),10)||0;}
  var sub=document.getElementById('rm-sub-'+k);if(sub)sub.textContent=l.cant*l.costo?fmt(l.cant*l.costo):l.und;
  rmTotal();
});

/* ══ 2. Todo ajuste a mano pide motivo ══ */
var AJ_MOTIVOS={
  menos:['Rotura o daño','Vencido','Cortesía de la casa','Consumo interno','Error de conteo'],
  mas:['Error de conteo','Llegó mercancía sin factura','Devolución de un cliente']
};
var _ajPend=null,_ajUlt={};
function _ajPintar(){
  var p=_ajPend;if(!p)return;
  var lista=p.delta<0?AJ_MOTIVOS.menos:AJ_MOTIVOS.mas;
  modal2('<div style="text-align:center;margin-bottom:12px"><div style="font-weight:800;font-size:16px">¿Por qué '+(p.delta<0?'salen':'entran')+' '+Math.abs(p.delta)+'?</div>'
    +'<div style="color:var(--muted);font-size:12.5px;margin-top:3px">'+esc(p.nombre)+' · queda escrito en el kardex con tu nombre</div></div>'
    +'<div style="display:grid;gap:8px">'+lista.map(function(m,i){return '<button class="btn btn-full" data-aj-mot="'+i+'" style="background:var(--card2);border:1px solid var(--border);color:var(--text);text-align:left;padding:13px 14px">'+esc(m)+'</button>';}).join('')+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:10px"><input class="inp" id="aj-otro" placeholder="Otro motivo…" autocomplete="off" style="flex:1"><button class="btn" data-aj-otro style="background:var(--accent);color:#fff;border:none">Usar</button></div>'
    +'<button class="btn btn-full" data-aj-cancelar style="background:none;border:1px solid var(--border);color:var(--muted);margin-top:10px">Cancelar: no cambiar nada</button>');
}
function _ajAplicar(mot){
  var p=_ajPend;_ajPend=null;if(!p)return;
  closeModal2();
  _ajUlt={signo:p.delta<0?-1:1,mot:mot,ts:Date.now()};
  var esBaja=p.delta<0&&AJ_MOTIVOS.menos.indexOf(mot)>=0&&mot!=='Error de conteo';
  _cambiarStock0(p.tipo,p.id,p.delta,(esBaja?'🗑 Baja: '+mot:p.motivo+' · '+mot));
  render();
}
var _cambiarStock0=cambiarStock;
cambiarStock=function(tipo,id,delta,motivo){
  delta=parseInt(delta)||0;
  if(!delta||!/^✏️ Ajuste manual/.test(String(motivo||''))||/ · /.test(String(motivo||'')))return _cambiarStock0(tipo,id,delta,motivo);
  var col=tipo==='p'?menu:ingredientes,it=col.find(function(x){return String(x.id)===String(id);});
  if(!it||(tipo==='p'&&it.sinStock))return _cambiarStock0(tipo,id,delta,motivo);
  // varios toques seguidos de +1 / −1 con el mismo motivo: no se pregunta cada vez (90 segundos)
  if(Math.abs(delta)===1&&_ajUlt.mot&&_ajUlt.signo===(delta<0?-1:1)&&Date.now()-_ajUlt.ts<90000){
    _ajUlt.ts=Date.now();var eb=delta<0&&AJ_MOTIVOS.menos.indexOf(_ajUlt.mot)>=0&&_ajUlt.mot!=='Error de conteo';
    return _cambiarStock0(tipo,id,delta,eb?'🗑 Baja: '+_ajUlt.mot:motivo+' · '+_ajUlt.mot);
  }
  _ajPend={tipo:tipo,id:id,delta:delta,motivo:motivo,nombre:it.nombre};
  setTimeout(_ajPintar,40);   // después de que la ventana que lo pidió termine de cerrarse
};
document.addEventListener('click',function(e){
  if(!_ajPend||!e.target.closest)return;
  var m=e.target.closest('[data-aj-mot]');
  if(m){_ajAplicar((_ajPend.delta<0?AJ_MOTIVOS.menos:AJ_MOTIVOS.mas)[Number(m.dataset.ajMot)]);return;}
  if(e.target.closest('[data-aj-otro]')){var t=((document.getElementById('aj-otro')||{}).value||'').trim();if(t.length<3){var o=document.getElementById('aj-otro');if(o){o.placeholder='Escribe el motivo (mínimo 3 letras)';o.focus();}return;}_ajAplicar(t);return;}
  if(e.target.closest('[data-aj-cancelar]')){_ajPend=null;closeModal2();}
});

/* ══ 3. Dar de baja varias unidades ══ */
function abrirBajaInventario(){
  if(!puedeAjustarInv()){alert('🔒 Solo quien puede ajustar el inventario registra bajas.');return;}
  var its=_rmItems().sort(function(a,b){return a.nombre.localeCompare(b.nombre);});
  modal2('<div style="font-weight:800;font-size:16px;margin-bottom:10px">🗑 Dar de baja</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Producto o insumo</div><select class="inp" id="bj-item" style="margin-bottom:8px"><option value="">— Elige —</option>'+its.map(function(x){return '<option value="'+x.t+'|'+esc(x.id)+'">'+x.emoji+' '+esc(x.nombre)+'</option>';}).join('')+'</select>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Cantidad</div><input class="inp" id="bj-cant" type="number" inputmode="numeric" min="1" style="margin-bottom:8px">'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Motivo</div><select class="inp" id="bj-mot" style="margin-bottom:8px">'+AJ_MOTIVOS.menos.filter(function(m){return m!=='Error de conteo';}).map(function(m){return '<option>'+esc(m)+'</option>';}).join('')+'</select>'
    +'<input class="inp" id="bj-nota" placeholder="Detalle (opcional): se cayó la canasta…" autocomplete="off" style="margin-bottom:10px">'
    +'<div id="bj-error" role="alert" style="color:#ef4444;font-weight:700;font-size:12.5px;margin-bottom:8px"></div>'
    +'<button class="btn btn-full" onclick="guardarBajaInventario()" style="background:#ef4444;color:#fff;border:none">Registrar la baja</button>');
}
function guardarBajaInventario(){
  var v=((document.getElementById('bj-item')||{}).value||''),c=parseInt((document.getElementById('bj-cant')||{}).value)||0,e=document.getElementById('bj-error');
  if(!v){if(e)e.textContent='Elige el producto.';return;}
  if(c<=0){if(e)e.textContent='Escribe cuántas unidades salen.';return;}
  var t=v.charAt(0),id=v.slice(2),mot=(document.getElementById('bj-mot')||{}).value||'',nota=((document.getElementById('bj-nota')||{}).value||'').trim();
  var col=t==='p'?menu:ingredientes,it=col.find(function(x){return String(x.id)===String(id);});if(!it)return;
  if((parseInt(it.stock)||0)<c&&e&&!e.dataset.ok){e.dataset.ok='1';e.textContent='Solo hay '+(parseInt(it.stock)||0)+' en el sistema. Si de verdad salen '+c+', toca otra vez el botón.';return;}
  _cambiarStock0(t,it.id,-c,'🗑 Baja: '+mot+(nota?' ('+nota+')':''));
  closeModal2();showToast('🗑 Baja registrada: '+c+' × '+esc(it.nombre)+'<br><span style="font-size:12px;opacity:.85">'+esc(mot)+'</span>','#ef4444');render();
}

/* ══ 4. Mínimos por producto y lista de qué pedir ══ */
var _qp={soloBajos:true,busca:''};
function _qpFilas(){
  var q=_normTxt(_qp.busca||''),puede=puedeAjustarInv();
  var its=[];
  menu.forEach(function(m){if(!m.sinStock&&m.activo!==false)its.push({t:'p',o:m,cat:m.cat||'',emoji:m.emoji||'📦'});});
  ingredientes.forEach(function(i){its.push({t:'i',o:i,cat:'Insumos',emoji:'🧂'});});
  its=its.filter(function(x){return (!q||_normTxt(x.o.nombre+' '+x.cat).indexOf(q)>=0)&&(!_qp.soloBajos||q||invBajo(x.o));});
  its.sort(function(a,b){return a.cat.localeCompare(b.cat)||invPorDia(b.o)-invPorDia(a.o)||a.o.nombre.localeCompare(b.o.nombre);});
  if(!its.length)return '<div style="color:var(--muted);text-align:center;padding:18px;font-size:13px">'+(_qp.soloBajos?'Nada de lo que se vende está en su mínimo. 👍':'Sin resultados.')+'</div>';
  var cat='',inp='background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:6px;font-size:13px;text-align:right;width:52px';
  var h='<div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto auto auto auto;gap:5px 8px;font-size:12.5px;align-items:center">'
    +['Producto','Vende/día','Hay','Mínimo','Ideal','Pedir'].map(function(t,i){return '<b style="color:var(--muted);font-size:10.5px;'+(i?'text-align:right':'')+'">'+t+'</b>';}).join('');
  its.forEach(function(x){
    var o=x.o,st=parseInt(o.stock)||0,min=invMin(o),ideal=invIdeal(o),pd=invPorDia(o),manual=!isNaN(parseInt(o.min))||!isNaN(parseInt(o.ideal));
    var pedir=invBajo(o)?Math.max(0,ideal-st):0,k=x.t+'|'+o.id;
    if(x.cat!==cat){cat=x.cat;h+='<div style="grid-column:1/-1;color:var(--accent);font-weight:800;margin-top:6px">'+esc(cat||'Sin categoría')+'</div>';}
    h+='<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+x.emoji+' '+esc(o.nombre)
        +(manual&&puede?' <button data-qp-auto="'+esc(k)+'" title="Volver al cálculo automático" style="background:none;border:1px solid var(--border);color:var(--muted);border-radius:6px;font-size:10px;padding:1px 5px;cursor:pointer">↺ auto</button>':'')+'</span>'
      +'<span style="text-align:right;color:'+(pd?'var(--text)':'var(--muted)')+'">'+(pd?(pd>=10?Math.round(pd):pd.toFixed(1).replace('.',',')):'no se vende')+'</span>'
      +'<b style="text-align:right;color:'+(invBajo(o)?'#ef4444':'var(--text)')+'">'+st+'</b>'
      +(puede?'<input type="number" inputmode="numeric" min="0" value="'+min+'" data-qp="min" data-k="'+esc(k)+'" aria-label="Mínimo" style="'+inp+(manual?';border-color:var(--accent)':'')+'">'
             +'<input type="number" inputmode="numeric" min="0" value="'+ideal+'" data-qp="ideal" data-k="'+esc(k)+'" aria-label="Ideal" style="'+inp+(manual?';border-color:var(--accent)':'')+'">'
             :'<span style="text-align:right">'+min+'</span><span style="text-align:right">'+ideal+'</span>')
      +'<b style="text-align:right;color:var(--gold)">'+(pedir||'·')+'</b>';
  });
  return h+'</div>';
}
function qpTexto(){
  var l=[];
  menu.forEach(function(m){if(!m.sinStock&&m.activo!==false&&invBajo(m))l.push(m);});ingredientes.forEach(function(i){if(invBajo(i))l.push(i);});
  l.sort(function(a,b){return invPorDia(b)-invPorDia(a);});
  return 'Pedido '+(NEGOCIO.nombre||'')+' · '+new Date().toLocaleDateString('es-CO')+'\n'+l.map(function(o){return '• '+Math.max(0,invIdeal(o)-(parseInt(o.stock)||0))+' × '+o.nombre;}).join('\n');
}
function qpPintar(){var e=document.getElementById('qp-lista');if(e)e.innerHTML=_qpFilas();}
function abrirQuePedir(){
  _qp={soloBajos:true,busca:''};
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:2px">🛒 Qué pedir</div>'
    +'<div style="color:var(--muted);font-size:11.5px;margin-bottom:8px">El mínimo y el ideal salen de lo que se vendió en los últimos '+invConsumo().dias+' días: el <b>mínimo</b> cubre '+INV_DIAS.min+' días de venta y el <b>ideal</b> '+INV_DIAS.ideal+'. Lo que no se vende no pide nada.'+(puedeAjustarInv()?' Si escribes un número, ese manda (queda con borde de color); «↺ auto» lo devuelve al cálculo.':'')+'</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:8px"><input class="inp" id="qp-busca" type="search" placeholder="🔍 Buscar para ponerle su mínimo…" autocomplete="off" style="flex:1">'
    +'<button id="qp-todos" class="btn" style="background:var(--card2);border:1px solid var(--border);color:var(--text);white-space:nowrap">Ver todos</button></div>'
    +'<div id="qp-lista" style="max-height:52vh;overflow-y:auto">'+_qpFilas()+'</div>'
    +'<button class="btn btn-full" id="qp-copiar" style="background:var(--accent);color:#fff;border:none;margin-top:10px">📋 Copiar la lista para el proveedor</button>'
    +'<div id="qp-aviso" style="color:var(--muted);font-size:11.5px;text-align:center;margin-top:6px"></div>');
}
document.addEventListener('input',function(e){if(e.target&&e.target.id==='qp-busca'){_qp.busca=e.target.value;qpPintar();}});
document.addEventListener('focusout',function(e){
  if(!e.target||!e.target.dataset||!e.target.dataset.qp)return;
  setTimeout(function(){var f=document.activeElement;if(_qp.sucio&&!(f&&f.dataset&&f.dataset.qp)){_qp.sucio=false;qpPintar();}},60);
});
document.addEventListener('change',function(e){
  var t=e.target;if(!t||!t.dataset||!t.dataset.qp)return;
  if(!puedeAjustarInv())return;
  var k=t.dataset.k,tp=k.charAt(0),id=k.slice(2),v=Math.max(0,parseInt(t.value)||0);
  var col=tp==='p'?menu:ingredientes,it=col.find(function(x){return String(x.id)===String(id);});if(!it)return;
  it[t.dataset.qp]=v;
  var r=ref((tp==='p'?'menu/':'ingredientes/')+it.id+'/'+t.dataset.qp);if(r)r.set(v);   // solo ese dato: no toca existencias
  _qp.sucio=true;   // se repinta al salir de la casilla (ver focusout), no en medio de la escritura
});
document.addEventListener('click',function(e){
  if(!e.target.closest)return;
  var au=e.target.closest('[data-qp-auto]');
  if(au&&puedeAjustarInv()){var k2=au.dataset.qpAuto,tp2=k2.charAt(0),id2=k2.slice(2),c2=tp2==='p'?menu:ingredientes,it2=c2.find(function(x){return String(x.id)===String(id2);});
    if(it2){delete it2.min;delete it2.ideal;['min','ideal'].forEach(function(f){var rr=ref((tp2==='p'?'menu/':'ingredientes/')+it2.id+'/'+f);if(rr)rr.remove();});qpPintar();}return;}
  if(e.target.closest('#qp-todos')){_qp.soloBajos=!_qp.soloBajos;e.target.closest('#qp-todos').textContent=_qp.soloBajos?'Ver todos':'Solo los bajos';qpPintar();return;}
  if(e.target.closest('#qp-copiar')){
    var txt=qpTexto(),av=document.getElementById('qp-aviso');
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){if(av)av.textContent='Lista copiada. Pégala en WhatsApp.';}).catch(function(){if(av){av.style.whiteSpace='pre-wrap';av.style.textAlign='left';av.textContent=txt;}});
  }
});
/* El botón viejo «Ingresar inventario» ahora abre la entrada unificada */
abrirIngresoInventario=abrirRecibirMercancia;
