/* ═══════════════ FIREBASE ═══════════════ */
// db is set by the dynamic loader in <head> once Firebase scripts load
function getDb(){return window._db||null;}
function ref(path){var d=getDb();return d?d.ref(path):null;}
function fbSet(path,val){var r=ref(path);if(r)r.set(val).catch(function(e){a52Falla(path,e);});}
function fbPush(path,val){var r=ref(path);if(r)r.push(val).catch(function(e){a52Falla(path,e);});}
function fbOn(path,cb){var r=ref(path);if(r)r.on('value',function(s){cb(s.val());});return r;}
function fbOff(path){var r=ref(path);if(r)r.off();}

/* ═══════════════ CONSTANTES ═══════════════ */
var ZONAS=[
  {id:'salon',label:'Salón',emoji:'🪑',color:'#a855f7'}
];   // de fábrica; las de cada negocio vienen de sus ajustes
var FPAGO=[
  {id:'nequi',    label:'Nequi',         color:'#8B5CF6',emoji:'📲'},
  {id:'daviplata',label:'Daviplata',      color:'#EF4444',emoji:'🔴'},
  {id:'breb',     label:'Bre-B',          color:'#06B6D4',emoji:'💠'},
  {id:'tarjeta',  label:'Tarjeta crédito',color:'#F59E0B',emoji:'💳'},
  {id:'efectivo', label:'Efectivo',       color:'#22C55E',emoji:'💵'}
];
var ROLES={
  admin:   {label:'Administrador',  color:'#f5a623',tabs:['mesas','inventario','carta','combos','caja','gastos','ventas','rappi','socios','empleados','creditos','saneamiento','cocina','admin']},
  subadmin:{label:'Subadministrador',color:'#38bdf8',tabs:['mesas','inventario','carta','combos','gastos','ventas','rappi','socios','empleados','creditos','saneamiento','cocina']},
  cajero:  {label:'Cajero',         color:'#a855f7',tabs:['mesas','inventario','carta','combos','gastos','ventas','rappi','socios','empleados','creditos','saneamiento','cocina']},
  mesero:  {label:'Mesero',         color:'#22c55e',tabs:['mesas','inventario','gastos','socios','cocina']},
  cocinero:{label:'Cocinero',       color:'#f97316',tabs:['cocina','inventario','mesas']}
};
var TAB_LABELS={mesas:NEGOCIO.emoji+' Mesas',inventario:'📦 Inventario',carta:'🍽️ Carta',combos:'🎁 Combos',
  caja:'💰 Caja',gastos:'📋 Gastos',ventas:'📊 Ventas',rappi:'🛵 Rappi',socios:'🤝 Socios',empleados:'👷 Empleados',creditos:'📒 Fiados',saneamiento:'🧼 Saneamiento',cocina:'👨‍🍳 Cocina',admin:'⚙️ Admin'};
// Pestañas visibles en la barra superior por rol (las que más se usan a diario)
var TABS_FAVORITOS={
  admin:['mesas','caja','gastos','ventas'],
  subadmin:['mesas','gastos','ventas','inventario'],
  cajero:['mesas','gastos','ventas','cocina'],
  mesero:['mesas','cocina','gastos','inventario']
};
// Agrupación del menú "☰ Más" por categorías
var TABS_GRUPOS=[
  {titulo:'🍻 Operación',tabs:['mesas','cocina','carta','combos']},
  {titulo:'💵 Dinero',tabs:['caja','gastos','ventas','creditos','rappi']},
  {titulo:'📦 Inventario y personas',tabs:['inventario','socios','empleados']},
  {titulo:'⚙️ Configuración',tabs:['saneamiento','admin']}
];
var EMOJIS=['🍺','🍻','🥃','🍷','🥂','🍹','🥤','💧','🧃','🧉','🍸','🍾','☕','🫖','🧋','⚡','🔋','🥫','🍕','🍔','🌭','🌮','🌯','🫔','🫓','🌽','🥙','🍗','🍖','🥩','🥓','🍟','🧆','🍝','🍜','🥘','🫕','🥟','🥪','🧀','🥗','🥖','🍚','🎂','🍰','🧁','🍩','🍪','🍫','🚬','🔥','💫','🌶️','🍤','🦐','🦑','🦀','🍣','🍱','🍊','🍋','🍓','🫐','🥭','🧊','🥚','🍳','🫙','🍞','🥐','🧇'];
var CATG_GASTOS=['Mercancía','Insumos','Servicios','Personal','Mantenimiento','Transporte','Otro'];

/* ═══════════════ ESTADO ═══════════════ */
var usuarios=[
  {id:'admin',   nombre:'Administrador',pin:'1234',rol:'admin', emoji:'👑'},
  {id:'socio1',  nombre:'Socio',         pin:'5678',rol:'subadmin',emoji:'🤝'},
  {id:'cajero1', nombre:'Cajero',        pin:'0000',rol:'cajero',emoji:'💰'},
  {id:'mesera1', nombre:'Mesera 1',      pin:'1111',rol:'mesero',emoji:'🌸'},
  {id:'mesera2', nombre:'Mesera 2',      pin:'2222',rol:'mesero',emoji:'⭐'},
  {id:'mesera3', nombre:'Mesera 3',      pin:'3333',rol:'mesero',emoji:'🌙'},
];
var menu=[
  {id:1, nombre:'Cerveza Águila',       precio:4500, cubeta:20000,esCerveza:true, cat:'Cervezas',emoji:'🍺',stock:120,und:'und'},
  {id:2, nombre:'Cerveza Club Colombia',precio:5500, cubeta:24000,esCerveza:true, cat:'Cervezas',emoji:'🍺',stock:96, und:'und'},
  {id:3, nombre:'Cerveza Heineken',     precio:7000, cubeta:32000,esCerveza:true, cat:'Cervezas',emoji:'🍺',stock:48, und:'und'},
  {id:4, nombre:'Cerveza Corona',       precio:7500, cubeta:34000,esCerveza:true, cat:'Cervezas',emoji:'🍺',stock:36, und:'und'},
  {id:5, nombre:'Aguardiente (copa)',   precio:8000, cubeta:null, esCerveza:false,cat:'Licores', emoji:'🥃',stock:2,  und:'bot'},
  {id:6, nombre:'Ron Medellín (copa)',  precio:9000, cubeta:null, esCerveza:false,cat:'Licores', emoji:'🥃',stock:3,  und:'bot'},
  {id:7, nombre:'Whisky (copa)',        precio:18000,cubeta:null, esCerveza:false,cat:'Licores', emoji:'🥃',stock:1,  und:'bot'},
  {id:8, nombre:'Vino tinto (copa)',    precio:14000,cubeta:null, esCerveza:false,cat:'Vinos',   emoji:'🍷',stock:4,  und:'bot'},
  {id:9, nombre:'Gaseosa',             precio:4000, cubeta:null, esCerveza:false,cat:'Soft',    emoji:'🥤',stock:60, und:'und'},
  {id:10,nombre:'Agua',                precio:3000, cubeta:null, esCerveza:false,cat:'Soft',    emoji:'💧',stock:80, und:'und'},
  {id:11,nombre:'Tabla de quesos',     precio:28000,cubeta:null, esCerveza:false,cat:'Comidas', emoji:'🧀',stock:10, und:'und'},
  {id:12,nombre:'Alitas (6 und)',      precio:22000,cubeta:null, esCerveza:false,cat:'Comidas', emoji:'🍗',stock:20, und:'und'},
  {id:13,nombre:'Papas fritas',        precio:12000,cubeta:null, esCerveza:false,cat:'Comidas', emoji:'🍟',stock:30, und:'und'}
];
function genMesas(zona,n,off){
  return Array.from({length:n},function(_,i){
    return{id:off+i+1,num:i+1,nombre:'Mesa '+(i+1),zona:zona,
      cap:i<2?2:i<n-2?4:6,x:(i%5)*150+16,y:Math.floor(i/5)*145+16,
      forma:['redonda','rectangular','cuadrada'][i%3],ori:'horizontal'};
  });
}
var mesas=genMesas('salon',8,0);
var pedidos={};
var ventas=[];
var gastos=[];       // [{id,ts,concepto,categoria,valor,uid,uidNombre}]
var cierres=[];      // [{fecha,ts,cajaInicial,efectivoFinal,ventas,gastos,porFP,utilidad,uid}]
var cajaHoy={cajaInicial:0};  // caja inicial del turno
var turnoInicio=a52Ahora();    // timestamp del inicio del turno (se resetea en cada cierre)
var ticketConfig={fontSize:14,paperWidth:280,mostrarLogo:true};  // configurable
var consumoSocios=[];  // [{id, ts, socio, items, total}]
var novedades=[];
var comprasCocina=[];   // 🛒 lista de faltantes que anota la cocina
var serviciosPublicos={};  // 🧾 agua, luz, gas, internet
var otrosConciliados=[];   // ✏️ ventas en "Otros" ya cuadradas contra el inventario  // 📝 novedades de mesas: descuentos, clientes que se volaron, cortesías...
var smsBanco=[];  // 📡 SMS del banco empujados desde el celular {texto,ts} → contraste automático
var pelotasMesa={};  // 🐸 pelotas de bolirrana prestadas por mesa {mesaId:{qty,ts,uidNombre}}
var trasladosFP=[];  // movimientos de dinero entre medios de pago [{ts,de,a,monto,uid,uidNombre}]
var invCfg={soloAdmin:true};  // 🔐 quién puede ajustar cantidades · ocultarCant: esconde números al cajero
function verCantidadesInv(){
  if(!usuarioActivo)return false;
  if(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin')return true;
  return invCfg.ocultarCant!==true;
}
function _stockTxt(n){return verCantidadesInv()?n:'•••';}
function toggleOcultarCant(){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  invCfg.ocultarCant=(invCfg.ocultarCant!==true);
  fbSet('invCfg',invCfg);
  showToast(invCfg.ocultarCant
    ?'🙈 Cantidades OCULTAS para el cajero<br><span style="font-size:12px;opacity:.85">Ideal para día de conteo: el cajero no ve los números del sistema</span>'
    :'👁️ Cantidades visibles para todos','#f5a623');
  render();
}
function puedeAjustarInv(){
  if(!usuarioActivo)return false;
  if(usuarioActivo.rol==='admin')return true;
  if(usuarioActivo.rol==='subadmin')return invCfg.soloAdmin===false;
  return false;
}
var promos=[];  // promociones por día/hora [{id,prodId,tipo:'unidad'|'cubeta',valor,dias:[0-6],horaIni:'HH:MM',horaFin:'HH:MM',on}]
var prestamosSocios=[];  // préstamos de socios al negocio [{id,ts,socio,tipo:'dinero'|'compra',monto,fp,concepto,devuelto,devoluciones[],uid,uidNombre}]
var consumoEmpleados=[];  // [{id,ts,empId,empNombre,prodNombre,cantidad,stockDetalle,uid,uidNombre}] consumo interno del personal (sin valor, solo inventario)
var proveedores=[];  // [{id, nombre}]
var ingresosInv=[];  // [{id, ts, fecha, prodId, prodNombre, cantidad, proveedor, factura, uid, uidNombre}]
var empleados=[];      // [{id, nombre, cargo, activo, pagoDiario}]
var movEmpleados=[];   // [{id, ts, empId, tipo, valor, fp, nota, uid, largoPlazo, semanaKey}]
var asistenciaEmp={};  // {empId_YYYY-MM-DD: true} días trabajados
var _empSemanaOffset=0;  // navegación de semana en nómina
var clientesCredito=[];// [{id, nombre, telefono, activo}]
var _secOpen={ranking:false,historial:false,socios:false,gastosHist:false,invCarta:true,invIng:false,cierresHist:false,rappiHist:false,rappiCierres:false,sanPlan:false,ventasDiarias:true,stockBajo:false,socProds:false,cobrosTurno:true,concil:false,gastosFP:false,prestamosHist:false};  // secciones plegables
var ventasRappi=[];   // [{id,ts,items,total,uid}]
var _rappiPedido=[];  // pedido en construcción
var _rappiCat='';  // categoría abierta en acordeón Rappi
var cierresRappi=[];  // histórico de cierres de Rappi
var APPS_DOMI={rappi:{n:'Rappi',e:'🛵',c:'#FF6B00'},didi:{n:'Didi',e:'🍔',c:'#FF9E0D'},uber:{n:'Uber Eats',e:'🥡',c:'#06C167'}};
var _appPlat='rappi';       // plataforma seleccionada para la venta en construcción
var _appPlatCierre='rappi'; // plataforma del cierre en pantalla
var saneamientoChecks={};  // {fecha_areaId: {check,uid,hora}}
var saneamientoSemanal={};  // {semana_actId: {fecha,insumo,responsable,obs}}
var _sanSemanaOffset=0;  // 0=semana actual, -1=anterior, etc.
var abonosMesa={};  // {mesaId:[{monto,fp,nombre,ts,uid}]}
var pedidoLog={};   // {mesaId:[{ts,texto,delta,uidNombre}]}  historial de pedidos con hora
var fotoCompCfg={on:true,min:0};  // foto de comprobante para pagos digitales: activada, monto mínimo
var arqueos=[];  // [{ts,uid,uidNombre,denoms,total,esperado,dif,turnoTs}] conteos de efectivo
var _arqNoVistos=[];  // 🔔 arqueos de otros aún sin revisar por el admin (insignia en el header)
var redBarCfg={on:false,ips:[]};  // bloqueo por red: meseros/cajeros solo entran desde las IPs autorizadas
var _miIPCache=null;
// Obtiene la IP pública de la red actual (con respaldo si el primer servicio falla)
function obtenerIPPublica(cb){
  var done=false;
  function ok(ip){if(done)return;done=true;_miIPCache=ip;cb(ip);}
  function fallo(){if(done)return;done=true;cb(null);}
  try{
    fetch('https://api.ipify.org?format=json').then(function(r){return r.json();}).then(function(d){ok(d.ip);})
    .catch(function(){
      fetch('https://api64.ipify.org?format=json').then(function(r){return r.json();}).then(function(d){ok(d.ip);}).catch(fallo);
    });
  }catch(e){fallo();}
}
function ipAutorizada(ip){
  return !!ip&&(redBarCfg.ips||[]).some(function(x){return x.ip===ip;});
}
function rolRestringidoRed(rol){return rol==='mesero'||rol==='cajero';}
var DENOMS=[
  {k:'b100',v:100000,l:'💵 $100.000'},{k:'b50',v:50000,l:'💵 $50.000'},{k:'b20',v:20000,l:'💵 $20.000'},
  {k:'b10',v:10000,l:'💵 $10.000'},{k:'b5',v:5000,l:'💵 $5.000'},{k:'b2',v:2000,l:'💵 $2.000'},
  {k:'m1000',v:1000,l:'🪙 $1.000'},{k:'m500',v:500,l:'🪙 $500'},{k:'m200',v:200,l:'🪙 $200'},
  {k:'m100',v:100,l:'🪙 $100'},{k:'m50',v:50,l:'🪙 $50'}
];
var SAN_AREAS=[
  {id:'pisos',nombre:'Pisos y Paredes',cond:'Libres de residuos, grasa y humedad. Barrido y trapeado completo.'},
  {id:'banos',nombre:'Baños (Clientes/Staff)',cond:'Sanitarios, lavamanos y pisos desinfectados. Papeleras vaciadas.'},
  {id:'neveras',nombre:'Refrigeradores / Neveras',cond:'Limpieza externa e interna. Rejillas sin humedad.'},
  {id:'barra',nombre:'Utensilios de Barra',cond:'Lavados y desinfectados. Solo material no poroso.'},
  {id:'basura',nombre:'Contenedores de Basura',cond:'Limpios. Tapas instaladas y funcionales.'}
];
var SAN_SEMANAL=[
  {id:'dificil',nombre:'Zonas de Difícil Acceso',desc:'Limpieza debajo y detrás de neveras, mobiliario y estanterías.'},
  {id:'rejillas',nombre:'Mantenimiento de Rejillas',desc:'Verificación y limpieza para evitar óxido o desprendimiento de pintura.'},
  {id:'drenaje',nombre:'Sistemas de Drenaje',desc:'Limpieza profunda de rejillas de piso y sifones.'},
  {id:'almacen',nombre:'Área de Almacenamiento',desc:'Revisión de rotación de productos e inspección de orden.'}
];
var _mesesOpen={};  // meses expandidos en historial
var deudasCredito=[];  // [{id, ts, clienteId, mesa, items, total, pagado, pagos:[{ts,valor,fp}]}]
var _socioActivo='';  // currently selected socio
var _socCatFiltro='';  // categoría abierta en el acordeón de socios (vacío = todas cerradas)
var ventaSinStock=false;  // admin toggle: allow selling without stock (se guarda en configBar: vale para todos los equipos)
var otroHabilitado=true;  // admin toggle: botón «✏️ Otro» (producto personalizado) para meseros y cajeros
var descuentoHabilitado=true;  // admin toggle: permitir el 10% de descuento
var descuentos={};        // {mesaId: {pct:10, auth:'Nombre'}}
var _invTab='carta';      // 'carta' or 'ingredientes'
var mesaSize=80;  // px size of each mesa circle
var vistaMesas='mapa';  // 'mapa' o 'lista'
var catEmojis={};  // {catName: emoji} - saved in Firebase
var combos=[];  // [{id,nombre,precio,emoji,ingredientes:[{prodId,cantidad}]}]
var ingredientes=[];  // cocina ingredients - separate from menu
var paredesData={};  // antejardIn = safe key for antejardín
var formasData={};  // formas: rect/circ/texto por zona
var _formaDragState=null;
var _formaResizeState=null;

// UI state
var usuarioActivo=null;
var tabActual='mesas';
var zonaActual='salon';
var mesaActiva=null;
var modoEdicion=false;
var modoParedes=false;
var catFiltroPed='Todos';
var _pedSubAbierta={};  // {cat|subcat: true} subcategorías desplegadas en el selector de pedido
var _busqPed='';        // texto del buscador de productos en la mesa
function _cartaCard(p){
  // Productos sin control de cantidad: solo importa si están disponibles
  if(p.sinStock){
    var dispo=p.disponible!==false;
    var agoSS=!dispo;
    var okNS=dispo,okCS=dispo;
    return _cartaCardHTML(p,agoSS,okNS,okCS,true);
  }
  var ago=!ventaSinStock&&p.stock<=0;
  // El stock YA descuenta lo pedido en mesas (descuento en tiempo real al agregar):
  // el número es la nevera física, así que la disponibilidad es directa.
  var okN=ventaSinStock||(!ago&&p.stock>=1);
  var okC=ventaSinStock||(!ago&&p.stock>=5);
  return _cartaCardHTML(p,ago&&!ventaSinStock,okN,okC,false);
}
function _cartaCardHTML(p,mostrarAgotado,okN,okC,esSinStock){
  return'<div class="carta-item" style="opacity:'+(mostrarAgotado?0.4:1)+'">'
    +'<div class="flex-between">'+a52FotoMini(p)
    +(mostrarAgotado?'<span class="tag" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;font-size:10px">AGOTADO</span>'
         :esSinStock?'<span class="tag" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;font-size:10px">✅</span>'
         :p.stock<=0&&ventaSinStock?'<span class="tag" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;font-size:10px">S/L</span>'
         :p.stock<=5?'<span class="tag" style="background:#f5a62318;color:#f5a623;border:1px solid #f5a62333;font-size:10px">↓'+p.stock+'</span>':'')+'</div>'
    +'<div style="color:var(--text);font-size:12px;font-weight:700;margin:3px 0 1px;line-height:1.2">'+esc(p.nombre)+'</div>'
    +'<div style="color:var(--muted);font-size:10px;margin-bottom:5px">'+(esSinStock?(p.disponible!==false?'✅ Disponible':'🚫 Agotado'):'Stock: '+p.stock+' '+p.und)+'</div>'
    +'<div style="display:flex;gap:4px">'
    +(function(){
      var prU=(p.variantes&&p.variantes.length)?null:promoVigente(p.id,'unidad');
      var prC=promoVigente(p.id,'cubeta');
      return '<button onclick="abrirCantidadMesa('+p.id+',false)" '+(okN?'':'disabled')+' style="flex:1;background:'+(prU?'#f5a62322':'var(--accent)18')+';color:'+(prU?'#f5a623':'var(--accent)')+';border:1px solid '+(prU?'#f5a62366':'var(--accent)33')+';border-radius:6px;padding:4px 0;font-size:11px;font-weight:700;cursor:'+(okN?'pointer':'not-allowed')+'">'+(prU?'🏷️'+fmt(prU.valor):((p.variantes&&p.variantes.length)?'desde '+fmt(Math.min.apply(null,p.variantes.map(function(v){return v.precio;}))):fmt(p.precio)))+'</button>'
      +(p.esCerveza&&p.cubeta?'<button onclick="abrirCantidadMesa('+p.id+',true)" '+(okC?'':'disabled')+' style="flex:1;background:'+(prC?'#f5a62322':'#22c55e18')+';color:'+(prC?'#f5a623':'#22c55e')+';border:1px solid '+(prC?'#f5a62366':'#22c55e33')+';border-radius:6px;padding:4px 0;font-size:11px;font-weight:700;cursor:'+(okC?'pointer':'not-allowed')+'">🪣'+(prC?'🏷️'+fmt(prC.valor):fmt(p.cubeta))+'</button>':'');
    })()
    +'</div>'
    +(((p.cat||'').toLowerCase().indexOf('nacional')>=0)?'<button onclick="abrirCantidadPromo('+p.id+')" '+(okN?'':'disabled')+' style="width:100%;margin-top:4px;background:#f5a62318;color:#f5a623;border:1px solid #f5a62344;border-radius:6px;padding:4px 0;font-size:11px;font-weight:800;cursor:'+(okN?'pointer':'not-allowed')+'">⭐ Promo '+fmt(PROMO_NACIONAL_PRECIO)+'</button>':'')
    +'</div>';
}
function _bpBusqHTML(){
  var qtxt=(_busqPed||'').trim();
  if(!qtxt)return null;
  var q=_normTxt(qtxt);
  var matches=menu.filter(function(m){
    return _normTxt(m.nombre).indexOf(q)>=0||_normTxt(m.cat).indexOf(q)>=0||_normTxt(m.subcat||'').indexOf(q)>=0;
  }).filter(a52Vendible).slice(0,30);
  return '<div style="margin-top:10px">'
    +'<div style="color:var(--accent);font-size:11px;font-weight:800;letter-spacing:.5px;margin-bottom:6px">\ud83d\udd0d '+matches.length+' RESULTADO'+(matches.length!==1?'S':'')+' PARA "'+esc(qtxt)+'"</div>'
    +(matches.length?'<div class="carta-grid">'+matches.filter(a52Vendible).map(_cartaCard).join('')+'</div>'
      :'<div style="color:var(--muted);font-size:12px;text-align:center;padding:14px;background:var(--card2);border-radius:10px">Sin coincidencias. Revisa la ortograf\u00eda o busca por categor\u00eda.</div>')
  +'</div>';
}
var _busqTimer=null;
function _debounceBusq(fn){
  // Mientras se escribe no se re-dibuja nada (el teclado queda quieto);
  // 450ms después de la última tecla se actualizan los resultados.
  clearTimeout(_busqTimer);
  _busqTimer=setTimeout(fn,450);
}
function _refocusBusq(id){
  // Re-enfocar EN EL MISMO evento (sin setTimeout): así Android no cierra el teclado
  var el=document.getElementById(id);
  if(el){el.focus();var n=el.value.length;try{el.setSelectionRange(n,n);}catch(e){}}
}
function filtrarBusqPed(v){
  _busqPed=v;
  var z=document.getElementById('bp-zona');
  var htmlB=_bpBusqHTML();
  if(z&&htmlB!=null){z.innerHTML=htmlB;return;}   // escribiendo: solo cambia la zona, el input no se toca y el teclado vive
  renderSoloPedido();
  _refocusBusq('busq-ped');
}
function limpiarBusqPed(){_busqPed='';renderSoloPedido();}
function _normTxt(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
var editandoProd=null;
var editandoCombo=null;
var emojiSel='🍺';
var _formaSel='rectangular';
var _oriSel='horizontal';
var _fpSel=null;
var _paredDibujando=null;
var _colorPared='#f5a623';
var _grosorPared=6;
var dragState=null;

/* ═══════════════ UTILS ═══════════════ */
function zonaKey(z){ return z==='antejardín'?'antejardIn':String(z).replace(/[.#$\[\]\/]/g,'_'); }   // llave segura para la base
var fmt=function(n){return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n||0);};
// ── Formateo de miles en campos de dinero ──
function moneyFmt(s){var d=String(s==null?'':s).replace(/[^0-9]/g,'');if(!d)return'';return parseInt(d,10).toLocaleString('es-CO');}
function moneyVal(idOrEl){var el=(typeof idOrEl==='string')?document.getElementById(idOrEl):idOrEl;if(!el)return 0;return parseInt(String(el.value).replace(/[^0-9]/g,''),10)||0;}
document.addEventListener('input',function(e){
  var t=e.target;
  if(t&&t.classList&&t.classList.contains('money')){
    var digitsBefore=String(t.value).slice(0,t.selectionStart||0).replace(/[^0-9]/g,'').length;
    t.value=moneyFmt(t.value);
    // Reposicionar el cursor tras el dígito correspondiente
    var idx=0,seen=0;
    while(idx<t.value.length&&seen<digitsBefore){if(/[0-9]/.test(t.value[idx]))seen++;idx++;}
    try{t.setSelectionRange(idx,idx);}catch(err){}
  }
},true);
var fmtDate=function(ts){return new Date(ts).toLocaleDateString('es-CO');};
var fmtTime=function(ts){return new Date(ts).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});};
var fmtDT=function(ts){return fmtDate(ts)+' '+fmtTime(ts);};
function todayStr(){return new Date().toLocaleDateString('es-CO');}
// ── DÍA DE NEGOCIO (11am–5am): lo que pasa entre 00:00 y 04:59 cuenta para el día anterior ──
var HORA_CIERRE_NEGOCIO=5;  // a las 5am cambia el día de negocio
function fechaNegocio(ts){var d=new Date(ts);d.setHours(d.getHours()-HORA_CIERRE_NEGOCIO);return d;}
function diaNegocioStr(ts){return fechaNegocio(ts).toLocaleDateString('es-CO');}
function hoyNegocioStr(){return diaNegocioStr(a52Ahora());}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function precioItem(it){
  if(it.es2x1Gratis) return 0;   // 🎁 unidad gratis de una promo 2x1
  if(it.isCombo) return it.comboPrecio||0;
  if(it.isCustom) return it.customPrecio||0;
  if(it.isCubetazoMix) return it.cubMixPrecio||0;
  // Precio de promoción CONGELADO al momento de agregar el producto a la mesa
  if(it.precioPromo) return it.precioPromo;
  // Variante con precio propio (ej: Pizza Personal/Mediana)
  if(it.variantePrecio) return it.variantePrecio;
  var p=menu.find(function(m){return m.id===it.pid;});if(!p)return 0;return it.cubeta?(p.cubeta||p.precio*5):p.precio;
}
/* ═══ PROMOCIONES por día y hora (ej: jueves y viernes cubetazo Miller a 30.000) ═══ */
function _hm(str){  // 'HH:MM' → minutos del día; vacío → null
  if(!str)return null;
  var p=String(str).split(':');
  return (parseInt(p[0])||0)*60+(parseInt(p[1])||0);
}
function _promoEnVentana(pr){
  var ahora=new Date();
  var dia=ahora.getDay();               // 0=domingo ... 6=sábado
  var diaAnt=(dia+6)%7;
  var min=ahora.getHours()*60+ahora.getMinutes();
  var dias=pr.dias||[];
  var ini=_hm(pr.horaIni),fin=_hm(pr.horaFin);
  if(ini===null||fin===null){                       // sin horario: todo el día
    return dias.indexOf(dia)>=0;
  }
  if(fin>=ini){                                     // horario normal en el mismo día
    return dias.indexOf(dia)>=0&&min>=ini&&min<=fin;
  }
  // Cruza medianoche (ej: 20:00 → 02:00): vale la noche del día elegido
  return (dias.indexOf(dia)>=0&&min>=ini)||(dias.indexOf(diaAnt)>=0&&min<=fin);
}
function promo2x1Vigente(p){
  if(!p)return null;
  return promos.find(function(pr){
    if(pr.on===false)return false;
    if(pr.tipo!=='2x1')return false;
    if(pr.cat){if(String(pr.cat)!==String(p.cat||''))return false;}
    else if(String(pr.prodId)!==String(p.id))return false;
    return _promoEnVentana(pr);
  })||null;
}
function promoVigente(prodId,tipo){
  return promos.find(function(pr){
    if(pr.on===false)return false;
    if(pr.tipo==='2x1')return false;
    if(String(pr.prodId)!==String(prodId))return false;
    if((pr.tipo||'unidad')!==tipo)return false;
    return _promoEnVentana(pr);
  })||null;
}
var DIAS_SEMANA=[{n:1,l:'L'},{n:2,l:'M'},{n:3,l:'X'},{n:4,l:'J'},{n:5,l:'V'},{n:6,l:'S'},{n:0,l:'D'}];
function _promoDiasTxt(pr){
  var m={0:'Dom',1:'Lun',2:'Mar',3:'Mié',4:'Jue',5:'Vie',6:'Sáb'};
  return (pr.dias||[]).slice().sort(function(a,b){return (a===0?7:a)-(b===0?7:b);}).map(function(d){return m[d];}).join(', ');
}
function totalPedido(mid){return(pedidos[mid]||[]).reduce(function(a,it){return a+precioItem(it)*it.qty;},0);}
function ventasTurno(){return ventas.filter(function(v){return v.ts>=turnoInicio;});}
function gastosTurno(){return gastos.filter(function(g){return g.ts>=turnoInicio;});}
function totalVentasHoy(){return ventasTurno().reduce(function(a,v){return a+v.total;},0);}
function totalGastosHoy(){return gastosTurno().reduce(function(a,g){return a+g.valor;},0);}

/* ═══════════════ SYNC ═══════════════ */
function iniciarSync(){
  if(!getDb()){
    console.warn('Sin Firebase - modo local');
    // Update sync indicator to show offline
    var dot=document.getElementById('sync-dot');
    if(dot){dot.style.background='#f5a623';dot.title='Modo local - sin sincronización';}
    return;
  }
  var dot=document.getElementById('sync-dot');
  if(dot){dot.style.background='#22c55e';dot.title='Conectado a Firebase';}
  a52ConIniciar();
  fbOn('pedidos',function(v){
    pedidos=v||{};
    Object.keys(pedidos).forEach(function(k){if(!Array.isArray(pedidos[k]))pedidos[k]=Object.values(pedidos[k]||{});});
    _sndChequearPedidos();
    _notifChequearPedidos();
    renderSoloPedido();updateHeader();actualizarColorMesas();
  });
  fbOn('ventas',function(v){ventas=v?Object.keys(v).map(function(k){var o=v[k];o._fbkey=k;return o;}):[];_sndChequearVentas();updateHeader();if(tabActual==='ventas'||tabActual==='caja')render();});
  fbOn('gastos',function(v){gastos=v?Object.values(v):[];if(tabActual==='gastos'||tabActual==='caja')render();});
  fbOn('menu',function(v){_cpMenuListo=!!v;setTimeout(a52PublicarCarta,0);if(v){menu=Object.values(v);menu.forEach(function(m){if(m.stock==null||isNaN(parseInt(m.stock)))m.stock=0;else m.stock=parseInt(m.stock);});}if(tabActual==='carta'||tabActual==='inventario')render();});
  fbOn('ingredientes',function(v){
    ingredientes=v?Object.keys(v).map(function(k){
      var o=v[k];
      if(typeof o!=='object'||o===null)o={stock:parseInt(o)||0};   // nodo aún más dañado (solo un número)
      if(o.id==null||o.id==='')o.id=k;                              // rescatar la llave de Firebase como id
      return o;
    }):[];
    ingredientes.forEach(function(i){if(i.stock==null||isNaN(parseInt(i.stock)))i.stock=0;else i.stock=parseInt(i.stock);});
    if(tabActual==='inventario'||tabActual==='cocina')render();
  });
  fbOn('mesas',function(v){if(v){mesas=Object.values(v);_mesasDeFabrica=false;a52ZonasArmar();}if(tabActual==='mesas')render();});
  fbOn('configBar',function(v){
    if(v&&typeof v.descuentoHabilitado!=='undefined')descuentoHabilitado=!!v.descuentoHabilitado;
    if(v&&typeof v.ventaSinStock!=='undefined')ventaSinStock=!!v.ventaSinStock;
    if(v&&typeof v.otroHabilitado!=='undefined')otroHabilitado=!!v.otroHabilitado;
    if(usuarioActivo&&(tabActual==='mesas'||tabActual==='admin'||tabActual==='carta'))render();
    if(v&&typeof v.cubeMixPrecio!=='undefined'&&v.cubeMixPrecio)CUBE_MIX_PRECIO=parseInt(v.cubeMixPrecio)||CUBE_MIX_PRECIO;
    if(v&&typeof v.cubeNacPrecio!=='undefined'&&v.cubeNacPrecio)CUBE_NAC_PRECIO=parseInt(v.cubeNacPrecio)||CUBE_NAC_PRECIO;
    if(v&&typeof v.promoNacPrecio!=='undefined'&&v.promoNacPrecio)PROMO_NACIONAL_PRECIO=parseInt(v.promoNacPrecio)||PROMO_NACIONAL_PRECIO;
    if(v&&typeof v.cubeTam!=='undefined'&&v.cubeTam)CUBE_MIX_TAM=parseInt(v.cubeTam)||CUBE_MIX_TAM;
    if(v&&typeof v.cubeMixSubcat!=='undefined')CUBE_MIX_SUBCAT=v.cubeMixSubcat||'';
    if(v&&typeof v.cubeNacSubcat!=='undefined')CUBE_NAC_SUBCAT=v.cubeNacSubcat||'';
    if(tabActual==='mesas'||tabActual==='admin'||tabActual==='carta')render();
  });
  fbOn('proveedores',function(v){proveedores=v?(Array.isArray(v)?v:Object.values(v)):[];if(tabActual==='inventario')render();});
  fbOn('ingresosInv',function(v){ingresosInv=v?(Array.isArray(v)?v:Object.values(v)):[];if(tabActual==='inventario')render();});
  fbOn('formas',function(v){
    formasData={};
    if(v){
      Object.keys(v).forEach(function(k){if(v[k])formasData[k]=Array.isArray(v[k])?v[k]:Object.values(v[k]);});
    }
    if(tabActual==='mesas')render();
  });
  fbOn('ajustes',function(v){a52AjCache(v||{});a52AplicarAjustes(v||{});});
  fbOn('config/fotos',function(v){a52Fotos=v||{};if(mesaActiva)renderSoloPedido();else if(tabActual==='carta'&&editandoProd===null)render();});
  fbOn('equipos',function(v){a52Equipos=v||{};a52Refrescar();});
  fbOn('solicitudes',function(v){a52Solic=v||{};a52Refrescar();});
  fbOn('cartaPublica',function(v){_cpRemoto=a52CartaCanon(v?Object.values(v):[]);a52PublicarCarta();});
  fbOn('llamados',function(v){a52Llamados=v||{};a52LlamadosPintar();a52LlamadosLimpiar();});
  if(!window._llReloj)window._llReloj=setInterval(function(){if(usuarioActivo)a52LlamadosPintar();},30000);
  fbOn('paredes',function(v){
    paredesData={};
    if(v){
      Object.keys(v).forEach(function(k){if(v[k])paredesData[zonaKey(k)]=Array.isArray(v[k])?v[k]:Object.values(v[k]);});
    }
    if(tabActual==='mesas')render();
  });
  fbOn('combos',function(v){combos=v?Object.values(v):[];if(tabActual==='combos'||tabActual==='mesas')render();});
  fbOn('cocinaEntregados',function(v){
    cocinaEntregados=v||{};
    if(tabActual==='cocina')render();
  });
  fbOn('cierres',function(v){cierres=v?Object.values(v):[];if(tabActual==='caja')render();});
  fbOn('cajaHoy',function(v){if(v)cajaHoy=v;if(tabActual==='caja')render();});
  fbOn('turnoInicio',function(v){if(v)turnoInicio=v;if(tabActual==='caja'||tabActual==='ventas')render();});
  fbOn('consumoEmpleados',function(v){
    if(!v){consumoEmpleados=[];return;}
    if(Array.isArray(v)){consumoEmpleados=v;return;}
    consumoEmpleados=Object.keys(v).map(function(k){var o=v[k]||{};o._fbkey=k;return o;});
  });
  fbOn('comprasCocina',function(v){
    comprasCocina=v?Object.keys(v).map(function(k){var o=v[k];o._fbkey=k;return o;}):[];
    comprasCocina.sort(function(a,b){return (a.comprado?1:0)-(b.comprado?1:0)||b.ts-a.ts;});
    if(tabActual==='cocina')render();
  });
  fbOn('serviciosPublicos',function(v){serviciosPublicos=v||{};});
  fbOn('otrosConciliados',function(v){otrosConciliados=v?Object.values(v):[];});
  fbOn('novedades',function(v){
    novedades=v?Object.keys(v).map(function(k){var o=v[k]||{};o._fbkey=k;return o;}):[];
    novedades.sort(function(a,b){return (b.ts||0)-(a.ts||0);});
    if(tabActual==='caja')render();
  });
  fbOn('smsBanco',function(v){
    var lista=v?Object.keys(v).map(function(k){var o=v[k]||{};o._fbkey=k;return o;}):[];
    lista.sort(function(a,b){return (a.ts||0)-(b.ts||0);});
    var esPrimera=(window._smsVistos==null);
    if(esPrimera)window._smsVistos={};
    smsBanco=lista;
    var ultTs=0;try{ultTs=parseInt(localStorage.getItem('_a52_smsUltTs'))||0;}catch(e){}
    lista.forEach(function(m){
      if(window._smsVistos[m._fbkey])return;
      window._smsVistos[m._fbkey]=true;
      // En vivo: anunciar siempre. Al abrir o recargar la app: anunciar también lo que
      // llegó en los últimos 15 min y aún no se había procesado en este equipo.
      var reciente=(m.ts||0)>ultTs&&(a52Ahora()-(m.ts||0))<15*60000;
      if(!esPrimera||reciente){
        if((m.ts||0)>ultTs){try{localStorage.setItem('_a52_smsUltTs',String(m.ts||0));}catch(e){}}
        _smsAutoLlego(m);
      }
    });
  });
  fbOn('pelotasMesa',function(v){
    pelotasMesa=v||{};
    if(tabActual==='mesas')render();
  });
  fbOn('invCfg',function(v){
    if(v)invCfg=v;
    if(tabActual==='inventario'||tabActual==='admin')render();
  });
  fbOn('promos',function(v){
    promos=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='mesas'||tabActual==='admin')render();
  });
  fbOn('trasladosFP',function(v){
    trasladosFP=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='caja')render();
  });
  fbOn('prestamosSocios',function(v){
    prestamosSocios=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='caja')render();
  });
  fbOn('consumoSocios',function(v){
    consumoSocios=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='socios')render();
  });
  fbOn('asistenciaEmp',function(v){asistenciaEmp=v||{};if(tabActual==='empleados')render();});
  fbOn('empleados',function(v){
    empleados=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='empleados')render();
  });
  fbOn('movEmpleados',function(v){
    movEmpleados=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='empleados')render();
  });
  fbOn('clientesCredito',function(v){
    clientesCredito=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='creditos')render();
  });
  fbOn('deudasCredito',function(v){
    deudasCredito=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='creditos'||tabActual==='caja')render();
  });
  fbOn('ventasRappi',function(v){
    ventasRappi=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='rappi')render();
  });
  fbOn('cierresRappi',function(v){
    cierresRappi=v?(Array.isArray(v)?v:Object.values(v)):[];
    if(tabActual==='rappi')render();
  });
  fbOn('saneamientoChecks',function(v){
    saneamientoChecks=v||{};
    if(tabActual==='saneamiento')render();
  });
  fbOn('saneamientoSemanal',function(v){
    saneamientoSemanal=v||{};
    if(tabActual==='saneamiento')render();
  });
  fbOn('abonosMesa',function(v){
    abonosMesa=v||{};
    Object.keys(abonosMesa).forEach(function(k){if(!Array.isArray(abonosMesa[k]))abonosMesa[k]=Object.values(abonosMesa[k]||{});});
    if(tabActual==='mesas')render();
  });
  fbOn('pedidoLog',function(v){
    pedidoLog=v||{};
    Object.keys(pedidoLog).forEach(function(k){if(!Array.isArray(pedidoLog[k]))pedidoLog[k]=Object.values(pedidoLog[k]||{});});
  });
  fbOn('fotoCompCfg',function(v){if(v)fotoCompCfg=v;});
  fbOn('redBarCfg',function(v){
    if(v){redBarCfg=v;if(!Array.isArray(redBarCfg.ips))redBarCfg.ips=redBarCfg.ips?Object.values(redBarCfg.ips):[];}
    if(tabActual==='admin')render();
  });
  fbOn('arqueos',function(v){
    var antes=arqueos.length?Math.max.apply(null,arqueos.map(function(a){return a.ts||0;})):0;
    arqueos=v?(Array.isArray(v)?v:Object.values(v)):[];
    // 🔔 Avisar al admin/subadmin si ALGUIEN MÁS acaba de contar la caja (llega en vivo por Firebase)
    if(window._arqInit&&usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin')){
      var nuevos=arqueos.filter(function(a){return (a.ts||0)>antes&&a.uid!==usuarioActivo.id;});
      nuevos.forEach(function(a){
        var dif=a.dif||0;
        var difTxt=dif===0?'✅ caja cuadrada':(dif<0?'🔴 FALTAN '+fmt(Math.abs(dif)):'🟡 sobran '+fmt(dif));
        showToast('🧮 '+esc(a.uidNombre||'Alguien')+' contó la caja<br><span style="font-size:12px;opacity:.9">Contado '+fmt(a.total||0)+' · esperado '+fmt(a.esperado||0)+' · '+difTxt+'</span>',dif===0?'#22c55e':(dif<0?'#ef4444':'#f5a623'),9000);
        _beep(dif<0?[[660,180,0],[440,260,220],[330,340,500]]:[[880,140,0],[1100,180,170]]);
        _arqNoVistos.push(a.id);
      });
    }
    window._arqInit=true;
    if(tabActual==='caja'||tabActual==='gastos')render();
  });
  fbOn('usuarios',function(v){
    if(v){usuarios=Array.isArray(v)?v:Object.values(v);}
    if(tabActual==='admin')render();
  });
}


