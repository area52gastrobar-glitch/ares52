/* ═══════════ PROVEEDORES E INGRESO DE INVENTARIO ═══════════ */
function abrirProveedores(){
  function gastosProv(pv){
    return gastos.filter(function(g){return g.provId===pv.id||(g.provNombre&&g.provNombre===pv.nombre);});
  }
  function ingresosProv(pv){
    return ingresosInv.filter(function(r){return r.proveedor===pv.nombre;});
  }
  var rows=proveedores.length?proveedores.map(function(pv){
    var gs=gastosProv(pv);
    var totalPagado=gs.reduce(function(s,g){return s+(g.valor||0);},0);
    var ents=ingresosProv(pv);
    var totalFacturado=ents.reduce(function(s,r){return s+(parseInt(r.valorFactura)||0);},0);
    var saldo=totalFacturado-totalPagado;
    var saldoColor=saldo>0?'#ef4444':(saldo<0?'#f5a623':'#22c55e');
    var saldoLabel=saldo>0?'DEBE':(saldo<0?'A FAVOR':'AL DÍA');
    return'<div style="background:var(--card2);border-radius:10px;padding:10px 12px;margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
        +'<span style="font-size:14px;font-weight:700">🏭 '+esc(pv.nombre)+'</span>'
        +'<button onclick="borrarProveedor(\''+pv.id+'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:6px;padding:3px 9px;font-size:12px;cursor:pointer">✕</button>'
      +'</div>'
      +'<div style="background:var(--bg);border-radius:7px;padding:8px;text-align:center;margin-bottom:8px;border:1px solid '+saldoColor+'33">'
        +'<div style="color:var(--muted);font-size:9px">SALDO PENDIENTE · '+saldoLabel+'</div>'
        +'<div style="color:'+saldoColor+';font-weight:900;font-size:18px">'+fmt(Math.abs(saldo))+'</div></div>'
      +'<div style="display:flex;gap:8px;margin-bottom:8px">'
        +'<div style="flex:1;background:var(--bg);border-radius:7px;padding:6px 8px;text-align:center"><div style="color:var(--muted);font-size:9px">FACTURADO</div><div style="color:var(--text);font-weight:800;font-size:12px">'+fmt(totalFacturado)+'</div></div>'
        +'<div style="flex:1;background:var(--bg);border-radius:7px;padding:6px 8px;text-align:center"><div style="color:var(--muted);font-size:9px">PAGADO</div><div style="color:#22c55e;font-weight:800;font-size:12px">'+fmt(totalPagado)+'</div></div>'
        +'<div style="flex:1;background:var(--bg);border-radius:7px;padding:6px 8px;text-align:center"><div style="color:var(--muted);font-size:9px">ENTRADAS</div><div style="color:#38bdf8;font-weight:800;font-size:12px">'+ents.length+'</div></div>'
      +'</div>'
      +'<div style="display:flex;gap:6px">'
        +'<button onclick="pagarProveedor(\''+pv.id+'\')" style="flex:1;background:var(--accent);color:#fff;border:none;border-radius:7px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">💵 Pagar</button>'
        +'<button onclick="verCuentaProveedor(\''+pv.id+'\')" style="flex:1;background:var(--card);border:1px solid var(--border);color:var(--muted);border-radius:7px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">📋 Ver detalle</button>'
      +'</div>'
    +'</div>';
  }).join(''):'<div style="color:var(--muted);text-align:center;padding:14px;font-size:13px">Sin proveedores. Agrega el primero.</div>';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:12px">🏭 Proveedores</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:14px">'
      +'<input class="inp" id="prov-nombre" placeholder="Nombre del proveedor" style="flex:1"/>'
      +'<button class="btn btn-green" onclick="agregarProveedor()">+ Agregar</button>'
    +'</div>'
    +'<div style="max-height:55vh;overflow-y:auto">'+rows+'</div>');
}
function pagarProveedor(provId){
  var pv=proveedores.find(function(p){return p.id===provId;});
  if(!pv)return;
  var gs=gastos.filter(function(g){return g.provId===pv.id||(g.provNombre&&g.provNombre===pv.nombre);});
  var totalPagado=gs.reduce(function(s,g){return s+(g.valor||0);},0);
  var ents=ingresosInv.filter(function(r){return r.proveedor===pv.nombre;});
  var totalFacturado=ents.reduce(function(s,r){return s+(parseInt(r.valorFactura)||0);},0);
  var saldo=totalFacturado-totalPagado;
  var saldoBanner=saldo>0
    ?'<div style="background:#ef444412;border:1px solid #ef444433;border-radius:9px;padding:9px 11px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center"><span style="color:#ef4444;font-size:12px;font-weight:700">💳 Le debes</span><span style="color:#ef4444;font-weight:900;font-size:16px">'+fmt(saldo)+'</span></div>'
    :'<div style="background:#22c55e12;border:1px solid #22c55e33;border-radius:9px;padding:9px 11px;margin-bottom:12px;text-align:center;color:#22c55e;font-size:12px;font-weight:700">✅ Estás al día con este proveedor</div>';
  var fpOpts=FPV().sort(function(a,b){return a.id==='efectivo'?-1:b.id==='efectivo'?1:0;}).map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💵 Pagar a proveedor</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:14px">🏭 '+esc(pv.nombre)+'</div>'
    +saldoBanner
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Concepto *</div>'
    +'<input class="inp" id="pp-concepto" placeholder="Ej: Factura #123, mercancía semana..." value="'+(saldo>0?'Abono saldo proveedor':'')+'"/></div>'
    +'<div style="margin-bottom:6px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor (COP) *</div>'
    +'<input class="inp money" id="pp-valor" type="text" inputmode="numeric" placeholder="0" value="'+(saldo>0?moneyFmt(saldo):'')+'"/></div>'
    +(saldo>0?'<button onclick="(function(){var el=document.getElementById(\'pp-valor\');if(el)el.value=\''+moneyFmt(saldo)+'\';})()" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;margin-bottom:12px">💯 Saldar todo ('+fmt(saldo)+')</button>':'')
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Categoría</div>'
    +'<select class="inp" id="pp-cat"><option value="Mercancía">Mercancía</option><option value="Insumos">Insumos</option></select></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Sale de (forma de pago)</div>'
    +'<select class="inp" id="pp-fp">'+fpOpts+'</select></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarPagoProveedor(\''+provId+'\')">✓ Registrar pago</button>');
}
function confirmarPagoProveedor(provId){
  var pv=proveedores.find(function(p){return p.id===provId;});
  if(!pv)return;
  var concepto=((document.getElementById('pp-concepto')||{}).value||'').trim();
  var valor=moneyVal('pp-valor')||0;
  var cat=(document.getElementById('pp-cat')||{}).value||'Mercancía';
  var fp=(document.getElementById('pp-fp')||{}).value||'efectivo';
  if(!concepto){alert('Escribe el concepto.');return;}
  if(valor<=0){alert('Escribe el valor.');return;}
  var g={id:'g'+a52Ahora(),ts:a52Ahora(),concepto:concepto,categoria:cat,valor:valor,notas:'Pago a proveedor',fp:fp,provId:provId,provNombre:pv.nombre,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  fbPush('gastos',g);
  // Calcular saldo restante después de este pago
  var pagadoPrev=gastos.filter(function(x){return x.provId===pv.id||(x.provNombre&&x.provNombre===pv.nombre);}).reduce(function(s,x){return s+(x.valor||0);},0);
  var facturado=ingresosInv.filter(function(r){return r.proveedor===pv.nombre;}).reduce(function(s,r){return s+(parseInt(r.valorFactura)||0);},0);
  var saldoRest=facturado-(pagadoPrev+valor);
  var restTxt=saldoRest>0?' · queda debiendo '+fmt(saldoRest):(saldoRest<0?' · quedó a favor '+fmt(-saldoRest):' · ✅ saldado');
  closeModal1();
  showToast('💵 Pago a '+esc(pv.nombre)+'<br><span style="font-size:12px;opacity:.85">'+fmt(valor)+' · sale de caja'+restTxt+'</span>','#22c55e');
  render();
}
function verCuentaProveedor(provId){
  var pv=proveedores.find(function(p){return p.id===provId;});
  if(!pv)return;
  var gs=gastos.filter(function(g){return g.provId===pv.id||(g.provNombre&&g.provNombre===pv.nombre);}).slice().sort(function(a,b){return b.ts-a.ts;});
  var ents=ingresosInv.filter(function(r){return r.proveedor===pv.nombre;}).slice().sort(function(a,b){return b.ts-a.ts;});
  var totalPagado=gs.reduce(function(s,g){return s+(g.valor||0);},0);
  var totalFacturado=ents.reduce(function(s,r){return s+(parseInt(r.valorFactura)||0);},0);
  var saldo=totalFacturado-totalPagado;
  var saldoColor=saldo>0?'#ef4444':(saldo<0?'#f5a623':'#22c55e');
  var pagosRows=gs.length?gs.map(function(g){
    return'<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--border)"><span>💵 '+esc(g.concepto)+'<br><span style="color:var(--muted);font-size:10px">'+fmtFechaCorta(g.ts)+' · '+esc(g.categoria)+'</span></span><span style="color:#22c55e;font-weight:700;white-space:nowrap">'+fmt(g.valor)+'</span></div>';
  }).join(''):'<div style="color:var(--muted);font-size:12px;padding:8px 0">Sin pagos registrados.</div>';
  var entRows=ents.length?ents.map(function(r){
    var vf=parseInt(r.valorFactura)||0;
    return'<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--border)"><span>📦 '+r.cantidad+'× '+esc(r.prodNombre)+'<br><span style="color:var(--muted);font-size:10px">'+(r.fecha||fmtFecha(r.ts))+(r.factura?' · Fact: '+esc(r.factura):'')+'</span></span>'+(vf>0?'<span style="color:#f5a623;font-weight:700;white-space:nowrap">'+fmt(vf)+'</span>':'')+'</div>';
  }).join(''):'<div style="color:var(--muted);font-size:12px;padding:8px 0">Sin entradas de inventario.</div>';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🏭 '+esc(pv.nombre)+'</div>'
    +'<div style="background:var(--card2);border-radius:9px;padding:10px;margin-bottom:8px;text-align:center;border:1px solid '+saldoColor+'44"><div style="color:var(--muted);font-size:10px">SALDO PENDIENTE</div><div style="color:'+saldoColor+';font-weight:900;font-size:22px">'+fmt(Math.abs(saldo))+'</div><div style="color:'+saldoColor+';font-size:10px;font-weight:700">'+(saldo>0?'Le debes':saldo<0?'Te debe / pagaste de más':'Al día ✅')+'</div></div>'
    +'<div style="display:flex;gap:8px;margin-bottom:12px">'
      +'<div style="flex:1;background:var(--card2);border-radius:8px;padding:8px;text-align:center"><div style="color:var(--muted);font-size:9px">FACTURADO</div><div style="color:var(--text);font-weight:800;font-size:14px">'+fmt(totalFacturado)+'</div></div>'
      +'<div style="flex:1;background:var(--card2);border-radius:8px;padding:8px;text-align:center"><div style="color:var(--muted);font-size:9px">PAGADO</div><div style="color:#22c55e;font-weight:800;font-size:14px">'+fmt(totalPagado)+'</div></div>'
    +'</div>'
    +'<div style="color:var(--muted);font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:4px">💵 PAGOS</div>'
    +'<div style="max-height:25vh;overflow-y:auto;margin-bottom:12px">'+pagosRows+'</div>'
    +'<div style="color:var(--muted);font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:4px">📦 ENTRADAS DE INVENTARIO</div>'
    +'<div style="max-height:25vh;overflow-y:auto;margin-bottom:14px">'+entRows+'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-full" onclick="abrirProveedores()" style="flex:1;background:var(--card2);border:1px solid var(--border);color:var(--text)">‹ Volver</button>'
      +'<button class="btn btn-green btn-full" onclick="pagarProveedor(\''+provId+'\')" style="flex:1">💵 Pagar</button>'
    +'</div>');
}
function agregarProveedor(){
  var n=(document.getElementById('prov-nombre')||{}).value;n=(n||'').trim();
  if(!n){alert('Escribe el nombre del proveedor.');return;}
  proveedores.push({id:'prov_'+a52Ahora(),nombre:n});
  var ob={};proveedores.forEach(function(p){ob[p.id]=p;});fbSet('proveedores',ob);
  abrirProveedores();
}
function borrarProveedor(id){
  if(!confirm('¿Eliminar este proveedor?'))return;
  proveedores=proveedores.filter(function(p){return p.id!==id;});
  var ob={};proveedores.forEach(function(p){ob[p.id]=p;});fbSet('proveedores',ob);
  abrirProveedores();
}

function abrirIngresoInventario(){
  if(!puedeAjustarInv()){alert('🔒 Los ingresos de inventario están bloqueados. Solo el administrador puede modificar cantidades.');return;}
  if(!proveedores.length){
    alert('Primero crea al menos un proveedor. Pídele al administrador que agregue proveedores en 🏭 Proveedores.');
    return;
  }
  var hoy=_fechaKey(new Date());
  // Lista de productos (carta + ingredientes)
  var prodOpts='<option value="">— Producto —</option>'
    +'<optgroup label="Carta">'+menu.map(function(m){return'<option value="p:'+m.id+'">'+esc(m.nombre)+'</option>';}).join('')+'</optgroup>'
    +'<optgroup label="Ingredientes">'+ingredientes.map(function(i){return'<option value="i:'+i.id+'">'+esc(i.nombre)+'</option>';}).join('')+'</optgroup>';
  var provOpts=proveedores.map(function(pv){return'<option value="'+pv.id+'">'+esc(pv.nombre)+'</option>';}).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:12px">➕ Ingresar inventario</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Producto *</div>'
      +'<select class="inp" id="ing-prod">'+prodOpts+'</select></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Cantidad que entra *</div>'
      +'<input class="inp" id="ing-cant" type="number" inputmode="numeric" min="1" placeholder="0"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Proveedor *</div>'
      +'<select class="inp" id="ing-prov">'+provOpts+'</select></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">N° de factura</div>'
      +'<input class="inp" id="ing-factura" placeholder="Ej: 00123"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor de la factura (COP)</div>'
      +'<input class="inp money" id="ing-valor" type="text" inputmode="numeric" placeholder="0"/>'
      +'<div style="color:var(--muted);font-size:10px;margin-top:3px">Esto es lo que le quedas debiendo al proveedor. Déjalo en 0 si ya la pagaste o si es solo control de stock.</div></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Fecha</div>'
      +'<input class="inp" id="ing-fecha" type="date" value="'+hoy+'"/></div>'
    +'<button class="btn btn-green btn-full" onclick="guardarIngresoInventario()">✓ Registrar ingreso</button>');
}

function guardarIngresoInventario(){
  if(!puedeAjustarInv()){alert('🔒 Los ingresos de inventario están bloqueados. Solo el administrador puede modificar cantidades.');return;}
  var prodVal=(document.getElementById('ing-prod')||{}).value||'';
  var cant=parseInt((document.getElementById('ing-cant')||{}).value)||0;
  var provId=(document.getElementById('ing-prov')||{}).value||'';
  var factura=((document.getElementById('ing-factura')||{}).value||'').trim();
  var valorFactura=moneyVal('ing-valor')||0;
  var fecha=(document.getElementById('ing-fecha')||{}).value||_fechaKey(new Date());
  if(!prodVal){alert('Selecciona el producto.');return;}
  if(cant<=0){alert('La cantidad debe ser mayor a 0.');return;}
  if(!provId){alert('Selecciona el proveedor.');return;}
  var prov=proveedores.find(function(p){return p.id===provId;});
  var tipo=prodVal.charAt(0); var pid=prodVal.slice(2);
  var prodNombre='';
  var motivoIng='Ingreso inventario · '+(prov?prov.nombre:'')+(factura?' · Fact '+factura:'');
  if(tipo==='p'){
    var p=menu.find(function(m){return String(m.id)===String(pid);});
    if(p){prodNombre=p.nombre;cambiarStock('p',p.id,cant,motivoIng);}
  } else {
    var ing=ingredientes.find(function(m){return String(m.id)===String(pid);});
    if(ing){prodNombre=ing.nombre;cambiarStock('i',ing.id,cant,motivoIng);}
  }
  // Registrar el ingreso
  var registro={id:'ing_'+a52Ahora(),ts:a52Ahora(),fecha:fecha,prodTipo:tipo,prodId:pid,prodNombre:prodNombre,cantidad:cant,proveedor:prov?prov.nombre:'',factura:factura,valorFactura:valorFactura,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  fbPush('ingresosInv',registro);
  closeModal1();
  showToast('➕ Ingreso registrado<br><span style="font-size:12px;opacity:.85">'+cant+'× '+esc(prodNombre)+' · '+esc(prov?prov.nombre:'')+(valorFactura>0?' · '+fmt(valorFactura):'')+'</span>','#22c55e');
  render();
}

function verIngresosInv(){
  var rows=ingresosInv.slice().reverse().map(function(r){
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:9px 11px;margin-bottom:7px">'
      +'<div style="display:flex;justify-content:space-between"><span style="font-weight:700;font-size:13px">'+esc(r.prodNombre)+' <b style="color:#22c55e">+'+r.cantidad+'</b></span><span style="color:var(--muted);font-size:11px">'+esc(r.fecha||'')+'</span></div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:3px">🏭 '+esc(r.proveedor||'-')+(r.factura?' · 🧾 '+esc(r.factura):'')+' · '+esc(r.uidNombre||'')+'</div>'
    +'</div>';
  }).join('')||'<div style="color:var(--muted);text-align:center;padding:16px">Sin ingresos registrados</div>';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:12px">📋 Ingresos de inventario</div>'
    +'<div style="max-height:60vh;overflow-y:auto">'+rows+'</div>');
}

/* ═══════════════ INVENTARIO ═══════════════ */
function corregirCosto(pid){
  if(!usuarioActivo||usuarioActivo.rol!=='admin'){alert('Solo el administrador puede corregir costos.');return;}
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:6px">💵 Corregir precio de compra</div>'
    +'<div style="background:var(--bg);border-radius:9px;padding:8px 11px;margin-bottom:10px;font-size:12px">'+p.emoji+' <b>'+esc(p.nombre)+'</b><br><span style="color:var(--muted)">Costo actual: '+(p.costo>0?fmt(p.costo).replace(/\u00A0/g,' '):'sin definir')+' · vende a '+fmt(_precioUnitVenta(p)).replace(/\u00A0/g,' ')+((p.variantes&&p.variantes.length)?' por '+esc(p.und||'und'):'')+'</span></div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nuevo costo por '+esc(p.und||'unidad')+'</div>'
    +'<input class="inp money" id="cc-valor" type="text" inputmode="numeric" placeholder="Ej: 3.500" value="'+(p.costo>0?moneyFmt(p.costo):'')+'" style="margin-bottom:10px"/>'
    +'<div style="color:var(--muted);font-size:10px;margin-bottom:12px">Este valor reemplaza el costo actual (no promedia). Para las compras del día a día usa mejor "📦 Llegó mercancía", que promedia solo.</div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarCorregirCosto('+pid+')">💾 Guardar costo</button>'
    +(p.costo>0?'<button class="btn btn-full" onclick="confirmarCorregirCosto('+pid+',true)" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;margin-top:8px">🗑 Quitar el costo (dejar sin definir)</button>':'')
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
  setTimeout(function(){var i=document.getElementById('cc-valor');if(i){i.focus();i.select&&i.select();}},80);
}
function confirmarCorregirCosto(pid,quitar){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  var anterior=p.costo||0;
  if(quitar){
    p.costo=0;
  }else{
    var v=moneyVal('cc-valor')||0;
    if(v<=0){alert('Escribe el nuevo costo.');return;}
    p.costo=v;
  }
  var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  logKardex('p',p.id,p.nombre,0,'💵 Costo corregido: '+(anterior>0?fmt(anterior).replace(/\u00A0/g,' '):'sin definir')+' → '+(p.costo>0?fmt(p.costo).replace(/\u00A0/g,' '):'sin definir'),parseInt(p.stock)||0);
  closeModal2();
  showToast('💵 Costo de '+esc(p.nombre)+' actualizado'+(p.costo>0?': '+fmt(p.costo):' (quedó sin definir)'),'#22c55e');
  render();
}
function _precioUnitVenta(p){
  // Precio de venta por unidad de stock: precio directo, o derivado de la variante más económica por unidad
  if((p.precio||0)>0)return p.precio;
  if(p.variantes&&p.variantes.length){
    var mejores=p.variantes.map(function(v){return (v.precio||0)/(parseInt(v.und)||1);}).filter(function(x){return x>0;});
    if(mejores.length)return Math.min.apply(null,mejores);
  }
  return 0;
}
var _EMOJI_REGLAS=[
  [/arepa/i,'🫓'],[/mazorc|maiz|maíz/i,'🌽'],[/burrit/i,'🌯'],[/taco/i,'🌮'],[/empanad/i,'🥟'],
  [/hamburgues|burger/i,'🍔'],[/pizza/i,'🍕'],[/lasag|lasañ|pasta|espagu/i,'🍝'],[/alita|alas|wing/i,'🍗'],
  [/costilla|carne|churrasco|res |lomo/i,'🍖'],[/picada/i,'🥓'],[/chorrean|baguette|chorizo/i,'🥖'],
  [/papa|frita/i,'🍟'],[/perro|hot ?dog/i,'🌭'],[/sandwich|sánduche|club house/i,'🥪'],
  [/ensalada/i,'🥗'],[/sopa|caldo|ajiaco/i,'🥘'],[/queso/i,'🧀'],[/salchipapa/i,'🍟'],
  [/patacon|patacón/i,'🫓'],[/nacho/i,'🧀'],[/ceviche|camaron|camarón/i,'🍤'],[/pescado|mojarra|trucha/i,'🍣'],
  [/pollo/i,'🍗'],[/torta|pastel|postre/i,'🍰'],[/brownie|chocolate/i,'🍫'],[/helado/i,'🍨'],
  [/cerveza|beer|coronita|miller|budwei|stella|heineken|aguila|águila|poker|club colombia|corona|modelo|sol\b|mitica|mítica|cordillera/i,'🍺'],
  [/michelada/i,'🍺'],[/coctel|cóctel|margarita|mojito|gin|sex on/i,'🍹'],
  [/aguardiente|amarillo|antioque|ron |ron$|caldas|medellin|medellín/i,'🍾'],
  [/whisk|buchan|old parr|sello|jack daniel|chivas/i,'🥃'],[/tequila|jimador|cuervo/i,'🥃'],
  [/vodka|smirnoff/i,'🍸'],[/vino/i,'🍷'],
  [/agua /i,'💧'],[/agua$/i,'💧'],[/gaseosa|bretaña|coca|postobon|postobón|colombiana|sprite|cuatro/i,'🥤'],
  [/energiz|red ?bull|hatsu|vive ?100|monster/i,'⚡'],[/gatorade|hidrat/i,'⚡'],
  [/limonada|jugo|naranjada/i,'🧃'],[/caf[eé]|tinto|capuchino|cappuc/i,'☕'],[/t[eé] |aromatica|aromática/i,'🫖'],
  [/cigarril|lucky|mustang|marlboro|rothman/i,'🚬']
];
function _emojiSugerido(p){
  var txt=(p.nombre||'')+' '+(p.subcat||'')+' '+(p.cat||'');
  for(var i=0;i<_EMOJI_REGLAS.length;i++){if(_EMOJI_REGLAS[i][0].test(txt))return _EMOJI_REGLAS[i][1];}
  return null;
}
function abrirAutoEmojis(){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  var cambios=[];
  menu.forEach(function(p){
    var sug=_emojiSugerido(p);
    if(sug&&sug!==p.emoji)cambios.push({p:p,de:p.emoji||'📦',a:sug});
  });
  if(!cambios.length){modal2('<div style="font-weight:800;font-size:15px;margin-bottom:8px">🪄 Auto-asignar iconos</div><div style="color:var(--muted);font-size:12px">Todos los productos ya tienen el icono que les corresponde según su nombre. Nada por cambiar. 👌</div><button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:12px">Cerrar</button>');return;}
  window._autoEmojiCambios=cambios;
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:8px">🪄 Auto-asignar iconos · '+cambios.length+' cambios</div>'
    +'<div style="max-height:45vh;overflow-y:auto;background:var(--bg);border-radius:9px;padding:8px 11px;font-size:12px">'
      +cambios.map(function(c){return'<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border)"><span>'+esc(c.p.nombre)+'</span><span>'+c.de+' → <b>'+c.a+'</b></span></div>';}).join('')
    +'</div>'
    +'<div style="color:var(--muted);font-size:10.5px;margin:8px 0 12px">Detectado por el nombre del producto (arepa→🫓, mazorcada→🌽, burrito→🌯, hamburguesa→🍔...). Cualquier producto puedes ajustarlo a mano después editándolo.</div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarAutoEmojis()">✨ Aplicar los '+cambios.length+' cambios</button>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function confirmarAutoEmojis(){
  var cambios=window._autoEmojiCambios||[];
  cambios.forEach(function(c){c.p.emoji=c.a;});
  var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  window._autoEmojiCambios=null;
  closeModal2();
  showToast('🪄 '+cambios.length+' iconos actualizados<br><span style="font-size:12px;opacity:.85">La carta pública los tomará de Firebase</span>','#a855f7');
  render();
}
function abrirSetupCocina(){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  var esBurger=function(m){return /hamburgues|burger/i.test(m.nombre||'');};
  var burgers=menu.filter(esBurger);
  var papas=menu.find(function(m){return /papa/i.test(m.nombre||'')&&!esBurger(m);});
  var carne=ingredientes.find(function(i){return /carne/i.test(i.nombre||'');});
  var pasos=[];
  pasos.push(carne?'✅ Insumo ya existe: 🥩 '+esc(carne.nombre):'🆕 Crear insumo: 🥩 Carne de hamburguesa (stock 0 — tú pones las unidades)');
  pasos.push(papas?'✅ Papas detectadas: '+papas.emoji+' '+esc(papas.nombre)+' (stock actual: '+papas.stock+')':'🆕 Crear producto: 🍟 Papas a la francesa (precio y stock los pones tú)');
  if(burgers.length){
    pasos.push('🍔 Configurar '+burgers.length+' hamburguesa'+(burgers.length>1?'s':'')+': '+burgers.map(function(b){return esc(b.nombre);}).join(', '));
    pasos.push('→ a cada una: SIN stock propio + receta de 1 carne + 1 porción de papas (el combo)');
  }else{
    pasos.push('⚠️ No encontré productos con "hamburguesa" en el nombre. Créalas en la carta primero y vuelve a tocar este botón.');
  }
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:8px">🍔 Configurar cocina por insumos</div>'
    +'<div style="background:var(--bg);border-radius:9px;padding:9px 12px;font-size:11.5px;line-height:1.6">'+pasos.join('<br>')+'</div>'
    +'<div style="color:var(--muted);font-size:10.5px;margin:8px 0 12px">Después de aplicar, lo único que te queda es poner las unidades: el stock del insumo 🥩 (tus 10 carnes) y el de 🍟 (tus 52 porciones). Las hamburguesas quedan limitadas por el insumo más escaso (verás "🧾 alcanza p/ N"). Puedes tocar este botón las veces que quieras: no duplica nada.</div>'
    +(burgers.length?'<button class="btn btn-green btn-full" onclick="confirmarSetupCocina()">✨ Aplicar configuración</button>':'')
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">'+(burgers.length?'Cancelar':'Cerrar')+'</button>');
}
function confirmarSetupCocina(){
  var esBurger=function(m){return /hamburgues|burger/i.test(m.nombre||'');};
  var burgers=menu.filter(esBurger);
  // 1) Insumo carne (si falta)
  var carne=ingredientes.find(function(i){return /carne/i.test(i.nombre||'');});
  if(!carne){
    carne={id:'ing_'+a52Ahora(),nombre:'Carne de hamburguesa',stock:0,und:'und'};
    ingredientes.push(carne);
    guardarIngredientes();
  }
  // 2) Producto papas (si falta)
  var papas=menu.find(function(m){return /papa/i.test(m.nombre||'')&&!esBurger(m);});
  if(!papas){
    var maxId=menu.reduce(function(a,m){return Math.max(a,Number(m.id)||0);},0);
    papas={id:maxId+1,nombre:'Papas a la francesa',emoji:'🍟',precio:0,costo:0,cat:'Cocina',subcat:'',stock:0,und:'porciones',esComida:true,receta:[],variantes:[],disponible:true};
    menu.push(papas);
  }
  // 3) Cada hamburguesa: sin stock propio + receta 1 carne + 1 papas (sin duplicar)
  var configuradas=0;
  burgers.forEach(function(b){
    b.sinStock=true;
    if(b.disponible===undefined)b.disponible=true;
    b.receta=Array.isArray(b.receta)?b.receta:[];
    if(!b.receta.some(function(r){return String(r.pid)===String(carne.id);}))b.receta.push({pid:carne.id,cantidad:1});
    if(!b.receta.some(function(r){return Number(r.pid)===Number(papas.id);}))b.receta.push({pid:papas.id,cantidad:1});
    configuradas++;
  });
  var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  closeModal2();
  showToast('✨ Cocina configurada: '+configuradas+' hamburguesa'+(configuradas>1?'s':'')+' por insumos<br><span style="font-size:12px;opacity:.85">Ahora pon las unidades: stock de 🥩 '+esc(carne.nombre)+' y de '+papas.emoji+' '+esc(papas.nombre)+(papas.precio?'':' (y su precio de venta)')+'</span>','#22c55e');
  render();
}
function _maxPorReceta(p){
  // ¿Para cuántas unidades alcanzan los insumos de la receta? (el más escaso manda)
  if(!p.receta||!p.receta.length)return null;
  var min=Infinity;
  p.receta.forEach(function(ri){
    var enMenu=menu.find(function(m){return Number(m.id)===Number(ri.pid);});
    var it=enMenu||ingredientes.find(function(i){return String(i.id)===String(ri.pid);});
    if(!it)return;
    var st=parseInt(it.stock)||0;
    var alcanza=Math.floor(st/(ri.cantidad||1));
    if(alcanza<min)min=alcanza;
  });
  return min===Infinity?null:Math.max(0,min);
}
function _esComidaProd(p){
  return p.esComida===true||/cocina|comida/i.test(String(p.cat||''));
}
function _valorInventario(){
  var venta=0,costo=0,sinCosto=0,conStock=0,ventaCocina=0,costoCocina=0;
  menu.forEach(function(p){
    var st=parseInt(p.stock)||0;
    if(st<=0||p.sinStock)return;
    conStock++;
    var v=st*_precioUnitVenta(p);
    var c=(p.costo||0)>0?st*p.costo:0;
    if(!((p.costo||0)>0))sinCosto++;
    if(_esComidaProd(p)){ventaCocina+=v;costoCocina+=c;}
    else{venta+=v;costo+=c;}
  });
  return{venta:venta,costo:costo,sinCosto:sinCosto,conStock:conStock,ventaCocina:ventaCocina,costoCocina:costoCocina};
}
function renderInventario(){
  var esAdmin=puedeAjustarInv();  // 🔐 respeta el candado de inventario
  // Edición directa del inventario (precios, ±, borrar) SOLO admin. Los demás solo usan "➕ Ingresar inventario".
  var esCajero=esAdmin;
  var invTab=_invTab||'carta';

  // ── Alerts ────────────────────────────────────────────────────────────────
  var bajos=menu.filter(function(m){return !m.sinStock&&m.stock<=5;});
  var bajosIng=ingredientes.filter(function(i){return i.stock<=5;});
  var totalBajos=bajos.length+bajosIng.length;
  var alertHtml=totalBajos?'<div class="alert-box alert-red mb12" style="padding:0;overflow:hidden">'
    +'<button data-act="toggle-sec" data-sec="stockBajo" style="width:100%;text-align:left;background:none;border:none;color:inherit;padding:10px 12px;font-weight:700;cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
      +'<span>⚠️ Stock bajo · '+totalBajos+' producto'+(totalBajos!==1?'s':'')+'</span><span style="font-size:12px">'+(_secOpen.stockBajo?'▲ ocultar':'▼ ver')+'</span>'
    +'</button>'
    +(_secOpen.stockBajo?'<div style="padding:0 12px 10px">'
      +bajos.map(function(m){return'<div>'+m.emoji+' '+esc(m.nombre)+' — '+_stockTxt(m.stock)+' '+m.und+(m.stock===0?' · AGOTADO':'')+'</div>';}).join('')
      +bajosIng.map(function(i){return'<div>🧂 '+esc(i.nombre)+' — '+_stockTxt(i.stock)+' '+i.und+(i.stock===0?' · AGOTADO':'')+'</div>';}).join('')
    +'</div>':'')
    +'</div>':'';

  // ── Reporte de stock NEGATIVO (vendido sin stock) ──
  var negativos=menu.filter(function(m){return (parseInt(m.stock)||0)<0;});
  var negIng=ingredientes.filter(function(i){return (parseInt(i.stock)||0)<0;});
  var negHtml=(negativos.length||negIng.length)?'<div class="alert-box mb12" style="background:#38bdf812;border:1px solid #38bdf844">'
    +'<div style="font-weight:700;margin-bottom:6px;color:#38bdf8">📉 Vendido sin stock (stock negativo)</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:6px">Estas cantidades se vendieron sin tener inventario. El número es lo que debes reponer.</div>'
    +negativos.map(function(m){return'<div style="display:flex;justify-content:space-between;padding:2px 0"><span>'+m.emoji+' '+esc(m.nombre)+'</span><span style="color:#ef4444;font-weight:800">'+m.stock+' '+m.und+' ('+Math.abs(m.stock)+' de más)</span></div>';}).join('')
    +negIng.map(function(i){return'<div style="display:flex;justify-content:space-between;padding:2px 0"><span>🧂 '+esc(i.nombre)+'</span><span style="color:#ef4444;font-weight:800">'+i.stock+' '+i.und+'</span></div>';}).join('')
    +'</div>':'';
  alertHtml=negHtml+alertHtml;

  // ── Tab pills ──────────────────────────────────────────────────────────────
  var tabPills='<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center">'
    +(puedeAjustarInv()?'<button onclick="abrirIngresoInventario()" style="background:#22c55e;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:800;font-size:13px;cursor:pointer">➕ Ingresar inventario</button>':'')
    +(esAdmin?'<button onclick="abrirProveedores()" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:8px;padding:8px 14px;font-weight:700;font-size:12px;cursor:pointer">🏭 Proveedores</button>':'')
    +(esAdmin?'<button onclick="verIngresosInv()" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:8px;padding:8px 14px;font-weight:700;font-size:12px;cursor:pointer">📋 Ingresos</button>':'')
    +(esAdmin?'<button onclick="abrirKardex()" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:8px;padding:8px 14px;font-weight:700;font-size:12px;cursor:pointer">📒 Kardex</button>':'')
    +(!a52Mod('empleados')?'':'<button onclick="abrirConsumoEmpleados()" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:8px;padding:8px 14px;font-weight:700;font-size:12px;cursor:pointer">🥤 Consumo personal</button>')
    +'<button onclick="elegirImpresionInventario()" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:8px;padding:8px 14px;font-weight:700;font-size:12px;cursor:pointer">🖨️ Imprimir inventario</button>'
    +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button onclick="abrirCuadreInventario()" style="background:#a855f7;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:800;font-size:12px;cursor:pointer">📋 Cuadre físico</button>':'')
    +(usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin')?'<button onclick="abrirVentasOtros()" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:8px;padding:8px 14px;font-weight:800;font-size:12px;cursor:pointer">✏️ Ventas en Otros</button>':'')
    +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button onclick="abrirSetupCocina()" style="background:#f5a62318;color:#f5a623;border:1px solid #f5a62333;border-radius:8px;padding:8px 14px;font-weight:800;font-size:12px;cursor:pointer">🍔 Configurar cocina</button>':'')
    +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button onclick="abrirAutoEmojis()" style="background:#a855f718;color:#a855f7;border:1px solid #a855f733;border-radius:8px;padding:8px 14px;font-weight:800;font-size:12px;cursor:pointer">🪄 Auto-iconos</button>':'')
    +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button onclick="toggleOcultarCant()" style="background:'+(invCfg.ocultarCant?'#a855f7':'var(--card)')+';color:'+(invCfg.ocultarCant?'#fff':'var(--muted)')+';border:1px solid '+(invCfg.ocultarCant?'#a855f7':'var(--border)')+';border-radius:8px;padding:8px 14px;font-weight:800;font-size:12px;cursor:pointer">'+(invCfg.ocultarCant?'🙈 Cajero SIN cantidades':'👁️ Cajero ve cantidades')+'</button>':'')
    +(esAdmin?'<button onclick="exportarInventarioExcel()" style="margin-left:auto;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:8px;padding:7px 14px;font-weight:700;font-size:12px;cursor:pointer">📥 Exportar Excel</button>':'')
    +'</div>'
    +(esAdmin?(function(){
      var vi=_valorInventario();
      return'<div class="card mb12" style="border:1px solid #22c55e33">'
        +'<div class="section-title" style="color:#22c55e">💰 Valor del inventario actual <span style="font-size:10px;color:var(--muted);font-weight:600">(sin cocina)</span></div>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap">'
          +'<div style="flex:1;min-width:130px;background:var(--bg);border-radius:9px;padding:9px 12px"><div style="color:var(--muted);font-size:10px">SI SE VENDIERA TODO (sin comida)</div><div style="color:var(--gold);font-weight:900;font-size:17px">'+fmt(vi.venta)+'</div></div>'
          +(vi.costo>0?'<div style="flex:1;min-width:130px;background:var(--bg);border-radius:9px;padding:9px 12px"><div style="color:var(--muted);font-size:10px">COSTO (precio de compra)</div><div style="color:#38bdf8;font-weight:900;font-size:17px">'+fmt(vi.costo)+'</div></div>'
          +'<div style="flex:1;min-width:130px;background:var(--bg);border-radius:9px;padding:9px 12px"><div style="color:var(--muted);font-size:10px">UTILIDAD POTENCIAL</div><div style="color:#22c55e;font-weight:900;font-size:17px">'+fmt(vi.venta-vi.costo)+'</div><div style="color:var(--muted);font-size:10px">margen '+(vi.venta>0?Math.round((vi.venta-vi.costo)/vi.venta*100):0)+'%</div></div>':'')
        +'</div>'
        +(vi.ventaCocina>0?'<div style="display:flex;justify-content:space-between;background:#f5a62310;border:1px solid #f5a62333;border-radius:9px;padding:7px 12px;margin-top:8px;font-size:12px"><span style="color:#f5a623;font-weight:800">🍽️ Cocina (aparte)</span><span><b style="color:var(--gold)">'+fmt(vi.ventaCocina)+'</b>'+(vi.costoCocina>0?' <span style="color:var(--muted);font-size:10.5px">· costo '+fmt(vi.costoCocina).replace(/\u00A0/g,' ')+'</span>':'')+'</span></div>':'')
        +(vi.sinCosto>0?'<div style="color:var(--muted);font-size:10.5px;margin-top:6px">💡 '+vi.sinCosto+' de '+vi.conStock+' productos con stock aún no tienen precio de compra — agrégalo editando el producto o al registrar la próxima compra.</div>':'')
      +'</div>';
    })():'')
    +'<div style="display:flex;gap:8px;margin-bottom:14px">'
    +['carta','ingredientes'].map(function(t){
      var sel=invTab===t;
      var label=t==='carta'?'🍺 Productos carta':'🧂 Ingredientes cocina';
      return'<button data-act="inv-tab" data-tab="'+t+'" style="flex:1;background:'+(sel?'var(--accent)':'var(--card)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:10px;padding:8px;font-weight:700;font-size:13px;cursor:pointer">'+label+'</button>';
    }).join('')+'</div>';

  if(invTab==='ingredientes'){
    // ── INGREDIENTES section ──────────────────────────────────────────────────
    var _ingFila=function(ing){
      // ⚠️ Insumo fantasma: registro dañado sin nombre (queda de recetas o ediciones viejas)
      if(!ing.nombre){
        var usadoEn=menu.filter(function(p){return p.receta&&p.receta.some(function(ri){return String(ri.pid)===String(ing.id)&&!ri.grupo;});}).map(function(p){return p.nombre;});
        return'<div style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #ef444455;background:#ef444410;border-radius:10px;margin:6px 0">'
          +'<span style="font-size:22px">⚠️</span>'
          +'<div style="flex:1;min-width:0">'
            +'<div style="font-weight:800;font-size:12.5px;color:#ef4444">Insumo dañado (sin nombre)</div>'
            +'<div style="color:var(--muted);font-size:10px">id '+esc(String(ing.id))+' · stock '+(ing.stock||0)+' '+(ing.und||'')
            +(usadoEn.length?' · lo usan: '+esc(usadoEn.join(', ')):' · ninguna receta lo usa — se puede borrar tranquilo')+'</div>'
          +'</div>'
          +(usuarioActivo&&(usuarioActivo.rol==='admin')
            ?'<div style="display:flex;flex-direction:column;gap:5px">'
              +'<button onclick="recuperarIngrediente(\''+String(ing.id).replace(/'/g,'')+'\')" style="background:#22c55e;color:#fff;border:none;border-radius:7px;padding:6px 11px;font-size:11px;font-weight:900;cursor:pointer">♻️ Recuperar</button>'
              +'<button onclick="eliminarIngrediente(\''+String(ing.id).replace(/'/g,'')+'\')" style="background:#ef4444;color:#fff;border:none;border-radius:7px;padding:6px 11px;font-size:11px;font-weight:900;cursor:pointer">🗑 Eliminar</button>'
            +'</div>'
            :'')
        +'</div>';
      }
      return'<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">'
        +'<span style="font-size:22px">🧂</span>'
        +'<div style="flex:1">'
          +'<div style="font-weight:700;font-size:13px">'+esc(ing.nombre)+'</div>'
          +'<div style="color:var(--muted);font-size:11px">'+ing.und+'</div>'
        +'</div>'
        +'<div style="display:flex;align-items:center;gap:6px">'
          +(esCajero
            ?'<button data-act="ing-minus" data-iid="'+ing.id+'" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer">−</button>'
            :'')
          +(esCajero
            ?'<button data-act="ing-edit-stock" data-iid="'+ing.id+'" style="font-weight:800;font-size:15px;min-width:36px;text-align:center;color:'+(ing.stock<=5?'#ef4444':ing.stock<=20?'#f5a623':'var(--text)')+';background:none;border:none;cursor:pointer;padding:0">'+ing.stock+'</button>'
            :'<span style="font-weight:800;font-size:15px;min-width:36px;text-align:center;color:'+(ing.stock<=5?'#ef4444':ing.stock<=20?'#f5a623':'var(--text)')+'">'+_stockTxt(ing.stock)+'</span>')
          +(esCajero
            ?'<button data-act="ing-plus" data-iid="'+ing.id+'" style="background:#22c55e18;color:#22c55e;border:none;border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer">+</button>'
            :'')
          +(esCajero
            ?'<button data-act="ing-merc" data-iid="'+ing.id+'" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer">📦 Llegó</button>'
            :'')
          +(esCajero
            ?'<button data-act="ing-edit" data-iid="'+ing.id+'" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer">✏️</button>'
            :'')
        +'</div>'
        +'</div>';
    };

    var addIngBtn=esCajero
      ?'<button class="btn btn-green btn-full mb12" onclick="abrirNuevoIngrediente()">+ Nuevo ingrediente</button>'
      :'';

    var _gruposMap={};
    ingredientes.forEach(function(ing){
      var g=(ing.grupo||'').trim()||'📦 Sin grupo';
      if(!_gruposMap[g])_gruposMap[g]=[];
      _gruposMap[g].push(ing);
    });
    var _gruposKeys=Object.keys(_gruposMap).sort(function(a,b){
      if(a==='📦 Sin grupo')return 1;if(b==='📦 Sin grupo')return -1;return a.localeCompare(b);
    });
    var ingRows;
    if(!ingredientes.length){
      ingRows='<div style="color:var(--muted);text-align:center;padding:20px">Sin ingredientes registrados</div>';
    }else if(_gruposKeys.length===1&&_gruposKeys[0]==='📦 Sin grupo'){
      ingRows=_gruposMap['📦 Sin grupo'].map(_ingFila).join('');
    }else{
      ingRows=_gruposKeys.map(function(g){
        var k='ingGrp_'+g;
        var abierto=_secOpen[k]!==false;
        var its=_gruposMap[g];
        var totG=its.reduce(function(a,i){return a+(parseInt(i.stock)||0);},0);
        return'<div data-inggrp="'+esc(g)+'" onclick="toggleIngGrp(this.getAttribute(\'data-inggrp\'))" style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border-radius:8px;padding:8px 10px;margin:6px 0;cursor:pointer">'
          +'<span style="font-size:13px;font-weight:800">'+(abierto?'▼':'▶')+' '+esc(g)+' <span style="color:var(--muted);font-weight:600;font-size:11px">· '+its.length+' insumo'+(its.length!==1?'s':'')+'</span></span>'
          +'<span style="color:var(--muted);font-size:11px;font-weight:700">'+(verCantidadesInv()?totG+' total':'•••')+'</span>'
        +'</div>'
        +(abierto?'<div style="padding-left:6px">'+its.map(_ingFila).join('')+'</div>':'');
      }).join('');
    }
    return alertHtml+tabPills+addIngBtn
      +'<div class="card">'+ingRows+'</div>';
  }

  // ── CARTA section - grouped by category ───────────────────────────────────
  var cats=menu.reduce(function(a,m){if(a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
  function _invRow(p){
    var canEdit=esAdmin;
    return'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-size:20px">'+p.emoji+'</span>'
      +'<div style="flex:1">'
        +'<div style="font-weight:700;font-size:13px">'+esc(p.nombre)+'</div>'
        +'<div style="color:var(--accent);font-size:11px">'+fmt(p.precio)+(p.esCerveza&&p.cubeta?' · Cubetazo: '+fmt(p.cubeta):'')+(p.esComida?' · 👨‍🍳':'')+'</div>'
        +((usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'))?(function(){
          if(!(p.costo>0)){
            return usuarioActivo.rol==='admin'?'<div onclick="event.stopPropagation();corregirCosto('+p.id+')" style="font-size:10px;color:#38bdf8;cursor:pointer;font-weight:700">💵 + poner precio de compra</div>':'';
          }
          var pv=_precioUnitVenta(p);
          var u=pv-p.costo;
          return'<div onclick="event.stopPropagation();corregirCosto('+p.id+')" style="font-size:10px;color:var(--muted);cursor:pointer">💵 costo '+fmt(p.costo).replace(/\u00A0/g,' ')+' → <span style="color:'+(u>0?'#22c55e':'#ef4444')+';font-weight:700">utilidad '+fmt(u).replace(/\u00A0/g,' ')+(pv>0?' ('+Math.round(u/pv*100)+'%)':'')+'</span>'+((p.variantes&&p.variantes.length)?' por '+esc(p.und||'und'):'')+' <span style="color:#38bdf8;font-weight:700">✎</span></div>';
        })():'')
      +'</div>'
      +(p.sinStock
        ?'<div style="display:flex;align-items:center;gap:6px">'
          +(function(){var mx=_maxPorReceta(p);if(mx==null||!verCantidadesInv())return'';return'<span style="font-size:10.5px;font-weight:800;color:'+(mx<=0?'#ef4444':mx<=5?'#f5a623':'#22c55e')+'">🧾 alcanza p/ '+mx+'</span>';})()
          +'<button onclick="toggleDisponible('+p.id+')" style="background:'+(p.disponible!==false?'#22c55e18':'#ef444418')+';color:'+(p.disponible!==false?'#22c55e':'#ef4444')+';border:1px solid '+(p.disponible!==false?'#22c55e33':'#ef444433')+';border-radius:7px;padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer">'+(p.disponible!==false?'✅ Disponible':'🚫 Agotado')+'</button>'
        +'</div>'
        :'<div style="display:flex;align-items:center;gap:6px">'
        +(canEdit
          ?'<button data-act="inv-minus" data-pid="'+p.id+'" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer">−</button>'
          :'')
        +(canEdit
          ?'<button data-act="inv-edit-stock" data-pid="'+p.id+'" style="font-weight:800;font-size:15px;min-width:36px;text-align:center;color:'+(p.stock<0?'#ef4444':p.stock===0?'#ef4444':p.stock<=5?'#f5a623':'var(--text)')+';font-weight:'+(p.stock<0?'900':'800')+';background:'+(p.stock<0?'#ef444415':'none')+';border:none;cursor:pointer;padding:2px 6px;border-radius:4px"><u>'+p.stock+'</u></button>'
          :'<span style="font-weight:800;font-size:15px;min-width:36px;text-align:center;color:'+(p.stock<0?'#ef4444':p.stock===0?'#ef4444':p.stock<=5?'#f5a623':'var(--text)')+';padding:2px 6px">'+_stockTxt(p.stock)+'</span>')
        +(canEdit
          ?'<button data-act="inv-plus" data-pid="'+p.id+'" style="background:#22c55e18;color:#22c55e;border:none;border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer">+</button>'
          :'')
        +(canEdit?'<button data-act="inv-merc" data-pid="'+p.id+'" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer">📦 Llegó</button>':'')
      +'</div>')
      +'</div>';
  }
  var catSections=cats.map(function(cat){
    var prods=menu.filter(function(m){return m.cat===cat;});
    // Agrupar por subcategoría
    var subs=prods.reduce(function(a,m){var s=m.subcat||'';if(a.indexOf(s)<0)a.push(s);return a;},[]).sort();
    var rows;
    if(subs.length<=1){
      rows=prods.map(_invRow).join('');
    } else {
      rows=subs.map(function(s){
        var lista=prods.filter(function(m){return (m.subcat||'')===s;});
        var tot=lista.reduce(function(a,p){return a+(p.sinStock?0:(parseInt(p.stock)||0));},0);
        return (s?'<div style="display:flex;justify-content:space-between;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin:8px 0 2px;padding-top:6px;border-top:1px solid var(--border)"><span>'+esc(s)+'</span><span>'+lista.length+' · '+tot+' und</span></div>':'')
          +lista.map(_invRow).join('');
      }).join('');
    }
    var catKey='inv_'+cat;
    var abierto=(catKey in _mesesOpen)?_mesesOpen[catKey]:false;  // cerradas por defecto
    var totalCat=prods.reduce(function(a,p){return a+(p.sinStock?0:(parseInt(p.stock)||0));},0);
    return'<div class="card mb8">'
      +'<button data-act="toggle-mes" data-mes="'+catKey+'" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;cursor:pointer;padding:0">'
        +'<span style="color:var(--accent);font-weight:800;font-size:13px;letter-spacing:1px;text-transform:uppercase">'+(abierto?'▼':'▶')+' '+cat+'</span>'
        +'<span style="color:var(--muted);font-size:11px">'+prods.length+' prod · '+totalCat+' und</span>'
      +'</button>'
      +(abierto?'<div style="margin-top:8px">'+rows+'</div>':'')
      +'</div>';
  }).join('');

  return alertHtml+tabPills+catSections;
}

function toggleCorr(id){
  var p=document.getElementById('corr-'+id),b=document.getElementById('btn-corr-'+id);if(!p)return;
  var vis=p.style.display!=='none';
  p.style.display=vis?'none':'block';
  if(b){b.style.borderColor=vis?'var(--border)':'#ef4444';b.style.color=vis?'var(--muted)':'#ef4444';}
}
function sumarStock(id){
  var el=document.getElementById('ent-'+id);if(!el)return;
  var cant=parseInt(el.value);
  if(isNaN(cant)||cant<=0){alert('Ingresa una cantidad mayor a cero.');return;}
  var p=menu.find(function(m){return m.id===id;});
  if(p){p.stock+=cant;el.value='';var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);render();}
}
function sumarStockRapido(id,cant){
  var p=menu.find(function(m){return m.id===id;});
  if(p){p.stock+=cant;var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);render();}
}
function guardarStock(id){
  var el=document.getElementById('inv-'+id);if(!el)return;
  var v=parseInt(el.value);
  if(isNaN(v)||v<0){alert('Número inválido.');return;}
  if(!confirm('¿Fijar el stock en '+v+' unidades? Úsalo solo para corregir errores.'))return;
  var p=menu.find(function(m){return m.id===id;});
  if(p){p.stock=v;var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);render();}
}


