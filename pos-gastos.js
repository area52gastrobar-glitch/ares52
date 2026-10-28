/* ═══════════════ GASTOS ═══════════════ */
var _SERV_DEF={
  agua:    {emoji:'💧',label:'Agua',    unidad:'m³', frecuencia:'bimestral'},
  luz:     {emoji:'⚡',label:'Luz',     unidad:'kWh',frecuencia:'mensual'},
  gas:     {emoji:'🔥',label:'Gas',     unidad:'m³', frecuencia:'mensual'},
  internet:{emoji:'🌐',label:'Internet',unidad:'',   frecuencia:'mensual'}
};
function _servSeed(k){
  // Recibos de arranque: solo si el negocio los trae en negocio.js (pos.serviciosSemilla)
  var s=((window.NEGOCIO||{}).pos||{}).serviciosSemilla;if(!s||!s[k])return;
  if(serviciosPublicos[k]&&serviciosPublicos[k].recibos&&Object.keys(serviciosPublicos[k].recibos).length){
    if(!serviciosPublicos[k].cuenta&&s[k].cuenta){serviciosPublicos[k].cuenta=s[k].cuenta;fbSet('serviciosPublicos/'+k+'/cuenta',s[k].cuenta);}
    return;
  }
  serviciosPublicos[k]=JSON.parse(JSON.stringify(s[k]));
  fbSet('serviciosPublicos/'+k,serviciosPublicos[k]);
}
function _servSeedAgua(){_servSeed('agua');}
function _servSeedGas(){_servSeed('gas');}
function _servSeedLuz(){_servSeed('luz');}
function _servSeedCuentas(){}
function abrirServiciosPublicos(){
  _servSeedAgua();
  _servSeedGas();
  _servSeedLuz();
  _servSeedCuentas();
  if(!window._servSel)window._servSel='agua';
  var sk=window._servSel;
  var def=_SERV_DEF[sk];
  var sv=serviciosPublicos[sk]||{};
  var chips=Object.keys(_SERV_DEF).map(function(k){
    var sel=k===sk;
    return'<button onclick="window._servSel=\''+k+'\';abrirServiciosPublicos()" style="flex:1;background:'+(sel?'#06b6d4':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'#06b6d4':'var(--border)')+';border-radius:9px;padding:9px 0;font-weight:900;font-size:12px;cursor:pointer">'+_SERV_DEF[k].emoji+' '+_SERV_DEF[k].label+'</button>';
  }).join('');
  var recibos=sv.recibos?Object.values(sv.recibos).sort(function(a,b){return b.ts-a.ts;}):[];
  var filas=recibos.map(function(r,i){
    var ant=recibos[i+1];
    var xU=r.consumo>0?Math.round(r.valor/r.consumo):null;
    var xUant=ant&&ant.consumo>0?Math.round(ant.valor/ant.consumo):null;
    var varTxt='';
    if(ant){
      var dv=r.valor-ant.valor;
      varTxt='<span style="color:'+(dv>0?'#ef4444':'#22c55e')+';font-weight:800;font-size:10px">'+(dv>0?'▲':'▼')+' '+fmt(Math.abs(dv))+' vs anterior</span>';
    }
    var xUvar='';
    if(xU!=null&&xUant!=null){
      var dU=xU-xUant;
      xUvar=' <span style="color:'+(dU>0?'#ef4444':'#22c55e')+';font-size:9.5px;font-weight:800">('+(dU>0?'+':'')+fmt(dU)+')</span>';
    }
    return'<div style="padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center">'
        +'<span style="font-size:12px;font-weight:800">'+esc(r.periodo||'')+'</span>'
        +'<span style="font-weight:900;color:var(--gold);font-size:14px">'+fmt(r.valor)+'</span>'
      +'</div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1px">'
        +'<span style="color:var(--muted);font-size:10px">'+(r.consumo?r.consumo+' '+def.unidad+' · <b style="color:#06b6d4">'+fmt(xU)+'/'+def.unidad+'</b>'+xUvar:'sin consumo')+(r.suspension?' · corte '+r.suspension.slice(5):'')+'</span>'
        +varTxt
      +'</div>'
      +(usuarioActivo&&usuarioActivo.rol==='admin'?'<div onclick="eliminarReciboServ(\''+sk+'\',\''+r.id+'\')" style="color:#ef4444;font-size:9.5px;cursor:pointer;margin-top:2px">✕ eliminar</div>':'')
    +'</div>';
  }).join('')||'<div style="color:var(--dim);text-align:center;padding:10px;font-size:12px">Sin recibos registrados</div>';
  var ult=recibos[0];
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:10px">🧾 Servicios públicos</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:12px">'+chips+'</div>'
    +(sv.cuenta?'<div onclick="copiarCuentaServ(\''+esc(String(sv.cuenta).replace(/'/g,''))+'\')" style="background:#06b6d412;border:1px solid #06b6d433;border-radius:10px;padding:8px 12px;margin-bottom:10px;cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
      +'<div><div style="color:var(--muted);font-size:9.5px;letter-spacing:.5px">💳 CUENTA / REFERENCIA DE PAGO</div>'
      +'<div style="font-size:15px;font-weight:900;color:#06b6d4;letter-spacing:.5px">'+esc(sv.cuenta)+'</div></div>'
      +'<span style="color:var(--muted);font-size:10px">📋 copiar</span>'
    +'</div>':'')
    +'<div style="background:var(--bg);border-radius:10px;padding:9px 12px;margin-bottom:10px">'
      +'<div style="font-size:11px;font-weight:800;color:#06b6d4;margin-bottom:6px">'+def.emoji+' '+def.label+' · configuración</div>'
      +'<div style="color:var(--muted);font-size:10px;margin-bottom:2px">Cuenta / referencia de pago</div>'
      +'<input class="inp inp-sm" id="sv-cuenta" value="'+esc(sv.cuenta||'')+'" placeholder="Ej: número de cuenta o referencia" style="margin-bottom:8px"/>'
      +'<div style="display:flex;gap:8px">'
        +'<div style="flex:1"><div style="color:var(--muted);font-size:10px;margin-bottom:2px">Día que llega el recibo</div><input class="inp inp-sm" id="sv-dia" type="number" min="1" max="31" value="'+(sv.diaRecibo||'')+'" placeholder="Ej: 2"/></div>'
        +'<div style="flex:1"><div style="color:var(--muted);font-size:10px;margin-bottom:2px">Día de suspensión</div><input class="inp inp-sm" id="sv-susp" type="number" min="1" max="31" value="'+(sv.diaSuspension||'')+'" placeholder="Ej: 22"/></div>'
        +'<div style="flex:1"><div style="color:var(--muted);font-size:10px;margin-bottom:2px">Frecuencia</div><select class="inp inp-sm" id="sv-frec"><option value="mensual"'+((sv.frecuencia||def.frecuencia)==='mensual'?' selected':'')+'>Mensual</option><option value="bimestral"'+((sv.frecuencia||def.frecuencia)==='bimestral'?' selected':'')+'>Bimestral</option></select></div>'
      +'</div>'
      +'<button onclick="guardarConfigServ(\''+sk+'\')" style="width:100%;background:#06b6d422;color:#06b6d4;border:1px solid #06b6d444;border-radius:8px;padding:7px;font-weight:800;font-size:11px;cursor:pointer;margin-top:8px">💾 Guardar configuración</button>'
    +'</div>'
    +'<div style="background:var(--bg);border-radius:10px;padding:9px 12px;margin-bottom:10px">'
      +'<div style="font-size:11px;font-weight:800;color:#22c55e;margin-bottom:6px">➕ Registrar recibo nuevo</div>'
      +'<input class="inp inp-sm" id="sv-per" placeholder="Periodo (Ej: AGO-OCT 2026)" style="margin-bottom:7px"/>'
      +'<div style="display:flex;gap:8px;margin-bottom:7px">'
        +'<input class="inp inp-sm money" id="sv-valor" type="text" inputmode="numeric" placeholder="Valor total" style="flex:1.4"/>'
        +(def.unidad?'<input class="inp inp-sm" id="sv-cons" type="number" step="0.1" placeholder="Consumo '+def.unidad+'" style="flex:1"/>':'')
      +'</div>'
      +'<button onclick="registrarReciboServ(\''+sk+'\')" style="width:100%;background:#22c55e;color:#fff;border:none;border-radius:8px;padding:8px;font-weight:900;font-size:12px;cursor:pointer">💾 Registrar</button>'
    +'</div>'
    +(ult&&ult.consumo?'<div style="background:#06b6d412;border:1px solid #06b6d433;border-radius:9px;padding:7px 11px;margin-bottom:8px;font-size:11px">📐 Último precio: <b style="color:#06b6d4">'+fmt(Math.round(ult.valor/ult.consumo))+' por '+def.unidad+'</b> ('+esc(ult.periodo||'')+')</div>':'')
    +(def.unidad?(function(){
      var lecturas=sv.lecturas?Object.values(sv.lecturas).sort(function(a,b){return b.ts-a.ts;}):[];
      var factor=sv.factor||1;
      var tarifaEf=(ult&&ult.consumo)?(ult.valor/ult.consumo):null;
      var filasL=lecturas.map(function(l,i){
        var ant=lecturas[i+1];
        var extra='';
        if(ant&&l.valor>=ant.valor){
          var bruto=l.valor-ant.valor;
          var corr=Math.round(bruto*factor);
          var dias=Math.max(1,Math.round((l.ts-ant.ts)/86400000));
          extra='<div style="color:var(--muted);font-size:9.5px">'+bruto+' '+def.unidad+' brutos'+(factor!==1?' × '+factor+' = <b style="color:#22c55e">'+corr+' '+def.unidad+'</b>':'')+' en '+dias+' días'
            +(tarifaEf?' · estimado <b style="color:var(--gold)">'+fmt(Math.round(corr*tarifaEf))+'</b>':'')+'</div>';
        }
        return'<div style="padding:5px 0;border-bottom:1px solid var(--border)">'
          +'<div style="display:flex;justify-content:space-between;font-size:11.5px"><span style="font-weight:700">📏 '+esc(l.fecha||'')+'</span><span style="font-weight:900;color:#06b6d4">'+l.valor+'</span></div>'
          +extra
          +'<div style="color:var(--muted);font-size:9px">'+esc(l.uidNombre||'')
          +(usuarioActivo&&usuarioActivo.rol==='admin'?' · <span onclick="eliminarLecturaServ(\''+sk+'\',\''+l.id+'\')" style="color:#ef4444;cursor:pointer">✕</span>':'')+'</div>'
        +'</div>';
      }).join('');
      return'<div style="background:var(--bg);border-radius:10px;padding:9px 12px;margin-bottom:10px">'
        +'<div style="font-size:11px;font-weight:800;color:#a855f7;margin-bottom:2px">📏 Lecturas del medidor (tu control)</div>'
        +'<div style="color:var(--muted);font-size:9.5px;margin-bottom:7px">Anota la lectura del medidor cuando quieras: el sistema calcula el consumo'+(factor!==1?' (con factor de corrección '+factor+')':'')+' y estima el valor con la tarifa del último recibo — así verificas que no se equivoquen.</div>'
        +'<div style="display:flex;gap:7px;margin-bottom:7px">'
          +'<input class="inp inp-sm" id="sv-lect" type="number" step="1" placeholder="Lectura (Ej: 15900)" style="flex:1"/>'
          +'<button onclick="guardarLecturaServ(\''+sk+'\')" style="background:#a855f7;color:#fff;border:none;border-radius:8px;padding:0 14px;font-weight:900;font-size:12px;cursor:pointer">📏</button>'
        +'</div>'
        +(filasL||'<div style="color:var(--dim);font-size:11px;text-align:center;padding:4px">Sin lecturas anotadas</div>')
      +'</div>';
    })():'')
    +'<div style="font-size:11px;font-weight:800;color:var(--muted);margin-bottom:4px">📜 Historial</div>'
    +filas
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:12px">Cerrar</button>');
}
function copiarCuentaServ(txt){
  // Copiar solo el número de pago (si hay varios, el último; quitar separadores de texto)
  var num=String(txt).split('pago:').pop().replace(/[^0-9-]/g,'');
  var copiar=num||txt;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(copiar).then(function(){showToast('📋 Copiado: '+esc(copiar),'#06b6d4');});
  }else{showToast('💳 '+esc(txt),'#06b6d4');}
}
function guardarConfigServ(sk){
  if(!serviciosPublicos[sk])serviciosPublicos[sk]={};
  serviciosPublicos[sk].cuenta=((document.getElementById('sv-cuenta')||{}).value||'').trim();
  serviciosPublicos[sk].diaRecibo=parseInt((document.getElementById('sv-dia')||{}).value)||null;
  serviciosPublicos[sk].diaSuspension=parseInt((document.getElementById('sv-susp')||{}).value)||null;
  serviciosPublicos[sk].frecuencia=(document.getElementById('sv-frec')||{}).value||'mensual';
  fbSet('serviciosPublicos/'+sk,serviciosPublicos[sk]);
  showToast('💾 Configuración de '+_SERV_DEF[sk].label+' guardada','#06b6d4');
}
function registrarReciboServ(sk){
  var per=((document.getElementById('sv-per')||{}).value||'').trim();
  var valor=moneyVal('sv-valor')||0;
  var cons=parseFloat((document.getElementById('sv-cons')||{}).value)||0;
  if(!per||valor<=0){alert('Escribe el periodo y el valor del recibo.');return;}
  if(!serviciosPublicos[sk])serviciosPublicos[sk]={};
  if(!serviciosPublicos[sk].recibos)serviciosPublicos[sk].recibos={};
  var id='r'+a52Ahora();
  serviciosPublicos[sk].recibos[id]={id:id,ts:a52Ahora(),periodo:per,valor:valor,consumo:cons||null};
  fbSet('serviciosPublicos/'+sk+'/recibos/'+id,serviciosPublicos[sk].recibos[id]);
  showToast('🧾 '+_SERV_DEF[sk].emoji+' '+esc(per)+': '+fmt(valor)+(cons?' · '+fmt(Math.round(valor/cons))+'/'+_SERV_DEF[sk].unidad:''),'#22c55e');
  abrirServiciosPublicos();
}
function guardarLecturaServ(sk){
  var v=parseFloat((document.getElementById('sv-lect')||{}).value);
  if(!v&&v!==0){alert('Escribe la lectura del medidor.');return;}
  if(!serviciosPublicos[sk])serviciosPublicos[sk]={};
  if(!serviciosPublicos[sk].lecturas)serviciosPublicos[sk].lecturas={};
  var lecturas=Object.values(serviciosPublicos[sk].lecturas);
  var ultima=lecturas.sort(function(a,b){return b.ts-a.ts;})[0];
  if(ultima&&v<ultima.valor){
    if(!confirm('⚠️ La lectura ('+v+') es MENOR que la última anotada ('+ultima.valor+').\n¿Seguro? Los medidores solo suben.'))return;
  }
  var hoyF=new Date();
  var fecha=hoyF.getFullYear()+'-'+('0'+(hoyF.getMonth()+1)).slice(-2)+'-'+('0'+hoyF.getDate()).slice(-2);
  var id='l'+a52Ahora();
  serviciosPublicos[sk].lecturas[id]={id:id,ts:a52Ahora(),fecha:fecha,valor:v,uidNombre:usuarioActivo?usuarioActivo.nombre:''};
  fbSet('serviciosPublicos/'+sk+'/lecturas/'+id,serviciosPublicos[sk].lecturas[id]);
  showToast('📏 Lectura anotada: '+v,'#a855f7');
  abrirServiciosPublicos();
}
function eliminarLecturaServ(sk,lid){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  if(serviciosPublicos[sk]&&serviciosPublicos[sk].lecturas)delete serviciosPublicos[sk].lecturas[lid];
  fbSet('serviciosPublicos/'+sk+'/lecturas/'+lid,null);
  abrirServiciosPublicos();
}
function eliminarReciboServ(sk,rid){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  if(!confirm('¿Eliminar este recibo del historial?'))return;
  if(serviciosPublicos[sk]&&serviciosPublicos[sk].recibos)delete serviciosPublicos[sk].recibos[rid];
  fbSet('serviciosPublicos/'+sk+'/recibos/'+rid,null);
  abrirServiciosPublicos();
}
function renderGastos(){
  var _fg=gFormGuardar();   // lo que el cajero lleva escrito sobrevive a los repintados (ventas o arqueos de otros equipos)
  var hoy=gastosTurno();
  var totalH=hoy.reduce(function(a,g){return a+g.valor;},0);

  // Arqueo de efectivo accesible para cajero/subadmin (que no ven la pestaña Caja).
  // Versión CIEGA: ven sus conteos registrados pero nunca el esperado ni la diferencia.
  var puedeArqG=usuarioActivo&&(usuarioActivo.rol==='cajero'||usuarioActivo.rol==='subadmin');
  var arqueoBanner='';
  if(puedeArqG){
    var arqTurnoG=arqueos.filter(function(a){return a.ts>=turnoInicio;}).sort(function(a,b){return b.ts-a.ts;});
    var arqRowsG=arqTurnoG.map(function(a){
      return'<div onclick="verArqueo(\''+a.id+'\')" style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);cursor:pointer">'
        +'<div><div style="font-size:12px;font-weight:700">🧮 Contado: <span style="color:var(--gold)">'+fmt(a.total)+'</span></div>'
          +'<div style="color:var(--muted);font-size:10px;margin-top:1px">🕐 '+fmtFechaCorta(a.ts)+' · ✍️ '+esc(a.uidNombre||'')+'</div></div>'
        +'<span style="color:#22c55e;font-size:10px;font-weight:700">✓ Registrado</span>'
      +'</div>';
    }).join('');
    arqueoBanner='<div class="card2 mb12" style="border:1px solid var(--gold)44">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px">'
        +'<div><div style="color:var(--gold);font-weight:800;font-size:13px">🧮 Arqueo de efectivo</div>'
        +'<div style="color:var(--muted);font-size:11px;margin-top:2px">Cuenta el dinero físico billete por billete. Queda registrado con tu nombre.</div></div>'
        +'<button onclick="abrirArqueo()" style="background:var(--gold);color:#1a1a22;border:none;border-radius:9px;padding:10px 16px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap">🧮 Contar caja</button>'
      +'</div>'
      +'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin-bottom:4px">ARQUEOS DE ESTE TURNO ('+arqTurnoG.length+')</div>'
      +(arqRowsG||'<div style="color:var(--dim);font-size:12px;padding:6px 0">Aún no has contado la caja en este turno.</div>')
    +'</div>';
  }

  var form='<div class="card2 mb12">'
    +((usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'))?'<button onclick="abrirServiciosPublicos()" style="width:100%;background:#06b6d418;color:#06b6d4;border:1px solid #06b6d444;border-radius:10px;padding:11px;font-weight:800;font-size:13px;cursor:pointer;margin-bottom:12px">🧾 Servicios públicos — agua · luz · gas · internet</button>':'')
    +'<div style="color:var(--gold);font-weight:800;font-size:14px;margin-bottom:12px">📋 Registrar gasto / compra</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Concepto *</div>'
        +'<input class="inp" id="g-concepto" placeholder="Ej: 2 cajas cerveza, gas, taxi..."/></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Categoría</div>'
        +'<select class="inp" id="g-cat" onchange="toggleGastoExtras()">'
        +'<option value="" selected disabled>👆 Elige la categoría...</option>'
        +CATG_GASTOS.map(function(c){return'<option>'+c+'</option>';}).join('')
        +'</select></div>'
      +'<div id="g-emp-wrap" style="grid-column:1/-1;display:none"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">👷 Empleado (opcional, lo enlaza a su nómina)</div>'
        +'<select class="inp" id="g-emp"><option value="">— Sin empleado específico —</option>'
        +empleados.filter(function(e){return e.activo!==false;}).map(function(e){return'<option value="'+e.id+'">'+esc(e.nombre)+(e.cargo?' · '+esc(e.cargo):'')+'</option>';}).join('')
        +'</select></div>'
      +'<div id="g-prov-wrap" style="grid-column:1/-1;display:none"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">🏭 Proveedor (le pagas este gasto)</div>'
        +'<select class="inp" id="g-prov"><option value="">— Sin proveedor específico —</option>'
        +proveedores.map(function(pv){return'<option value="'+pv.id+'">'+esc(pv.nombre)+'</option>';}).join('')
        +'</select></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Forma de pago *</div>'
        +'<select class="inp" id="g-fp" onchange="toggleGastoExtras()">'
        +'<option value="" selected disabled>👆 Elige la forma de pago...</option>'
        +FPV().sort(function(a,b){return (a.id==='efectivo'?-1:b.id==='efectivo'?1:0);}).map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('')
        +'<option value="credito">🧾 A crédito (queda debiendo al proveedor)</option>'
        +(a52Mod('socios')?'<option value="socio">🤝 Lo pagó un socio (el negocio le queda debiendo)</option>':'')
        +'</select></div>'
      +'<div id="g-socio-wrap" style="display:none"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">🤝 ¿Qué socio lo pagó?</div>'
        +'<select class="inp" id="g-socio">'+SOCIOS.map(function(x){return'<option value="'+esc(x.id)+'">'+esc(x.nombre||socNom(x.id))+'</option>';}).join('')+'</select></div>'
      +'<div id="g-vence-wrap" style="display:none"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">📅 Fecha en que hay que pagarla</div>'
        +'<input class="inp" id="g-vence" type="date"/></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor (COP) *</div>'
        +'<input class="inp money" id="g-valor" type="text" placeholder="0" inputmode="numeric"/></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Notas (opcional)</div>'
        +'<input class="inp" id="g-notas" placeholder="Notas adicionales..."/></div>'
      +'<div id="g-inv-wrap" style="grid-column:1/-1;display:none;background:var(--bg);border:1px solid #38bdf844;border-radius:10px;padding:10px">'
        +'<div style="color:#38bdf8;font-weight:800;font-size:12px">📦 Ingresar al inventario lo que llegó</div>'
        +'<div style="color:var(--muted);font-size:10.5px;margin:2px 0 8px">Busca cada producto o insumo y pon cuánto llegó. Se suma al stock al registrar el gasto. Si no es mercancía para vender, déjalo vacío.</div>'
        +'<input class="inp" id="g-inv-busq" placeholder="🔍 Escribe el producto o insumo..." oninput="gInvBuscar(this.value)" autocomplete="off"/>'
        +'<div id="g-inv-sug" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px"></div>'
        +'<div id="g-inv-lineas" style="margin-top:6px"></div>'
      +'</div>'
    +'</div>'
    +'<button class="btn btn-gold btn-full" onclick="guardarGasto()">💾 Registrar gasto</button>'
    +'</div>';

  // Desglose de gastos de hoy por forma de pago
  var gastosPorFpHoy={};
  hoy.forEach(function(g){var gfp=g.fp||'efectivo';gastosPorFpHoy[gfp]=(gastosPorFpHoy[gfp]||0)+g.valor;});
  var fpBreakdown=FPAGO.filter(function(f){return gastosPorFpHoy[f.id];}).map(function(f){
    return'<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0"><span style="color:'+f.color+';font-size:12px;font-weight:600">'+f.emoji+' '+f.label+'</span><span style="color:'+f.color+';font-weight:700;font-size:13px">'+fmt(gastosPorFpHoy[f.id])+'</span></div>';
  }).join('');

  var resHoy='<div class="card mb12">'
    +'<div class="flex-between mb8">'
    +'<div class="section-title" style="margin-bottom:0">Gastos del turno actual</div>'
    +'<span style="color:var(--red);font-weight:900;font-size:15px">'+fmt(totalH)+'</span>'
    +'</div>'
    +(fpBreakdown?'<div style="background:var(--bg);border-radius:8px;padding:6px 12px;margin-bottom:10px">'+fpBreakdown+'</div>':'')
    +(hoy.length===0?'<div style="color:var(--dim);text-align:center;padding:16px;font-size:13px">Sin gastos registrados hoy</div>'
      :hoy.slice().sort(function(a,b){return b.ts-a.ts;}).map(function(g){
        return'<div class="gasto-row">'
          +'<div style="flex:1">'
            +'<div style="font-size:13px;font-weight:600">'+esc(g.concepto)+'</div>'
            +(function(){var f=FPAGO.find(function(x){return x.id===g.fp;});return f?'<span style="background:'+f.color+'22;color:'+f.color+';border:1px solid '+f.color+'44;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700">'+f.emoji+' '+f.label+'</span> ':'';})()
            +'<div style="color:var(--muted);font-size:11px">'+g.categoria+' · 🕐 '+fmtFechaCorta(g.ts)+' · '+esc(g.uidNombre||g.uid||'')+(g.notas?' · '+esc(g.notas):'')+'</div>'
            +(g.entradas&&g.entradas.length?'<div style="color:#38bdf8;font-size:10.5px;margin-top:2px">📦 '+g.entradas.map(function(l){return '+'+l.cant+' '+esc(l.nombre);}).join(' · ')+'</div>':'')
          +'</div>'
          +'<span style="color:var(--red);font-weight:700;font-size:13px">'+fmt(g.valor)+'</span>'
          +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button onclick="borrarGasto(\''+g.id+'\')" style="background:#ef444418;color:#ef4444;border:none;border-radius:5px;padding:3px 7px;cursor:pointer;font-size:11px">✕</button>':'')
          +'</div>';
      }).join(''))
    +'</div>';

  // Historial por categoría hoy
  var porCat={};hoy.forEach(function(g){porCat[g.categoria]=(porCat[g.categoria]||0)+g.valor;});
  var catRows=Object.entries(porCat).map(function(kv){
    return'<div class="res-row"><span style="color:var(--text)">'+esc(kv[0])+'</span><span style="color:var(--red);font-weight:700">'+fmt(kv[1])+'</span></div>';
  }).join('');
  var resumen=catRows?'<div class="card"><div class="section-title">Por categoría hoy</div>'+catRows+'</div>':'';

  // Historial completo (todos los gastos)
  var todosGastos=gastos.slice().sort(function(a,b){return b.ts-a.ts;});
  var totalTodos=todosGastos.reduce(function(a,g){return a+g.valor;},0);
  var histRows=todosGastos.slice(0,100).map(function(g){
    var f=FPAGO.find(function(x){return x.id===g.fp;});
    return'<div class="gasto-row">'
      +'<div style="flex:1">'
        +'<div style="font-size:13px;font-weight:600">'+esc(g.concepto)+'</div>'
        +(f?'<span style="background:'+f.color+'22;color:'+f.color+';border:1px solid '+f.color+'44;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700">'+f.emoji+' '+f.label+'</span> ':'')
        +'<div style="color:var(--muted);font-size:11px">'+g.categoria+' · '+fmtFecha(g.ts)+' '+fmtTime(g.ts)+' · '+esc(g.uidNombre||g.uid||'')+(g.notas?' · '+esc(g.notas):'')+'</div>'
      +'</div>'
      +'<span style="color:var(--red);font-weight:700;font-size:13px">'+fmt(g.valor)+'</span>'
      +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button onclick="borrarGasto(\''+g.id+'\')" style="background:#ef444418;color:#ef4444;border:none;border-radius:5px;padding:3px 7px;cursor:pointer;font-size:11px">✕</button>':'')
    +'</div>';
  }).join('');
  var historial='<div class="card mb12">'
    +'<div class="flex-between mb8">'
      +'<button data-act="toggle-sec" data-sec="gastosHist" style="background:none;border:none;color:var(--text);cursor:pointer;font-weight:700;font-size:14px;padding:0">'+(_secOpen.gastosHist?'▼':'▶')+' 📜 Historial completo de gastos</button>'
      +'<button onclick="exportarGastosExcel()" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:8px;padding:6px 12px;font-weight:700;font-size:12px;cursor:pointer">📥 Excel</button>'
    +'</div>'
    +(_secOpen.gastosHist?(''
    +'<div style="display:flex;justify-content:space-between;margin-bottom:10px;padding:8px 12px;background:var(--card2);border-radius:8px">'
      +'<span style="color:var(--muted);font-size:12px">Total acumulado ('+todosGastos.length+' gastos)</span>'
      +'<span style="color:var(--red);font-weight:900;font-size:15px">'+fmt(totalTodos)+'</span>'
    +'</div>'
    +(todosGastos.length===0?'<div style="color:var(--dim);text-align:center;padding:16px;font-size:13px">Sin gastos registrados</div>':histRows)
    +(todosGastos.length>100?'<div style="color:var(--muted);text-align:center;padding:10px;font-size:11px">Mostrando los 100 más recientes · Exporta a Excel para ver todos</div>':'')
    ):'')
  +'</div>';

  setTimeout(function(){gFormRestaurar(_fg);},0);
  return arqueoBanner+form+cxpCard()+resHoy+resumen+historial;
}
/* ═══ 🧾 GASTOS POR PAGAR (compras a crédito) ═══ */
function cxpPendientes(){return cxp.filter(function(c){return !c.pagado;}).slice().sort(function(a,b){return String(a.vence||'').localeCompare(String(b.vence||''))||a.ts-b.ts;});}
function cxpSaldo(c){return Math.max(0,(c.valor||0)-(c.abonado||0));}
function cxpCard(){
  var pend=cxpPendientes();
  var puedePagar=usuarioActivo&&usuarioActivo.rol!=='mesero'&&usuarioActivo.rol!=='cocinero';
  var pagadas=cxp.filter(function(c){return c.pagado;}).sort(function(a,b){return (b.pagadoTs||0)-(a.pagadoTs||0);}).slice(0,5);
  if(!pend.length&&!pagadas.length)return'';
  var hoyK=_fechaKey(new Date()),total=pend.reduce(function(a,c){return a+cxpSaldo(c);},0),vencidas=pend.filter(function(c){return c.vence&&c.vence<hoyK;}).length;
  var rows=pend.map(function(c){
    var venc=c.vence&&c.vence<hoyK,hoyV=c.vence===hoyK;
    return'<div class="gasto-row" style="'+(venc?'background:#ef44440d;border-radius:8px;':'')+'">'
      +'<div style="flex:1;min-width:0">'
        +'<div style="font-size:13px;font-weight:700">🏭 '+esc(c.provNombre||'Proveedor')+' <span style="color:var(--muted);font-weight:600">· '+esc(c.concepto)+'</span></div>'
        +'<div style="font-size:11px;color:'+(venc?'#ef4444':hoyV?'#f5a623':'var(--muted)')+'">'+(venc?'⚠️ VENCIDA · ':hoyV?'📅 Vence HOY · ':'📅 Vence ')+(c.vence?c.vence.split('-').reverse().join('/'):'sin fecha')+' · registró '+esc(c.uidNombre||'')+((c.abonado||0)>0?' · abonado '+fmt(c.abonado):'')+'</div>'
        +(c.entradas&&c.entradas.length?'<div style="color:#38bdf8;font-size:10.5px">📦 '+c.entradas.map(function(l){return '+'+l.cant+' '+esc(l.nombre);}).join(' · ')+'</div>':'')
      +'</div>'
      +'<span style="color:#f5a623;font-weight:800;font-size:13px">'+fmt(cxpSaldo(c))+'</span>'
      +(puedePagar?'<button onclick="cxpPagar(\''+c.id+'\')" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer">💵 Pagar</button>':'')
      +(usuarioActivo&&usuarioActivo.rol==='admin'?'<button onclick="cxpBorrar(\''+c.id+'\')" style="background:#ef444418;color:#ef4444;border:none;border-radius:5px;padding:3px 7px;cursor:pointer;font-size:11px">✕</button>':'')
    +'</div>';
  }).join('');
  var hist=pagadas.map(function(c){
    return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:3px 0"><span>✅ '+esc(c.provNombre||'')+' · '+esc(c.concepto)+' · pagada '+(c.pagadoTs?fmtFechaCorta(c.pagadoTs):'')+'</span><span>'+fmt(c.valor||0)+'</span></div>';
  }).join('');
  return'<div class="card mb12" style="border:1px solid #f5a62344">'
    +'<div class="flex-between mb8"><div class="section-title" style="margin-bottom:0">🧾 Gastos por pagar'+(vencidas?' <span style="color:#ef4444;font-size:11px">· '+vencidas+' vencida'+(vencidas>1?'s':'')+'</span>':'')+'</div>'
    +'<span style="color:#f5a623;font-weight:900;font-size:15px">'+fmt(total)+'</span></div>'
    +(pend.length?rows:'<div style="color:var(--dim);font-size:12px;text-align:center;padding:8px">Nada pendiente 👌</div>')
    +(hist?'<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:6px"><div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.5px;margin-bottom:3px">ÚLTIMAS PAGADAS</div>'+hist+'</div>':'')
  +'</div>';
}
function cxpPagar(id){
  var c=cxp.find(function(x){return x.id===id;});if(!c||c.pagado)return;
  var saldo=cxpSaldo(c);
  var fpOpts=FPV().sort(function(a,b){return (a.id==='efectivo'?-1:b.id==='efectivo'?1:0);}).map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:4px">💵 Pagar a '+esc(c.provNombre||'proveedor')+'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:12px">'+esc(c.concepto)+' · saldo <b style="color:#f5a623">'+fmt(saldo)+'</b></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor que paga hoy (puede ser un abono)</div>'
      +'<input class="inp money" id="cxp-valor" type="text" inputmode="numeric" value="'+moneyFmt(saldo)+'"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Sale de (forma de pago)</div>'
      +'<select class="inp" id="cxp-fp">'+fpOpts+'</select></div>'
    +'<div style="display:flex;gap:8px"><button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
    +'<button class="btn btn-green btn-full" onclick="cxpConfirmarPago(\''+id+'\')">✓ Registrar pago</button></div>');
}
function cxpConfirmarPago(id){
  var c=cxp.find(function(x){return x.id===id;});if(!c||c.pagado)return;
  var valor=moneyVal('cxp-valor')||0,fp=(document.getElementById('cxp-fp')||{}).value||'efectivo',saldo=cxpSaldo(c);
  if(valor<=0){alert('Escribe el valor.');return;}
  if(valor>saldo){alert('El pago no puede ser mayor al saldo ('+fmt(saldo)+').');return;}
  var g={id:'g'+a52Ahora(),ts:a52Ahora(),concepto:(valor<saldo?'Abono: ':'Pago: ')+c.concepto,categoria:c.categoria||'Mercancía',valor:valor,notas:'Gasto por pagar'+(c.vence?' · vencía '+c.vence.split('-').reverse().join('/'):''),fp:fp,provId:c.provId||'',provNombre:c.provNombre||'',cxpId:c.id,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  fbPush('gastos',g);
  c.abonado=(c.abonado||0)+valor;
  if(c.abonado>=(c.valor||0)){c.pagado=true;c.pagadoTs=a52Ahora();c.pagadoPor=usuarioActivo.nombre;}
  var k=c._fbkey;var o=Object.assign({},c);delete o._fbkey;
  if(k)fbSet('cuentasPorPagar/'+k,o);
  closeModal2();
  showToast((c.pagado?'✅ Factura pagada a ':'💵 Abono a ')+esc(c.provNombre||'proveedor')+'<br><span style="font-size:12px;opacity:.85">'+fmt(valor)+' sale de caja'+(c.pagado?'':' · queda '+fmt(cxpSaldo(c)))+'</span>','#22c55e');
  render();
}
function cxpBorrar(id){
  var c=cxp.find(function(x){return x.id===id;});if(!c)return;
  var conInv=!!(c.entradas&&c.entradas.length);
  if(!confirm('¿Eliminar esta cuenta por pagar?'+(conInv?'\n\nTambién se descuenta del inventario lo que ingresó con esta compra.':'')+((c.abonado||0)>0?'\n\nLos abonos ya registrados quedan como gastos.':'')))return;
  if(conInv)gInvAplicar(c.entradas,c.concepto||'',-1);
  if(c._fbkey)fbSet('cuentasPorPagar/'+c._fbkey,null);
  cxp=cxp.filter(function(x){return x.id!==id;});
  render();
}
/* Lo que un proveedor tiene facturado por compras a crédito (pagadas o no): entra al FACTURADO de 🏭 Proveedores */
function cxpFacturadoProv(pv){return cxp.filter(function(c){return c.provId===pv.id||(c.provNombre&&c.provNombre===pv.nombre);}).reduce(function(a,c){return a+(c.valor||0);},0);}
var G_FORM_IDS=['g-concepto','g-cat','g-fp','g-valor','g-notas','g-emp','g-prov','g-inv-busq','g-vence'];
function gFormGuardar(){var f=null;G_FORM_IDS.forEach(function(id){var e=document.getElementById(id);if(e&&e.value){f=f||{};f[id]=e.value;}});return f;}
function gFormRestaurar(f){
  if(f)Object.keys(f).forEach(function(id){var e=document.getElementById(id);if(e&&!e.value)e.value=f[id];});
  if(f||_gInv.length){toggleGastoExtras();}
}

function fmtFecha(ts){
  var d=new Date(ts);
  return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear();
}
function fmtFechaCorta(ts){
  var d=new Date(ts);
  return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+String(d.getFullYear()).slice(-2)+' '+fmtTime(ts);
}

function exportarGastosExcel(){
  var rows=[['Fecha','Hora','Concepto','Categoría','Forma de pago','Valor','Usuario','Notas']];
  var sorted=gastos.slice().sort(function(a,b){return b.ts-a.ts;});
  sorted.forEach(function(g){
    var f=FPAGO.find(function(x){return x.id===g.fp;});
    var d=new Date(g.ts);
    rows.push([
      ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear(),
      ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2),
      g.concepto||'',
      g.categoria||'',
      f?f.label:(g.fp||''),
      g.valor||0,
      g.uidNombre||g.uid||'',
      g.notas||''
    ]);
  });
  // Total row
  var total=sorted.reduce(function(a,g){return a+g.valor;},0);
  rows.push([]);
  rows.push(['','','','','TOTAL',total,'','']);

  var csv='﻿';
  rows.forEach(function(r){
    csv+=r.map(function(v){
      var s=String(v).replace(/"/g,'""');
      return (s.indexOf(',')>=0||s.indexOf('"')>=0)?'"'+s+'"':s;
    }).join(',')+'\r\n';
  });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download=NEGOCIO.archivo+'-Gastos-'+_fechaKey(new Date())+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function guardarGasto(){
  var concepto=(document.getElementById('g-concepto')||{}).value;concepto=concepto?concepto.trim():'';
  var valor=moneyVal('g-valor')||0;
  var categoria=(document.getElementById('g-cat')||{}).value||'';
  var notas=(document.getElementById('g-notas')||{}).value||'';
  var fp=(document.getElementById('g-fp')||{}).value||'';
  if(!concepto){alert('Escribe el concepto.');return;}
  if(!valor||valor<=0){alert('Escribe el valor.');return;}
  if(!categoria){alert('👆 Elige a qué categoría corresponde el gasto.');return;}
  if(!fp){alert('👆 Elige de dónde salió la plata (forma de pago).');return;}
  var empId=(document.getElementById('g-emp')||{}).value||'';
  var provId=(document.getElementById('g-prov')||{}).value||'';
  if(fp==='socio'){
    // 🤝 Un socio pagó con su plata: no sale de la caja; queda como préstamo del socio (se le devuelve desde Caja → préstamos de socios)
    var socId=(document.getElementById('g-socio')||{}).value||socDef();
    if(!socId){alert('👆 Elige el socio que lo pagó.');return;}
    var regS={id:'ps_'+a52Ahora(),ts:a52Ahora(),socio:socId,tipo:'compra',monto:valor,fp:'',concepto:concepto+(categoria?' ('+categoria+')':''),categoria:categoria,devuelto:0,devoluciones:[],uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
    if(categoria==='Mercancía'||categoria==='Insumos'){
      var entS=_gInv.filter(function(l){return (parseInt(l.cant)||0)>0;}).map(function(l){return {t:l.t,id:l.id,nombre:l.nombre,cant:parseInt(l.cant)||0,costo:l.t==='p'?(parseInt(l.costo)||0):0};});
      if(entS.length){regS.entradas=entS;gInvAplicar(entS,concepto,1);}
    }
    if(provId){var pvS=proveedores.find(function(p){return p.id===provId;});regS.provId=provId;regS.provNombre=pvS?pvS.nombre:'';}
    _gInv=[];
    G_FORM_IDS.forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
    prestamosSocios.push(regS);
    var rS=ref('prestamosSocios');if(rS)rS.push(regS);else fbSet('prestamosSocios',prestamosSocios);
    showToast('🤝 '+esc(socNom(socId))+' pagó '+fmt(valor)+'<br><span style="font-size:12px;opacity:.85">No sale de la caja · el negocio se lo debe (Caja → préstamos de socios)'+(regS.entradas?' · inventario ingresado':'')+'</span>','#f5a623');
    render();return;
  }
  if(fp==='credito'){
    if(categoria!=='Mercancía'&&categoria!=='Insumos'){alert('A crédito solo se registran compras de Mercancía o Insumos.');return;}
    if(!provId){alert('👆 Elige el proveedor al que le quedas debiendo.');return;}
    var vence=(document.getElementById('g-vence')||{}).value||'';
    if(!vence){alert('Pon la fecha en que hay que pagar la factura.');return;}
    var pvC=proveedores.find(function(p){return p.id===provId;});
    var c={id:'cxp'+a52Ahora(),ts:a52Ahora(),concepto:concepto,categoria:categoria,valor:valor,abonado:0,pagado:false,vence:vence,notas:notas,provId:provId,provNombre:pvC?pvC.nombre:'',uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
    var entC=_gInv.filter(function(l){return (parseInt(l.cant)||0)>0;}).map(function(l){return {t:l.t,id:l.id,nombre:l.nombre,cant:parseInt(l.cant)||0,costo:l.t==='p'?(parseInt(l.costo)||0):0};});
    if(entC.length){c.entradas=entC;gInvAplicar(entC,concepto,1);}
    _gInv=[];
    G_FORM_IDS.forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
    fbPush('cuentasPorPagar',c);
    showToast('🧾 Queda por pagar '+fmt(valor)+' a '+esc(c.provNombre||'proveedor')+'<br><span style="font-size:12px;opacity:.85">No sale de la caja hasta que se pague · vence '+vence.split('-').reverse().join('/')+(entC.length?' · inventario ingresado':'')+'</span>','#f5a623');
    render();return;
  }
  var g={id:'g'+a52Ahora(),ts:a52Ahora(),concepto:concepto,categoria:categoria,valor:valor,notas:notas,fp:fp,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  if((categoria==='Mercancía'||categoria==='Insumos')&&provId){
    var pv=proveedores.find(function(p){return p.id===provId;});
    g.provId=provId;
    g.provNombre=pv?pv.nombre:'';
    showToast('🏭 Gasto enlazado a '+(pv?esc(pv.nombre):'proveedor'),'#38bdf8');
  }
  if(categoria==='Personal'&&empId){
    var emp=empleados.find(function(e){return e.id===empId;});
    g.empId=empId;
    // Registrar como préstamo (esta semana) en la nómina del empleado
    var semKey=_fechaKey(_sanLunes(0));
    var mov={id:'me'+a52Ahora(),ts:a52Ahora(),empId:empId,tipo:'prestamo',valor:valor,fp:fp,nota:concepto,largoPlazo:false,semanaKey:semKey,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,fromGasto:true,gastoId:g.id};
    g.movId=mov.id;   // 🔗 gasto y movimiento van de la mano: si se borra uno, se borra el otro
    movEmpleados.push(mov);
    var rm=ref('movEmpleados');if(rm)rm.push(mov);else guardarMovs();
    showToast('💸 Gasto enlazado a '+(emp?esc(emp.nombre):'empleado')+'<br><span style="font-size:12px;opacity:.85">Se descuenta de su nómina esta semana</span>','#ef4444');
  }
  if((categoria==='Mercancía'||categoria==='Insumos')&&_gInv.length){
    var ent=_gInv.filter(function(l){return (parseInt(l.cant)||0)>0;}).map(function(l){return {t:l.t,id:l.id,nombre:l.nombre,cant:parseInt(l.cant)||0,costo:l.t==='p'?(parseInt(l.costo)||0):0};});
    if(ent.length){
      g.entradas=ent;
      gInvAplicar(ent,concepto,1);
      var tot=ent.reduce(function(a,l){return a+l.cant;},0);
      showToast('📦 '+tot+' unidad'+(tot===1?'':'es')+' ingresada'+(tot===1?'':'s')+' al inventario ('+ent.length+' producto'+(ent.length===1?'':'s')+')','#38bdf8');
    }
  }
  _gInv=[];
  G_FORM_IDS.forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});   // formulario limpio para el siguiente
  fbPush('gastos',g);
  render();
}
function toggleGastoExtras(){
  var cat=(document.getElementById('g-cat')||{}).value||'';
  var we=document.getElementById('g-emp-wrap');
  if(we)we.style.display=(cat==='Personal')?'block':'none';
  var wp=document.getElementById('g-prov-wrap');
  if(wp)wp.style.display=(cat==='Mercancía'||cat==='Insumos')?'block':'none';
  var wi=document.getElementById('g-inv-wrap');
  if(wi){wi.style.display=(cat==='Mercancía'||cat==='Insumos')?'block':'none';gInvPintar();}
  var fp=(document.getElementById('g-fp')||{}).value||'';
  var wv=document.getElementById('g-vence-wrap');
  if(wv){wv.style.display=fp==='credito'?'block':'none';var dv=document.getElementById('g-vence');if(dv&&!dv.value&&fp==='credito'){var d=new Date();d.setDate(d.getDate()+8);dv.value=_fechaKey(d);}}
  if(fp==='credito'&&wp)wp.style.display='block';
  var ws=document.getElementById('g-socio-wrap');
  if(ws)ws.style.display=fp==='socio'?'block':'none';
}
/* ── 📦 Entrada de inventario desde el gasto (compra) ──
   Cualquier usuario que registre la compra puede decir qué llegó: queda en el gasto (g.entradas),
   suma al stock por cambiarStock (kardex con el concepto) y, si pone el costo, promedia el precio de compra. */
var _gInv=[];
function gInvBuscar(q){
  var box=document.getElementById('g-inv-sug');if(!box)return;
  q=_normTxt(q).trim();
  if(q.length<2){box.innerHTML='';return;}
  var ya={};_gInv.forEach(function(l){ya[l.t+l.id]=1;});
  var r=[];
  menu.forEach(function(m){if(m.sinStock||m.activo===false)return;if(_normTxt(m.nombre).indexOf(q)>=0&&!ya['p'+m.id])r.push({t:'p',id:m.id,nombre:m.nombre,emoji:m.emoji||'📦',und:m.und||'und'});});
  ingredientes.forEach(function(i){if(_normTxt(i.nombre).indexOf(q)>=0&&!ya['i'+i.id])r.push({t:'i',id:i.id,nombre:i.nombre,emoji:'🧂',und:i.und||'und'});});
  box.innerHTML=r.slice(0,8).map(function(x,k){
    window._gInvSug=r.slice(0,8);
    return'<button type="button" onclick="gInvAgregar('+k+')" style="background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:99px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer">'+x.emoji+' '+esc(x.nombre)+'</button>';
  }).join('')||'<div style="color:var(--dim);font-size:11px">Nada con ese nombre. Si es un producto nuevo, créelo primero en Inventario.</div>';
}
function gInvAgregar(k){
  var x=(window._gInvSug||[])[k];if(!x)return;
  _gInv.push({t:x.t,id:x.id,nombre:x.nombre,emoji:x.emoji,und:x.und,cant:1,costo:0});
  var b=document.getElementById('g-inv-busq');if(b){b.value='';b.focus();}
  var sg=document.getElementById('g-inv-sug');if(sg)sg.innerHTML='';
  gInvPintar();
}
function gInvQuitar(k){_gInv.splice(k,1);gInvPintar();}
function gInvCambio(k,campo,v){var l=_gInv[k];if(!l)return;if(campo==='cant')l.cant=parseInt(v)||0;else l.costo=parseInt(String(v).replace(/[^0-9]/g,''),10)||0;}
function gInvPintar(){
  var box=document.getElementById('g-inv-lineas');if(!box)return;
  box.innerHTML=_gInv.map(function(l,k){
    return'<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-top:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0;font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+l.emoji+' '+esc(l.nombre)+'</div>'
      +'<input type="number" inputmode="numeric" min="1" value="'+l.cant+'" oninput="gInvCambio('+k+',\'cant\',this.value)" title="Cantidad que llegó" style="width:64px;background:var(--card);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:6px;font-size:13px;text-align:center;font-weight:800"/>'
      +'<span style="color:var(--muted);font-size:10px">'+esc(l.und)+'</span>'
      +(l.t==='p'?'<input type="text" inputmode="numeric" placeholder="$ c/u" value="'+(l.costo?moneyFmt(l.costo):'')+'" oninput="this.value=moneyFmt(this.value);gInvCambio('+k+',\'costo\',this.value)" title="Precio de compra por unidad (opcional)" style="width:84px;background:var(--card);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:6px;font-size:12px;text-align:right"/>':'')
      +'<button type="button" onclick="gInvQuitar('+k+')" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:13px">✕</button>'
    +'</div>';
  }).join('');
}
/* Suma al stock lo que llegó; con costo, promedia el precio de compra (igual que «Llegó mercancía») */
function gInvAplicar(entradas,concepto,signo){
  signo=signo||1;var tocoMenu=false;
  (entradas||[]).forEach(function(l){
    var cant=(parseInt(l.cant)||0)*signo;if(!cant)return;
    if(l.t==='i'){cambiarStock('i',l.id,cant,(signo>0?'🛒 Compra: ':'↩️ Compra eliminada: ')+concepto);return;}
    var p=menu.find(function(m){return String(m.id)===String(l.id);});if(!p)return;
    var motivo=(signo>0?'🛒 Compra: ':'↩️ Compra eliminada: ')+concepto;
    if(signo>0&&l.costo>0){
      var stAnt=Math.max(0,parseInt(p.stock)||0),costoAnt=p.costo||0;
      p.costo=(costoAnt>0&&stAnt>0)?Math.round((stAnt*costoAnt+cant*l.costo)/(stAnt+cant)):l.costo;
      motivo+=' (a '+fmt(l.costo).replace(/\u00A0/g,' ')+' c/u'+(p.costo!==l.costo?' · costo promedio: '+fmt(p.costo).replace(/\u00A0/g,' '):'')+')';
      tocoMenu=true;
    }
    cambiarStock('p',p.id,cant,motivo);
  });
  if(tocoMenu){var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);}
}
function toggleGastoEmpleado(){toggleGastoExtras();}
function borrarGasto(id){
  var gx=gastos.find(function(g){return g.id===id;});
  var conInv=!!(gx&&gx.entradas&&gx.entradas.length);
  var mv=movDeGasto(gx);
  var cx=gx&&gx.cxpId?cxp.find(function(c){return c.id===gx.cxpId;}):null;
  var extra=[];
  if(conInv)extra.push('Se descuenta del inventario lo que ingresó con esta compra.');
  if(mv)extra.push('Se elimina también el '+(mv.tipo==='salario'?'pago de nómina':mv.tipo==='prestamo'?'préstamo':'movimiento')+' del empleado, para que no le quede descontado.');
  if(cx)extra.push('La cuenta por pagar vuelve a quedar pendiente por ese valor.');
  if(!confirm('¿Eliminar este gasto?'+(extra.length?'\n\n• '+extra.join('\n• '):'')))return;
  if(conInv)gInvAplicar(gx.entradas,gx.concepto||'',-1);
  if(mv){movEmpleados=movEmpleados.filter(function(m){return m.id!==mv.id;});guardarMovs();}
  if(cx){cx.abonado=Math.max(0,(cx.abonado||0)-(gx.valor||0));if(cx.abonado<(cx.valor||0)){cx.pagado=false;delete cx.pagadoTs;delete cx.pagadoPor;}var ko=Object.assign({},cx);delete ko._fbkey;if(cx._fbkey)fbSet('cuentasPorPagar/'+cx._fbkey,ko);}
  gastos=gastos.filter(function(g){return g.id!==id;});
  var go={};gastos.forEach(function(g){go[g.id]=g;});fbSet('gastos',go);render();
}


