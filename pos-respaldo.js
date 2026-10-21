/* ═══════════ RESPALDO COMPLETO ═══════════ */
function exportarRespaldoCompleto(){
  if(typeof XLSX==='undefined'||!window._xlsxReady){
    alert('La librería de Excel aún no carga. Verifica la conexión a internet e intenta de nuevo.');return;
  }
  var wb=XLSX.utils.book_new();
  function hoja(nombre,filas){
    if(!filas||filas.length<=1)filas=filas&&filas.length?filas:[['(sin datos)']];
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(filas),nombre.slice(0,31));
  }
  function fpL(fp){var f=FPAGO.find(function(x){return x.id===fp;});return f?f.label:(fp||'');}
  // Ventas
  var vRows=[['Fecha','Hora','Mesa','Zona','Total','Forma de pago','Items','Usuario']];
  ventas.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    var det=its.map(function(it){return (it.qty||1)+'x '+(it.isCustom?it.customNombre:(it.isCombo?it.comboNombre:(it.cubMixNombre||((menu.find(function(m){return m.id===it.pid;})||{}).nombre)||'?')))+(it.cubeta?' (cubetazo)':'')+(it.varianteNombre?' ('+it.varianteNombre+')':'');}).join(' | ');
    vRows.push([fmtFecha(v.ts),fmtTime(v.ts),v.mesa||'',v.zona||'',v.total||0,v.fpLabel||fpL(v.fp),det,v.uidNombre||'']);
  });
  hoja('Ventas',vRows);
  // Gastos
  var gRows=[['Fecha','Hora','Concepto','Categoría','Valor','Forma de pago','Proveedor','Notas','Usuario']];
  gastos.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(g){
    gRows.push([fmtFecha(g.ts),fmtTime(g.ts),g.concepto||'',g.categoria||'',g.valor||0,fpL(g.fp),g.provNombre||'',g.notas||'',g.uidNombre||'']);
  });
  hoja('Gastos',gRows);
  // Inventario carta
  var iRows=[['Categoría','Subcategoría','Nombre','Precio','Stock','Unidad','Cubetazo']];
  menu.slice().sort(function(a,b){return (a.cat||'').localeCompare(b.cat||'')||(a.nombre||'').localeCompare(b.nombre||'');}).forEach(function(p){
    iRows.push([p.cat||'',p.subcat||'',p.nombre||'',p.precio||0,p.stock||0,p.und||'und',p.cubeta||'']);
  });
  hoja('Inventario',iRows);
  // Ingredientes
  var ingRows=[['Nombre','Stock','Unidad']];
  ingredientes.forEach(function(i){ingRows.push([i.nombre||'',i.stock||0,i.und||'und']);});
  hoja('Ingredientes',ingRows);
  // Ingresos de inventario (facturas)
  var iiRows=[['Fecha','Producto','Cantidad','Proveedor','N° Factura','Valor factura','Usuario']];
  ingresosInv.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(r){
    iiRows.push([r.fecha||fmtFecha(r.ts),r.prodNombre||'',r.cantidad||0,r.proveedor||'',r.factura||'',parseInt(r.valorFactura)||0,r.uidNombre||'']);
  });
  hoja('Ingresos inventario',iiRows);
  // Proveedores con saldos
  var pRows=[['Proveedor','Facturado','Pagado','Saldo pendiente']];
  proveedores.forEach(function(pv){
    var fac=ingresosInv.filter(function(r){return r.proveedor===pv.nombre;}).reduce(function(s,r){return s+(parseInt(r.valorFactura)||0);},0);
    var pag=gastos.filter(function(g){return g.provId===pv.id||(g.provNombre&&g.provNombre===pv.nombre);}).reduce(function(s,g){return s+(g.valor||0);},0);
    pRows.push([pv.nombre,fac,pag,fac-pag]);
  });
  hoja('Proveedores',pRows);
  // Nómina: movimientos
  var nRows=[['Fecha','Hora','Empleado','Tipo','Valor','Forma de pago','Nota','Semana','Usuario']];
  movEmpleados.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(mv){
    var emp=empleados.find(function(e){return e.id===mv.empId;});
    nRows.push([fmtFecha(mv.ts),fmtTime(mv.ts),emp?emp.nombre:mv.empId,mv.tipo||'',mv.valor||0,fpL(mv.fp),mv.nota||'',mv.semanaKey||'',mv.uidNombre||'']);
  });
  hoja('Nómina movimientos',nRows);
  // Asistencia
  var aRows=[['Empleado','Fecha','Valor del día']];
  Object.keys(asistenciaEmp).sort().forEach(function(k){
    var sep=k.indexOf('_');var eid=k.slice(0,sep);var fecha=k.slice(sep+1);
    var emp=empleados.find(function(e){return e.id===eid;});
    var rec=asistenciaEmp[k];
    aRows.push([emp?emp.nombre:eid,fecha,(typeof rec==='number')?rec:(emp?(parseInt(emp.pagoDiario)||''):'')]);
  });
  hoja('Asistencia',aRows);
  // Socios
  var sRows=[['Fecha','Hora','Socio','Detalle','Total','Registró']];
  consumoSocios.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(c){
    var det=(c.items?(Array.isArray(c.items)?c.items:Object.values(c.items)):[]).map(function(it){return (it.qty||1)+'x '+(it.nombre||'?');}).join(' | ');
    sRows.push([fmtFecha(c.ts),fmtTime(c.ts),c.socio||'',det,c.total||0,c.uidNombre||'']);
  });
  hoja('Socios',sRows);
  // Rappi
  var rRows=[['Fecha','Hora','Detalle','Total','Usuario']];
  ventasRappi.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(v){
    var det=(v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[]).map(function(it){var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});return (it.qty||1)+'x '+(p?p.nombre:(it.nombre||'?'));}).join(' | ');
    rRows.push([fmtFecha(v.ts),fmtTime(v.ts),det,v.total||0,v.uidNombre||'']);
  });
  hoja('Rappi',rRows);
  // Cierres de caja
  var cRows=[['Fecha','Ventas','Gastos','Utilidad','Caja inicial','Usuario']];
  cierres.slice().sort(function(a,b){return (a.ts||0)-(b.ts||0);}).forEach(function(c){
    cRows.push([c.fecha||fmtFecha(c.ts),c.ventas||0,c.gastos||0,c.utilidad||0,c.cajaInicial||0,c.uidNombre||c.uid||'']);
  });
  hoja('Cierres caja',cRows);
  // Créditos (fiados)
  var crRows=[['Cliente','Teléfono','Deuda registrada','Fecha','Nota']];
  clientesCredito.forEach(function(cl){
    var ds=deudasCredito.filter(function(d){return d.clienteId===cl.id;});
    if(!ds.length)crRows.push([cl.nombre||'',cl.telefono||'','','','']);
    ds.forEach(function(d){crRows.push([cl.nombre||'',cl.telefono||'',d.valor||d.monto||0,fmtFecha(d.ts),d.nota||d.concepto||'']);});
  });
  hoja('Créditos',crRows);
  var fecha=_fechaKey(new Date());
  XLSX.writeFile(wb,NEGOCIO.archivo+'-Respaldo-Completo-'+fecha+'.xlsx');
  showToast('💾 Respaldo completo descargado<br><span style="font-size:12px;opacity:.85">Guárdalo en un lugar seguro (Drive, USB...)</span>','#22c55e',5000);
}

function renderAdmin(){
  var esAdmin=usuarioActivo&&usuarioActivo.rol==='admin';
  if(!esAdmin) return '<div class="alert-box alert-blue">Solo administradores.</div>';

  // Bloqueo por red del bar
  var ipsRows=(redBarCfg.ips||[]).map(function(x,i){
    return'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border-radius:8px;padding:8px 10px;margin-bottom:6px">'
      +'<div><span style="font-weight:800;font-size:13px;font-family:monospace">'+esc(x.ip)+'</span>'
      +'<div style="color:var(--muted);font-size:10px">'+(x.nota?esc(x.nota)+' · ':'')+(x.ts?fmtFechaCorta(x.ts):'')+'</div></div>'
      +'<button onclick="quitarRedAutorizada('+i+')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer">✕</button>'
    +'</div>';
  }).join('');
  var redSection='<div class="card" style="grid-column:1/-1;border:1px solid #a855f744">'
    +'<div style="color:#a855f7;font-weight:800;font-size:15px;margin-bottom:4px">📶 Bloqueo por red del bar</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Los <b>meseros y cajeros</b> solo podrán ingresar (y mantener la sesión) si están conectados a una red autorizada — así nadie mete productos a una mesa desde la casa. Admin y subadmin entran desde cualquier lugar. Funciona por la IP pública de la red: párate en el bar conectado al WiFi y toca "Autorizar esta red".</div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">'
      +'<button onclick="toggleRedBar()" style="background:'+(redBarCfg.on?'#22c55e':'var(--card2)')+';color:'+(redBarCfg.on?'#fff':'var(--muted)')+';border:1px solid '+(redBarCfg.on?'#22c55e':'var(--border)')+';border-radius:9px;padding:10px 18px;font-weight:800;font-size:13px;cursor:pointer">'+(redBarCfg.on?'✅ Bloqueo ACTIVADO':'⭕ Bloqueo desactivado')+'</button>'
      +'<button onclick="autorizarRedActual()" style="background:#a855f7;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-weight:800;font-size:13px;cursor:pointer">➕ Autorizar ESTA red</button>'
    +'</div>'
    +'<div style="color:var(--muted);font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:6px">REDES AUTORIZADAS ('+(redBarCfg.ips||[]).length+')</div>'
    +(ipsRows||'<div style="color:var(--dim);font-size:12px;padding:8px 0">Ninguna todavía. Conéctate al WiFi del bar y toca "Autorizar ESTA red".</div>')
    +(redBarCfg.on&&!(redBarCfg.ips||[]).length?'<div style="background:#ef444414;border:1px solid #ef444433;border-radius:8px;padding:8px;margin-top:8px;color:#ef4444;font-size:11px;font-weight:700">⚠️ El bloqueo está activo pero no hay redes autorizadas: NINGÚN mesero o cajero podrá entrar.</div>':'')
    +'<div style="color:var(--muted);font-size:10px;margin-top:10px">💡 Si el proveedor de internet cambia la IP del bar, los meseros verán "no puedes ingresar" — solo vuelve a tocar "Autorizar ESTA red" desde el bar y borra la vieja.</div>'
  +'</div>';

  // Comprobantes de pago digital
  // ═══ Card candado de inventario ═══
  var invLockSection='<div class="card mb12" style="grid-column:1/-1;border:1px solid #ef444444">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'
      +'<div><div style="color:#ef4444;font-weight:800;font-size:15px">🔐 Ajustes de inventario</div>'
      +'<div style="color:var(--muted);font-size:12px;margin-top:3px">Controla quién puede cambiar cantidades (+/−, editar stock, ingresos de mercancía). El consumo de personal y marcar productos agotados siguen abiertos porque quedan registrados.</div></div>'
      +'<button onclick="toggleInvLock()" style="background:'+(invCfg.soloAdmin!==false?'#ef4444':'#f5a623')+';color:#fff;border:none;border-radius:9px;padding:10px 16px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap">'+(invCfg.soloAdmin!==false?'🔒 SOLO ADMIN':'🔓 Admin y subadmin')+'</button>'
      +'<button onclick="toggleOcultarCant()" style="background:'+(invCfg.ocultarCant?'#a855f7':'var(--card2)')+';color:'+(invCfg.ocultarCant?'#fff':'var(--muted)')+';border:1px solid '+(invCfg.ocultarCant?'#a855f7':'var(--border)')+';border-radius:9px;padding:10px 16px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap">'+(invCfg.ocultarCant?'🙈 Cajero SIN cantidades':'👁️ Cajero ve cantidades')+'</button>'
    +'</div>'
  +'</div>';

  // ═══ Card notificaciones de admin ═══
  var notifSection='<div class="card mb12" style="grid-column:1/-1;border:1px solid #38bdf844">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'
      +'<div><div style="color:#38bdf8;font-weight:800;font-size:15px">🔔 Notificaciones de administrador</div>'
      +'<div style="color:var(--muted);font-size:12px;margin-top:3px">Avisos en pantalla con la app minimizada: qué se pidió y qué se cobró. Solo para tu usuario admin, se activa por equipo. <b>Funciona mejor en computador; en iPhone el sistema pausa la app al minimizarla.</b></div></div>'
      +'<div style="display:flex;flex-direction:column;gap:6px">'
        +'<button onclick="toggleNotifAdmin()" style="background:'+(_notifOn?'#38bdf8':'var(--card2)')+';color:'+(_notifOn?'#fff':'var(--muted)')+';border:1px solid '+(_notifOn?'#38bdf8':'var(--border)')+';border-radius:9px;padding:10px 16px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap">'+(_notifOn?'🔔 ACTIVAS aquí':'🔕 Activar en este equipo')+'</button>'
        +'<button onclick="toggleVozPagos()" style="background:'+(_vozOn?'#22c55e':'var(--card2)')+';color:'+(_vozOn?'#fff':'var(--muted)')+';border:1px solid '+(_vozOn?'#22c55e':'var(--border)')+';border-radius:9px;padding:10px 16px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap">'+(_vozOn?'🗣️ VOZ activa aquí':'🔇 Activar voz de pagos')+'</button>'
        +'<button onclick="probarPagoRecibido()" style="background:var(--card2);color:var(--muted);border:1px solid var(--border);border-radius:9px;padding:8px 16px;font-weight:700;font-size:11px;cursor:pointer;white-space:nowrap">🧪 Probar aviso de pago</button>'
      +'</div>'
    +'</div>'
  +'</div>';

  // ═══ Card de Promociones ═══
  var activasPr=promos.filter(function(x){return x.on!==false;});
  var vigsPr=activasPr.filter(function(pr){return promoVigente(pr.prodId,pr.tipo||'unidad')===pr;});
  var promoSection='<div class="card" style="grid-column:1/-1;border:1px solid #f5a62344">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'
      +'<div><div style="color:#f5a623;font-weight:800;font-size:15px">🏷️ Promociones</div>'
      +'<div style="color:var(--muted);font-size:12px;margin-top:3px">'
        +(activasPr.length?activasPr.length+' activa'+(activasPr.length!==1?'s':'')+(vigsPr.length?' · <b style="color:#22c55e">'+vigsPr.length+' vigente'+(vigsPr.length!==1?'s':'')+' AHORA</b>':''):'Precios especiales por días y horas. Ej: jueves y viernes cubetazo de Miller a $30.000.')
      +'</div></div>'
      +'<button onclick="abrirPromos()" style="background:#f5a623;color:#1a1a22;border:none;border-radius:9px;padding:10px 16px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap">🏷️ Gestionar</button>'
    +'</div>'
  +'</div>';

  var compSection='<div class="card" style="grid-column:1/-1;border:1px solid #38bdf844">'
    +'<div style="color:#38bdf8;font-weight:800;font-size:15px;margin-bottom:4px">📷 Comprobantes de pagos digitales</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Al cobrar con Bre-B, Nequi, Daviplata o tarjeta, se exige foto del comprobante del cliente. Se guarda amarrada a la venta y se ve en Caja → Conciliación. Las fotos se borran solas a los 45 días.</div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Estado</div>'
        +'<button onclick="toggleFotoComp()" style="background:'+(fotoCompCfg.on?'#22c55e':'var(--card2)')+';color:'+(fotoCompCfg.on?'#fff':'var(--muted)')+';border:1px solid '+(fotoCompCfg.on?'#22c55e':'var(--border)')+';border-radius:9px;padding:10px 18px;font-weight:800;font-size:13px;cursor:pointer">'+(fotoCompCfg.on?'✅ Activado':'⭕ Desactivado')+'</button></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Salida "sin foto" (PC sin cámara)</div>'
        +'<button onclick="togglePermitirSinFoto()" style="background:'+(fotoCompCfg.permitirSinFoto!==false?'#f5a623':'var(--card2)')+';color:'+(fotoCompCfg.permitirSinFoto!==false?'#1a1a22':'var(--muted)')+';border:1px solid '+(fotoCompCfg.permitirSinFoto!==false?'#f5a623':'var(--border)')+';border-radius:9px;padding:10px 18px;font-weight:800;font-size:13px;cursor:pointer">'+(fotoCompCfg.permitirSinFoto!==false?'🚪 Permitida (con motivo)':'🔒 Bloqueada')+'</button></div>'
      +'<div style="flex:1;min-width:160px"><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Solo exigir foto desde (COP) — 0 = siempre</div>'
        +'<input class="inp money" id="fotocomp-min" type="text" inputmode="numeric" value="'+moneyFmt(fotoCompCfg.min||0)+'"/></div>'
      +'<button onclick="guardarFotoCompCfg()" style="background:#38bdf8;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-weight:800;font-size:13px;cursor:pointer">💾 Guardar</button>'
    +'</div></div>';

  // Respaldo completo
  var backupSection='<div class="card" style="grid-column:1/-1;border:1px solid #22c55e44">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">'
      +'<div><div style="color:#22c55e;font-weight:800;font-size:15px">💾 Respaldo completo</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:2px">Descarga TODO en un solo Excel: ventas, gastos, inventario, nómina, socios, Rappi, cierres y créditos. Hazlo mínimo una vez por semana.</div></div>'
      +'<button onclick="exportarRespaldoCompleto()" style="background:#22c55e;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap">📥 Descargar respaldo</button>'
    +'</div></div>';

  // Ticket config section
  var ticketSection='<div class="card" style="grid-column:1/-1">'
    +'<div style="color:var(--accent);font-weight:800;font-size:15px;margin-bottom:14px">🖨️ Configuración de impresión</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;align-items:end">'
    // Font size
    +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Tamaño de letra</div>'
      +'<div style="display:flex;gap:6px;align-items:center">'
        +[10,12,14,16,18,20].map(function(s){
          var sel=ticketConfig.fontSize===s;
          return'<button data-act="setfont" data-fs="'+s+'" style="flex:1;background:'+(sel?'#a855f7':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'#a855f7':'var(--border)')+';border-radius:7px;padding:5px 0;font-size:12px;font-weight:700;cursor:pointer">'+s+'</button>';
        }).join('')
      +'</div>'
      +'<div style="color:var(--muted);font-size:10px;margin-top:3px">Actual: '+ticketConfig.fontSize+'px</div>'
    +'</div>'
    // Paper width
    +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Ancho del papel</div>'
      +'<div style="display:flex;gap:6px">'
        +[{w:200,l:'58mm'},{w:280,l:'80mm'},{w:380,l:'110mm'}].map(function(x){
          var sel=ticketConfig.paperWidth===x.w;
          return'<button data-act="setpaper" data-pw="'+x.w+'" style="flex:1;background:'+(sel?'#a855f7':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'#a855f7':'var(--border)')+';border-radius:7px;padding:5px 0;font-size:12px;font-weight:700;cursor:pointer">'+x.l+'</button>';
        }).join('')
      +'</div>'
      +'<div style="color:var(--muted);font-size:10px;margin-top:3px">Actual: '+ticketConfig.paperWidth+'px</div>'
    +'</div>'
    // Preview
    +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Vista previa</div>'
      +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:monospace;font-size:'+ticketConfig.fontSize+'px;width:'+Math.min(ticketConfig.paperWidth,240)+'px;overflow:hidden">'
        +'<div style="text-align:center;font-weight:900;letter-spacing:4px;font-size:'+(ticketConfig.fontSize+6)+'px">'+M('nombreSimple')+'</div>'
        +'<div style="text-align:center;font-size:'+(ticketConfig.fontSize-3)+'px;color:#888">'+MU('tipo')+'</div>'
        +'<hr style="border:1px dashed #ccc"/>'
        +'<div>🍺 Cerveza ×2</div>'
        +'<div>🍔 Hamburguesa ×1</div>'
        +'<hr style="border:1px dashed #ccc"/>'
        +'<div style="text-align:right;font-weight:900;font-size:'+(ticketConfig.fontSize+4)+'px">$85.000</div>'
        +'<div style="background:#000;color:#fff;text-align:center;padding:3px;font-size:'+(ticketConfig.fontSize-1)+'px">💵 Efectivo</div>'
      +'</div>'
    +'</div>'
    +'</div>'
    +'<div style="margin-top:12px">'
      +'<button class="btn btn-sm btn-blue" onclick="imprimirTicketPrueba()">🖨️ Imprimir ticket de prueba</button>'
    +'</div>'
    // Modo de impresión de ESTE dispositivo
    +'<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">'
      +'<div style="font-weight:700;font-size:13px;margin-bottom:3px">🖨️ Impresión en este dispositivo</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Se guarda solo en este equipo. En el computador con la impresora usa "Directo"; en celulares deja "Estación".</div>'
      +'<div style="display:flex;gap:8px">'
        +'<button onclick="setModoImpresion(\'estacion\')" style="flex:1;background:'+(MODO_IMPRESION==='estacion'?'#38bdf8':'var(--card2)')+';color:'+(MODO_IMPRESION==='estacion'?'#fff':'var(--muted)')+';border:1px solid '+(MODO_IMPRESION==='estacion'?'#38bdf8':'var(--border)')+';border-radius:9px;padding:11px;font-size:12px;font-weight:700;cursor:pointer">📡 Enviar a la estación</button>'
        +'<button onclick="setModoImpresion(\'local\')" style="flex:1;background:'+(MODO_IMPRESION==='local'?'#22c55e':'var(--card2)')+';color:'+(MODO_IMPRESION==='local'?'#fff':'var(--muted)')+';border:1px solid '+(MODO_IMPRESION==='local'?'#22c55e':'var(--border)')+';border-radius:9px;padding:11px;font-size:12px;font-weight:700;cursor:pointer">🖨️ Imprimir directo (este equipo)</button>'
      +'</div>'
      +(MODO_IMPRESION==='local'?'<div style="color:#22c55e;font-size:11px;margin-top:8px">✓ Este equipo imprime directo, sin depender de la estación. Se abrirá el diálogo de impresión (o imprime solo si activaste kiosk-printing en Chrome).</div>':'<div style="color:var(--muted);font-size:11px;margin-top:8px">Los recibos se envían a la estación USB (otro equipo o pestaña debe estar abierta).</div>')
    +'</div>'
    +'</div>';

  // Sistema config card
  // Categories list
  var cats=menu.reduce(function(a,m){if(a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
  var catRows=cats.map(function(cat){
    var count=menu.filter(function(m){return m.cat===cat;}).length;
    var ce=catEmojis[cat]||'';
    return'<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<button data-act="set-cat-emoji" data-cat="'+esc(cat)+'" title="Cambiar emoji" style="font-size:22px;background:var(--bg);border:1px solid var(--border);border-radius:8px;width:40px;height:40px;cursor:pointer;flex-shrink:0">'+(ce||'➕')+'</button>'
      +'<div style="flex:1"><span style="font-weight:700;font-size:13px">'+esc(cat)+'</span>'
      +'<span style="color:var(--muted);font-size:11px;margin-left:8px">'+count+' producto'+(count!==1?'s':'')+'</span></div>'
      +'<button data-act="rename-cat" data-cat="'+esc(cat)+'" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:7px;padding:4px 10px;font-size:12px;cursor:pointer">✏️</button>'
      +'</div>';
  }).join('');
  var catCard='<div class="card" style="grid-column:1/-1">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      +'<div style="color:var(--accent);font-weight:800;font-size:15px">🏷️ Categorías de la carta</div>'
      +'<button onclick="autoAsignarEmojis()" style="background:var(--accent)18;color:var(--accent);border:1px solid var(--accent)33;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer">✨ Auto-asignar emojis</button>'
    +'</div>'
    +catRows
    +'</div>';

  var sistemaCard='<div class="card" style="grid-column:1/-1">'
    +'<div style="color:var(--accent);font-weight:800;font-size:15px;margin-bottom:14px">⚙️ Configuración del sistema</div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">'
      +'<div>'
        +'<div style="font-weight:700;font-size:13px">Vender productos sin stock</div>'
        +'<div style="color:var(--muted);font-size:11px;margin-top:2px">Permite agregar al pedido productos agotados. El inventario quedará en negativo.</div>'
      +'</div>'
      +'<button onclick="toggleVentaSinStock()" style="'
        +'background:'+(ventaSinStock?'#22c55e':'var(--dim)')+';'
        +'border:none;border-radius:99px;width:52px;height:28px;cursor:pointer;'
        +'position:relative;transition:background .2s">'
        +'<div style="position:absolute;top:3px;'+(ventaSinStock?'right:3px':'left:3px')+';'
          +'width:22px;height:22px;background:#fff;border-radius:50%;transition:all .2s"></div>'
      +'</button>'
    +'</div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">'
      +'<div>'
        +'<div style="font-weight:700;font-size:13px">Descuento del 10%</div>'
        +'<div style="color:var(--muted);font-size:11px;margin-top:2px">Permite aplicar el 10% de descuento en las mesas. Si lo apagas, el botón 🏷️ desaparece para todos.</div>'
      +'</div>'
      +'<button onclick="toggleDescuento10()" style="'
        +'background:'+(descuentoHabilitado?'#22c55e':'var(--dim)')+';'
        +'border:none;border-radius:99px;width:52px;height:28px;cursor:pointer;'
        +'position:relative;transition:background .2s">'
        +'<div style="position:absolute;top:3px;'+(descuentoHabilitado?'right:3px':'left:3px')+';'
          +'width:22px;height:22px;background:#fff;border-radius:50%;transition:all .2s"></div>'
      +'</button>'
    +'</div>'
    // Precios de cubetazos y promo (editables)
    +'<div style="'+(a52Mod('cubetazos')?'':'display:none;')+'border-top:1px solid var(--border);margin-top:8px;padding-top:14px">'
      +'<div style="font-weight:700;font-size:13px;margin-bottom:4px">🪣 Precios de cubetazos y promo</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Cambia estos precios cuando quieras. Aplican de inmediato a todas las mesas.</div>'
      +'<div style="display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;margin-bottom:8px">'
        +'<span style="font-size:13px">🪣 Cubetazo mixto ('+CUBE_MIX_TAM+' cervezas)</span>'
        +'<input class="inp money" id="cfg-cubemix" type="text" inputmode="numeric" value="'+moneyFmt(CUBE_MIX_PRECIO)+'"/>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;margin-bottom:8px">'
        +'<span style="font-size:13px">🪣 Cubetazo nacional ('+CUBE_MIX_TAM+' cervezas)</span>'
        +'<input class="inp money" id="cfg-cubenac" type="text" inputmode="numeric" value="'+moneyFmt(CUBE_NAC_PRECIO)+'"/>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;margin-bottom:8px">'
        +'<span style="font-size:13px">⭐ Promo nacional (c/u)</span>'
        +'<input class="inp money" id="cfg-promo" type="text" inputmode="numeric" value="'+moneyFmt(PROMO_NACIONAL_PRECIO)+'"/>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;margin-bottom:12px">'
        +'<span style="font-size:13px">🍺 Cervezas por cubetazo</span>'
        +'<input class="inp" id="cfg-tam" type="number" inputmode="numeric" min="1" value="'+CUBE_MIX_TAM+'"/>'
      +'</div>'
      +(function(){
        var subs=menu.reduce(function(a,m){if(m.subcat&&a.indexOf(m.subcat)<0)a.push(m.subcat);return a;},[]).sort();
        var opt=function(sel){return'<option value="">— por nombre (Heineken/Sol/Águila...) —</option>'+subs.map(function(s){return'<option value="'+esc(s)+'"'+(sel===s?' selected':'')+'>'+esc(s)+'</option>';}).join('');};
        return'<div style="color:var(--muted);font-size:11px;margin:4px 0 8px">Opcional: elige de qué subcategoría salen las cervezas de cada cubetazo.</div>'
          +'<div style="margin-bottom:8px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">🪣 Subcategoría del cubetazo mixto</div><select class="inp" id="cfg-cubemix-sub">'+opt(CUBE_MIX_SUBCAT)+'</select></div>'
          +'<div style="margin-bottom:12px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">🪣 Subcategoría del cubetazo nacional</div><select class="inp" id="cfg-cubenac-sub">'+opt(CUBE_NAC_SUBCAT)+'</select></div>';
      })()
      +'<button class="btn btn-green btn-full" onclick="guardarPreciosCubetazo()">💾 Guardar precios</button>'
    +'</div>'
    +'</div>';

  // Build userRows
  var userRows=usuarios.map(function(u){
    var activo=(u.activo!==false);
    var esAdmin=(u.rol==='admin');
    var toggle=esAdmin
      ?'<span style="font-size:11px;color:#22c55e;font-weight:700;padding:4px 8px">Siempre activo</span>'
      :'<button data-act="toggleturno" data-uid="'+u.id+'" style="background:'+(activo?'#22c55e22':'#6b6b6b22')+';color:'+(activo?'#22c55e':'#888')+';border:1px solid '+(activo?'#22c55e55':'#6b6b6b55')+';border-radius:99px;padding:4px 12px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap">'+(activo?'🟢 En turno':'⚪ Fuera')+'</button>';
    return'<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-size:20px;opacity:'+(activo||esAdmin?'1':'.4')+'">'+u.emoji+'</span>'
      +'<div style="flex:1"><div style="font-weight:700;font-size:13px;opacity:'+(activo||esAdmin?'1':'.5')+'">'+esc(u.nombre)+'</div>'
      +'<div style="color:var(--muted);font-size:11px">'+u.rol+(u.pinHash?' · 🔐':'')+'</div></div>'
      +toggle
      +'<button data-act="edituser" data-uid="'+u.id+'" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:7px;padding:4px 9px;font-size:12px;cursor:pointer">✏️</button>'
      +'<button data-act="deluser" data-uid="'+u.id+'" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:4px 9px;font-size:12px;cursor:pointer">✕</button>'
      +'</div>';
  }).join('');

  // Build rolCards
  var ROLES_INFO={
    admin:{label:'Administrador',desc:'Acceso total: mesas, inventario, carta, combos, caja, gastos, ventas, admin'},
    cajero:{label:'Cajero',desc:'Mesas, inventario, carta, combos, caja, gastos, ventas. Sin admin'},
    mesero:{label:'Mesero / Mesera',desc:'Solo mesas y gastos. Sin cobro ni Excel'}
  };
  var rolCards=Object.entries(ROLES_INFO).map(function(kv){
    var r=kv[0],info=kv[1];
    var count=usuarios.filter(function(u){return u.rol===r;}).length;
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center">'
      +'<div style="font-weight:700;font-size:13px">'+info.label+'</div>'
      +'<span style="background:var(--accent)18;color:var(--accent);border-radius:99px;padding:2px 10px;font-size:11px;font-weight:700">'+count+' usuarios</span>'
      +'</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:3px">'+info.desc+'</div>'
      +'</div>';
  }).join('');

  return'<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">'
    +catCard
    +sistemaCard
    +'<div class="card"><div style="color:var(--accent);font-weight:800;font-size:15px;margin-bottom:14px">👥 Usuarios</div>'
    +userRows
    +'<button class="btn btn-sm btn-green btn-full" style="margin-top:12px" onclick="nuevoUsuario()">+ Agregar usuario</button>'
    +'<button class="btn btn-sm btn-full" style="margin-top:8px;background:var(--card2);border:1px solid var(--border);color:var(--muted)" onclick="abrirSesiones()">👥 Ver inicios de sesión</button>'
    +'</div>'
    +a52Seguro(a52EquipoHtml)
    +a52Seguro(a52TemaHtml)
    +a52Seguro(a52NegocioHtml)
    +'<div class="card"><div style="color:var(--accent);font-weight:800;font-size:15px;margin-bottom:14px">🔐 Roles y permisos</div>'+rolCards+'</div>'
    +redSection
    +notifSection
    +invLockSection
    +promoSection
    +compSection
    +backupSection
    +ticketSection
    +'</div>';
}
function toggleRedBar(){
  if(!redBarCfg.on&&!(redBarCfg.ips||[]).length){
    if(!confirm('Aún no has autorizado ninguna red. Si activas el bloqueo ahora, NINGÚN mesero o cajero podrá entrar hasta que autorices la red del bar.\n\n¿Activar de todas formas?'))return;
  }
  redBarCfg.on=!redBarCfg.on;
  fbSet('redBarCfg',redBarCfg);
  showToast(redBarCfg.on?'📶 Bloqueo por red ACTIVADO<br><span style="font-size:12px;opacity:.85">Meseros y cajeros solo entran desde las redes autorizadas</span>':'📶 Bloqueo por red desactivado','#a855f7');
  render();
}
function autorizarRedActual(){
  showToast('📶 Detectando la red actual...','#38bdf8',2500);
  obtenerIPPublica(function(ip){
    if(!ip){alert('No pude detectar la IP de esta red. Verifica la conexión a internet e intenta de nuevo.');return;}
    if(!Array.isArray(redBarCfg.ips))redBarCfg.ips=[];
    if(redBarCfg.ips.some(function(x){return x.ip===ip;})){
      showToast('✅ Esta red ya está autorizada<br><span style="font-size:12px;opacity:.85;font-family:monospace">'+esc(ip)+'</span>','#22c55e');return;
    }
    var nota=(prompt('Nombre para esta red (ej: WiFi del bar):','WiFi del bar')||'').trim();
    redBarCfg.ips.push({ip:ip,nota:nota,ts:a52Ahora()});
    fbSet('redBarCfg',redBarCfg);
    showToast('✅ Red autorizada<br><span style="font-size:12px;opacity:.85;font-family:monospace">'+esc(ip)+(nota?' · '+esc(nota):'')+'</span>','#22c55e');
    render();
  });
}
function quitarRedAutorizada(idx){
  var x=(redBarCfg.ips||[])[idx];
  if(!x)return;
  if(!confirm('¿Quitar la red '+x.ip+(x.nota?' ('+x.nota+')':'')+'?'+(redBarCfg.on&&redBarCfg.ips.length===1?'\n\n⚠️ Es la única autorizada: los meseros y cajeros quedarán bloqueados.':'')))return;
  redBarCfg.ips.splice(idx,1);
  fbSet('redBarCfg',redBarCfg);
  render();
}
function toggleFotoComp(){
  fotoCompCfg.on=!fotoCompCfg.on;
  fbSet('fotoCompCfg',fotoCompCfg);
  render();
}
function togglePermitirSinFoto(){
  fotoCompCfg.permitirSinFoto=(fotoCompCfg.permitirSinFoto===false);
  fbSet('fotoCompCfg',fotoCompCfg);
  showToast(fotoCompCfg.permitirSinFoto!==false
    ?'🚪 Salida "sin foto" PERMITIDA<br><span style="font-size:12px;opacity:.85">Con motivo obligatorio · queda marcado en la conciliación</span>'
    :'🔒 Salida "sin foto" BLOQUEADA<br><span style="font-size:12px;opacity:.85">Todo pago digital exige la foto, sin excepción</span>','#f5a623');
  render();
}
function guardarFotoCompCfg(){
  fotoCompCfg.min=moneyVal('fotocomp-min')||0;
  fbSet('fotoCompCfg',fotoCompCfg);
  showToast('📷 Configuración guardada<br><span style="font-size:12px;opacity:.85">'+(fotoCompCfg.on?'Foto obligatoria'+(fotoCompCfg.min>0?' desde '+fmt(fotoCompCfg.min):' en todos los pagos digitales'):'Desactivado')+'</span>','#38bdf8');
  render();
}


