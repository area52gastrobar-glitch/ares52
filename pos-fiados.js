/* ═══ Devolver un fiado a una mesa (sin perder el historial de abonos) ═══ */
function abrirDevolverFiado(deudaId){
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var libres=mesas.filter(function(m){return !(pedidos[m.id]&&pedidos[m.id].length);});
  if(!libres.length){alert('No hay mesas libres para devolver este fiado.');return;}
  var opts=libres.map(function(m){
    var z=ZONAS.find(function(x){return x.id===m.zona;});
    return'<option value="'+m.id+'">'+(z?z.label+' · ':'')+esc(m.nombre||('Mesa '+m.num))+'</option>';
  }).join('');
  var pagosInfo=(d.pagos&&d.pagos.length)
    ?'<div style="background:var(--bg);border:1px solid #22c55e44;border-radius:9px;padding:9px 11px;margin-bottom:12px">'
      +'<div style="font-size:11px;font-weight:800;color:#22c55e;margin-bottom:4px">✓ PAGOS YA RECIBIDOS — se conservan como abonos de la mesa</div>'
      +d.pagos.map(function(p){
        var f=FPAGO.find(function(x){return x.id===p.fp;});
        return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:1px 0"><span>'+(f?f.emoji+' '+f.label:p.fp)+(p.nota?' · '+esc(p.nota):'')+'</span><span style="font-weight:700">'+fmt(p.valor)+'</span></div>';
      }).join('')
    +'</div>':'';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">↩️ Devolver fiado a mesa</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:12px">'+esc(d.clienteNombre)+' · total '+fmt(d.total)+' · pendiente <b style="color:#f5a623">'+fmt(d.total-(d.pagado||0))+'</b></div>'
    +pagosInfo
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿A qué mesa?</div>'
    +'<select class="inp" id="devfiado-mesa" style="margin-bottom:12px">'+opts+'</select>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Los productos vuelven a la mesa y los pagos recibidos quedan como abonos. El fiado desaparece de la lista y sus registros en ventas se retiran (la plata quedará contada al cobrar la mesa).</div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarDevolverFiado(\''+deudaId+'\')">↩️ Devolver a la mesa</button>');
}
function confirmarDevolverFiado(deudaId){
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var mesaId=(document.getElementById('devfiado-mesa')||{}).value;
  var mesa=mesas.find(function(m){return String(m.id)===String(mesaId);});
  if(!mesa){alert('Elige la mesa.');return;}
  if(pedidos[mesa.id]&&pedidos[mesa.id].length){alert('Esa mesa ya está ocupada.');return;}
  // 1. Productos de vuelta a la mesa (el stock nunca se devolvió: no se toca)
  pedidos[mesa.id]=JSON.parse(JSON.stringify(d.items||[]));
  var rp=ref('pedidos/'+mesa.id);if(rp)rp.set(pedidos[mesa.id]);
  // 2. Pagos del fiado → abonos de la mesa (historial intacto)
  if(d.pagos&&d.pagos.length){
    abonosMesa[mesa.id]=d.pagos.map(function(p){
      return {monto:p.valor||0,fp:p.fp||'efectivo',nombre:(p.nota||'Pago fiado')+' · '+d.clienteNombre,ts:p.ts||a52Ahora()};
    });
    fbSet('abonosMesa',abonosMesa);
  }
  // 3. Retirar las ventas que esos pagos generaron (para no contar la plata dos veces:
  //    quedará contada cuando la mesa se cobre, con los abonos incluidos)
  var aBorrar=ventas.filter(function(v){return v.esPagoCredito&&v.deudaId===d.id&&v._fbkey;});
  aBorrar.forEach(function(v){var rv=ref('ventas/'+v._fbkey);if(rv)rv.set(null);});
  ventas=ventas.filter(function(v){return !(v.esPagoCredito&&v.deudaId===d.id);});
  // 4. Eliminar la deuda
  deudasCredito=deudasCredito.filter(function(x){return x.id!==deudaId;});
  var ob={};deudasCredito.forEach(function(x){ob[x.id]=x;});fbSet('deudasCredito',ob);
  closeModal1();
  showToast('↩️ Fiado devuelto a '+esc(mesa.nombre||('Mesa '+mesa.num))+'<br><span style="font-size:12px;opacity:.85">'+((d.pagos||[]).length?'Con '+(d.pagos||[]).length+' abono(s) conservados':'Sin pagos previos')+'</span>','#38bdf8');
  render();
}

function confirmarPagoCredito(deudaId){
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var valor=moneyVal('pago-valor')||0;
  var fp=(document.getElementById('pago-fp')||{}).value||'efectivo';
  var pend=d.total-(d.pagado||0);
  if(valor<=0){alert('Escribe el valor.');return;}
  if(valor>pend){alert('El pago no puede ser mayor a lo pendiente ('+fmt(pend)+').');return;}

  d.pagado=(d.pagado||0)+valor;
  d.pagos=d.pagos||[];
  d.pagos.push({ts:a52Ahora(),valor:valor,fp:fp});

  // Persist deuda
  var idx=deudasCredito.findIndex(function(x){return x.id===deudaId;});
  if(idx>=0)deudasCredito[idx]=d;
  var do2={};deudasCredito.forEach(function(x){do2[x.id]=x;});fbSet('deudasCredito',do2);

  // Registrar como VENTA del día actual (entra a caja/cierre del día que paga)
  var f=FPAGO.find(function(x){return x.id===fp;});
  var esFinal=(d.pagado>=d.total);  // ¿quedó saldada con este pago?
  // Si quedó saldada, adjuntar los productos reales para que cuenten en el ranking.
  // Si es abono parcial, registrar solo el abono (los productos cuentan al saldar).
  var ventaItems=esFinal
    ? (d.items&&d.items.length?d.items:[{isCustom:true,customNombre:'Pago fiado '+d.clienteNombre,customPrecio:valor,qty:1}])
    : [{isCustom:true,customNombre:'Abono fiado '+d.clienteNombre,customPrecio:valor,qty:1}];
  var venta={
    mesa:'Fiado: '+d.clienteNombre,zona:'credito',
    ts:a52Ahora(),total:valor,
    items:ventaItems,
    fp:fp,fpLabel:(f?f.label:fp),
    pagos:[{fp:fp,label:(f?f.label:fp),monto:valor}],
    esPagoCredito:true,fiadoSaldado:esFinal,deudaId:d.id,
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre
  };
  fbPush('ventas',venta);

  closeModal1();
  showToast('💵 Pago registrado<br><span style="font-size:12px;opacity:.85">'+esc(d.clienteNombre)+' · '+fmt(valor)+(d.pagado>=d.total?' · ✓ Saldado':'')+'</span>','#22c55e');
  render();
}

function renderEmpleados(){
  var esAdmin=usuarioActivo&&usuarioActivo.rol==='admin';
  var DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var lunes=_sanLunes(_empSemanaOffset);
  var fechas=[];for(var i=0;i<7;i++){var d=new Date(lunes);d.setDate(d.getDate()+i);fechas.push(d);}
  var semKey=_fechaKey(lunes);
  var rango=lunes.getDate()+'/'+(lunes.getMonth()+1)+' al '+fechas[6].getDate()+'/'+(fechas[6].getMonth()+1);
  var hoy=new Date();

  // Saldo de préstamos a LARGO PLAZO (pendientes, no de esta semana)
  function saldoLargoPlazo(empId){
    return movEmpleados.filter(function(m){return m.empId===empId;}).reduce(function(s,m){
      if(m.tipo==='prestamo'&&m.largoPlazo)return s+m.valor;
      if(m.tipo==='abono')return s-m.valor;
      return s;
    },0);
  }
  // Detalle de movimientos de LARGO PLAZO (préstamos y abonos), ordenados por fecha
  function movsLargoPlazo(empId){
    return movEmpleados.filter(function(m){
      return m.empId===empId && ((m.tipo==='prestamo'&&m.largoPlazo)||m.tipo==='abono');
    }).sort(function(a,b){return (a.ts||0)-(b.ts||0);});
  }
  // Préstamos de ESTA semana (se descuentan del pago semanal)
  function prestamosSemana(empId){
    return movEmpleados.filter(function(m){
      return m.empId===empId&&((m.tipo==='prestamo'&&!m.largoPlazo)||m.tipo==='consumo')&&m.semanaKey===semKey;
    });
  }

  var empCards=empleados.filter(function(e){return e.activo!==false;}).map(function(e){
    var diario=parseInt(e.pagoDiario)||0;
    var esVariable=!!e.pagoVariable;
    // Días trabajados esta semana
    var diasTrab=0;
    var ganado=0;
    var diasBtns=fechas.map(function(d,idx){
      var k=e.id+'_'+_fechaKey(d);
      var rec=asistenciaEmp[k];
      var trab=!!rec;
      var valorDia=0;
      if(trab){
        diasTrab++;
        // Si es variable y se guardó un número, usar ese; si no, el pago diario
        valorDia=(typeof rec==='number')?rec:diario;
        ganado+=valorDia;
      }
      var futuro=d>hoy;
      var etiqueta=trab?(esVariable&&typeof rec==='number'?fmt(rec).replace('$','').replace(/\s/g,''):'✓'):d.getDate();
      return'<button data-act="emp-dia" data-key="'+k+'" data-emp="'+e.id+'" '+(futuro?'disabled':'')+' style="flex:1;min-width:38px;background:'+(trab?'#22c55e':'var(--card)')+';color:'+(trab?'#000':'var(--muted)')+';border:1px solid '+(trab?'#22c55e':'var(--border)')+';border-radius:8px;padding:7px 2px;font-size:11px;font-weight:700;cursor:'+(futuro?'not-allowed':'pointer')+';opacity:'+(futuro?'.3':'1')+'">'+DIAS[idx]+'<br><span style="font-size:'+(esVariable&&trab?'9px':'13px')+'">'+etiqueta+'</span></button>';
    }).join('');
    var prests=prestamosSemana(e.id);
    var _c=calcSaldoSemana(e.id,semKey);
    var totalPrestSem=_c.prest;
    var pagadoSem=_c.pagado;
    var ajusteSem=_c.ajuste;
    var saldoPagar=_c.saldo;   // >0 falta por pagar · <0 se pagó de más
    var estaPagada=(pagadoSem>0&&saldoPagar===0);
    var largoP=saldoLargoPlazo(e.id);

    var prestRows=prests.map(function(m){
      return'<div data-act="emp-vermov" data-id="'+m.id+'" style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--muted);padding:5px 0;cursor:pointer;border-bottom:1px solid var(--border)"><span>'+(m.tipo==='consumo'?'':'💸 ')+(m.nota?esc(m.nota):'Préstamo')+' · '+fmtTime(m.ts)+' <span style="opacity:.5">ⓘ</span></span><span style="color:#ef4444;font-weight:700">-'+fmt(m.valor)+(esAdmin?' <button data-act="emp-delmov" data-id="'+m.id+'" style="background:none;border:none;color:#ef4444;cursor:pointer">✕</button>':'')+'</span></div>';
    }).join('');
    // Filas de ajustes traídos de otra semana
    var ajustes=movEmpleados.filter(function(m){return m.empId===e.id&&m.tipo==='ajuste'&&m.semanaKey===semKey;});
    var ajusteRows=ajustes.map(function(m){
      var pos=(m.valor||0)>=0;
      return'<div data-act="emp-vermov" data-id="'+m.id+'" style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#c9b8f0;padding:5px 0;cursor:pointer;border-bottom:1px solid var(--border)"><span>↪️ '+(m.nota?esc(m.nota):(pos?'Saldo semana anterior':'Adelanto semana anterior'))+' <span style="opacity:.5">ⓘ</span></span><span style="color:'+(pos?'#f5a623':'#22c55e')+';font-weight:700;white-space:nowrap">'+(pos?'+':'−')+fmt(Math.abs(m.valor))+(esAdmin?' <button data-act="emp-delmov" data-id="'+m.id+'" style="background:none;border:none;color:#ef4444;cursor:pointer">✕</button>':'')+'</span></div>';
    }).join('');
    // Filas de pagos ya hechos esta semana
    var pagos=movEmpleados.filter(function(m){return m.empId===e.id&&m.tipo==='salario'&&m.semanaKey===semKey;});
    var pagoRows=pagos.map(function(m){
      return'<div data-act="emp-vermov" data-id="'+m.id+'" style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#9fe8b0;padding:5px 0;cursor:pointer;border-bottom:1px solid #22c55e22"><span>✅ Pagado · '+fmtTime(m.ts)+' <span style="opacity:.5">ⓘ</span></span><span style="color:#22c55e;font-weight:700;white-space:nowrap">-'+fmt(m.valor)+(esAdmin?' <button data-act="emp-delmov" data-id="'+m.id+'" style="background:none;border:none;color:#ef4444;cursor:pointer">✕</button>':'')+'</span></div>';
    }).join('');

    // 🥤 Consumos del mes (para verificar el descuento al pagar)
    var _iniMesC=new Date();_iniMesC.setDate(1);_iniMesC.setHours(0,0,0,0);
    var _consMes=consumoEmpleados.filter(function(c){return String(c.empId)===String(e.id)&&!c.descontado;});
    var _consMesUnd=_consMes.reduce(function(a,c){return a+(c.cantidad||1);},0);
    var _consMesVal=_consMes.reduce(function(a,c){return a+valorConsumo(c);},0);
    return'<div class="card" style="margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
        +'<div><div style="font-weight:800;font-size:15px">👷 '+esc(e.nombre)+'</div>'
        +'<div style="color:var(--muted);font-size:12px">'+esc(e.cargo||'Sin cargo')+'</div>'
        +(_consMesUnd>0?'<div style="color:#f5a623;font-size:11px;font-weight:800;margin-top:3px">🥤 Consumos pendientes: '+fmt(_consMesVal)+' <span style="color:var(--muted);font-weight:600">('+_consMesUnd+' und — a descontar)</span>'
          +(usuarioActivo.rol==='admin'?' <button onclick="descontarConsumosEmp(\''+e.id+'\')" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:6px;padding:2px 8px;font-size:10px;font-weight:800;cursor:pointer;margin-left:4px">✅ Descontar</button>':'')+'</div>':'')
        +'</div>'
        +'<button data-act="emp-edit" data-emp="'+e.id+'" style="background:var(--card2);border:1px solid var(--border);color:var(--muted);border-radius:7px;padding:4px 8px;font-size:11px;cursor:pointer">⚙️ Pago: '+fmt(diario)+'/día</button>'
      +'</div>'
      // Días trabajados
      +'<div style="color:var(--muted);font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:5px">DÍAS TRABAJADOS</div>'
      +'<div style="display:flex;gap:4px;margin-bottom:10px">'+diasBtns+'</div>'
      // Cálculo semanal
      +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:10px">'
        +'<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0"><span>'+diasTrab+' día'+(diasTrab!==1?'s':'')+(esVariable?' (valor variable)':' × '+fmt(diario))+'</span><span style="font-weight:700">'+fmt(ganado)+'</span></div>'
        +(ajusteRows?'<div style="border-top:1px dashed var(--border);margin:5px 0;padding-top:5px">'+ajusteRows+'</div>':'')
        +(prestRows?'<div style="border-top:1px dashed var(--border);margin:5px 0;padding-top:5px">'+prestRows+'</div>':'')
        +(pagoRows?'<div style="border-top:1px dashed var(--border);margin:5px 0;padding-top:5px">'+pagoRows+'</div>':'')
        +(function(){
            var lbl,col,val;
            if(estaPagada){lbl='TOTAL SEMANA';col='#22c55e';val=fmt(_c.neto);}
            else if(saldoPagar>0){lbl=pagadoSem>0?'FALTA POR PAGAR':'SALDO A PAGAR';col='#f5a623';val=fmt(saldoPagar);}
            else if(saldoPagar<0){lbl='PAGADO DE MÁS';col='#ef4444';val=fmt(Math.abs(saldoPagar));}
            else {lbl='SALDO A PAGAR';col='var(--muted)';val=fmt(0);}
            return'<div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);margin-top:5px;padding-top:6px"><span style="font-weight:800;font-size:13px">'+lbl+'</span><span style="color:'+col+';font-weight:900;font-size:16px">'+val+'</span></div>';
        })()
        +(estaPagada?'<div style="background:#22c55e18;border:1px solid #22c55e33;border-radius:8px;padding:6px 8px;margin-top:8px;text-align:center;color:#22c55e;font-size:12px;font-weight:800">✅ SEMANA PAGADA · CERRADA</div>'
          :(saldoPagar<0?'<div style="background:#ef444414;border:1px solid #ef444433;border-radius:8px;padding:6px 8px;margin-top:8px;text-align:center;color:#ef4444;font-size:11px;font-weight:700">⚠️ Se pagó '+fmt(Math.abs(saldoPagar))+' de más · puedes pasarlo a la próxima semana</div>'
          :(pagadoSem>0&&saldoPagar>0?'<div style="background:#f5a62314;border:1px solid #f5a62333;border-radius:8px;padding:6px 8px;margin-top:8px;text-align:center;color:#f5a623;font-size:11px;font-weight:700">🕓 Pago parcial · falta '+fmt(saldoPagar)+'</div>':'')))
      +'</div>'
      // Largo plazo CON DETALLE (cuáles, fecha, abonos)
      +(largoP>0?(function(){
          var movs=movsLargoPlazo(e.id);
          var filas=movs.map(function(m){
            if(m.tipo==='prestamo'){
              return '<div data-act="emp-vermov" data-id="'+m.id+'" style="display:flex;justify-content:space-between;font-size:11px;padding:5px 0;border-bottom:1px solid #f5a62322;cursor:pointer">'
                +'<span style="color:#e8d5c0">📌 '+(m.nota?esc(m.nota):'Préstamo')+' <span style="opacity:.5">ⓘ</span><br><span style="color:#9a7ac0;font-size:10px">'+fmtFechaCorta(m.ts)+'</span></span>'
                +'<span style="color:#f5a623;font-weight:700;white-space:nowrap">'+fmt(m.valor)+(esAdmin?' <button data-act="emp-delmov" data-id="'+m.id+'" style="background:none;border:none;color:#ef4444;cursor:pointer">✕</button>':'')+'</span></div>';
            } else {
              return '<div data-act="emp-vermov" data-id="'+m.id+'" style="display:flex;justify-content:space-between;font-size:11px;padding:5px 0;border-bottom:1px solid #22c55e22;cursor:pointer">'
                +'<span style="color:#9fe8b0">✅ Abono <span style="opacity:.5">ⓘ</span><br><span style="color:#9a7ac0;font-size:10px">'+fmtFechaCorta(m.ts)+'</span></span>'
                +'<span style="color:#22c55e;font-weight:700;white-space:nowrap">-'+fmt(m.valor)+(esAdmin?' <button data-act="emp-delmov" data-id="'+m.id+'" style="background:none;border:none;color:#ef4444;cursor:pointer">✕</button>':'')+'</span></div>';
            }
          }).join('');
          return '<div style="background:#f5a62312;border:1px solid #f5a62333;border-radius:9px;padding:9px 11px;margin-bottom:10px">'
            +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="color:#f5a623;font-size:12px;font-weight:700">📌 Préstamos a largo plazo</span><span style="color:#f5a623;font-weight:900">Debe: '+fmt(largoP)+'</span></div>'
            +filas
          +'</div>';
        })():'')
      // Botones
      +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
        +'<button data-act="emp-prestamo" data-emp="'+e.id+'" style="flex:1;min-width:90px;background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">💸 Préstamo</button>'
        +(largoP>0?'<button data-act="emp-mov" data-emp="'+e.id+'" data-tipo="abono" style="flex:1;min-width:90px;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">✅ Abono largo plazo</button>':'')
        +(saldoPagar>0?'<button data-act="emp-pagar" data-emp="'+e.id+'" data-monto="'+saldoPagar+'" data-sem="'+semKey+'" style="flex:1;min-width:90px;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:9px;font-size:12px;font-weight:800;cursor:pointer">💰 Pagar saldo</button>':'')
        +(saldoPagar!==0?'<button data-act="emp-pasar" data-emp="'+e.id+'" data-sem="'+semKey+'" style="flex:1;min-width:90px;background:#c9b8f018;color:#c9b8f0;border:1px solid #c9b8f033;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">↪️ Pasar a próxima</button>':'')
      +'</div>'
    +'</div>';
  }).join('');

  // Egresos a empleados este turno
  var movTurno=movEmpleados.filter(function(m){return m.ts>=turnoInicio&&(m.tipo==='prestamo'||m.tipo==='salario'||m.tipo==='otro');});
  var totalEgresos=movTurno.reduce(function(s,m){return s+m.valor;},0);

  return'<div>'
    +'<div class="flex-between mb12">'
      +'<div style="font-weight:800;font-size:16px">👷 Nómina</div>'
      +'<button class="btn btn-green" onclick="abrirNuevoEmpleado()">+ Empleado</button>'
    +'</div>'
    // Navegación de semana
    +'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--card);border-radius:10px;padding:8px 12px;margin-bottom:12px">'
      +'<button onclick="_empSemanaOffset--;render()" style="background:var(--card2);border:none;color:var(--text);border-radius:7px;padding:6px 12px;cursor:pointer;font-size:16px">‹</button>'
      +'<div style="text-align:center;font-size:12px;font-weight:700">Semana '+rango+(_empSemanaOffset===0?' (actual)':'')+'</div>'
      +'<button onclick="if(_empSemanaOffset<0){_empSemanaOffset++;render()}" style="background:var(--card2);border:none;color:var(--text);border-radius:7px;padding:6px 12px;cursor:'+(_empSemanaOffset<0?'pointer':'not-allowed')+';font-size:16px;opacity:'+(_empSemanaOffset<0?'1':'.3')+'">›</button>'
    +'</div>'
    +(totalEgresos>0?'<div style="background:#ef444418;border:1px solid #ef444433;border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between"><span style="color:#ef4444;font-weight:700;font-size:13px">💸 Pagado a empleados (turno)</span><span style="color:#ef4444;font-weight:900">'+fmt(totalEgresos)+'</span></div>':'')
    +(empCards||'<div style="text-align:center;color:var(--muted);padding:40px 20px">Sin empleados. Toca "+ Empleado" para crear el primero.</div>')
  +'</div>';
}

function abrirNuevoEmpleado(){
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:14px">👷 Nuevo empleado</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nombre *</div>'
    +'<input class="inp" id="emp-nombre" placeholder="Ej: Juan Pérez"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Cargo</div>'
    +'<input class="inp" id="emp-cargo" placeholder="Ej: Mesero, Cocinero, Bartender"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Pago por día (COP)</div>'
    +'<input class="inp money" id="emp-pago" type="text" inputmode="numeric" placeholder="Ej: 50.000"/></div>'
    +'<label style="display:flex;align-items:center;gap:8px;padding:9px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:14px;cursor:pointer"><input type="checkbox" id="emp-variable"/> <span style="font-size:13px">Pago variable por día (elijo el valor al marcar cada día)</span></label>'
    +'<button class="btn btn-green btn-full" onclick="guardarEmpleado()">Guardar</button>');
}
function abrirEditarEmpleado(empId){
  var e=empleados.find(function(x){return x.id===empId;});
  if(!e)return;
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:14px">⚙️ Editar empleado</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nombre *</div>'
    +'<input class="inp" id="emp-nombre" value="'+esc(e.nombre)+'"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Cargo</div>'
    +'<input class="inp" id="emp-cargo" value="'+esc(e.cargo||'')+'"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Pago por día (COP)</div>'
    +'<input class="inp money" id="emp-pago" type="text" inputmode="numeric" value="'+moneyFmt(e.pagoDiario||'')+'"/></div>'
    +'<label style="display:flex;align-items:center;gap:8px;padding:9px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:14px;cursor:pointer"><input type="checkbox" id="emp-variable" '+(e.pagoVariable?'checked':'')+'/> <span style="font-size:13px">Pago variable por día (elijo el valor al marcar cada día)</span></label>'
    +'<button class="btn btn-green btn-full" onclick="guardarEmpleado(\''+empId+'\')">Guardar cambios</button>'
    +'<button class="btn btn-full" onclick="eliminarEmpleado(\''+empId+'\')" style="background:#f5a62318;color:#f5a623;border:1px solid #f5a62333;margin-top:8px">🚫 Sacar de nómina (conserva historial)</button>'
    +'<button class="btn btn-full" onclick="borrarEmpleadoDefinitivo(\''+empId+'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;margin-top:8px">🗑️ Borrar definitivamente</button>');
}
function eliminarEmpleado(empId){
  if(!confirm('¿Sacar a este empleado de la nómina? Deja de aparecer en las listas, pero su historial de pagos y consumos se conserva.'))return;
  var e=empleados.find(function(x){return String(x.id)===String(empId);});
  if(!e){alert('No encontré el empleado. Intenta de nuevo.');return;}
  e.activo=false;
  var ob={};empleados.forEach(function(x){ob[x.id]=x;});fbSet('empleados',ob);
  showToast('🚫 '+esc(e.nombre)+' fuera de nómina<br><span style="font-size:12px;opacity:.85">Su historial se conserva</span>','#f5a623');
  closeModal1();render();
}
function borrarEmpleadoDefinitivo(empId){
  var e=empleados.find(function(x){return String(x.id)===String(empId);});
  if(!e){alert('No encontré el empleado.');return;}
  var movs=movEmpleados.filter(function(m){return String(m.empId)===String(empId);}).length;
  var consumos=consumoEmpleados.filter(function(c){return String(c.empId)===String(empId);}).length;
  if(!confirm('🗑️ ¿BORRAR DEFINITIVAMENTE a '+e.nombre+'?\n\nEsto no se puede deshacer.'+((movs||consumos)?'\nSus '+movs+' movimiento(s) de nómina y '+consumos+' consumo(s) quedarán como registros sueltos.':'')))return;
  empleados=empleados.filter(function(x){return String(x.id)!==String(empId);});
  var ob={};empleados.forEach(function(x){ob[x.id]=x;});
  fbSet('empleados',empleados.length?ob:null);
  showToast('🗑️ '+esc(e.nombre)+' borrado definitivamente','#ef4444');
  closeModal1();render();
}

function guardarEmpleado(empId){
  var nombre=((document.getElementById('emp-nombre')||{}).value||'').trim();
  var cargo=((document.getElementById('emp-cargo')||{}).value||'').trim();
  var pago=moneyVal('emp-pago')||0;
  var variable=!!((document.getElementById('emp-variable')||{}).checked);
  if(!nombre){alert('Escribe el nombre.');return;}
  if(empId){
    var e=empleados.find(function(x){return String(x.id)===String(empId);});
    if(e){e.nombre=nombre;e.cargo=cargo;e.pagoDiario=pago;e.pagoVariable=variable;}
    var ob={};empleados.forEach(function(x){ob[x.id]=x;});fbSet('empleados',ob);
  } else {
    var emp={id:'emp'+a52Ahora(),nombre:nombre,cargo:cargo,pagoDiario:pago,pagoVariable:variable,activo:true,ts:a52Ahora()};
    empleados.push(emp);
    var ob2={};empleados.forEach(function(x){ob2[x.id]=x;});fbSet('empleados',ob2);
  }
  closeModal1();render();
}

function verMovEmpleado(movId){
  var m=movEmpleados.find(function(x){return x.id===movId;});
  if(!m)return;
  var emp=empleados.find(function(e){return e.id===m.empId;});
  var fp=FPAGO.find(function(f){return f.id===m.fp;});
  var tipoLabel=m.tipo==='prestamo'?(m.largoPlazo?'📌 Préstamo (largo plazo)':'💸 Préstamo (esta semana)'):(m.tipo==='abono'?'✅ Abono a largo plazo':(m.tipo==='salario'?'💰 Pago de saldo':(m.tipo==='ajuste'?'↪️ Traslado entre semanas':'Movimiento')));
  var color=m.tipo==='abono'?'#22c55e':(m.tipo==='salario'?'#22c55e':(m.tipo==='ajuste'?'#c9b8f0':'#ef4444'));
  var d=new Date(m.ts);
  var fecha=('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear();
  function fila(lbl,val){return'<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-size:12px">'+lbl+'</span><span style="font-size:13px;font-weight:600;text-align:right">'+val+'</span></div>';}
  modal1('<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:15px;font-weight:800;color:'+color+'">'+tipoLabel+'</div>'
    +'<div style="font-size:26px;font-weight:900;color:'+color+';margin-top:4px">'+(m.tipo==='abono'?'-':'')+fmt(m.valor)+'</div>'
    +'</div>'
    +fila('👷 Empleado', emp?esc(emp.nombre):'—')
    +fila('📅 Fecha', fecha)
    +fila('🕐 Hora', fmtTime(m.ts))
    +fila('💳 Medio de pago', fp?(fp.emoji+' '+fp.label):esc(m.fp||'—'))
    +(m.nota?fila('📝 Concepto', esc(m.nota)):'')
    +(m.semanaKey?fila('🗓️ Semana', m.semanaKey):'')
    +fila('✍️ Registró', esc(m.uidNombre||m.uid||'—'))
    +(m.fromGasto?'<div style="color:#38bdf8;font-size:11px;margin-top:8px;text-align:center">🔗 Enlazado desde un gasto de caja</div>':'')
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:14px">Cerrar</button>'
    +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button class="btn btn-full" onclick="borrarMovEmpleado(\''+movId+'\');closeModal1();" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;margin-top:8px">🗑️ Eliminar este movimiento</button>':''));
}

function _cierreAproxDia(fechaKey){
  // Último cobro de la JORNADA de ese día: desde las 6:00 am de la fecha hasta las 5:59 am del día siguiente
  var d0=new Date(fechaKey+'T06:00:00').getTime();
  var d1=d0+24*3600000;
  var ult=0;
  ventas.forEach(function(v){if(v.ts>=d0&&v.ts<d1&&v.ts>ult)ult=v.ts;});
  if(!ult)return null;
  var medianocheSig=new Date(fechaKey+'T00:00:00').getTime()+24*3600000;
  var madrugada=ult>=medianocheSig;
  return{ts:ult,txt:fmtTime(ult)+(madrugada?' (madrugada del día siguiente)':'')};
}
function abrirPagoDiaVariable(key,emp){
  var sugerido=parseInt(emp.pagoDiario)||0;
  var fechaKey=key.split('_').slice(1).join('_');
  var cierre=_cierreAproxDia(fechaKey);
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">📅 Pago de este día</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:8px">'+esc(emp.nombre)+' · '+fechaKey+'</div>'
    +'<div style="background:#38bdf812;border:1px solid #38bdf833;border-radius:9px;padding:8px 12px;margin-bottom:14px;font-size:12px">'
      +(cierre?'🌙 Cierre aproximado del bar: <b style="color:#38bdf8">'+cierre.txt+'</b><br><span style="color:var(--muted);font-size:10px">Hora del último cobro de esa jornada — referencia de hasta qué horas trabajaron.</span>'
             :'🌙 <span style="color:var(--muted)">Sin cobros registrados en esa jornada.</span>')
    +'</div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Cuánto se le paga por este día? (COP)</div>'
    +'<input class="inp money" id="dia-valor" type="text" inputmode="numeric" value="'+(sugerido?moneyFmt(sugerido):'')+'" placeholder="0" autofocus/></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarPagoDiaVariable(\''+key+'\')">✓ Marcar día</button>');
  setTimeout(function(){var el=document.getElementById('dia-valor');if(el){el.focus();el.select();}},100);
}
function confirmarPagoDiaVariable(key){
  var v=moneyVal('dia-valor')||0;
  if(v<=0){alert('Escribe el valor de este día.');return;}
  asistenciaEmp[key]=v;  // guarda el número (valor de ese día)
  fbSet('asistenciaEmp',asistenciaEmp);
  closeModal1();render();
}

function abrirPrestamoEmpleado(empId){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  var fpOpts=FPV().sort(function(a,b){return a.id==='efectivo'?-1:b.id==='efectivo'?1:0;}).map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💸 Préstamo a</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:14px">'+esc(emp.nombre)+'</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor (COP) *</div>'
    +'<input class="inp money" id="mov-valor" type="text" placeholder="0" inputmode="numeric"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Sale de (forma de pago)</div>'
    +'<select class="inp" id="mov-fp">'+fpOpts+'</select></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Concepto (opcional)</div>'
    +'<input class="inp" id="mov-nota" placeholder="Ej: adelanto, emergencia..."/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:6px">¿Cómo se descuenta?</div>'
      +'<label style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;cursor:pointer"><input type="radio" name="prestTipo" value="semana" checked/> <span style="font-size:13px">Esta semana (se descuenta del pago semanal)</span></label>'
      +'<label style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer"><input type="radio" name="prestTipo" value="largo"/> <span style="font-size:13px">Largo plazo (queda pendiente, se abona aparte)</span></label>'
    +'</div>'
    +'<button class="btn btn-green btn-full" onclick="guardarPrestamoEmpleado(\''+empId+'\')">Registrar préstamo</button>');
}
function guardarPrestamoEmpleado(empId){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  var valor=moneyVal('mov-valor')||0;
  var fp=(document.getElementById('mov-fp')||{}).value||'efectivo';
  var nota=((document.getElementById('mov-nota')||{}).value||'').trim();
  var tipoSel=(document.querySelector('input[name="prestTipo"]:checked')||{}).value||'semana';
  if(valor<=0){alert('Escribe el valor.');return;}
  var largoPlazo=(tipoSel==='largo');
  var semKey=_fechaKey(_sanLunes(_empSemanaOffset));
  var mov={id:'me'+a52Ahora(),ts:a52Ahora(),empId:empId,tipo:'prestamo',valor:valor,fp:fp,nota:nota,largoPlazo:largoPlazo,semanaKey:semKey,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,gastoId:'g'+a52Ahora()};
  movEmpleados.push(mov);
  var r=ref('movEmpleados');if(r)r.push(mov);else guardarMovs();
  // SALE DE CAJA: registrar como gasto (🔗 enlazado al movimiento)
  var g={id:mov.gastoId,ts:a52Ahora(),concepto:'Préstamo a '+emp.nombre,categoria:'Personal',valor:valor,notas:(largoPlazo?'Largo plazo':'Semana')+(nota?' · '+nota:''),fp:fp,empId:empId,movId:mov.id,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  gastos.push(g);var rg=ref('gastos');if(rg)rg.push(g);else fbSet('gastos',gastos);
  closeModal1();
  showToast('💸 Préstamo registrado<br><span style="font-size:12px;opacity:.85">'+esc(emp.nombre)+' · '+fmt(valor)+' · '+(largoPlazo?'largo plazo':'esta semana')+'</span>','#ef4444');
  render();
}
function pagarSaldoEmpleado(empId,monto,semKey){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  monto=parseInt(monto)||0;
  if(monto<=0){alert('No hay saldo por pagar.');return;}
  var fpOpts=FPV().sort(function(a,b){return a.id==='efectivo'?-1:b.id==='efectivo'?1:0;}).map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💰 Pagar saldo semanal</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:14px">'+esc(emp.nombre)+'</div>'
    +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:12px;text-align:center"><div style="color:var(--muted);font-size:11px">Saldo pendiente</div><div style="color:#f5a623;font-weight:900;font-size:22px">'+fmt(monto)+'</div></div>'
    +'<div style="margin-bottom:6px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Cuánto vas a pagar? *</div>'
    +'<input class="inp money" id="pago-valor" type="text" inputmode="numeric" value="'+moneyFmt(monto)+'"/></div>'
    +'<div style="color:var(--muted);font-size:10px;margin-bottom:12px">Puedes pagar más o menos. Si queda diferencia (o pagas de más), después podrás pasarla a la próxima semana con el botón ↪️.</div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Sale de (forma de pago)</div>'
    +'<select class="inp" id="pago-fp">'+fpOpts+'</select></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarPagoSaldo(\''+empId+'\',\''+semKey+'\')">✓ Confirmar pago</button>');
}
function confirmarPagoSaldo(empId,semKey){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  var valor=moneyVal('pago-valor')||0;
  if(valor<=0){alert('Escribe cuánto vas a pagar.');return;}
  var fp=(document.getElementById('pago-fp')||{}).value||'efectivo';
  var mov={id:'me'+a52Ahora(),ts:a52Ahora(),empId:empId,tipo:'salario',valor:valor,fp:fp,nota:'Pago semana '+semKey,semanaKey:semKey,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,gastoId:'g'+a52Ahora()};
  movEmpleados.push(mov);
  var r=ref('movEmpleados');if(r)r.push(mov);else guardarMovs();
  // SALE DE CAJA (🔗 enlazado al movimiento)
  var g={id:mov.gastoId,ts:a52Ahora(),concepto:'Pago nómina '+emp.nombre,categoria:'Personal',valor:valor,notas:'Semana '+semKey,fp:fp,empId:empId,movId:mov.id,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  gastos.push(g);var rg=ref('gastos');if(rg)rg.push(g);else fbSet('gastos',gastos);
  closeModal1();
  // Recalcular saldo tras el pago
  var c=calcSaldoSemana(empId,semKey);
  var rest=c.saldo;
  var restTxt=rest>0?' · falta '+fmt(rest):(rest<0?' · pagaste '+fmt(Math.abs(rest))+' de más':' · ✅ semana saldada');
  showToast('💰 Pago registrado<br><span style="font-size:12px;opacity:.85">'+esc(emp.nombre)+' · '+fmt(valor)+restTxt+'</span>','#22c55e');
  render();
}
// Pasa el saldo restante (o el exceso pagado) a la semana siguiente
function pasarSaldoSemana(empId,semKey){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  var c=calcSaldoSemana(empId,semKey);
  var s=c.saldo;
  if(s===0){alert('No hay saldo ni exceso para pasar en esta semana.');return;}
  var next=_semKeyMas(semKey,1);
  var nextLunes=_lunesDeSemKey(next);
  var nextRango=nextLunes.getDate()+'/'+(nextLunes.getMonth()+1);
  var esFalta=s>0;
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">↪️ Pasar saldo a la próxima semana</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:14px">'+esc(emp.nombre)+'</div>'
    +'<div style="background:var(--bg);border:1px solid '+(esFalta?'#f5a62344':'#ef444444')+';border-radius:10px;padding:12px;margin-bottom:12px;text-align:center">'
      +'<div style="color:var(--muted);font-size:11px">'+(esFalta?'Le quedas debiendo':'Se pagó de más')+'</div>'
      +'<div style="color:'+(esFalta?'#f5a623':'#ef4444')+';font-weight:900;font-size:22px">'+fmt(Math.abs(s))+'</div></div>'
    +'<div style="background:#c9b8f012;border:1px solid #c9b8f033;border-radius:9px;padding:10px 12px;margin-bottom:14px;font-size:12px;color:var(--text);line-height:1.5">'
      +'Esta semana quedará <b>cerrada en $0</b> y '+(esFalta?'se <b>sumarán</b> '+fmt(s)+' al pago de la semana del '+nextRango+'.':'se <b>descontarán</b> '+fmt(Math.abs(s))+' del pago de la semana del '+nextRango+'.')
    +'</div>'
    +'<button class="btn btn-full" onclick="confirmarPasarSaldo(\''+empId+'\',\''+semKey+'\')" style="background:#c9b8f0;color:#1a1228;font-weight:800">✓ Pasar a la próxima semana</button>');
}
function confirmarPasarSaldo(empId,semKey){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  var c=calcSaldoSemana(empId,semKey);
  var s=c.saldo;
  if(s===0){closeModal1();return;}
  var next=_semKeyMas(semKey,1);
  var ts=a52Ahora();
  // Cierra esta semana en 0
  var m1={id:'me'+ts,ts:ts,empId:empId,tipo:'ajuste',valor:-s,fp:'',nota:(s>0?'Saldo pasado a semana siguiente':'Adelanto pasado a semana siguiente'),semanaKey:semKey,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  // Lo traslada a la próxima
  var m2={id:'me'+(ts+1),ts:ts+1,empId:empId,tipo:'ajuste',valor:s,fp:'',nota:(s>0?'Saldo traído de semana anterior':'Adelanto traído de semana anterior'),semanaKey:next,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  movEmpleados.push(m1);movEmpleados.push(m2);
  var r=ref('movEmpleados');if(r){r.push(m1);r.push(m2);}else guardarMovs();
  closeModal1();
  showToast('↪️ Saldo pasado a la próxima semana<br><span style="font-size:12px;opacity:.85">'+esc(emp.nombre)+' · '+fmt(Math.abs(s))+'</span>','#c9b8f0');
  render();
}

function abrirMovEmpleado(empId,tipo){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  var titulos={prestamo:'💸 Préstamo a',abono:'✅ Abono de',salario:'💰 Pago salario a',otro:'📌 Otro movimiento'};
  var fpOpts=FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">'+(titulos[tipo]||tipo)+'</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:14px">'+esc(emp.nombre)+'</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor (COP) *</div>'
    +'<input class="inp money" id="mov-valor" type="text" placeholder="0" inputmode="numeric"/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Forma de pago</div>'
    +'<select class="inp" id="mov-fp">'+fpOpts+'</select></div>'
    +(tipo==='otro'?'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Concepto</div><input class="inp" id="mov-nota" placeholder="Ej: Bono, descuento..."/></div>':'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nota (opcional)</div><input class="inp" id="mov-nota" placeholder=""/></div>')
    +'<button class="btn btn-green btn-full" onclick="guardarMovEmpleado(\''+empId+'\',\''+tipo+'\')">Guardar</button>');
}

function guardarMovEmpleado(empId,tipo){
  var emp=empleados.find(function(e){return e.id===empId;});
  if(!emp)return;
  var valor=moneyVal('mov-valor')||0;
  var fp=(document.getElementById('mov-fp')||{}).value||'efectivo';
  var nota=((document.getElementById('mov-nota')||{}).value||'').trim();
  if(!valor||valor<=0){alert('Escribe el valor.');return;}
  var conGasto=(tipo==='prestamo'||tipo==='salario'||tipo==='otro');
  var mov={id:'me'+a52Ahora(),ts:a52Ahora(),empId:empId,tipo:tipo,valor:valor,fp:fp,nota:nota,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  if(conGasto)mov.gastoId='g'+a52Ahora();
  movEmpleados.push(mov);
  var r=ref('movEmpleados');if(r)r.push(mov);else guardarMovs();

  // Préstamo, salario y otro = gasto automático (sale dinero). Abono NO (entra dinero). 🔗 Enlazado al movimiento.
  if(conGasto){
    var conceptos={prestamo:'Préstamo a '+emp.nombre,salario:'Salario '+emp.nombre,otro:(nota||'Movimiento')+' - '+emp.nombre};
    var g={id:mov.gastoId,ts:a52Ahora(),concepto:conceptos[tipo],categoria:'Personal',valor:valor,notas:'Auto desde Empleados',fp:fp,empId:empId,movId:mov.id,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
    gastos.push(g);
    var rg=ref('gastos');if(rg)rg.push(g);else fbSet('gastos',gastos);
  }

  closeModal1();
  var msgs={prestamo:'💸 Préstamo registrado',abono:'✅ Abono registrado',salario:'💰 Salario pagado',otro:'📌 Movimiento registrado'};
  showToast((msgs[tipo]||'Guardado')+'<br><span style="font-size:12px;opacity:.85">'+esc(emp.nombre)+' · '+fmt(valor)+'</span>',tipo==='abono'?'#22c55e':'#ef4444');
  render();
}

/* 🔗 Gasto de caja ⇄ movimiento del empleado: se crean juntos y se borran juntos.
   Los registros viejos no traen el enlace: se emparejan por empleado, valor y hora (mismos 5 segundos). */
function gastoDeMov(m){
  if(!m)return null;
  if(m.gastoId){var g=gastos.find(function(x){return x.id===m.gastoId;});if(g)return g;}
  if(m.tipo==='abono'||m.tipo==='ajuste')return null;
  return gastos.find(function(x){return x.movId===m.id})||gastos.find(function(x){return x.categoria==='Personal'&&x.empId===m.empId&&(x.valor||0)===(m.valor||0)&&Math.abs((x.ts||0)-(m.ts||0))<5000;})||null;
}
function movDeGasto(g){
  if(!g)return null;
  if(g.movId){var m=movEmpleados.find(function(x){return x.id===g.movId;});if(m)return m;}
  if(g.categoria!=='Personal'||!g.empId)return null;
  return movEmpleados.find(function(x){return x.gastoId===g.id;})||movEmpleados.find(function(x){return x.empId===g.empId&&x.tipo!=='abono'&&x.tipo!=='ajuste'&&(x.valor||0)===(g.valor||0)&&Math.abs((x.ts||0)-(g.ts||0))<5000;})||null;
}
// La lista completa se guarda como objeto por id (no como lista numerada): así los nuevos movimientos se agregan sin pisar nada
function guardarMovs(){var mo={};movEmpleados.forEach(function(m){if(m&&m.id)mo[m.id]=m;});fbSet('movEmpleados',Object.keys(mo).length?mo:null);}
function borrarMovEmpleado(movId){
  var m=movEmpleados.find(function(x){return x.id===movId;});if(!m)return;
  var g=gastoDeMov(m);
  if(!confirm('¿Eliminar este movimiento de '+fmt(m.valor||0).replace(/\u00A0/g,' ')+'?'+(g?'\n\nTambién se elimina el gasto de caja «'+g.concepto+'» para que el cierre no muestre esa salida.':'')))return;
  movEmpleados=movEmpleados.filter(function(x){return x.id!==movId;});
  guardarMovs();
  if(g){gastos=gastos.filter(function(x){return x.id!==g.id;});var go={};gastos.forEach(function(x){go[x.id]=x;});fbSet('gastos',go);}
  showToast(g?'🗑️ Movimiento y gasto de caja eliminados':'🗑️ Movimiento eliminado','#ef4444');
  render();
}

function renderSocios(){
  var totalAcum=consumoSocios.reduce(function(a,c){return a+c.total;},0);
  var totSoc={};SOCIOS.forEach(function(x){totSoc[x.id]=socTotal(x.id);});
  var esAdmin=usuarioActivo&&usuarioActivo.rol==='admin';
  var socioActivo=_socioActivo||socDef();

  // Carta por categorias
  // Categorías reales (sin 'Todos'); cada una es un acordeón
  var catsReales=menu.reduce(function(a,m){if(a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
  // 🪣 Cubetazos mixtos del socio (nacional e importado, con 10% socio)
  var _precioMiticaSoc=(function(){
    var mejor=null,esPr=false;
    menu.forEach(function(m){
      var n=_normTxt(m.nombre||'');
      if(!CUBE_MITICA_NOMBRES.some(function(x){return n.indexOf(x)>=0;}))return;
      var pr=promoVigente(m.id,'cubeta');
      var v=pr?pr.valor:(m.cubeta||CUBE_MIX_PRECIO);
      if(mejor===null||v<mejor){mejor=v;esPr=!!pr;}
    });
    return {precio:mejor||CUBE_MIX_PRECIO,esPromo:esPr};
  })();
  var mixBtns='<div style="display:flex;gap:6px;margin-bottom:8px">'
    +'<button data-act="soc-mix" data-tipo="nac" style="flex:1;background:#22c55e14;color:#22c55e;border:1px solid #22c55e44;border-radius:10px;padding:9px 2px;font-size:11px;font-weight:900;cursor:pointer">🪣 NACIONAL<br><span style="font-size:10px;opacity:.8">'+fmt(Math.round(CUBE_NAC_PRECIO*0.9))+'</span></button>'
    +'<button data-act="soc-mix" data-tipo="imp" style="flex:1;background:#38bdf814;color:#38bdf8;border:1px solid #38bdf844;border-radius:10px;padding:9px 2px;font-size:11px;font-weight:900;cursor:pointer">🪣 IMPORTADO<br><span style="font-size:10px;opacity:.8">'+fmt(Math.round(CUBE_MIX_PRECIO*0.9))+'</span></button>'
    +'<button data-act="soc-mix" data-tipo="mitica" style="flex:1;background:#a855f714;color:#a855f7;border:1px solid #a855f744;border-radius:10px;padding:9px 2px;font-size:11px;font-weight:900;cursor:pointer">🪣 MÍTICA'+(_precioMiticaSoc.esPromo?' 🏷️':'')+'<br><span style="font-size:10px;opacity:.8">'+fmt(Math.round(_precioMiticaSoc.precio*0.9))+'</span></button>'
  +'</div>';

  // 🔍 Buscador (como en las mesas): sin re-render al escribir
  var socBusq=(window._socBusq||'').trim();
  var busqBox='<input class="inp" id="soc-busq" placeholder="🔍 Buscar producto (ej: aguila, margarita...)" value="'+esc(window._socBusq||'')+'" oninput="_socBuscar(this.value)" style="margin-bottom:8px"/>';

  // Acordeón: Combos + cada categoría
  var acordeon='';
  // Combos
  if(combos.length){
    var combosOpen=(_socCatFiltro==='🎁 Combos');
    acordeon+='<div style="margin-bottom:6px"><button data-act="soc-cat" data-cat="🎁 Combos" style="width:100%;text-align:left;background:var(--card);border:1px solid '+(combosOpen?'var(--gold)':'var(--border)')+';border-radius:10px;padding:11px 14px;font-weight:700;font-size:13px;color:'+(combosOpen?'var(--gold)':'var(--text)')+';cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
      +'<span>🎁 Combos</span><span style="font-size:11px;color:var(--muted)">'+combos.length+' '+(combosOpen?'▲':'▼')+'</span></button>';
    if(combosOpen){
      acordeon+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'+combos.map(function(cb){
        var psCb=Math.round(cb.precio*0.9);
        return'<div data-act="soc-add-combo" data-cbid="'+cb.id+'" style="background:var(--bg);border:1px solid var(--gold)33;border-radius:10px;padding:8px 10px;cursor:pointer;display:flex;align-items:center;gap:8px">'
          +'<span style="font-size:20px">'+cb.emoji+'</span>'
          +'<div style="flex:1"><div style="font-size:12px;font-weight:700">'+esc(cb.nombre)+'</div>'
          +'<div style="color:#22c55e;font-size:11px;font-weight:700">'+fmt(psCb)+'</div></div>'
          +'<div style="background:var(--gold)18;color:var(--gold);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900">+</div>'
        +'</div>';
      }).join('')+'</div>';
    }
    acordeon+='</div>';
  }
  // Cada categoría
  catsReales.forEach(function(cat){
    var prods=menu.filter(function(m){return m.cat===cat;});
    if(!prods.length)return;
    var abierta=(_socCatFiltro===cat);
    acordeon+='<div style="margin-bottom:6px"><button data-act="soc-cat" data-cat="'+esc(cat)+'" style="width:100%;text-align:left;background:var(--card);border:1px solid '+(abierta?'var(--accent)':'var(--border)')+';border-radius:10px;padding:11px 14px;font-weight:700;font-size:13px;color:'+(abierta?'var(--accent)':'var(--text)')+';cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
      +'<span>'+esc(cat)+'</span><span style="font-size:11px;color:var(--muted)">'+prods.length+' '+(abierta?'▲':'▼')+'</span></button>';
    if(abierta){
      // Agrupado por subcategoría, como la carta de las mesas
      var subMap={};
      prods.forEach(function(p){var sc=(p.subcat||'').trim()||'_sin';if(!subMap[sc])subMap[sc]=[];subMap[sc].push(p);});
      var subKeys=Object.keys(subMap).sort(function(a,b){if(a==='_sin')return 1;if(b==='_sin')return -1;return a.localeCompare(b);});
      acordeon+='<div style="margin-top:8px">'+subKeys.map(function(sc){
        var lista=subMap[sc].slice().sort(function(a,b){return (a.nombre||'').localeCompare(b.nombre||'');});
        return (sc!=='_sin'&&subKeys.length>1?'<div style="color:var(--muted);font-size:10.5px;font-weight:800;letter-spacing:.6px;margin:7px 0 5px;text-transform:uppercase">'+esc(sc)+'</div>':'')
          +'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">'+lista.map(_cardProdSoc).join('')+'</div>';
      }).join('')+'</div>';
    }
    acordeon+='</div>';
  });

  // History — SOLO del socio seleccionado
  var consumosSocio=consumoSocios.filter(function(c){return c.socio===socioActivo;});
  // Resumen AGRUPADO por producto del socio activo
  var agrup={};
  consumosSocio.forEach(function(c){
    (c.items?(Array.isArray(c.items)?c.items:Object.values(c.items)):[]).forEach(function(it){
      var k=(it.nombre||'?');
      if(!agrup[k])agrup[k]={nombre:k,emoji:it.emoji||'',qty:0,total:0};
      agrup[k].qty+=(it.qty||0);
      agrup[k].total+=(it.precioSocio||0)*(it.qty||0);
    });
  });
  var agrupArr=Object.values(agrup).sort(function(a,b){return b.qty-a.qty;});
  var colorSoc=socColor(socioActivo);
  var resumenAgrupado=agrupArr.length?'<div style="background:var(--bg);border:1px solid '+colorSoc+'44;border-radius:10px;padding:10px 12px;margin-bottom:10px">'
    +'<div style="color:'+colorSoc+';font-weight:700;font-size:12px;margin-bottom:8px">📦 Resumen de '+socioActivo+' (agrupado)</div>'
    +agrupArr.map(function(a){return'<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);font-size:12px"><span>'+(a.emoji||'')+' '+esc(a.nombre)+' <b style="color:'+colorSoc+'">×'+a.qty+'</b></span><span style="color:var(--gold);font-weight:700">'+fmt(a.total)+'</span></div>';}).join('')
    +'</div>':'';

  // Detalle cronológico SOLO del socio activo
  var histRows=consumosSocio.slice().reverse().map(function(c){
    var itemsHtml=c.items?(Array.isArray(c.items)?c.items:Object.values(c.items)).map(function(it){
      return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:1px 0">'
        +'<span>'+(it.emoji||'')+' '+esc(it.nombre||'?')+' ×'+it.qty+'</span>'
        +'<span>'+fmt((it.precioSocio||0)*it.qty)+'</span></div>';
    }).join(''):'';
    var colorSocio=socColor(c.socio);
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start">'
        +'<div><div style="font-weight:700;font-size:13px;color:'+colorSocio+'">'+esc(c.socio||'Socio')+'</div>'
        +'<div style="color:var(--muted);font-size:11px">'+fmtDT(c.ts)+(c.uidNombre?' · ✍️ '+esc(c.uidNombre):'')+'</div></div>'
        +'<div style="display:flex;align-items:center;gap:8px">'
          +'<span style="color:var(--gold);font-weight:900;font-size:15px">'+fmt(c.total)+'</span>'
          +(esAdmin?'<button data-act="delsocio" data-sid="'+c.id+'" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer">✕</button>':'')
        +'</div>'
      +'</div>'
      +(itemsHtml?'<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border)">'+itemsHtml+'</div>':'')
      +'</div>';
  }).join('')||'<div style="color:var(--muted);text-align:center;padding:20px">'+socioActivo+' no tiene consumos registrados</div>';

  return'<div>'
    // KPIs socios
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">'
      +'<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">'
        +'<div style="color:var(--muted);font-size:10px;font-weight:700">TOTAL</div>'
        +'<div style="color:var(--gold);font-weight:900;font-size:16px">'+fmt(totalAcum)+'</div>'
      +'</div>'
      +SOCIOS.map(function(x){var col=socColor(x.id);
        return'<div style="background:var(--card);border:2px solid '+col+'44;border-radius:12px;padding:10px;text-align:center">'
          +'<div style="color:'+col+';font-size:10px;font-weight:700">'+esc(x.id)+'</div>'
          +'<div style="color:'+col+';font-weight:900;font-size:16px">'+fmt(totSoc[x.id])+'</div>'
        +'</div>';}).join('')
    +'</div>'
    // Socio selector
    +'<div style="display:flex;gap:8px;margin-bottom:12px">'
      +SOCIOS.map(function(x){var on=socioActivo===x.id,col=socColor(x.id);
        return'<button data-act="sel-socio" data-socio="'+esc(x.id)+'" style="flex:1;background:'+(on?col:'var(--card)')+';color:'+(on?socTxt(x.id):'var(--muted)')+';border:2px solid '+(on?col:'var(--border)')+';border-radius:10px;padding:10px;font-weight:800;font-size:14px;cursor:pointer">👤 '+esc(x.id)+'</button>';}).join('')
    +'</div>'
    // Botón para mostrar/ocultar la lista de productos (minimizada por defecto)
    +'<button data-act="toggle-sec" data-sec="socProds" style="width:100%;text-align:left;background:'+(socColor(socioActivo)+'18')+';border:1px solid '+(socColor(socioActivo)+'44')+';border-radius:10px;padding:11px 14px;margin-bottom:10px;font-weight:800;font-size:13px;color:'+(socColor(socioActivo))+';cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
      +'<span>➕ Anotar consumo a '+socioActivo+'</span><span style="font-size:12px">'+(_secOpen.socProds?'▲ ocultar':'▼ abrir')+'</span>'
    +'</button>'
    +(_secOpen.socProds?'<div style="margin-bottom:14px">'
      // Banner fijo: a quién se le está anotando (para que el cajero no se confunda)
      +'<div style="position:sticky;top:0;z-index:6;background:'+(socColor(socioActivo))+';color:'+socTxt(socioActivo)+';border-radius:10px;padding:10px 14px;margin-bottom:10px;text-align:center;font-weight:900;font-size:15px;box-shadow:0 4px 14px rgba(0,0,0,.35);letter-spacing:.5px">✍️ ANOTANDO A: '+socioActivo+'</div>'
      +'<div style="display:flex;gap:8px;margin-bottom:10px">'
        +'<button onclick="abrirRetiroSocio()" style="flex:1;background:#22c55e18;color:#22c55e;border:1px solid #22c55e44;border-radius:10px;padding:11px;font-weight:800;font-size:12px;cursor:pointer">💵 Retiro de dinero</button>'
        +'<button onclick="abrirOtroSocio()" style="flex:1;background:#f5a62318;color:#f5a623;border:1px solid #f5a62344;border-radius:10px;padding:11px;font-weight:800;font-size:12px;cursor:pointer">📝 Otro (fuera de carta)</button>'
      +'</div>'
      +busqBox+mixBtns+'<div id="soc-res">'+(socBusq?_socResHTML():'')+'</div>'+'<div id="soc-acordeon" style="'+(socBusq?'display:none':'')+'">'+acordeon+'</div>'
    +'</div>':'')
    // History del socio activo
    +'<div style="color:var(--muted);font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:8px">📋 CONSUMOS DE '+socioActivo+'</div>'
    +resumenAgrupado
    +'<div style="color:var(--muted);font-size:10px;font-weight:700;letter-spacing:1px;margin:10px 0 8px">DETALLE POR PEDIDO</div>'
    +histRows
    // ── LIQUIDAR / CERRAR (al final para no confundir con el selector) ──
    +(esAdmin&&SOCIOS.some(function(x){return totSoc[x.id]>0;})
      ?'<div style="background:var(--card2);border-radius:10px;padding:10px 12px;margin:18px 0 10px;border-top:2px solid var(--border)">'
        +'<div style="color:var(--muted);font-size:11px;font-weight:700;margin-bottom:8px">💵 Liquidar cuenta de socio (vuelve a 0)</div>'
        +'<div style="display:flex;gap:8px">'
        +SOCIOS.map(function(x){var col=socColor(x.id);
          return totSoc[x.id]>0?'<button onclick="liquidarSocio(\''+esc(x.id)+'\')" style="flex:1;background:'+col+'18;color:'+col+';border:1px solid '+col+'44;border-radius:8px;padding:9px;font-weight:700;font-size:12px;cursor:pointer">'+esc(socNom(x.id))+' · '+fmt(totSoc[x.id])+'</button>':'';}).join('')
        +'</div></div>'
      :'')
    +(esAdmin&&totalAcum>0
      ?'<div style="background:#ef444418;border:1px solid #ef444433;border-radius:10px;padding:10px 12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">'
        +'<div><div style="color:#ef4444;font-weight:700;font-size:13px">🔒 Cerrar todo ('+SOCIOS.map(function(x){return esc(socNom(x.id));}).join(' + ')+')</div>'
        +'<div style="color:var(--muted);font-size:11px">Total: '+fmt(totalAcum)+'</div></div>'
        +'<button onclick="cerrarConsumoSocios()" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:700;font-size:13px;cursor:pointer">Cerrar todo</button>'
      +'</div>'
      :'')
    +'</div>';
}


function showToast(msg,color,dur){
  var t=document.getElementById('app-toast');
  if(!t){
    t=document.createElement('div');
    t.id='app-toast';
    t.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-80px);background:#1a1a22;border:2px solid '+(color||'#22c55e')+';color:#fff;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.5);transition:transform .3s cubic-bezier(.16,1,.3,1);opacity:0;max-width:90vw;text-align:center';
    document.body.appendChild(t);
  }
  t.style.borderColor=color||'#22c55e';
  t.innerHTML=msg;
  t.style.transform='translateX(-50%) translateY(0)';
  t.style.opacity='1';
  clearTimeout(t._timer);
  t._timer=setTimeout(function(){
    t.style.transform='translateX(-50%) translateY(-80px)';
    t.style.opacity='0';
  },dur||1800);
}

function _cardProdSoc(p){
  var ps=Math.round(p.precio*0.9);
  var psCub=p.esCerveza&&p.cubeta?Math.round((p.cubeta||p.precio*5)*0.9):0;
  return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px 10px">'
    +'<div style="display:flex;align-items:center;gap:8px'+(p.esCerveza&&p.cubeta?';margin-bottom:6px':'')+'">'
      +'<span style="font-size:20px">'+p.emoji+'</span>'
      +'<div style="flex:1"><div style="font-size:12px;font-weight:700">'+esc(p.nombre)+'</div>'
      +'<div style="color:#22c55e;font-size:11px;font-weight:700">'+fmt(ps)+'</div></div>'
      +'<button data-act="soc-add" data-pid="'+p.id+'" data-cub="false" style="background:var(--accent)18;color:var(--accent);border:none;border-radius:7px;padding:4px 10px;font-size:14px;font-weight:900;cursor:pointer">+</button>'
    +'</div>'
    +(p.esCerveza&&p.cubeta
      ?'<button data-act="soc-add" data-pid="'+p.id+'" data-cub="true" style="width:100%;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:7px;padding:4px;font-size:11px;font-weight:700;cursor:pointer">🪣 Cubetazo ×5 — '+fmt(psCub)+'</button>'
      :'')
    +'</div>';
  }
function _socResHTML(){
  var qtxt=(window._socBusq||'').trim();
  if(!qtxt)return null;
  var q=_normTxt(qtxt);
  var matches=menu.filter(function(m){
    return _normTxt(m.nombre).indexOf(q)>=0||_normTxt(m.cat).indexOf(q)>=0||_normTxt(m.subcat||'').indexOf(q)>=0;
  }).filter(a52Vendible).slice(0,30);
  return '<div style="margin-bottom:10px">'
    +'<div style="color:var(--accent);font-size:11px;font-weight:800;margin-bottom:6px">\ud83d\udd0d '+matches.length+' RESULTADO'+(matches.length!==1?'S':'')+'</div>'
    +(matches.length?'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">'+matches.map(_cardProdSoc).join('')+'</div>'
      :'<div style="color:var(--muted);font-size:12px;text-align:center;padding:12px;background:var(--card2);border-radius:10px">Sin coincidencias</div>')
  +'</div>';
}
function _socBuscar(v){
  window._socBusq=v;
  var res=document.getElementById('soc-res');
  var aco=document.getElementById('soc-acordeon');
  var h=_socResHTML();
  if(res&&aco){
    res.innerHTML=h||'';
    aco.style.display=h?'none':'';
    return;
  }
  render();
}
function abrirMixtoSocio(tipo){
  // 🪣 Cubetazo para el socio: nacional, importado o Mítica — con 10% de socio
  var esNac=(tipo==='nac'),esMitica=(tipo==='mitica');
  var nombres=esMitica?CUBE_MITICA_NOMBRES:(esNac?CUBE_NAC_NOMBRES:CUBE_MIX_NOMBRES);
  var subcat=esMitica?'':(esNac?CUBE_NAC_SUBCAT:CUBE_MIX_SUBCAT);
  var precioLista=esNac?CUBE_NAC_PRECIO:CUBE_MIX_PRECIO;
  var etiqueta='Cubetazo mixto '+(esMitica?'Mítica':(esNac?'nacional':'importado'));
  if(esMitica){
    // Igual que en las mesas: promo de cubeta vigente si existe, o el precio de cubeta de Mítica
    var mejor=null,esPr=false;
    menu.forEach(function(m){
      var n=_normTxt(m.nombre||'');
      if(!CUBE_MITICA_NOMBRES.some(function(x){return n.indexOf(x)>=0;}))return;
      var pr=promoVigente(m.id,'cubeta');
      var v=pr?pr.valor:(m.cubeta||CUBE_MIX_PRECIO);
      if(mejor===null||v<mejor){mejor=v;esPr=!!pr;}
    });
    precioLista=mejor||CUBE_MIX_PRECIO;
    if(esPr)etiqueta+=' 🏷️';
  }
  var precioSocio=Math.round(precioLista*0.9);
  var cervezas=menu.filter(function(m){
    var match;
    if(subcat){match=(m.subcat===subcat);}
    else{var n=_normTxt(m.nombre||'');match=nombres.some(function(x){return n.indexOf(x)>=0;});}
    return match&&(ventaSinStock||m.stock>0);
  });
  if(!cervezas.length){alert('No hay cervezas disponibles para este cubetazo.');return;}
  abrirDistribucion({
    titulo:'🪣 '+etiqueta+' para '+_socioActivo+' · '+fmt(precioSocio).replace(/\u00A0/g,' ')+' (elige '+CUBE_MIX_TAM+')',
    emoji:'🪣',
    total:CUBE_MIX_TAM,
    productos:cervezas.map(function(p){return {id:p.id,nombre:p.nombre,emoji:p.emoji,precio:Math.round(precioSocio/CUBE_MIX_TAM),stock:p.stock};}),
    onConfirm:function(cantidades){confirmarMixtoSocio(cantidades,precioLista,precioSocio,etiqueta);}
  });
}
function confirmarMixtoSocio(cantidades,precioLista,precioSocio,etiqueta){
  var detalle=[],stockDetalle=[],txt=[];
  Object.keys(cantidades).forEach(function(pid){
    var q=cantidades[pid];if(!q)return;
    var p=menu.find(function(m){return Number(m.id)===Number(pid);});
    if(!p)return;
    detalle.push({prodId:p.id,nombre:p.nombre,emoji:p.emoji,cantidad:q});
    stockDetalle.push({t:'p',id:p.id,cant:q});
    txt.push(q+' '+p.nombre);
  });
  if(!detalle.length)return;
  var item={nombre:'🪣 '+etiqueta+' ('+txt.join(' · ')+')',emoji:'🪣',qty:1,esMixto:true,
    cubMixDetalle:detalle,precioBase:precioLista,precioLista:precioLista,precioSocio:precioSocio};
  var consumo={id:'soc_'+a52Ahora(),ts:a52Ahora(),socio:_socioActivo,items:[item],total:precioSocio,stockDetalle:stockDetalle,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoSocios.push(consumo);
  var r=ref('consumoSocios');if(r)r.push(consumo);else fbSet('consumoSocios',consumoSocios);
  aplicarStockDetalle(stockDetalle,-1,'Consumo socio '+_socioActivo+': '+etiqueta);
  var totalSocio=consumoSocios.filter(function(c){return c.socio===_socioActivo;}).reduce(function(a,c){return a+(c.total||0);},0);
  var colorS=socColor(_socioActivo);
  closeModal2();
  showToast('🪣 '+esc(etiqueta)+' → '+_socioActivo+'<br><span style="font-size:12px;opacity:.85">'+esc(txt.join(' · '))+' · 10% socio: '+fmt(precioSocio)+' · Total '+_socioActivo+': '+fmt(totalSocio)+'</span>',colorS);
  render();
}
function abrirCantidadSocio(pid,esCubeta){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  var precioBase=esCubeta?(p.cubeta||p.precio*5):p.precio;
  var precioSocio=Math.round(precioBase*0.9);
  var btns=[1,2,3,4,5,6,8,10,12].map(function(q){
    return'<button data-act="soc-qty" data-pid="'+pid+'" data-cub="'+esCubeta+'" data-qty="'+q+'" '
      +'style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 0;'
      +'font-size:20px;font-weight:900;color:var(--accent);cursor:pointer">'+q+'</button>';
  }).join('');
  var socC=socColor(_socioActivo);
  modal2('<div style="background:'+socC+';color:'+socTxt(_socioActivo)+';border-radius:10px;padding:8px;text-align:center;font-weight:900;font-size:14px;margin-bottom:12px;letter-spacing:.5px">✍️ Para: '+_socioActivo+'</div>'
    +'<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:30px">'+(esCubeta?'🪣':p.emoji)+'</div>'
    +'<div style="font-weight:800;font-size:16px;margin-top:4px">'+(esCubeta?'Cubetazo ':'')+esc(p.nombre)+'</div>'
    +'<div style="color:#22c55e;font-weight:700;font-size:14px;margin-top:2px">'+fmt(precioSocio)+' c/u</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">¿Cuántas unidades?</div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'+btns+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:12px;align-items:center">'
      +'<input id="qty-libre-soc" type="number" inputmode="numeric" min="1" placeholder="Otra cantidad..." style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px;font-size:16px;text-align:center" onkeydown="if(event.key===\'Enter\')confirmarQtyLibreSocio('+pid+','+!!esCubeta+')"/>'
      +'<button onclick="confirmarQtyLibreSocio('+pid+','+!!esCubeta+')" style="background:#22c55e;color:#fff;border:none;border-radius:10px;padding:12px 18px;font-weight:800;font-size:15px;cursor:pointer">✓</button>'
    +'</div>');
}

function confirmarQtyLibreSocio(pid,esCubeta){
  var q=parseInt((document.getElementById('qty-libre-soc')||{}).value)||0;
  if(q<=0)return;
  closeModal2();
  agregarConsumoSocio(pid,!!esCubeta,q);
}

function agregarConsumoSocio(pid,esCubeta,cantidad){
  var p=menu.find(function(m){return m.id===pid;});
  if(!p)return;
  var qty=cantidad||1;
  var precioLista=esCubeta?(p.cubeta||p.precio*5):p.precio;
  // 🏷️ Si el producto está en promoción vigente, el socio parte del precio de promo
  var prS=promoVigente(p.id,esCubeta?'cubeta':'unidad');
  var precioBase=prS?prS.valor:precioLista;
  var precioSocio=Math.round(precioBase*0.9);   // y encima el 10% de descuento de socio
  var nombre=(esCubeta?'🪣 Cubetazo ':'')+''+p.nombre+(prS?' 🏷️':'');
  var item={pid:pid,qty:qty,cubeta:!!esCubeta,nombre:nombre,emoji:p.emoji,precioBase:precioBase,precioLista:precioLista,esPromo:!!prS,precioSocio:precioSocio};
  // Detalle de stock descontado (para poder devolverlo si se elimina el registro)
  var stockDetalle=[];
  var cantStock=esCubeta?qty*5:qty;
  stockDetalle.push({t:'p',id:p.id,cant:cantStock});
  if(p.receta&&p.receta.length){
    p.receta.forEach(function(ri){
      var enMenu=menu.some(function(m){return Number(m.id)===Number(ri.pid);});
      stockDetalle.push({t:enMenu?'p':'i',id:ri.pid,cant:ri.cantidad*qty});
    });
  }
  var consumo={id:'soc_'+a52Ahora(),ts:a52Ahora(),socio:_socioActivo,items:[item],total:precioSocio*qty,stockDetalle:stockDetalle,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoSocios.push(consumo);
  var r=ref('consumoSocios');
  if(r)r.push(consumo); else fbSet('consumoSocios',consumoSocios);
  // Descontar stock según el detalle
  aplicarStockDetalle(stockDetalle,-1,'Consumo socio '+_socioActivo+': '+nombre);
  var totalSocio=consumoSocios.filter(function(c){return c.socio===_socioActivo;}).reduce(function(a,c){return a+c.total;},0);
  var colorS=socColor(_socioActivo);
  showToast('✅ '+qty+'× '+p.emoji+' '+esc(nombre)+' → '+_socioActivo+'<br><span style="font-size:12px;opacity:.8">'+(prS?'🏷️ promo '+fmt(precioBase)+' + 10% socio = '+fmt(precioSocio)+' c/u · ':'10% socio: '+fmt(precioSocio)+' c/u · ')+'Total '+_socioActivo+': '+fmt(totalSocio)+'</span>',colorS);
  render();
}

// Aplica (signo -1 descuenta, +1 devuelve) un detalle de stock [{t:'p'|'i', id, cant}]
function aplicarStockDetalle(detalle,signo,motivo){
  (detalle||[]).forEach(function(d){
    if(!d||!d.cant)return;
    cambiarStock(d.t==='p'?'p':'i',d.id,d.cant*signo,motivo||(signo<0?'Consumo socio':'Devolución socio'));
  });
}

// Elimina un consumo de socio DEVOLVIENDO el stock al inventario
/* ═══ 💵 Retiro de dinero de un socio (sale de la caja) ═══ */
function abrirRetiroSocio(){
  var colorS=socColor(_socioActivo);
  var fpOpts=FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+' (disp: '+fmt(saldoActualFP(f.id)).replace(/\u00A0/g,' ')+')</option>';}).join('');
  modal2('<div style="background:'+colorS+';color:'+socTxt(_socioActivo)+';border-radius:10px;padding:8px;text-align:center;font-weight:900;font-size:14px;margin-bottom:12px">💵 Retiro de '+_socioActivo+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">El dinero sale de la caja y queda anotado en el consumo del socio.</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto</div>'
    +'<input class="inp money" id="rs-monto" type="text" inputmode="numeric" placeholder="Ej: 50.000" style="margin-bottom:10px"/>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿De qué medio sale?</div>'
    +'<select class="inp" id="rs-fp" style="margin-bottom:10px">'+fpOpts+'</select>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nota (opcional)</div>'
    +'<input class="inp" id="rs-nota" placeholder="Ej: para el mercado" style="margin-bottom:14px"/>'
    +'<button class="btn btn-green btn-full" onclick="confirmarRetiroSocio()">💵 Registrar retiro</button>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function confirmarRetiroSocio(){
  var monto=moneyVal('rs-monto')||0;
  if(monto<=0){alert('Escribe el monto.');return;}
  var fp=(document.getElementById('rs-fp')||{}).value||'efectivo';
  var disp=saldoActualFP(fp);
  if(monto>disp){alert('Saldo insuficiente en ese medio (disponible: '+fmt(disp).replace(/\u00A0/g,' ')+').');return;}
  var nota=((document.getElementById('rs-nota')||{}).value||'').trim();
  var f=FPAGO.find(function(x){return x.id===fp;});
  var consumo={id:'soc_'+a52Ahora(),ts:a52Ahora(),socio:_socioActivo,
    items:[{nombre:'💵 Retiro en '+(f?f.label:fp)+(nota?' — '+nota:''),emoji:'💵',qty:1,precioBase:monto,precioSocio:monto}],
    total:monto,esRetiro:true,fp:fp,stockDetalle:[],uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoSocios.push(consumo);
  var r=ref('consumoSocios');
  if(r)r.push(consumo);else fbSet('consumoSocios',consumoSocios);
  cajaHoy['ini_'+fp]=(cajaHoy['ini_'+fp]||0)-monto;
  fbSet('cajaHoy',cajaHoy);
  closeModal2();
  showToast('💵 Retiro de '+esc(_socioActivo)+': '+fmt(monto)+'<br><span style="font-size:12px;opacity:.85">Salió de '+(f?f.emoji+' '+f.label:fp)+' · anotado en su consumo</span>','#22c55e');
  render();
}
/* ═══ 📝 Consumo fuera de carta ═══ */
function abrirOtroSocio(){
  var colorS=socColor(_socioActivo);
  modal2('<div style="background:'+colorS+';color:'+socTxt(_socioActivo)+';border-radius:10px;padding:8px;text-align:center;font-weight:900;font-size:14px;margin-bottom:12px">📝 Otro consumo · '+_socioActivo+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Para productos o cosas que no están en la carta. No toca el inventario ni la caja: solo queda anotado al socio.</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Qué fue?</div>'
    +'<input class="inp" id="os-nombre" placeholder="Ej: Botella traída por encargo" style="margin-bottom:10px"/>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor</div>'
    +'<input class="inp money" id="os-valor" type="text" inputmode="numeric" placeholder="Ej: 80.000" style="margin-bottom:14px"/>'
    +'<button class="btn btn-green btn-full" onclick="confirmarOtroSocio()">📝 Anotar</button>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function confirmarOtroSocio(){
  var nombre=((document.getElementById('os-nombre')||{}).value||'').trim();
  if(!nombre){alert('Escribe qué fue.');return;}
  var valor=moneyVal('os-valor')||0;
  if(valor<=0){alert('Escribe el valor.');return;}
  var consumo={id:'soc_'+a52Ahora(),ts:a52Ahora(),socio:_socioActivo,
    items:[{nombre:'📝 '+nombre,emoji:'📝',qty:1,precioBase:valor,precioSocio:valor}],
    total:valor,esOtro:true,stockDetalle:[],uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoSocios.push(consumo);
  var r=ref('consumoSocios');
  if(r)r.push(consumo);else fbSet('consumoSocios',consumoSocios);
  closeModal2();
  showToast('📝 Anotado a '+esc(_socioActivo)+': '+esc(nombre)+' · '+fmt(valor),'#f5a623');
  render();
}

function eliminarConsumoSocio(sid){
  var c=consumoSocios.find(function(x){return x.id===sid;});
  if(!c)return;
  // 💵 Retiro de dinero: al eliminarlo, la plata vuelve a la caja
  if(c.esRetiro){
    if(!confirm('¿Eliminar este retiro de '+fmt(c.total).replace(/\u00A0/g,' ')+'? El dinero vuelve a la caja.'))return;
    cajaHoy['ini_'+(c.fp||'efectivo')]=(cajaHoy['ini_'+(c.fp||'efectivo')]||0)+(c.total||0);
    fbSet('cajaHoy',cajaHoy);
    consumoSocios=consumoSocios.filter(function(x){return x.id!==sid;});
    var rr=ref('consumoSocios');
    if(rr)rr.set(consumoSocios.length?consumoSocios:null);
    showToast('🗑️ Retiro eliminado · dinero de vuelta en la caja','#22c55e');
    render();return;
  }
  // 📝 Consumo fuera de carta o deuda asumida: no tocó inventario ni caja
  if(c.esOtro||c.esAsumido){
    if(!confirm('¿Eliminar este registro?'))return;
    consumoSocios=consumoSocios.filter(function(x){return x.id!==sid;});
    var ro=ref('consumoSocios');
    if(ro)ro.set(consumoSocios.length?consumoSocios:null);
    showToast('🗑️ Registro eliminado','#6b7280');
    render();return;
  }
  var detalle=c.stockDetalle;
  if(!detalle||!detalle.length){
    // Registro antiguo sin detalle: reconstruir desde los items (productos directos y cubetazos)
    detalle=[];
    var hayCombo=false;
    (c.items?(Array.isArray(c.items)?c.items:Object.values(c.items)):[]).forEach(function(it){
      if(String(it.pid).indexOf('combo_')===0){hayCombo=true;return;}
      var p=menu.find(function(m){return String(m.id)===String(it.pid);});
      if(!p)return;
      var cant=(it.qty||1)*(it.cubeta?5:1);
      detalle.push({t:'p',id:p.id,cant:cant});
      if(p.receta&&p.receta.length){
        p.receta.forEach(function(ri){
          var enMenu=menu.some(function(m){return Number(m.id)===Number(ri.pid);});
          detalle.push({t:enMenu?'p':'i',id:ri.pid,cant:ri.cantidad*(it.qty||1)});
        });
      }
    });
    if(hayCombo)showToast('⚠️ Este registro antiguo incluía un combo: sus ingredientes no se pudieron devolver automáticamente. Ajusta el inventario a mano si es necesario.','#f5a623',5000);
  }
  aplicarStockDetalle(detalle,+1,'Devolución: consumo socio eliminado');
  consumoSocios=consumoSocios.filter(function(x){return x.id!==sid;});
  var r=ref('consumoSocios');
  if(r)r.set(consumoSocios.length?consumoSocios:null);
  showToast('🗑️ Consumo eliminado · stock devuelto al inventario','#22c55e');
  render();
}

function agregarConsumoSocioCombo(cbId){
  var cb=combos.find(function(c){return String(c.id)===String(cbId);});
  if(!cb)return;
  // Si el combo tiene ingredientes por CATEGORÍA, pedir la elección (igual que en mesas)
  var catIngs=(cb.ingredientes||[]).filter(function(i){return i.tipo==='categoria';});
  if(catIngs.length>0){
    abrirSelectorComboSocio(cb,catIngs,0,[]);
    return;
  }
  confirmarComboSocio(cb,[]);
}

// Selector de productos para ingredientes tipo categoría (versión socios)
function abrirSelectorComboSocio(cb,catIngs,step,selecciones){
  if(step>=catIngs.length){
    confirmarComboSocio(cb,selecciones);
    return;
  }
  var ing=catIngs[step];
  var disponibles=menu.filter(function(p){return (p.cat===ing.cat||p.subcat===ing.cat)&&(ventaSinStock||p.stock>0);});
  if(disponibles.length===0){
    closeModal2();
    alert('No hay stock de '+ing.cat+' para este combo.');
    return;
  }
  abrirDistribucion({
    titulo:cb.nombre+' · elige '+ing.cantidad+' '+ing.cat,
    emoji:cb.emoji||'🎁',
    total:ing.cantidad,
    productos:disponibles.map(function(p){return {id:p.id,nombre:p.nombre,emoji:p.emoji,precio:p.precio,stock:p.stock};}),
    onConfirm:function(cantidades){
      selecciones.push({catIng:ing, distribucion:cantidades});
      abrirSelectorComboSocio(cb,catIngs,step+1,selecciones);
    }
  });
}

function confirmarComboSocio(cb,selecciones){
  // Resolver ingredientes finales (expandiendo elecciones de categoría)
  var finalIngs=[];var selIdx=0;
  (cb.ingredientes||[]).forEach(function(ing){
    if(ing.tipo==='categoria'){
      var sel=selecciones[selIdx++];
      if(sel&&sel.distribucion){
        Object.keys(sel.distribucion).forEach(function(pid){
          var q=sel.distribucion[pid];if(!q)return;
          var p=menu.find(function(m){return Number(m.id)===Number(pid);});
          finalIngs.push({tipo:'producto',prodId:Number(pid),cantidad:q,nombre:p?p.nombre:'?',emoji:p?p.emoji:'?'});
        });
      }
    } else {
      finalIngs.push(ing);
    }
  });
  // Validar stock (igual que en mesas)
  var ok=finalIngs.every(function(ing){
    if(ing.prodId==null)return true;
    var p=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});
    return p&&(ventaSinStock||(parseInt(p.stock)||0)>=(ing.cantidad||1));
  });
  if(!ok){alert('Stock insuficiente para alguno de los productos del combo.');return;}
  var precioSocio=Math.round(cb.precio*0.9);
  var ingDesc=finalIngs.map(function(ing){
    if(ing.prodId!=null){var p=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});return (p?p.emoji:'')+'×'+(ing.cantidad||1);}
    return '🧂×'+(ing.cantidad||1);
  }).join(' ');
  var item={pid:'combo_'+cb.id,qty:1,nombre:'🎁 '+cb.nombre+(ingDesc?' ('+ingDesc+')':''),emoji:cb.emoji,precioBase:cb.precio,precioSocio:precioSocio};
  // Detalle de stock para descontar Y poder devolver
  var stockDetalle=[];
  finalIngs.forEach(function(ing){
    var cant=ing.cantidad||1;
    if(ing.prodId!=null)stockDetalle.push({t:'p',id:ing.prodId,cant:cant});
    if(ing.ingId!=null)stockDetalle.push({t:'i',id:ing.ingId,cant:cant});
  });
  var consumo={id:'soc_'+a52Ahora(),ts:a52Ahora(),socio:_socioActivo,items:[item],total:precioSocio,stockDetalle:stockDetalle,comboId:cb.id,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoSocios.push(consumo);
  var r=ref('consumoSocios');
  if(r)r.push(consumo); else fbSet('consumoSocios',consumoSocios);
  // Descontar stock
  aplicarStockDetalle(stockDetalle,-1,'Consumo socio '+_socioActivo+': combo '+cb.nombre);
  var totalSocioC=consumoSocios.filter(function(c){return c.socio===_socioActivo;}).reduce(function(a,c){return a+c.total;},0);
  var colorSC=socColor(_socioActivo);
  showToast('✅ 🎁 '+esc(cb.nombre)+' → '+_socioActivo+'<br><span style="font-size:12px;opacity:.8">Total '+_socioActivo+': '+fmt(totalSocioC)+'</span>',colorSC);
  render();
}

function liquidarSocio(socio){
  var consumosSocio=consumoSocios.filter(function(c){return c.socio===socio;});
  var total=consumosSocio.reduce(function(a,c){return a+c.total;},0);
  if(total<=0){alert('Este socio no tiene consumos.');return;}
  if(!confirm('¿Liquidar la cuenta de '+socio+'? Total: '+fmt(total)+'.\n\nEsto registra el cierre de '+socio+' y vuelve su cuenta a 0. Los consumos del otro socio no se afectan.'))return;
  // Guardar registro del cierre de este socio
  var cierreSocio={id:'cs_'+a52Ahora(),ts:a52Ahora(),socio:socio,total:total,items:consumosSocio.length,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  var r=ref('cierresSocios');if(r)r.push(cierreSocio);
  // Quitar solo los consumos de este socio
  consumoSocios=consumoSocios.filter(function(c){return c.socio!==socio;});
  var co={};consumoSocios.forEach(function(c,i){co['c'+i]=c;});
  fbSet('consumoSocios',consumoSocios.length?co:null);
  showToast('✅ Cuenta de '+socio+' liquidada<br><span style="font-size:12px;opacity:.85">'+fmt(total)+' · vuelve a 0</span>',socColor(socio));
  render();
}

function cerrarConsumoSocios(){
  var total=consumoSocios.reduce(function(a,c){return a+c.total;},0);
  if(!confirm('¿Confirmas el cierre mensual de socios? Total: '+fmt(total)+'. Esto borrará todos los consumos.'))return;
  // Save cierre record
  var cierreSocios={id:'cs_'+a52Ahora(),ts:a52Ahora(),total:total,items:consumoSocios.length,uid:usuarioActivo.id};
  var r=ref('cierresSocios');
  if(r)r.push(cierreSocios);
  // Reset
  consumoSocios=[];
  var rs=ref('consumoSocios');
  if(rs)rs.set(null); else fbSet('consumoSocios',null);
  render();
  alert('Cierre mensual guardado. Total: '+fmt(total));
}


