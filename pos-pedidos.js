/* ═══════════════ PEDIDOS ═══════════════ */
function abrirCantidadVariante(pid,nom,pre){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  var btns=[1,2,3,4,5,6,8,10,12].map(function(q){
    return'<button data-act="mesa-qty-var" data-pid="'+pid+'" data-nom="'+esc(nom)+'" data-pre="'+pre+'" data-qty="'+q+'" '
      +'style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 0;'
      +'font-size:20px;font-weight:900;color:var(--accent);cursor:pointer">'+q+'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:30px">'+p.emoji+'</div>'
    +'<div style="font-weight:800;font-size:16px;margin-top:4px">'+esc(p.nombre)+' · '+esc(nom)+'</div>'
    +'<div style="color:var(--accent);font-weight:700;font-size:14px;margin-top:2px">'+fmt(pre)+' c/u</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">¿Cuántas unidades?</div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'+btns+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:12px;align-items:center">'
      +'<input id="qty-libre-var" type="number" inputmode="numeric" min="1" placeholder="Otra cantidad..." style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px;font-size:16px;text-align:center" onkeydown="if(event.key===\'Enter\')confirmarQtyLibreVar('+pid+',this.getAttribute(\'data-nom\'),'+pre+')" data-nom="'+esc(nom)+'"/>'
      +'<button onclick="confirmarQtyLibreVar('+pid+',\''+esc(nom)+'\','+pre+')" style="background:var(--accent);color:#fff;border:none;border-radius:10px;padding:12px 18px;font-weight:800;font-size:15px;cursor:pointer">✓</button>'
    +'</div>');
}

function confirmarQtyLibreVar(pid,nom,pre){
  var q=parseInt((document.getElementById('qty-libre-var')||{}).value)||0;
  if(q<=0)return;
  closeModal2();
  agregarItemQty(pid,false,q,nom,pre);
}

function editarCantidadPedido(idx){
  if(!mesaActiva)return;
  var pped=pedidos[mesaActiva.id]||[];
  var it=pped[idx];if(!it)return;
  var nombre=it.nombre||(it.cubeta?'Cubetazo':'Producto');
  var sumBtns=[1,2,3,4,5,6,10,12].map(function(q){
    return'<button onclick="sumarCantidadPedido('+idx+','+q+')" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:10px;padding:14px 0;font-size:18px;font-weight:900;cursor:pointer">+'+q+'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:26px">'+(it.emoji||'📦')+'</div>'
    +'<div style="font-weight:800;font-size:15px;margin-top:4px">'+esc(nombre)+'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">Tiene: <b style="color:var(--text)">'+it.qty+'</b></div>'
    +'</div>'
    +'<div style="color:#22c55e;font-size:11px;font-weight:700;margin-bottom:6px;text-align:center">➕ AGREGAR MÁS</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:10px">'+sumBtns+'</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:14px">'
      +'<input id="edit-qty-add" type="number" inputmode="numeric" min="1" placeholder="Sumar otra cantidad..." style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:13px;font-size:16px;text-align:center;font-weight:700" onkeydown="if(event.key===\'Enter\')sumarCantidadPedidoLibre('+idx+')"/>'
      +'<button onclick="sumarCantidadPedidoLibre('+idx+')" style="background:#22c55e;color:#fff;border:none;border-radius:10px;padding:0 20px;font-size:15px;font-weight:800;cursor:pointer">Sumar</button>'
    +'</div>'
    +'<div style="border-top:1px solid var(--border);padding-top:12px">'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:6px;text-align:center">O fijar el total exacto</div>'
      +'<div style="display:flex;gap:8px">'
        +'<input id="edit-qty-val" type="number" inputmode="numeric" min="0" value="'+it.qty+'" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px;font-size:16px;text-align:center;font-weight:700" onkeydown="if(event.key===\'Enter\')confirmarEditarCantidad('+idx+')"/>'
        +'<button onclick="confirmarEditarCantidad('+idx+')" style="background:var(--card2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:0 18px;font-size:14px;font-weight:700;cursor:pointer">Fijar</button>'
      +'</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:6px;text-align:center">Pon 0 para quitar el producto</div>'
    +'</div>');
}
function _aplicarNuevaCantidad(idx,nueva){
  if(!mesaActiva)return;
  var pped=pedidos[mesaActiva.id]||[];
  var it=pped[idx];if(!it)return;
  if(isNaN(nueva)||nueva<0){alert('Cantidad no válida.');return;}
  var dif=nueva-it.qty;
  if(dif!==0){
    var nomLog=it.isCustom?it.customNombre:(it.isCombo?it.comboNombre:(it.cubMixNombre||((menu.find(function(m){return m.id===it.pid;})||{}).nombre)||'Producto'))+(it.varianteNombre?' ('+it.varianteNombre+')':'')+(it.cubeta?' 🪣':'');
    ajustarStockItem(it,-dif);  // sube -> descuenta; baja -> devuelve
    if(nueva===0){logPedido(mesaActiva.id,'Quitado: '+nomLog,-it.qty);pped.splice(idx,1);}
    else{logPedido(mesaActiva.id,(dif>0?'+':'')+dif+' '+nomLog+' (queda en '+nueva+')',dif);it.qty=nueva;}
    var pr=ref('pedidos/'+mesaActiva.id);
    if(pr)pr.set(pped.length?pped:null);
  }
  closeModal2();
  renderSoloPedido();updateHeader();actualizarColorMesas();
}
function sumarCantidadPedido(idx,cuanto){
  var pped=pedidos[mesaActiva.id]||[];var it=pped[idx];if(!it)return;
  if(it.recGrupos){alert('🎛 Este ítem lleva tipos elegidos ('+(it.recGruposTxt||'')+').\nPara pedir más, agrégalo de nuevo desde la carta y eliges los tipos; para menos, elimínalo y vuélvelo a agregar.');closeModal2();return;}
  _aplicarNuevaCantidad(idx, it.qty+(parseInt(cuanto)||0));
}
function sumarCantidadPedidoLibre(idx){
  var cuanto=parseInt((document.getElementById('edit-qty-add')||{}).value)||0;
  if(cuanto<=0){alert('Escribe cuánto agregar.');return;}
  var pped=pedidos[mesaActiva.id]||[];var it=pped[idx];if(!it)return;
  _aplicarNuevaCantidad(idx, it.qty+cuanto);
}
function confirmarEditarCantidad(idx){
  var nueva=parseInt((document.getElementById('edit-qty-val')||{}).value);
  _aplicarNuevaCantidad(idx, nueva);
}

function confirmarQtyLibre(pid,cubeta){
  var q=parseInt((document.getElementById('qty-libre')||{}).value)||0;
  if(q<=0){return;}
  closeModal2();
  agregarItemQty(pid,!!cubeta,q);
}

function abrirCantidadPromo(pid){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  var btns=[1,2,3,4,5,6,8,10,12].map(function(q){
    return'<button data-act="mesa-qty-promo" data-pid="'+pid+'" data-qty="'+q+'" '
      +'style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 0;'
      +'font-size:20px;font-weight:900;color:#f5a623;cursor:pointer">'+q+'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:30px">⭐</div>'
    +'<div style="font-weight:800;font-size:16px;margin-top:4px">Promo · '+esc(p.nombre)+'</div>'
    +'<div style="color:#f5a623;font-weight:700;font-size:14px;margin-top:2px">'+fmt(PROMO_NACIONAL_PRECIO)+' c/u</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">¿Cuántas unidades?</div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'+btns+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:12px;align-items:center">'
      +'<input id="qty-libre-promo" type="number" inputmode="numeric" min="1" placeholder="Otra cantidad..." style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px;font-size:16px;text-align:center" onkeydown="if(event.key===\'Enter\')confirmarQtyLibrePromo('+pid+')"/>'
      +'<button onclick="confirmarQtyLibrePromo('+pid+')" style="background:#f5a623;color:#1a1208;border:none;border-radius:10px;padding:12px 18px;font-weight:800;font-size:15px;cursor:pointer">✓</button>'
    +'</div>');
}

function confirmarQtyLibrePromo(pid){
  var q=parseInt((document.getElementById('qty-libre-promo')||{}).value)||0;
  if(q<=0)return;
  closeModal2();
  agregarItemQty(pid,false,q,'Promo '+fmt(PROMO_NACIONAL_PRECIO),PROMO_NACIONAL_PRECIO);
}

function abrirCantidadMesa(pid,cubeta){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  // If has variantes, show variante selector first instead
  if(p.variantes&&p.variantes.length>0&&!cubeta){
    abrirSelectorVariante(pid);
    return;
  }
  var precio=cubeta?(p.cubeta||p.precio*5):p.precio;
  var btns=[1,2,3,4,5,6,8,10,12].map(function(q){
    return'<button data-act="mesa-qty" data-pid="'+pid+'" data-cub="'+cubeta+'" data-qty="'+q+'" '
      +'style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 0;'
      +'font-size:20px;font-weight:900;color:var(--accent);cursor:pointer">'+q+'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:30px">'+(cubeta?'🪣':p.emoji)+'</div>'
    +'<div style="font-weight:800;font-size:16px;margin-top:4px">'+(cubeta?'Cubetazo ':'')+esc(p.nombre)+'</div>'
    +'<div style="color:var(--accent);font-weight:700;font-size:14px;margin-top:2px">'+fmt(precio)+(cubeta?' (×5)':' c/u')+'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">Toca una cantidad o escríbela abajo</div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">'+btns+'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<input id="qty-libre" type="number" inputmode="numeric" min="1" placeholder="Otra cantidad..." style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:14px;font-size:17px;text-align:center;font-weight:700" onkeydown="if(event.key===\'Enter\')confirmarQtyLibre('+pid+','+(cubeta?'true':'false')+')"/>'
      +'<button onclick="confirmarQtyLibre('+pid+','+(cubeta?'true':'false')+')" style="background:var(--accent);color:#fff;border:none;border-radius:10px;padding:0 22px;font-size:16px;font-weight:800;cursor:pointer">Agregar</button>'
    +'</div>');
}

/* ═══════════ STOCK CENTRAL: escritura atómica + KARDEX ═══════════
   Todo cambio de stock pasa por cambiarStock():
   1. Actualiza el valor local.
   2. Escribe en Firebase con TRANSACCIÓN (menu/{id}/stock) para que dos
      equipos vendiendo a la vez no se pisen el descuento.
   3. Registra el movimiento en el kardex (libro de inventario).           */
function cambiarStock(tipo,id,delta,motivo){
  delta=parseInt(delta)||0;
  if(!delta)return;
  var col=(tipo==='p')?menu:ingredientes;
  var it=col.find(function(x){return String(x.id)===String(id);});
  // Productos "sin control de cantidad" (solo disponible/agotado): no manejan stock
  if(tipo==='p'&&it&&it.sinStock)return;
  if(!it){
    // ⚠️ id que ya no existe (insumo borrado o recreado): no crear registros fantasma sin nombre
    logKardex(tipo,id,'(id inexistente)',delta,'⚠️ IGNORADO — '+(motivo||''),null);
    return;
  }
  var a=parseInt(it.stock);if(isNaN(a))a=0;it.stock=a+delta;
  var d=getDb();
  if(d){
    d.ref((tipo==='p'?'menu/':'ingredientes/')+id+'/stock').transaction(function(cur){
      var c=parseInt(cur);if(isNaN(c))c=0;return c+delta;
    });
  }
  logKardex(tipo,id,it?it.nombre:'',delta,motivo,it?parseInt(it.stock):null);
}
function logKardex(tipo,id,nombre,delta,motivo,saldo){
  fbPush('kardex',{
    ts:a52Ahora(),t:tipo,id:id,nombre:nombre||'',delta:delta,motivo:motivo||'',
    saldo:(typeof saldo==='number'&&!isNaN(saldo))?saldo:null,
    uid:usuarioActivo?usuarioActivo.id:'',uidNombre:usuarioActivo?usuarioActivo.nombre:''
  });
}
// Visor del kardex: carga bajo demanda los últimos movimientos
var _kardexCache=[];var _kardexFiltro='';
/* ═══════════ CONSUMO DE PERSONAL (sin valor: solo descuenta inventario) ═══════════ */
/* ═══ Valor de un consumo de empleado (para descuento de nómina) ═══ */
function valorConsumo(c){
  if(c.valorTotal)return c.valorTotal;
  // Registros viejos sin valor guardado: usar el precio actual del producto
  var p=menu.find(function(m){return String(m.id)===String(c.prodId);});
  return p?(p.precio||0)*(c.cantidad||1):0;
}

/* ═══ Disponibilidad de productos sin control de cantidad ═══ */
function toggleInvLock(){
  invCfg.soloAdmin=(invCfg.soloAdmin===false);
  fbSet('invCfg',invCfg);
  showToast(invCfg.soloAdmin!==false
    ?'🔒 Inventario BLOQUEADO<br><span style="font-size:12px;opacity:.85">Solo tú (admin) puedes ajustar cantidades</span>'
    :'🔓 Inventario abierto para admin y subadmin','#ef4444');
  render();
}
function toggleDisponible(pid){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  p.disponible=(p.disponible===false);
  var d=getDb();
  if(d)d.ref('menu/'+p.id+'/disponible').set(p.disponible);
  else fbSet('menu',menu);
  showToast(p.disponible?'✅ '+esc(p.nombre)+' DISPONIBLE':'🚫 '+esc(p.nombre)+' marcado AGOTADO',p.disponible?'#22c55e':'#ef4444');
  render();
}
function abrirConsumoEmpleados(){
  window._ceEmp=window._ceEmp||'';window._ceBusq='';
  renderConsumoEmpModal();
}
function renderConsumoEmpModal(){
  var activos=empleados.filter(function(e){return e.activo!==false;});
  var empOpts='<option value="" '+(window._ceEmp?'':'selected ')+'disabled>👆 ¿Quién consume?...</option>'
    +activos.map(function(e){return'<option value="'+e.id+'"'+(window._ceEmp===e.id?' selected':'')+'>'+esc(e.nombre)+(e.cargo?' · '+esc(e.cargo):'')+'</option>';}).join('');
  // Buscador de producto

  // Resumen del mes por empleado
  var iniMes=new Date();iniMes.setDate(1);iniMes.setHours(0,0,0,0);
  var mesPorEmp={};var mesValorEmp={};
  consumoEmpleados.forEach(function(c){
    if(c.descontado)return;   // los ya descontados del pago no cuentan
    mesPorEmp[c.empNombre]=(mesPorEmp[c.empNombre]||0)+(c.cantidad||1);
    mesValorEmp[c.empNombre]=(mesValorEmp[c.empNombre]||0)+valorConsumo(c);
  });
  var chips=Object.keys(mesPorEmp).sort(function(a,b){return (mesValorEmp[b]||0)-(mesValorEmp[a]||0);}).map(function(n){
    return'<span style="background:var(--bg);border:1px solid var(--border);border-radius:99px;padding:4px 10px;font-size:11px;font-weight:700">'+esc(n)+': <b style="color:var(--gold)">'+mesPorEmp[n]+'</b> und · <b style="color:#f5a623">'+fmt(mesValorEmp[n]||0)+'</b></span>';
  }).join(' ');
  // Últimos registros
  var esAdm=usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin');
  var rows=consumoEmpleados.slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,50).map(function(c){
    return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0"><span style="font-weight:700">'+esc(c.empNombre||'?')+'</span> · '+(c.cantidad||1)+'× '+esc(c.prodNombre||'?')
        +'<div style="color:var(--muted);font-size:10px;margin-top:1px">🕐 '+fmtFechaCorta(c.ts)+(c.uidNombre?' · anotó '+esc(c.uidNombre):'')+'</div></div>'
      +'<span style="text-align:right;white-space:nowrap"><span style="color:#f5a623;font-weight:800;font-size:12px">'+fmt(valorConsumo(c))+'</span>'+(c.descontado?'<br><span style="color:#22c55e;font-size:9px;font-weight:800">✔ descontado '+fmtFechaCorta(c.descontado.ts)+'</span>':'')+'</span>'
      +(esAdm?'<button onclick="eliminarConsumoEmp(\''+c.id+'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:6px;padding:3px 9px;font-size:11px;cursor:pointer">✕</button>':'')
    +'</div>';
  }).join('');
  modal1('<div style="text-align:center;margin-bottom:10px">'
      +'<div style="font-size:26px">🥤</div>'
      +'<div style="font-weight:900;font-size:16px">Consumo de personal</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:3px">Descuenta del inventario, NO genera venta ni entra a caja. Queda con nombre, fecha y hora.</div>'
    +'</div>'
    +'<select class="inp" id="ce-emp" onchange="window._ceEmp=this.value" style="margin-bottom:8px">'+empOpts+'</select>'
    +'<input class="inp" id="ce-busq" placeholder="🔍 Buscar producto (ej: club, aguila...)" value="'+esc(window._ceBusq||'')+'" oninput="window._ceBusq=this.value;var r=document.getElementById(\'ce-res\');if(r)r.innerHTML=_ceResHTML();" style="margin-bottom:8px"/>'
    +'<div id="ce-res">'+_ceResHTML()+'</div>'
    +(chips?'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin:12px 0 5px">ESTE MES POR EMPLEADO</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+chips+'</div>':'')
    +'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin:12px 0 4px">ÚLTIMOS REGISTROS</div>'
    +'<div style="max-height:30vh;overflow-y:auto;margin-bottom:12px">'+(rows||'<div style="color:var(--muted);font-size:12px;padding:6px 0">Sin consumos registrados todavía.</div>')+'</div>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text)">Cerrar</button>');
}
function _ceResHTML(){
  var q=_normTxt((window._ceBusq||'').trim());
  var matches=q?menu.filter(function(m){return _normTxt(m.nombre).indexOf(q)>=0;}).slice(0,8):[];
  var combosMatch=q?combos.filter(function(c){return c&&c.nombre&&(_normTxt(c.nombre).indexOf(q)>=0||_normTxt('combo').indexOf(q)>=0);}).slice(0,5):[];
  var prodBtns=combosMatch.map(function(c){
    return'<button onclick="elegirComboConsumoEmp(\''+c.id+'\')" style="display:flex;justify-content:space-between;align-items:center;width:100%;background:#f5a62310;border:1px solid #f5a62344;border-radius:9px;padding:9px 12px;margin-bottom:5px;cursor:pointer;color:var(--text)">'
      +'<span style="font-size:13px;font-weight:700">🎁 '+esc(c.nombre)+'</span>'
      +'<span style="color:#f5a623;font-size:11px;font-weight:800">'+fmt(c.precio||0)+'</span>'
    +'</button>';
  }).join('')+matches.map(function(p){
    return'<button onclick="elegirProdConsumoEmp('+p.id+')" style="display:flex;justify-content:space-between;align-items:center;width:100%;background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:9px 12px;margin-bottom:5px;cursor:pointer;color:var(--text)">'
      +'<span style="font-size:13px;font-weight:700">'+p.emoji+' '+esc(p.nombre)+(p.cubeta?' <span style="color:#f5a623;font-size:10px;font-weight:800">🪣</span>':'')+'</span>'
      +'<span style="color:'+(p.sinStock?(p.disponible!==false?'#22c55e':'#ef4444'):((parseInt(p.stock)||0)>0?'var(--muted)':'#ef4444'))+';font-size:11px;font-weight:700">'+(p.sinStock?(p.disponible!==false?'✅ disponible':'🚫 agotado'):'stock: '+(parseInt(p.stock)||0))+'</span>'
    +'</button>';
  }).join('');
  return q?(prodBtns||'<div style="color:var(--muted);font-size:12px;text-align:center;padding:8px">Sin coincidencias.</div>'):'<div style="color:var(--muted);font-size:11px;text-align:center;padding:6px">Escribe el nombre del producto que se consumió.</div>';
}
function elegirProdConsumoEmp(pid,esCubeta){
  if(!window._ceEmp){alert('👆 Primero elige quién consume.');return;}
  var p=menu.find(function(m){return m.id===pid;});if(!p)return;
  esCubeta=!!esCubeta;
  var cub=esCubeta?'true':'false';
  var modoHtml=p.cubeta?'<div style="display:flex;gap:7px;margin-bottom:10px">'
    +'<button onclick="elegirProdConsumoEmp('+pid+',false)" style="flex:1;background:'+(!esCubeta?'#22c55e':'var(--bg)')+';color:'+(!esCubeta?'#fff':'var(--muted)')+';border:1px solid '+(!esCubeta?'#22c55e':'var(--border)')+';border-radius:9px;padding:8px 0;font-weight:900;font-size:12px;cursor:pointer">Por unidad · '+fmt(p.precio||0)+'</button>'
    +'<button onclick="elegirProdConsumoEmp('+pid+',true)" style="flex:1;background:'+(esCubeta?'#f5a623':'var(--bg)')+';color:'+(esCubeta?'#1a1a22':'var(--muted)')+';border:1px solid '+(esCubeta?'#f5a623':'var(--border)')+';border-radius:9px;padding:8px 0;font-weight:900;font-size:12px;cursor:pointer">🪣 Cubetazo (5) · '+fmt(p.cubeta)+'</button>'
  +'</div>':'';
  var btns=[1,2,3,4,5,6].map(function(n){
    return'<button onclick="confirmarConsumoEmp('+pid+','+n+','+cub+')" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:10px;padding:16px 0;font-size:19px;font-weight:900;cursor:pointer">'+n+'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:12px">'
      +'<div style="font-size:26px">'+(esCubeta?'🪣':p.emoji)+'</div>'
      +'<div style="font-weight:800;font-size:15px">'+(esCubeta?'Cubetazo de ':'')+esc(p.nombre)+'</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:2px">'+(p.sinStock?'Sin control de cantidad':'Stock: '+(parseInt(p.stock)||0))+' · ¿cuánt'+(esCubeta?'os cubetazos':'as')+' consumió?</div>'
    +'</div>'
    +modoHtml
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px">'+btns+'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<input id="ce-qty" type="number" inputmode="numeric" min="1" placeholder="Otra..." class="inp" style="flex:1;text-align:center;font-weight:800"/>'
      +'<button onclick="confirmarConsumoEmp('+pid+',parseInt((document.getElementById(\'ce-qty\')||{}).value)||0,'+cub+')" style="background:#22c55e;color:#fff;border:none;border-radius:10px;padding:0 18px;font-weight:800;cursor:pointer">✓</button>'
    +'</div>');
}
function elegirComboConsumoEmp(cid){
  if(!window._ceEmp){alert('👆 Primero elige quién consume.');return;}
  var c=combos.find(function(x){return String(x.id)===String(cid);});if(!c)return;
  var btns=[1,2,3].map(function(n){
    return'<button onclick="confirmarConsumoComboEmp(\''+cid+'\','+n+')" style="background:#f5a62318;color:#f5a623;border:1px solid #f5a62333;border-radius:10px;padding:16px 0;font-size:19px;font-weight:900;cursor:pointer">'+n+'</button>';
  }).join('');
  var comps=(c.ingredientes||[]).map(function(g){
    var p=menu.find(function(m){return Number(m.id)===Number(g.prodId);});
    return (g.cantidad||1)+'× '+(p?p.nombre:'?');
  }).join(' · ');
  modal2('<div style="text-align:center;margin-bottom:12px">'
      +'<div style="font-size:26px">🎁</div>'
      +'<div style="font-weight:800;font-size:15px">'+esc(c.nombre)+'</div>'
      +'<div style="color:var(--muted);font-size:10.5px;margin-top:2px">'+esc(comps)+' · '+fmt(c.precio||0)+'</div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+btns+'</div>');
}
function confirmarConsumoComboEmp(cid,qty){
  qty=parseInt(qty)||0;if(qty<=0)return;
  var c=combos.find(function(x){return String(x.id)===String(cid);});if(!c)return;
  var emp=empleados.find(function(e){return e.id===window._ceEmp;});
  if(!emp){alert('👆 Elige quién consume.');return;}
  var stockDetalle=[];
  (c.ingredientes||[]).forEach(function(g){
    if(g.prodId==null)return;
    var enMenu=menu.some(function(m){return Number(m.id)===Number(g.prodId);});
    stockDetalle.push({t:enMenu?'p':'i',id:g.prodId,cant:(g.cantidad||1)*qty});
  });
  stockDetalle.forEach(function(d){cambiarStock(d.t,d.id,-d.cant,'🥤 Consumo empleado (combo): '+emp.nombre);});
  var reg={id:'ce_'+a52Ahora(),ts:a52Ahora(),empId:emp.id,empNombre:emp.nombre,prodId:'combo_'+c.id,prodNombre:'🎁 '+c.nombre,cantidad:qty,valorUnit:c.precio||0,valorTotal:(c.precio||0)*qty,stockDetalle:stockDetalle,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoEmpleados.push(reg);
  var r=ref('consumoEmpleados');
  if(r)r.push(reg);else fbSet('consumoEmpleados',consumoEmpleados);
  closeModal2();
  window._ceBusq='';
  showToast('🎁 '+qty+'× '+esc(c.nombre)+' → '+esc(emp.nombre)+'<br><span style="font-size:12px;opacity:.85">💰 Se le descontará '+fmt((c.precio||0)*qty)+' · componentes fuera del inventario</span>','#f5a623');
  renderConsumoEmpModal();
}
function confirmarConsumoEmp(pid,qty,esCubeta){
  qty=parseInt(qty)||0;
  if(qty<=0){alert('Escribe la cantidad.');return;}
  var p=menu.find(function(m){return m.id===pid;});if(!p)return;
  var emp=empleados.find(function(e){return e.id===window._ceEmp;});
  if(!emp){alert('👆 Elige quién consume.');return;}
  var unds=esCubeta?qty*5:qty;   // 🪣 un cubetazo descuenta 5 unidades
  if(!p.sinStock&&!ventaSinStock&&(parseInt(p.stock)||0)<unds){
    if(!confirm('Stock insuficiente ('+(parseInt(p.stock)||0)+' und, se necesitan '+unds+'). ¿Registrar de todas formas? El stock quedará en negativo.'))return;
  }
  // Detalle para poder devolver si se elimina el registro
  var stockDetalle=[{t:'p',id:p.id,cant:unds}];
  if(p.receta&&p.receta.length){
    p.receta.forEach(function(ri){
      if(ri.grupo)return;
      var enMenu=menu.some(function(m){return Number(m.id)===Number(ri.pid);});
      var cantR=ri.porCada>0?Math.round(ri.cantidad*unds/ri.porCada):ri.cantidad*unds;
      if(cantR)stockDetalle.push({t:enMenu?'p':'i',id:ri.pid,cant:cantR});
    });
  }
  stockDetalle.forEach(function(d){
    cambiarStock(d.t,d.id,-d.cant,'🥤 Consumo empleado: '+emp.nombre);
  });
  // 🏷️ Si el producto está en promoción vigente, el empleado paga el precio de promo
  var prC=promoVigente(p.id,esCubeta?'cubeta':'unidad');
  var vLista=esCubeta?(p.cubeta||((p.precio||0)*5)):(p.precio||0);
  var vUnit=prC?prC.valor:vLista;
  var reg={id:'ce_'+a52Ahora(),ts:a52Ahora(),empId:emp.id,empNombre:emp.nombre,prodId:p.id,prodNombre:(esCubeta?'🪣 Cubetazo ':'')+p.nombre+(prC?' 🏷️':''),cantidad:qty,esCubeta:!!esCubeta,valorUnit:vUnit,valorLista:vLista,esPromo:!!prC,valorTotal:vUnit*qty,stockDetalle:stockDetalle,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoEmpleados.push(reg);
  var r=ref('consumoEmpleados');
  if(r)r.push(reg);else fbSet('consumoEmpleados',consumoEmpleados);
  closeModal2();
  window._ceBusq='';
  showToast('🥤 '+qty+'× '+(esCubeta?'🪣 Cubetazo de ':'')+p.emoji+' '+esc(p.nombre)+' → '+esc(emp.nombre)+'<br><span style="font-size:12px;opacity:.85">'+(prC?'🏷️ precio promo '+fmt(vUnit)+' c/u · ':'')+'💰 Se le descontará '+fmt(vUnit*qty)+' · fuera de caja</span>','#38bdf8');
  renderConsumoEmpModal();
}
function descontarConsumosEmp(empId){
  if(!usuarioActivo||usuarioActivo.rol!=='admin'){alert('Solo el administrador puede descontar consumos.');return;}
  var pend=consumoEmpleados.filter(function(c){return String(c.empId)===String(empId)&&!c.descontado;});
  if(!pend.length){alert('Este empleado no tiene consumos pendientes por descontar.');return;}
  var tot=pend.reduce(function(a,c){return a+valorConsumo(c);},0);
  var und=pend.reduce(function(a,c){return a+(c.cantidad||1);},0);
  var nom=pend[0].empNombre||'';
  if(!confirm('¿Marcar como DESCONTADOS los consumos de '+nom+'?\n\n'+und+' und · '+fmt(tot).replace(/\u00A0/g,' ')+'\n\nÚsalo cuando ya se los descontaste del pago. El contador queda en cero y el historial se conserva.'))return;
  var marca={ts:a52Ahora(),uidNombre:usuarioActivo.nombre};
  pend.forEach(function(c){
    c.descontado=marca;
    if(c._fbkey)fbSet('consumoEmpleados/'+c._fbkey+'/descontado',marca);
  });
  // 💰 Crear el descuento REAL en la nómina: entra a la semana en pantalla y baja el saldo a pagar
  var semKeyC=_fechaKey(_sanLunes(_empSemanaOffset));
  var movC={id:'me'+a52Ahora(),ts:a52Ahora(),empId:empId,tipo:'consumo',valor:tot,nota:'🍺 Consumos ('+und+' und)',semanaKey:semKeyC,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  movEmpleados.push(movC);
  var rC=ref('movEmpleados');if(rC)rC.push(movC);else fbSet('movEmpleados',movEmpleados);
  // Respaldo para registros viejos sin clave de Firebase: reescribir la colección completa
  if(pend.some(function(c){return !c._fbkey;})){
    var ob={};consumoEmpleados.forEach(function(c,i){ob[c._fbkey||('ce'+i)]=c;});
    fbSet('consumoEmpleados',ob);
  }
  showToast('✅ Consumos de '+esc(nom)+' descontados<br><span style="font-size:12px;opacity:.85">'+und+' und · '+fmt(tot)+' — quedó como descuento en la semana: baja el saldo a pagar</span>','#22c55e');
  render();
}
function eliminarConsumoEmp(cid){
  var c=consumoEmpleados.find(function(x){return x.id===cid;});
  if(!c)return;
  if(!confirm('¿Eliminar este consumo? El stock volverá al inventario.'))return;
  (c.stockDetalle&&c.stockDetalle.length?c.stockDetalle:[{t:'p',id:c.prodId,cant:c.cantidad||1}]).forEach(function(d){
    cambiarStock(d.t||'p',d.id,+d.cant,'Devolución: consumo de personal eliminado ('+(c.empNombre||'')+')');
  });
  consumoEmpleados=consumoEmpleados.filter(function(x){return x.id!==cid;});
  var r=ref('consumoEmpleados');
  if(r)r.set(consumoEmpleados.length?consumoEmpleados:null);
  showToast('🗑️ Consumo eliminado · stock devuelto','#22c55e');
  renderConsumoEmpModal();
}

function abrirKardex(){
  var d=getDb();
  if(!d){alert('El kardex necesita conexión a Firebase.');return;}
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:8px">📒 Kardex de inventario</div><div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Cargando movimientos...</div>');
  d.ref('kardex').limitToLast(400).once('value',function(s){
    var v=s.val();
    _kardexCache=v?Object.values(v).sort(function(a,b){return b.ts-a.ts;}):[];
    _kardexFiltro='';window._kardexProd='';
    renderKardexModal();
  });
}
function renderKardexModal(){
  var f=(_kardexFiltro||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  var prodSel=window._kardexProd||'';
  // Opciones del selector: productos/ingredientes que aparecen en el kardex
  var vistos={};var opciones=[];
  _kardexCache.forEach(function(e){
    var k=e.t+'|'+e.id;
    if(vistos[k])return;vistos[k]=true;
    opciones.push({k:k,t:e.t,id:e.id,nombre:e.nombre||('#'+e.id)});
  });
  opciones.sort(function(a,b){return a.nombre.localeCompare(b.nombre);});
  var opts='<option value=""'+(prodSel===''?' selected':'')+'>📦 Todos los productos</option>'
    +opciones.map(function(o){return'<option value="'+esc(o.k)+'"'+(prodSel===o.k?' selected':'')+'>'+(o.t==='i'?'🧂 ':'')+esc(o.nombre)+'</option>';}).join('');
  // Calcular SIEMPRE el "quedan" de cada registro: por cada producto, se camina
  // desde el stock ACTUAL hacia atrás sobre todo el historial cargado.
  var porProducto={};
  _kardexCache.forEach(function(e){
    var k=e.t+'|'+e.id;
    if(!porProducto[k])porProducto[k]=[];
    porProducto[k].push(e);  // el cache ya viene ordenado del más nuevo al más viejo
  });
  Object.keys(porProducto).forEach(function(k){
    var partes=k.split('|');var pT=partes[0];var pId=partes.slice(1).join('|');
    var col=(pT==='p')?menu:ingredientes;
    var itAct=col.find(function(x){return String(x.id)===String(pId);});
    if(itAct){
      var running=parseInt(itAct.stock)||0;
      porProducto[k].forEach(function(e){e._queda=running;running-=(e.delta||0);});
    } else {
      // Producto que ya no existe: usar el saldo guardado en el registro si lo tiene
      porProducto[k].forEach(function(e){if(typeof e.saldo==='number')e._queda=e.saldo;});
    }
  });
  var lista=_kardexCache.filter(function(e){
    if(prodSel&&(e.t+'|'+e.id)!==prodSel)return false;
    if(!f)return true;
    var n=(e.nombre||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    var mm=(e.motivo||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return n.indexOf(f)>=0||mm.indexOf(f)>=0;
  });
  // Con producto seleccionado: mostrar además el stock actual en el encabezado
  var headerStock='';
  if(prodSel){
    var partes2=prodSel.split('|');var pT2=partes2[0];var pId2=partes2.slice(1).join('|');
    var col2=(pT2==='p')?menu:ingredientes;
    var itAct2=col2.find(function(x){return String(x.id)===String(pId2);});
    if(itAct2)headerStock='<div style="background:var(--bg);border:1px solid var(--gold)44;border-radius:9px;padding:8px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;font-weight:700">Stock actual</span><span style="color:var(--gold);font-weight:900;font-size:18px">'+(parseInt(itAct2.stock)||0)+' und</span></div>';
  }
  var listaCorta=lista.slice(0,250);
  var rows=listaCorta.length?listaCorta.map(function(e){
    var pos=e.delta>0;
    var queda=(typeof e._queda==='number')?e._queda:((typeof e.saldo==='number')?e.saldo:null);
    return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0"><span style="font-weight:700">'+(e.t==='i'?'🧂 ':'')+esc(e.nombre||('#'+e.id))+'</span>'
        +'<div style="color:var(--muted);font-size:10px;margin-top:1px">'+esc(e.motivo||'')+'</div>'
        +'<div style="color:var(--muted);font-size:10px">'+fmtFechaCorta(e.ts)+(e.uidNombre?' · '+esc(e.uidNombre):'')+'</div></div>'
      +'<div style="display:flex;align-items:center;gap:8px;white-space:nowrap">'
        +'<span style="color:'+(pos?'#22c55e':'#ef4444')+';font-weight:900;font-size:15px;min-width:34px;text-align:right">'+(pos?'+':'')+e.delta+'</span>'
        +(queda!=null
          ?'<span style="background:'+(queda<=0?'#ef444418':'var(--gold)18')+';border:1px solid '+(queda<=0?'#ef444444':'var(--gold)44')+';color:'+(queda<=0?'#ef4444':'var(--gold)')+';border-radius:8px;padding:4px 9px;font-weight:900;font-size:13px">'+queda+'</span>'
          :'<span style="color:var(--muted);font-size:11px">—</span>')
      +'</div>'
    +'</div>';
  }).join(''):'<div style="color:var(--muted);text-align:center;padding:18px;font-size:13px">Sin movimientos'+(f||prodSel?' que coincidan con el filtro':'')+'.</div>';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:8px">📒 Kardex de inventario</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Últimos '+_kardexCache.length+' movimientos · a la derecha: el cambio y <b style="color:var(--gold)">cuántas quedaron</b> después de cada movimiento</div>'
    +'<select class="inp" id="kardex-prod" onchange="window._kardexProd=this.value;renderKardexModal();" style="margin-bottom:8px">'+opts+'</select>'
    +'<input class="inp" id="kardex-busq" placeholder="🔍 Filtrar por producto o motivo..." value="'+esc(_kardexFiltro)+'" oninput="_kardexFiltro=this.value;_debounceBusq(function(){renderKardexModal();_refocusBusq(\'kardex-busq\');})" style="margin-bottom:10px"/>'
    +headerStock
    +'<div style="max-height:52vh;overflow-y:auto">'+rows+'</div>');
}

function ajustarStockItem(item,delta,motivo){
  // delta: cantidad a sumar al stock (negativo al agregar pedido, positivo al quitar)
  if(item.isCustom)return;
  var mot=motivo||(delta<0?'Mesa: agregado a pedido':'Mesa: devuelto de pedido');
  if(item.isCubetazoMix){
    var signoM=delta<0?-1:1;
    (item.cubMixDetalle||[]).forEach(function(dd){
      cambiarStock('p',dd.prodId,dd.cantidad*Math.abs(delta)*signoM,mot+' (cubetazo mixto)');
    });
    return;
  }
  if(item.isCombo){
    // Usar los ingredientes YA RESUELTOS guardados en el item (con las elecciones del cliente)
    var ingsCombo=item.comboIngredientes||[];
    if(!ingsCombo.length){
      var cId=item.comboId||item.pid;
      var cc=combos.find(function(x){return String(x.id)===String(cId);});
      if(cc)ingsCombo=cc.ingredientes||[];
    }
    var signoC=delta<0?-1:1;
    ingsCombo.forEach(function(ing){
      var multV=parseInt(ing.varianteUnd)||1;
      var cant=(ing.cantidad||1)*Math.abs(delta)*multV;
      if(ing.prodId!=null){
        cambiarStock('p',ing.prodId,cant*signoC,mot+' (combo '+(item.comboNombre||'')+(ing.varianteNombre?' · '+ing.varianteNombre:'')+')');
        // Cascada de receta del producto (papas, insumos...) — con "por cada" incluido
        var pC=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});
        if(pC&&pC.receta&&pC.receta.length){
          pC.receta.forEach(function(ri){
            if(ri.grupo)return;
            var enMenuC=menu.some(function(m){return Number(m.id)===Number(ri.pid);});
            var cantRC=ri.porCada>0?Math.round(ri.cantidad*cant/ri.porCada):ri.cantidad*cant;
            if(cantRC)cambiarStock(enMenuC?'p':'i',ri.pid,cantRC*signoC,mot+' (receta de '+pC.nombre+' en combo)');
          });
        }
      }
      if(ing.ingId!=null)cambiarStock('i',ing.ingId,cant*signoC,mot+' (combo '+(item.comboNombre||'')+')');
    });
    return;
  }
  var p=menu.find(function(m){return Number(m.id)===Number(item.pid);});
  if(!p)return;
  var mult=item.cubeta?5:(parseInt(item.varianteUnd)||1);  // ej: Alitas x24 descuenta 24 alas del stock
  var c2=Math.abs(delta)*mult;
  var s=delta<0?-1:1;
  cambiarStock('p',p.id,c2*s,mot+(item.cubeta?' (cubetazo)':(mult>1?' ('+(item.varianteNombre||'')+' ×'+mult+')':'')));
  // Receta (escala igual por las unidades de la variante)
  if(p.receta&&p.receta.length){
    p.receta.forEach(function(ri){
      if(ri.grupo){
        // 🎛 Grupo repartido por el mesero: el detalle exacto viaja en el ítem
        var rg=item.recGrupos?(Array.isArray(item.recGrupos)?item.recGrupos:Object.values(item.recGrupos)).find(function(x){return x.grupo===ri.grupo;}):null;
        if(rg&&rg.det){
          var factor=Math.abs(delta)/(item.qty||Math.abs(delta));
          (Array.isArray(rg.det)?rg.det:Object.values(rg.det)).forEach(function(d){
            cambiarStock('i',d.ingId,Math.round(d.cant*factor)*s,mot+' ('+ri.grupo+': '+d.nombre+' · '+p.nombre+')');
          });
          return;
        }
        // ⚠️ Sin reparto (venta vieja o por otra vía): antes no se descontaba nada y el inventario quedaba inflado.
        // Se descuenta del insumo del grupo con más existencia y queda marcado en el kardex para revisarlo.
        var cantG=(ri.cantidad||1)*Math.abs(delta)*mult;
        var delG=ingredientes.filter(function(i){return (i.grupo||'').trim()===ri.grupo;}).sort(function(a,b){return (parseInt(b.stock)||0)-(parseInt(a.stock)||0);})[0];
        if(delG&&cantG)cambiarStock('i',delG.id,cantG*s,mot+' (⚠️ '+ri.grupo+' sin reparto → '+delG.nombre+' · '+p.nombre+')');
        else if(cantG)logKardex('i','',ri.grupo,cantG*s,'⚠️ NO DESCONTADO: el grupo «'+ri.grupo+'» no tiene insumos ('+p.nombre+')',null);
        return;
      }
      var enMenu=menu.some(function(m){return Number(m.id)===Number(ri.pid);});
      var undsTot=Math.abs(delta)*mult;
      var cantR=ri.porCada>0?Math.round(ri.cantidad*undsTot/ri.porCada):ri.cantidad*undsTot;
      if(cantR)cambiarStock(enMenu?'p':'i',ri.pid,cantR*s,mot+' (receta de '+p.nombre+(ri.porCada?' · 1 por cada '+ri.porCada:'')+')');
    });
  }
}

// Registra un movimiento del pedido de una mesa con su hora, para el historial
function logPedido(mesaId,texto,delta){
  if(mesaId==null)return;
  if(!Array.isArray(pedidoLog[mesaId]))pedidoLog[mesaId]=[];
  pedidoLog[mesaId].push({
    ts:a52Ahora(),
    texto:String(texto||''),
    delta:(typeof delta==='number')?delta:null,
    uidNombre:(usuarioActivo?usuarioActivo.nombre:'')
  });
  // Guardar solo los últimos 120 movimientos por mesa
  if(pedidoLog[mesaId].length>120)pedidoLog[mesaId]=pedidoLog[mesaId].slice(-120);
  fbSet('pedidoLog/'+mesaId,pedidoLog[mesaId]);
}
function verHistorialMesa(){
  if(!mesaActiva)return;
  var log=(pedidoLog[mesaActiva.id]||[]).slice().reverse();
  var nombreMesa=mesaActiva.nombre||('Mesa '+mesaActiva.num);
  var rows=log.length?log.map(function(e){
    var d=e.delta;
    var color=d==null?'var(--muted)':(d<0?'#ef4444':'#22c55e');
    var badge=d==null?'':'<span style="color:'+color+';font-weight:800;white-space:nowrap;margin-left:8px">'+(d>0?'+'+d:d)+'</span>';
    return'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;font-size:12px;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1"><span style="color:var(--text)">'+esc(e.texto)+'</span>'
        +'<div style="color:var(--muted);font-size:10px;margin-top:2px">🕐 '+fmtFechaCorta(e.ts)+(e.uidNombre?' · '+esc(e.uidNombre):'')+'</div></div>'
      +badge
    +'</div>';
  }).join(''):'<div style="color:var(--muted);text-align:center;padding:18px;font-size:13px">Sin movimientos registrados en esta mesa todavía.</div>';
  modal2('<div style="font-weight:800;font-size:16px;margin-bottom:2px">🕐 Historial de la mesa</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:12px">'+esc(nombreMesa)+' · '+log.length+' movimiento'+(log.length!==1?'s':'')+'</div>'
    +'<div style="max-height:55vh;overflow-y:auto">'+rows+'</div>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="margin-top:12px;background:var(--card2);border:1px solid var(--border);color:var(--text)">Cerrar</button>');
}
// Picker de cantidad para SUMAR MÁS (disponible para todos los roles, solo suma)
function abrirSumarCantidad(idx){
  if(!mesaActiva)return;
  var pped=pedidos[mesaActiva.id]||[];
  var it=pped[idx];if(!it)return;
  var nombre=it.isCustom?it.customNombre:(it.isCombo?it.comboNombre:(it.cubMixNombre||it.nombre||((menu.find(function(m){return m.id===it.pid;})||{}).nombre)||'Producto'));
  var emoji=it.emoji||(it.isCombo?it.comboEmoji:'')||((menu.find(function(m){return m.id===it.pid;})||{}).emoji)||'📦';
  var sumBtns=[1,2,3,4,5,6,10,12].map(function(q){
    return'<button onclick="sumarCantidadPedido('+idx+','+q+')" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:10px;padding:16px 0;font-size:19px;font-weight:900;cursor:pointer">+'+q+'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:28px">'+emoji+'</div>'
    +'<div style="font-weight:800;font-size:15px;margin-top:4px">'+esc(nombre)+'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">Tiene: <b style="color:var(--text)">'+it.qty+'</b> · toca cuántas agregar</div>'
    +'</div>'
    +'<div style="color:#22c55e;font-size:11px;font-weight:700;margin-bottom:6px;text-align:center">➕ AGREGAR MÁS</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px">'+sumBtns+'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<input id="edit-qty-add" type="number" inputmode="numeric" min="1" placeholder="Otra cantidad..." style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:13px;font-size:16px;text-align:center;font-weight:700" onkeydown="if(event.key===\'Enter\')sumarCantidadPedidoLibre('+idx+')"/>'
      +'<button onclick="sumarCantidadPedidoLibre('+idx+')" style="background:#22c55e;color:#fff;border:none;border-radius:10px;padding:0 20px;font-size:15px;font-weight:800;cursor:pointer">Sumar</button>'
    +'</div>');
}

function abrirRepartoGrupos(pid,cubeta,cantidad,varianteNombre,variantePrecio){
  var p=menu.find(function(m){return m.id===pid;});if(!p)return;
  var vUnd=1;
  if(varianteNombre&&p.variantes){var vv=p.variantes.find(function(v){return v.nombre===varianteNombre;});if(vv&&vv.und)vUnd=parseInt(vv.und)||1;}
  var grupos=(p.receta||[]).filter(function(r){return r.grupo;});
  window._repCtx={pid:pid,cubeta:cubeta,cantidad:cantidad,varianteNombre:varianteNombre,variantePrecio:variantePrecio,
    grupos:grupos.map(function(g){return{grupo:g.grupo,necesita:(g.cantidad||1)*vUnd*cantidad};}),sel:{}};
  grupos.forEach(function(g){window._repCtx.sel[g.grupo]={};});
  _renderRepartoModal();
}
function _renderRepartoModal(){
  var C=window._repCtx;if(!C)return;
  var p=menu.find(function(m){return m.id===C.pid;});
  var html='<div style="text-align:center;margin-bottom:12px"><div style="font-size:26px">'+(p?p.emoji:'')+'</div>'
    +'<div style="font-weight:800;font-size:15px">'+esc(p?p.nombre:'')+(C.varianteNombre?' ('+esc(C.varianteNombre)+')':'')+' × '+C.cantidad+'</div></div>';
  var completo=true;
  C.grupos.forEach(function(g){
    var its=ingredientes.filter(function(i){return (i.grupo||'').trim()===g.grupo;});
    var va=Object.values(C.sel[g.grupo]).reduce(function(a,b){return a+b;},0);
    if(va!==g.necesita)completo=false;
    html+='<div style="background:var(--bg);border-radius:10px;padding:10px 12px;margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-weight:800;font-size:13px">🎛 '+esc(g.grupo)+'</span>'
      +'<span style="font-weight:900;font-size:13px;color:'+(va===g.necesita?'#22c55e':va>g.necesita?'#ef4444':'#f5a623')+'">'+va+' de '+g.necesita+'</span></div>'
      +its.map(function(i){
        var c=C.sel[g.grupo][i.id]||0;
        return'<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">'
          +'<span style="flex:1;font-size:12.5px;font-weight:600">'+esc(i.nombre)+' <span style="color:var(--muted);font-size:10px">('+(verCantidadesInv()?('quedan '+i.stock):'')+')</span></span>'
          +'<button onclick="repMenos(\''+esc(g.grupo).replace(/\'/g,"\\'")+'\',\''+i.id+'\')" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:32px;height:32px;font-size:17px;cursor:pointer">−</button>'
          +'<span style="min-width:26px;text-align:center;font-weight:900;font-size:15px;color:'+(c>0?'#22c55e':'var(--muted)')+'">'+c+'</span>'
          +'<button onclick="repMas(\''+esc(g.grupo).replace(/\'/g,"\\'")+'\',\''+i.id+'\')" style="background:#22c55e18;color:#22c55e;border:none;border-radius:6px;width:32px;height:32px;font-size:17px;cursor:pointer">+</button>'
        +'</div>';
      }).join('')
    +'</div>';
  });
  html+='<button class="btn btn-green btn-full" '+(completo?'':'disabled style="opacity:.45"')+' onclick="confirmarReparto()">'+(window._repRappi?'✅ Listo, agregar al pedido':'✅ Listo, agregar a la mesa')+'</button>'
    +'<button class="btn btn-full" onclick="window._repCtx=null;window._repRappi=null;closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>';
  modal2(html);
}
function repMas(grupo,ingId){
  var C=window._repCtx;if(!C)return;
  var g=C.grupos.find(function(x){return x.grupo===grupo;});
  var va=Object.values(C.sel[grupo]).reduce(function(a,b){return a+b;},0);
  if(va>=g.necesita)return;
  C.sel[grupo][ingId]=(C.sel[grupo][ingId]||0)+1;
  _renderRepartoModal();
}
function repMenos(grupo,ingId){
  var C=window._repCtx;if(!C)return;
  if(!C.sel[grupo][ingId])return;
  C.sel[grupo][ingId]--;
  if(!C.sel[grupo][ingId])delete C.sel[grupo][ingId];
  _renderRepartoModal();
}
function confirmarReparto(){
  var C=window._repCtx;if(!C)return;
  var recGrupos=[],txtP=[];
  var ok=true;
  C.grupos.forEach(function(g){
    var det=Object.keys(C.sel[g.grupo]).map(function(ingId){
      var i=ingredientes.find(function(x){return x.id===ingId;});
      return{ingId:ingId,nombre:i?i.nombre:'?',cant:C.sel[g.grupo][ingId]};
    });
    var suma=det.reduce(function(a,d){return a+d.cant;},0);
    if(suma!==g.necesita)ok=false;
    recGrupos.push({grupo:g.grupo,det:det});
    var base=new RegExp('^'+g.grupo.replace(/s$/i,'')+'s?( de)? ','i');
    txtP.push(det.map(function(d){return d.cant+'× '+d.nombre.replace(base,'');}).join(' · '));
  });
  if(!ok){alert('Completa el reparto exacto.');return;}
  window._repCtx=null;
  closeModal2();
  if(window._repRappi){var RR=window._repRappi;window._repRappi=null;agregarRappiItem(RR.pid,RR.vi,{recGrupos:recGrupos,txt:txtP.join(' | ')});return;}
  window._repartoListo={recGrupos:recGrupos,txt:txtP.join(' | ')};
  agregarItemQty(C.pid,C.cubeta,C.cantidad,C.varianteNombre,C.variantePrecio);
}
function agregarItemQty(pid,cubeta,cantidad,varianteNombre,variantePrecio){
  if(!mesaActiva)return;
  var p=menu.find(function(m){return m.id===pid;});
  var id=mesaActiva.id;
  if(!pedidos[id])pedidos[id]=[];
  // 🎛 Receta con grupos: el mesero reparte los tipos antes de servir
  var _gruposRec=(p&&p.receta?p.receta:[]).filter(function(r){return r.grupo;});
  var _rep=window._repartoListo||null;window._repartoListo=null;
  if(_gruposRec.length&&!_rep){
    abrirRepartoGrupos(pid,cubeta,cantidad,varianteNombre,variantePrecio);
    return;
  }
  // Promo vigente al momento de agregar: el precio se CONGELA en el ítem
  // (si la promo termina con la mesa abierta, lo ya pedido conserva su precio)
  var _promo=(!varianteNombre)?promoVigente(pid,cubeta?'cubeta':'unidad'):null;
  var _pPromo=_promo?(_promo.valor||0):0;
  var _vUnd=1;
  if(varianteNombre&&p&&p.variantes){
    var _vv=p.variantes.find(function(v){return v.nombre===varianteNombre;});
    if(_vv&&_vv.und)_vUnd=parseInt(_vv.und)||1;
  }
  // 🍹 Promo 2x1 vigente: la mitad va gratis (pide 2, paga 1; con 3 paga 2)
  var _p2=(p&&!cubeta)?promo2x1Vigente(p):null;
  var _gratis2x1=_p2?Math.floor(cantidad/2):0;
  if(_gratis2x1>0){
    cantidad=cantidad-_gratis2x1;
    pedidos[id].push({
      pid:pid,cubeta:false,qty:_gratis2x1,
      varianteNombre:varianteNombre||'',variantePrecio:0,varianteUnd:_vUnd,
      es2x1Gratis:true,
      uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36)});
  }
  var idx=_rep?-1:pedidos[id].findIndex(function(it){
    return !it.recGrupos&&!it.es2x1Gratis&&it.pid===pid&&it.cubeta===cubeta&&(it.varianteNombre||'')===(varianteNombre||'')&&(it.precioPromo||0)===_pPromo;
  });
  if(idx>=0)pedidos[id][idx].qty+=cantidad;
  else pedidos[id].push({
    pid:pid,cubeta:cubeta,qty:cantidad,
    varianteNombre:varianteNombre||'',
    variantePrecio:variantePrecio||0,
    varianteUnd:_vUnd,
    precioPromo:_pPromo,
    recGrupos:_rep?_rep.recGrupos:null,
    recGruposTxt:_rep?_rep.txt:'',
    uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36),
  });
  var r=ref('pedidos/'+id);if(r)r.set(pedidos[id]);
  // Descontar stock en tiempo real
  ajustarStockItem({pid:pid,cubeta:cubeta,varianteNombre:varianteNombre,varianteUnd:_vUnd,isCustom:false,isCombo:false,qty:cantidad+_gratis2x1,recGrupos:_rep?_rep.recGrupos:null},-(cantidad+_gratis2x1));
  var totMesa=totalPedido(id);
  var nItems=pedidos[id].reduce(function(a,b){return a+b.qty;},0);
  var nombreP=(p?p.emoji+' '+p.nombre:'Producto')+(varianteNombre?' ('+varianteNombre+')':'')+(cubeta?' 🪣':'');
  logPedido(id,(cantidad+_gratis2x1)+'× '+nombreP+(_gratis2x1>0?' (2x1: '+_gratis2x1+' gratis)':''),cantidad+_gratis2x1);
  if(_gratis2x1>0){
    showToast('🍹 ¡2x1! '+esc(nombreP)+'<br><span style="font-size:12px;opacity:.85">'+cantidad+' pagada'+(cantidad>1?'s':'')+' + '+_gratis2x1+' GRATIS 🎁 · '+(mesaActiva.nombre||'Mesa '+mesaActiva.num)+' · '+fmt(totMesa)+'</span>','#ff5ec8');
  }else{
    showToast('✅ '+cantidad+'× '+esc(nombreP)+'<br><span style="font-size:12px;opacity:.85">'+(mesaActiva.nombre||'Mesa '+mesaActiva.num)+' · '+nItems+' ítems · '+fmt(totMesa)+'</span>','#22c55e');
  }
  renderSoloPedido();updateHeader();actualizarColorMesas();
}

function agregarItem(pid,cubeta,varianteNombre,variantePrecio){
  if(!mesaActiva)return;
  var p=menu.find(function(m){return m.id===pid;});
  // If product has variantes and no variant specified, show selector
  if(p&&p.variantes&&p.variantes.length>0&&!varianteNombre&&!cubeta){
    abrirSelectorVariante(pid);
    return;
  }
  var id=mesaActiva.id;
  if(!pedidos[id])pedidos[id]=[];
  // For variante items, match by pid + varianteNombre
  var idx=pedidos[id].findIndex(function(it){
    return it.pid===pid&&it.cubeta===cubeta&&(it.varianteNombre||'')===(varianteNombre||'');
  });
  var precio=variantePrecio||(p?p.precio:0);
  var _vUndL=1;
  if(varianteNombre&&p&&p.variantes){
    var _vvL=p.variantes.find(function(v){return v.nombre===varianteNombre;});
    if(_vvL&&_vvL.und)_vUndL=parseInt(_vvL.und)||1;
  }
  if(idx>=0)pedidos[id][idx].qty++;
  else pedidos[id].push({
    pid:pid,cubeta:cubeta,qty:1,
    varianteNombre:varianteNombre||'',
    variantePrecio:variantePrecio||0,
    varianteUnd:_vUndL,
    uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36),
  });
  var r=ref('pedidos/'+id);if(r)r.set(pedidos[id]);
  // Descontar stock en tiempo real (igual que agregarItemQty)
  ajustarStockItem({pid:pid,cubeta:cubeta,varianteNombre:varianteNombre,varianteUnd:_vUndL,isCustom:false,isCombo:false},-1);
  // Toast feedback
  var totMesa=totalPedido(id);
  var nItems=pedidos[id].reduce(function(a,b){return a+b.qty;},0);
  var nombreP=(p?p.emoji+' '+p.nombre:'Producto')+(varianteNombre?' ('+varianteNombre+')':'')+(cubeta?' 🪣':'');
  logPedido(id,'1× '+nombreP,1);
  showToast('✅ '+esc(nombreP)+'<br><span style="font-size:12px;opacity:.85">'+(mesaActiva.nombre||'Mesa '+mesaActiva.num)+' · '+nItems+' ítems · '+fmt(totMesa)+'</span>','#22c55e');
  renderSoloPedido();updateHeader();actualizarColorMesas();
}

// Cervezas que SÍ pueden ir en el cubetazo mixto (por nombre)
var CUBE_MIX_NOMBRES=['heineken','sol','miller'];
var CUBE_MIX_PRECIO=32000;  // precio del balde/cubetazo (5 cervezas)
var PROMO_NACIONAL_PRECIO=5000;  // precio promo de cerveza nacional unitaria
var CUBE_MIX_TAM=5;         // cantidad de cervezas por balde
var CUBE_NAC_NOMBRES=['aguila','poker'];  // coincide con Águila, Águila Light y Poker
var CUBE_MIX_SUBCAT='';  // subcategoría para cubetazo mixto (opcional)
var CUBE_NAC_SUBCAT='';  // subcategoría para cubetazo nacional (opcional)
var CUBE_NAC_PRECIO=25000;  // precio del cubetazo nacional (5 cervezas)
function abrirCubetazoNacional(){
  if(!mesaActiva)return;
  // Solo Águila, Águila Light y Poker
  var cervezas=menu.filter(function(m){
    var match;
    if(CUBE_NAC_SUBCAT){match=(m.subcat===CUBE_NAC_SUBCAT);}
    else{var n=(m.nombre||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');match=CUBE_NAC_NOMBRES.some(function(x){return n.indexOf(x)>=0;});}
    return match&&(ventaSinStock||m.stock>0);
  });
  if(!cervezas.length){alert('No hay cervezas disponibles para el cubetazo nacional.'+(CUBE_NAC_SUBCAT?' (subcategoría: '+CUBE_NAC_SUBCAT+')':''));return;}
  abrirDistribucion({
    titulo:'Cubetazo nacional '+fmt(CUBE_NAC_PRECIO)+' (elige '+CUBE_MIX_TAM+')',
    emoji:'🪣',
    total:CUBE_MIX_TAM,
    productos:cervezas.map(function(p){return {id:p.id,nombre:p.nombre,emoji:p.emoji,precio:Math.round(CUBE_NAC_PRECIO/CUBE_MIX_TAM),stock:p.stock};}),
    onConfirm:function(cantidades){
      confirmarCubetazoMixto(cantidades,CUBE_MIX_TAM,CUBE_NAC_PRECIO,'Cubetazo nacional');
    }
  });
}

var CUBE_MITICA_NOMBRES=['mitica'];   // coincide con Mítica y Mítica ligera (sin tildes)
function abrirCubetazoMitica(){
  if(!mesaActiva)return;
  var cervezas=menu.filter(function(m){
    var n=(m.nombre||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return CUBE_MITICA_NOMBRES.some(function(x){return n.indexOf(x)>=0;})&&(ventaSinStock||m.stock>0);
  });
  if(!cervezas.length){alert('No hay cervezas Mítica disponibles.');return;}
  // Precio del balde: si alguna tiene promo de cubeta VIGENTE, se usa la promo más baja; si no, su precio de cubeta normal
  var precioBalde=null,esPromo=false;
  cervezas.forEach(function(p){
    var pr=promoVigente(p.id,'cubeta');
    var v=pr?pr.valor:(p.cubeta||CUBE_MIX_PRECIO);
    if(precioBalde===null||v<precioBalde){precioBalde=v;esPromo=!!pr;}
  });
  if(!precioBalde)precioBalde=CUBE_MIX_PRECIO;
  abrirDistribucion({
    titulo:'Cubetazo Mítica '+fmt(precioBalde)+(esPromo?' 🏷️ PROMO':'')+' (elige '+CUBE_MIX_TAM+')',
    emoji:'🪣',
    total:CUBE_MIX_TAM,
    productos:cervezas.map(function(p){return {id:p.id,nombre:p.nombre,emoji:p.emoji,precio:Math.round(precioBalde/CUBE_MIX_TAM),stock:p.stock};}),
    onConfirm:function(cantidades){
      confirmarCubetazoMixto(cantidades,CUBE_MIX_TAM,precioBalde,'Cubetazo Mítica'+(esPromo?' 🏷️':''));
    }
  });
}
function abrirCubetazoMixto(){
  if(!mesaActiva)return;
  // Solo Heineken, Sol y Miller
  var cervezas=menu.filter(function(m){
    var match;
    if(CUBE_MIX_SUBCAT){match=(m.subcat===CUBE_MIX_SUBCAT);}
    else{var n=(m.nombre||'').toLowerCase();match=CUBE_MIX_NOMBRES.some(function(x){return n.indexOf(x)>=0;});}
    return match&&(ventaSinStock||m.stock>0);
  });
  if(!cervezas.length){alert('No hay cervezas disponibles para el cubetazo mixto.'+(CUBE_MIX_SUBCAT?' (subcategoría: '+CUBE_MIX_SUBCAT+')':''));return;}
  // Precio por unidad en cubeta = cubeta/5 de cada cerveza
  abrirDistribucion({
    titulo:'Cubetazo mixto '+fmt(CUBE_MIX_PRECIO)+' (elige '+CUBE_MIX_TAM+')',
    emoji:'🪣',
    total:CUBE_MIX_TAM,
    productos:cervezas.map(function(p){return {id:p.id,nombre:p.nombre,emoji:p.emoji,precio:Math.round(CUBE_MIX_PRECIO/CUBE_MIX_TAM),stock:p.stock};}),
    onConfirm:function(cantidades){
      confirmarCubetazoMixto(cantidades,CUBE_MIX_TAM);
    }
  });
}

function confirmarCubetazoMixto(cantidades,tam,precioFijo,nombreCub){
  if(!mesaActiva)return;
  var id=mesaActiva.id;
  if(!pedidos[id])pedidos[id]=[];
  var precioBalde=(precioFijo!=null)?precioFijo:CUBE_MIX_PRECIO;
  var etiqueta=nombreCub||'Cubetazo mixto';
  // Construir lista de cervezas elegidas
  var detalle=[];
  Object.keys(cantidades).forEach(function(pid){
    var q=cantidades[pid];if(!q)return;
    var p=menu.find(function(m){return Number(m.id)===Number(pid);});
    if(!p)return;
    var precioUnidad=Math.round(precioBalde/tam);
    detalle.push({prodId:p.id,nombre:p.nombre,emoji:p.emoji,cantidad:q,precioUnidad:precioUnidad});
  });
  var newItem={
    pid:'cubmix_'+a52Ahora(),
    uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36),
    cubeta:false,qty:1,isCubetazoMix:true,
    cubMixDetalle:detalle,cubMixPrecio:precioBalde,cubMixTam:tam,cubMixNombre:etiqueta
  };
  pedidos[id].push(newItem);
  var r=ref('pedidos/'+id);if(r)r.set(pedidos[id]);
  // Descontar stock de cada cerveza (atómico + kardex)
  detalle.forEach(function(dd){
    cambiarStock('p',dd.prodId,-dd.cantidad,'Mesa: '+etiqueta);
  });
  var resumen=detalle.map(function(dd){return dd.cantidad+'× '+dd.nombre;}).join(', ');
  logPedido(id,'🪣 '+etiqueta+' ('+resumen+')',1);
  showToast('🪣 '+esc(etiqueta)+'<br><span style="font-size:12px;opacity:.85">'+esc(resumen)+' · '+fmt(precioBalde)+'</span>','#22c55e');
  renderSoloPedido();updateHeader();actualizarColorMesas();
}

function abrirDistribucion(cfg){
  // cfg: {titulo, emoji, total, productos:[{id,nombre,emoji,precio,stock}], onConfirm}
  window._distrib={titulo:cfg.titulo,emoji:cfg.emoji||'🍺',total:cfg.total,
    productos:cfg.productos,cantidades:{},onConfirm:cfg.onConfirm};
  renderDistribModal();
}

function renderDistribModal(){
  var d=window._distrib;if(!d)return;
  var sumaActual=Object.values(d.cantidades).reduce(function(a,v){return a+(v||0);},0);
  var restante=d.total-sumaActual;
  var completo=(sumaActual===d.total);

  var filas=d.productos.map(function(p){
    var q=d.cantidades[p.id]||0;
    var maxStock=parseInt(p.stock);if(isNaN(maxStock))maxStock=0;
    var puedeMas=(restante>0)&&(ventaSinStock||q<maxStock);
    return'<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-size:20px">'+p.emoji+'</span>'
      +'<div style="flex:1"><div style="font-size:13px;font-weight:700">'+esc(p.nombre)+'</div>'
      +'<div style="color:var(--muted);font-size:10px">Stock: '+maxStock+'</div></div>'
      +'<button data-act="distrib-minus" data-pid="'+p.id+'" '+(q<=0?'disabled':'')+' style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:30px;height:30px;cursor:pointer;font-size:18px;line-height:1;opacity:'+(q<=0?'.3':'1')+'">−</button>'
      +'<span style="color:#fff;font-weight:800;min-width:24px;text-align:center;font-size:16px">'+q+'</span>'
      +'<button data-act="distrib-plus" data-pid="'+p.id+'" '+(puedeMas?'':'disabled')+' style="background:#22c55e18;color:#22c55e;border:none;border-radius:6px;width:30px;height:30px;cursor:pointer;font-size:18px;line-height:1;opacity:'+(puedeMas?'1':'.3')+'">+</button>'
    +'</div>';
  }).join('');

  modal2('<div style="text-align:center;margin-bottom:12px">'
    +'<div style="font-size:28px">'+d.emoji+'</div>'
    +'<div style="font-weight:800;font-size:16px">'+esc(d.titulo)+'</div>'
    +'<div style="color:'+(completo?'#22c55e':'var(--accent)')+';font-weight:700;font-size:14px;margin-top:4px">'+sumaActual+' / '+d.total+(completo?' ✓':' · faltan '+restante)+'</div>'
    +'</div>'
    +'<div style="max-height:300px;overflow-y:auto">'+filas+'</div>'
    +'<button onclick="confirmarDistribucion()" '+(completo?'':'disabled')+' style="width:100%;margin-top:14px;background:'+(completo?'#22c55e':'var(--card)')+';color:'+(completo?'#fff':'var(--muted)')+';border:none;border-radius:10px;padding:12px;font-weight:800;font-size:14px;cursor:'+(completo?'pointer':'not-allowed')+'">'+(completo?'✓ Confirmar':'Selecciona '+d.total+' en total')+'</button>');
}

function confirmarDistribucion(){
  var d=window._distrib;if(!d)return;
  var suma=Object.values(d.cantidades).reduce(function(a,v){return a+(v||0);},0);
  if(suma!==d.total)return;
  var cb=d.onConfirm;
  closeModal2();
  if(cb)cb(d.cantidades);
}

function abrirSelectorVariante(pid){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p||!p.variantes||!p.variantes.length)return;
  var btns=p.variantes.map(function(v){
    return'<button data-act="pick-variante" data-pid="'+pid+'" data-nom="'+esc(v.nombre)+'" data-pre="'+v.precio+'" '
      +'style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;'
      +'text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px">'
      +'<span style="flex:1"><span style="font-weight:700;font-size:14px">'+esc(v.nombre)+((v.und||1)>1?' <span style="color:var(--muted);font-size:11px;font-weight:600">('+v.und+' und)</span>':'')+'</span>'
      +(v.desc?'<br><span style="color:var(--muted);font-size:10.5px;font-weight:500">'+esc(v.desc)+'</span>':'')+'</span>'
      +'<span style="color:var(--accent);font-weight:700;font-size:15px">'+fmt(v.precio)+'</span>'
      +'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:16px">'
    +'<div style="font-size:28px">'+p.emoji+'</div>'
    +'<div style="font-weight:800;font-size:16px;margin-top:4px">'+esc(p.nombre)+'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">¿Qué tamaño?</div>'
    +'</div>'
    +'<div style="display:flex;flex-direction:column;gap:8px">'+btns+'</div>');
}
function quitarItem(pid,cubeta){
  if(!mesaActiva)return;
  if(!(usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'))){
    showToast('🔒 Solo admin o subadmin pueden restar productos.','#ef4444',3500);return;
  }
  var id=mesaActiva.id;
  var idx=(pedidos[id]||[]).findIndex(function(it){return it.pid===pid&&it.cubeta===cubeta;});
  if(idx<0)return;
  // Devolver 1 unidad al inventario (se había descontado al agregar)
  ajustarStockItem(pedidos[id][idx],+1);
  if(pedidos[id][idx].qty===1)pedidos[id].splice(idx,1);
  else pedidos[id][idx].qty--;
  var r=ref('pedidos/'+id);if(r)r.set(pedidos[id].length?pedidos[id]:null);
  renderSoloPedido();updateHeader();actualizarColorMesas();
}


