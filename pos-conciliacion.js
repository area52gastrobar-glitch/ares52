/* ═══════════ CONCILIACIÓN BANCARIA (subir extracto y cruzar) ═══════════ */
function abrirConcilBanco(){
  if(typeof XLSX==='undefined'||!window._xlsxReady){alert('La librería de Excel aún no carga. Verifica la conexión e intenta de nuevo.');return;}
  var fpChecks=FPAGO.filter(function(f){return f.id!=='efectivo';}).map(function(f){
    return'<label style="display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 10px;cursor:pointer;font-size:12px;font-weight:700;color:'+f.color+'"><input type="checkbox" class="cb-fp" value="'+f.id+'" checked onchange="reconciliarBanco()" style="accent-color:'+f.color+'"/>'+f.emoji+' '+f.label+'</label>';
  }).join('');
  window._concilMovs=null;window._concilRes=null;
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:2px">🏦 Conciliación bancaria</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Sube el extracto de movimientos del banco (Excel). El sistema cruza cada pago digital del POS y cada gasto contra el extracto, y te muestra lo que no cuadra.</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:5px">Formas de pago que entran a ESTA cuenta:</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'+fpChecks+'</div>'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
      +'<span style="color:var(--muted);font-size:11px">Tolerancia de fecha:</span>'
      +'<select class="inp" id="concil-tol" onchange="reconciliarBanco()" style="flex:1;padding:7px"><option value="1" selected>±1 día (recomendado: el banco registra al día siguiente)</option><option value="0">Mismo día exacto</option><option value="2">±2 días</option></select>'
    +'</div>'
    +'<input type="file" id="concil-file" accept=".xlsx,.xls,.csv" style="display:none" onchange="procesarArchivoBanco(this)"/>'
    +'<button onclick="document.getElementById(\'concil-file\').click()" style="width:100%;background:#38bdf818;color:#38bdf8;border:2px dashed #38bdf855;border-radius:12px;padding:22px;font-size:14px;font-weight:800;cursor:pointer;margin-bottom:12px">📄 Elegir archivo del extracto</button>'
    +'<div id="concil-result"></div>'
    +'<div style="border-top:1px solid var(--border);margin:12px 0;padding-top:12px">'
      +'<div style="font-weight:800;font-size:13px;color:#a855f7;margin-bottom:3px">📱 Contraste con mensajes del banco (hora exacta)</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:8px">Pega los SMS de Bancolombia (o sube un .txt con ellos). El sistema saca monto, fecha y hora de cada mensaje y los cruza al minuto contra los cobros digitales y los abonos registrados.</div>'
      +'<input type="file" id="sms-file" accept=".txt,.csv,text/plain" style="display:none" onchange="procesarArchivoSms(this)"/>'
      +'<button onclick="document.getElementById(\'sms-file\').click()" style="width:100%;background:#a855f718;color:#a855f7;border:2px dashed #a855f755;border-radius:10px;padding:10px;font-size:12px;font-weight:800;cursor:pointer;margin-bottom:6px">📎 Subir archivo de mensajes (.txt)</button>'
      +'<textarea id="sms-texto" placeholder="...o pega aquí los mensajes (pueden ir varios seguidos)" style="width:100%;min-height:70px;background:var(--bg);border:1px solid var(--border);border-radius:9px;color:var(--text);padding:9px;font-size:11px;box-sizing:border-box;margin-bottom:6px"></textarea>'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        +'<span style="color:var(--muted);font-size:11px">Periodo a revisar:</span>'
        +'<select class="inp" id="sms-rango" onchange="analizarSmsBanco();var r=document.getElementById(\'sms-fechas\');if(r)r.style.display=this.value===\'rango\'?\'flex\':\'none\'" style="flex:1;padding:7px"><option value="turno" selected>Turno actual</option><option value="hoy">Hoy</option><option value="48h">Últimas 48 horas</option><option value="rango">📅 Fechas específicas</option><option value="todo">Todo</option></select>'
      +'</div>'
      +'<div id="sms-fechas" style="display:none;gap:8px;margin-bottom:6px">'
        +'<input class="inp" type="date" id="sms-d1" onchange="analizarSmsBanco()" style="flex:1;padding:7px;font-size:12px"/>'
        +'<input class="inp" type="date" id="sms-d2" onchange="analizarSmsBanco()" style="flex:1;padding:7px;font-size:12px"/>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        +'<span style="color:var(--muted);font-size:11px">Diferencia máxima de hora:</span>'
        +'<select class="inp" id="sms-tol" onchange="analizarSmsBanco()" style="flex:1;padding:7px"><option value="1">±1 minuto</option><option value="3">±3 minutos</option><option value="10" selected>±10 minutos</option><option value="60">±60 minutos</option><option value="120">±120 minutos</option></select>'
      +'</div>'
      +'<button class="btn btn-full" onclick="analizarSmsBanco()" style="background:#a855f7;color:#fff;border:none;font-weight:800">🔍 Contrastar mensajes</button>'
      +'<div style="display:flex;gap:6px;margin-top:6px">'
        +'<button onclick="cargarSmsAutomaticos()" style="flex:1;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:8px;padding:8px;font-size:11px;font-weight:800;cursor:pointer">📡 Usar automáticos'+(smsBanco.length?' ('+smsBanco.length+')':' (0)')+'</button>'
        +'<button onclick="verMensajesRecibidos()" style="flex:1;background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:8px;padding:8px;font-size:11px;font-weight:800;cursor:pointer">🔎 Ver recibidos</button>'
        +'<button onclick="verComoConectarCelular()" style="flex:1;background:var(--card2);color:var(--muted);border:1px solid var(--border);border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">⚙️ Conectar correo o celular</button>'
      +'</div>'
      +'<div id="sms-result" style="margin-top:10px"></div>'
    +'</div>'
    +'<div style="border-top:1px solid var(--border);margin:12px 0;padding-top:12px">'
      +'<div style="font-weight:800;font-size:13px;color:#f5a623;margin-bottom:3px">💳 Contraste datáfono (tarjetas)</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:8px">Sube el "Listado de Transacciones" (.csv) del datáfono. Se cruza cada voucher APROBADO contra los cobros con tarjeta del sistema, al minuto.</div>'
      +'<input type="file" id="df-file" accept=".csv,text/csv" style="display:none" onchange="procesarArchivoDatafono(this)"/>'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        +'<span style="color:var(--muted);font-size:11px">Diferencia máxima de hora:</span>'
        +'<select class="inp" id="df-tol" onchange="analizarDatafono()" style="flex:1;padding:7px"><option value="1">±1 minuto</option><option value="3" selected>±3 minutos</option><option value="10">±10 minutos</option><option value="60">±60 minutos</option><option value="120">±120 minutos</option></select>'
      +'</div>'
      +'<button onclick="document.getElementById(\'df-file\').click()" style="width:100%;background:#f5a62318;color:#f5a623;border:2px dashed #f5a62355;border-radius:10px;padding:12px;font-size:12px;font-weight:800;cursor:pointer">💳 Elegir CSV del datáfono</button>'
      +'<div id="df-result" style="margin-top:10px"></div>'
    +'</div>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text)">Cerrar</button>');
}
/* ═══ 👁️ AVISOS VISUALES DE PAGOS: siempre activos (no se pueden apagar) ═══ */
function _avisosPagoBox(){
  var box=document.getElementById('pagos-avisos');
  if(!box){
    box=document.createElement('div');
    box.id='pagos-avisos';
    box.style.cssText='position:fixed;top:64px;right:12px;left:12px;max-width:360px;margin-left:auto;z-index:9800;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(box);
  }
  return box;
}
function mostrarAvisoPago(key,tipo,titulo,cuerpo){
  // tipo: 'ok' (verde, se va solo) · 'wait' (ámbar, queda hasta resolverse) · 'alerta' (rojo, queda hasta tocarlo)
  if(!usuarioActivo||(usuarioActivo.rol!=='admin'&&usuarioActivo.rol!=='cajero'))return;
  var box=_avisosPagoBox();
  var viejo=box.querySelector('[data-key="'+key+'"]');
  if(viejo)viejo.remove();
  var colores={ok:['#0d2818','#22c55e'],wait:['#2a2108','#f5a623'],alerta:['#2a0d0d','#ef4444']};
  var c=colores[tipo]||colores.ok;
  var d=document.createElement('div');
  d.setAttribute('data-key',key);
  d.style.cssText='background:'+c[0]+';border:1.5px solid '+c[1]+';border-radius:13px;padding:11px 14px;box-shadow:0 8px 28px rgba(0,0,0,.45);cursor:pointer;pointer-events:auto;animation:slideDown .25s ease';
  d.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">'
    +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;font-weight:900;color:'+c[1]+'">'+titulo+'</div>'
      +(cuerpo?'<div style="font-size:11.5px;color:var(--text);margin-top:2px;line-height:1.35">'+cuerpo+'</div>':'')
    +'</div>'
    +'<span style="color:'+c[1]+';font-size:12px;font-weight:900;opacity:.7">✕</span>'
  +'</div>';
  d.onclick=function(){d.remove();};
  box.insertBefore(d,box.firstChild);
  while(box.children.length>4)box.removeChild(box.lastChild);
  if(tipo==='ok')setTimeout(function(){if(d.parentNode)d.remove();},15000);
  return d;
}

/* ═══ 🗣️ VOZ DE PAGOS: anuncia por el altavoz los pagos contrastados ═══ */
var _vozOn=false;
try{_vozOn=localStorage.getItem('_a52_vozPagos')==='1';}catch(e){}
function toggleVozPagos(){
  if(typeof speechSynthesis==='undefined'){alert('Este navegador no soporta voz.');return;}
  _vozOn=!_vozOn;
  try{localStorage.setItem('_a52_vozPagos',_vozOn?'1':'0');}catch(e){}
  if(_vozOn){
    hablar('Voz de pagos activa');
    showToast('🗣️ Voz de pagos ACTIVA en este equipo<br><span style="font-size:12px;opacity:.85">Anunciará por el altavoz cada pago que llegue por SMS</span>','#22c55e');
  }else{
    try{speechSynthesis.cancel();}catch(e){}
    showToast('🔇 Voz de pagos apagada en este equipo','#6b7280');
  }
  render();
}
function hablar(txt){
  if(!_vozOn||typeof speechSynthesis==='undefined')return;
  if(!usuarioActivo||(usuarioActivo.rol!=='admin'&&usuarioActivo.rol!=='cajero'))return;
  try{
    var u=new SpeechSynthesisUtterance(txt);
    u.lang='es-CO';u.rate=0.95;u.volume=1;
    var voces=speechSynthesis.getVoices()||[];
    var v=voces.find(function(x){return /es[-_](CO|MX|US|419)/i.test(x.lang);})||voces.find(function(x){return /^es/i.test(x.lang);});
    if(v)u.voice=v;
    speechSynthesis.speak(u);
  }catch(e){}
}
function _montoVoz(n){
  n=parseInt(n)||0;
  if(n>=1000&&n%1000===0)return (n/1000)+' mil';
  return String(n);
}

/* ═══ 📡 SMS AUTOMÁTICOS desde el celular (via MacroDroid/Shortcuts → Firebase) ═══ */
function _smsMatch(parsed,tolMin){
  // Busca un cobro/abono digital con el monto exacto y hora dentro de la tolerancia
  var diasSet={};diasSet[_concilDia(new Date(parsed.ts))]=true;
  var movs=_movsDigitales(diasSet);
  var TOL=(tolMin||1)*60000;
  var mejor=null,mejorDif=Infinity;
  movs.forEach(function(mv){
    if(mv.monto!==parsed.monto)return;
    var dif=Math.abs(mv.ts-parsed.ts);
    if(dif<=TOL&&dif<mejorDif){mejor=mv;mejorDif=dif;}
  });
  return mejor?{mov:mejor,difMin:Math.round(mejorDif/60000)}:null;
}
function _smsAutoLlego(m){
  var parsed=parsearSmsBanco(m.texto||'')[0];
  if(!parsed)return;
  try{var u=parseInt(localStorage.getItem('_a52_smsUltTs'))||0;if((m.ts||0)>u)localStorage.setItem('_a52_smsUltTs',String(m.ts||0));}catch(e){}
  // Si el mismo pago ya llegó por otro canal (SMS y correo a la vez), no repetir
  if(!window._smsYaProc)window._smsYaProc={};
  var llave=parsed.monto+'|'+parsed.ts;
  if(window._smsYaProc[llave])return;
  window._smsYaProc[llave]=true;
  var esperaMs=(m.origen==='correo')?180000:120000;  // correo demora más: re-chequeo a los 3 min
  var hh=new Date(parsed.ts).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});
  var quien=parsed.de?' de <b>'+esc(parsed.de)+'</b>':'';
  var hit=_smsMatch(parsed,1);
  if(hit){
    mostrarAvisoPago('pago-'+m._fbkey,'ok','💰 Llegó '+fmt(parsed.monto).replace(/\u00A0/g,' '),hh+quien+'<br>✓ Cruzado con '+hit.mov.ref+' (Δ'+hit.difMin+' min)');
    _notifAdmin('💠 Llegó '+fmt(parsed.monto).replace(/\u00A0/g,' ')+(parsed.de?' de '+parsed.de:''),'✓ Cruzado con '+hit.mov.ref.replace(/<[^>]*>/g,'')+' (Δ'+hit.difMin+' min)','a52-sms-'+m._fbkey);
    hablar('Se recibieron '+_montoVoz(parsed.monto)+' pesos'+(parsed.de?' de '+parsed.de:'')+'. Cruzado con '+hit.mov.ref.replace(/<[^>]*>/g,'').replace(/·.*$/,''));
  }else{
    mostrarAvisoPago('pago-'+m._fbkey,'wait','💰 Llegó '+fmt(parsed.monto).replace(/\u00A0/g,' '),hh+quien+'<br>⏳ Esperando que registren el cobro...');
    hablar('Llegaron '+_montoVoz(parsed.monto)+' pesos'+(parsed.de?' de '+parsed.de:'')+'. Esperando el registro.');
    // Dar tiempo por si el cobro se registra después del aviso (correo: 3 min), y re-verificar
    setTimeout(function(){
      var hit2=_smsMatch(parsed,3);
      if(hit2){
        mostrarAvisoPago('pago-'+m._fbkey,'ok','💰 '+fmt(parsed.monto).replace(/\u00A0/g,' ')+' confirmado',hh+quien+'<br>✓ Cruzado con '+hit2.mov.ref+' (Δ'+hit2.difMin+' min)');
        _notifAdmin('💠 Llegó '+fmt(parsed.monto).replace(/\u00A0/g,' ')+(parsed.de?' de '+parsed.de:''),'✓ Cruzado con '+hit2.mov.ref.replace(/<[^>]*>/g,'')+' (Δ'+hit2.difMin+' min)','a52-sms-'+m._fbkey);
        hablar('Confirmado: los '+_montoVoz(parsed.monto)+' pesos quedaron cruzados con '+hit2.mov.ref.replace(/<[^>]*>/g,'').replace(/·.*$/,''));
      }else{
        mostrarAvisoPago('pago-'+m._fbkey,'alerta','⚠️ '+fmt(parsed.monto).replace(/\u00A0/g,' ')+' SIN registro',hh+quien+'<br>Nadie registró ese cobro o abono. Toca para cerrar.');
        _notifAdmin('⚠️ Llegó plata SIN registro','$'+(parsed.monto||0).toLocaleString('es-CO')+(parsed.de?' de '+parsed.de:'')+' · '+new Date(parsed.ts).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})+' — nadie registró ese cobro/abono','a52-sms-'+m._fbkey);
        hablar('Atención. Llegaron '+_montoVoz(parsed.monto)+' pesos'+(parsed.de?' de '+parsed.de:'')+' y nadie registró ese cobro.');
      }
    },esperaMs);
  }
}
function probarPagoRecibido(){
  var problemas=[];
  if(typeof speechSynthesis==='undefined')problemas.push('este navegador no tiene voz');
  if(!_vozOn)problemas.push('la VOZ está apagada en este equipo (actívala con el botón verde)');
  if(!usuarioActivo||(usuarioActivo.rol!=='admin'&&usuarioActivo.rol!=='cajero'))problemas.push('la voz solo suena con sesión de admin o cajero');
  var ahora=new Date();
  var hh=('0'+ahora.getHours()).slice(-2)+':'+('0'+ahora.getMinutes()).slice(-2);
  var dd=('0'+ahora.getDate()).slice(-2)+'/'+('0'+(ahora.getMonth()+1)).slice(-2)+'/'+String(ahora.getFullYear()).slice(-2);
  var msgPrueba={_fbkey:'prueba_'+a52Ahora(),ts:a52Ahora(),origen:'prueba',
    texto:'Bancolombia: PRUEBA, recibiste una transferencia de PRUEBA DEL SISTEMA por $12,345.00 en tu cuenta *0000 el '+dd+' a las '+hh+'.'};
  var pp=parsearSmsBanco(msgPrueba.texto)[0];
  if(window._smsYaProc&&pp)delete window._smsYaProc[pp.monto+'|'+pp.ts];
  _smsAutoLlego(msgPrueba);
  var estado='🧪 Prueba lanzada: pago simulado de $12.345.<br>'
    +'<span style="font-size:12px;opacity:.9">'
    +(problemas.length?'⚠️ Ojo: '+problemas.join(' · '):'Deberías OÍR el anuncio ahora (dirá "esperando el registro" porque no existe ese cobro).')
    +'<br>📡 Mensajes reales recibidos del banco: <b>'+smsBanco.length+'</b>'
    +(smsBanco.length?' · último hace '+Math.round((a52Ahora()-(smsBanco[smsBanco.length-1].ts||0))/60000)+' min':' — si acabas de configurar el correo y esto sigue en 0, revisa el activador en script.google.com')
    +'</span>';
  showToast(estado,problemas.length?'#f5a623':'#22c55e');
}
function verMensajesRecibidos(){
  var filas;
  if(!smsBanco.length){
    filas='<div style="background:#ef444415;border:1px solid #ef444433;border-radius:9px;padding:10px;font-size:12px;color:#ef4444;font-weight:700">📭 NO ha llegado NINGÚN mensaje a Firebase.<br><span style="font-weight:600;font-size:11px;color:var(--text)">El problema está ANTES del POS: el script de Gmail no está empujando. Revisa en script.google.com → menú <b>Ejecuciones</b>: ¿aparecen corridas cada minuto? ¿alguna en rojo? Si no hay ninguna, falta el activador; si están en rojo, ábrela y mira el error (suele ser permisos: ▶ Ejecutar una vez a mano y aceptar).</span></div>';
  }else{
    filas=smsBanco.slice().reverse().slice(0,25).map(function(m){
      var p=parsearSmsBanco(m.texto||'')[0];
      var lleg=new Date(m.ts||0);
      var llegTxt=('0'+lleg.getDate()).slice(-2)+'/'+('0'+(lleg.getMonth()+1)).slice(-2)+' '+('0'+lleg.getHours()).slice(-2)+':'+('0'+lleg.getMinutes()).slice(-2);
      return'<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:11px">'
        +'<div style="display:flex;justify-content:space-between;gap:6px">'
          +'<span style="color:var(--muted)">llegó '+llegTxt+' · '+(m.origen||'sms')+'</span>'
          +(p?'<span style="color:#22c55e;font-weight:800">✓ '+fmt(p.monto).replace(/\u00A0/g,' ')+' · '+('0'+new Date(p.ts).getHours()).slice(-2)+':'+('0'+new Date(p.ts).getMinutes()).slice(-2)+'</span>'
             :'<span style="color:#ef4444;font-weight:800">✗ no se pudo leer</span>')
        +'</div>'
        +'<div style="color:var(--text);opacity:.75;font-size:10px;word-break:break-word">'+esc(String(m.texto||'').slice(0,160))+'…</div>'
      +'</div>';
    }).join('');
  }
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:8px">🔎 Mensajes recibidos en Firebase ('+smsBanco.length+')</div>'
    +'<div style="max-height:50vh;overflow-y:auto">'+filas+'</div>'
    +'<button class="btn btn-full" onclick="inyectarSmsPrueba()" style="background:#a855f718;color:#a855f7;border:1px solid #a855f744;font-weight:800;margin-top:10px">🧪 Inyectar mensaje de prueba a Firebase</button>'
    +'<div style="color:var(--muted);font-size:10px;margin-top:4px">La prueba escribe directo en Firebase: si aparece aquí y suena el aviso, el POS y Firebase están bien y lo que falla es el script del correo.</div>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cerrar</button>');
}
function inyectarSmsPrueba(){
  var ahora=new Date();
  var hh=('0'+ahora.getHours()).slice(-2)+':'+('0'+ahora.getMinutes()).slice(-2);
  var dd=('0'+ahora.getDate()).slice(-2)+'/'+('0'+(ahora.getMonth()+1)).slice(-2)+'/'+String(ahora.getFullYear()).slice(2);
  fbPush('smsBanco',{texto:'Bancolombia: PRUEBA, recibiste una transferencia de INYECCION DE PRUEBA por $9,999.00 en tu cuenta *0000 el '+dd+' a las '+hh+'.',ts:a52Ahora(),origen:'prueba'});
  showToast('🧪 Mensaje de prueba enviado a Firebase<br><span style="font-size:12px;opacity:.85">En 1-2 segundos debe aparecer en la lista y sonar el aviso</span>','#a855f7');
  setTimeout(function(){verMensajesRecibidos();},1500);
}
function cargarSmsAutomaticos(){
  var ta=document.getElementById('sms-texto');
  if(!ta)return;
  if(!smsBanco.length){alert('No han llegado mensajes automáticos todavía.');return;}
  var autos=smsBanco.map(function(m){return m.texto||'';}).filter(Boolean).join('\n');
  ta.value=(ta.value.trim()?ta.value.trim()+'\n':'')+autos;   // fusiona con lo pegado (los repetidos se cuentan una sola vez)
  analizarSmsBanco();
}
var CODIGO_SCRIPT_CORREO='function revisarCorreosBanco(){\n'
+'  var lab=GmailApp.getUserLabelByName(\'A52-procesado\')||GmailApp.createLabel(\'A52-procesado\');\n'
+'  var hilos=GmailApp.search(\'from:notificacionesbancolombia.com newer_than:2d -label:A52-procesado\');\n'
+'  hilos.forEach(function(h){\n'
+'    h.getMessages().forEach(function(m){\n'
+'      var cuerpo=m.getPlainBody();\n'
+'      var i=cuerpo.indexOf(\'Bancolombia:\');\n'
+'      if(i>=0){\n'
+'        var texto=cuerpo.substring(i,i+400).split(\'Con llaves\')[0].split(\'Con Bre-b\')[0];\n'
+'        UrlFetchApp.fetch(\''+NEGOCIO.firebase.databaseURL+'/smsBanco.json\',{\n'
+'          method:\'post\',contentType:\'application/json\',\n'
+'          payload:JSON.stringify({texto:texto,ts:a52Ahora(),origen:\'correo\',llave:\'ESCRIBA-AQUI-LA-LLAVE-DE-LAS-REGLAS\'})\n'
+'        });\n'
+'      }\n'
+'    });\n'
+'    h.addLabel(lab);\n'
+'  });\n'
+'}';
function copiarScriptCorreo(){
  var ta=document.getElementById('script-correo-ta');
  if(!ta)return;
  ta.select();ta.setSelectionRange(0,99999);
  try{document.execCommand('copy');showToast('📋 Código copiado','#22c55e');}catch(e){alert('Copia manualmente el código del recuadro.');}
}
function verComoConectarCelular(){
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:8px">📡 Conectar las alertas del banco</div>'
    +'<div style="font-size:12px;color:var(--text);line-height:1.5">'
    +'<div style="background:#22c55e14;border:1px solid #22c55e33;border-radius:9px;padding:8px 10px;margin-bottom:10px">'
      +'<b style="color:#22c55e">📧 Por CORREO (recomendado)</b><br>'
      +'<span style="font-size:11px">Se configura <b>UNA sola vez</b> en la cuenta de Gmail que recibe las alertas ('+M('correo').toLowerCase()+') y sirve para <b>todos los equipos a la vez</b>: computador y celulares con el POS abierto anuncian solos. No hay que instalar nada en ningún celular.</span>'
    +'</div>'
    +'1. En un computador, entra con esa cuenta de Gmail a <b>script.google.com</b> → "Nuevo proyecto".<br>'
    +'2. Borra lo que aparece y pega este código:<br>'
    +'<textarea id="script-correo-ta" readonly style="width:100%;height:110px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:9px;font-family:monospace;padding:6px;box-sizing:border-box;margin:4px 0">'+CODIGO_SCRIPT_CORREO+'</textarea>'
    +'<button onclick="copiarScriptCorreo()" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:7px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;margin-bottom:6px">📋 Copiar código</button><br>'
    +'3. Guarda (💾) y dale ▶ <b>Ejecutar</b> una vez: Google pedirá permisos, acéptalos (es tu propia cuenta leyendo tu propio correo). El script marca cada correo procesado con la etiqueta <b>A52-procesado</b> — así funciona aunque tú ya hayas leído el correo. Si ya lo tenías montado con la versión anterior, reemplaza el código por este.<br>'
    +'4. A la izquierda, en <b>Activadores</b> (el relojito ⏰) → "Añadir activador" → función <b>revisarCorreosBanco</b> → "Según tiempo" → <b>Cada minuto</b> → Guardar.<br>'
    +'5. Listo: cada alerta del banco entra sola al sistema entre 1 y 2 minutos después. El cruce usa la fecha y hora que vienen <b>dentro</b> del mensaje, así que la demora del correo no daña el contraste al minuto — y el sistema ya sabe esperar ese margen antes de alertar "sin registro".<br><br>'
    +'<b style="color:var(--muted)">📱 Alternativa por SMS (si el banco los manda a un celular):</b><br>'
    +'<span style="font-size:11px">Android con <b>MacroDroid</b>: macro con disparador "SMS recibido" (remitente contiene Bancolombia) → acción "Petición HTTP" POST a<br>'
    +'<code style="font-size:9.5px;word-break:break-all;background:var(--bg);padding:3px;border-radius:5px;display:block;margin:3px 0">'+esc(NEGOCIO.firebase.databaseURL)+'/smsBanco.json'+'</code>'
    +'contenido <b>application/json</b>, cuerpo: <code style="font-size:9.5px;background:var(--bg);padding:2px 4px;border-radius:4px">{"texto":"[sms_message]","ts":0,"llave":"LA-LLAVE-DE-LAS-REGLAS"}</code><br>'
    +'<span style="color:#f5a623">🔑 La <b>llave</b> es la misma que se escribió en las reglas de Firebase (smsBanco). Sin ella la base rechaza el mensaje.</span><br>'
    +'iPhone: Atajos → automatización "Cuando reciba un mensaje" con "Bancolombia" → "Obtener contenido de URL" con el mismo POST.</span><br><br>'
    +'<span style="color:var(--muted);font-size:11px">💡 Si un pago llega por los dos canales (SMS y correo), el sistema lo detecta y lo cuenta una sola vez.</span>'
    +'</div>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:10px">Entendido</button>');
}

/* ═══ 🧩 Combinaciones: varios pagos que suman UN cobro (o al revés), por hora ═══ */
function _mejorCombinacion(objetivo,anclaTs,candidatos,TOL,maxN){
  // candidatos: [{i,ts,monto}] no usados. Busca subconjunto (2..maxN) que sume 'objetivo'
  // con cada pago dentro de ±TOL de la hora del cobro (anclaTs). Devuelve el de menor Δmáx.
  var pool=candidatos.filter(function(c){return Math.abs(c.ts-anclaTs)<=TOL&&c.monto<=objetivo;});
  if(pool.length<2)return null;
  pool.sort(function(a,b){return b.monto-a.monto;});
  var mejor=null;
  function dfs(inicio,suma,elegidos){
    if(elegidos.length>maxN)return;
    if(suma===objetivo&&elegidos.length>=2){
      var dMax=elegidos.reduce(function(a,c){return Math.max(a,Math.abs(c.ts-anclaTs));},0);
      if(!mejor||dMax<mejor.dMax)mejor={items:elegidos.slice(),dMax:dMax};
      return;
    }
    if(suma>=objetivo)return;
    for(var i=inicio;i<pool.length;i++){
      elegidos.push(pool[i]);
      dfs(i+1,suma+pool[i].monto,elegidos);
      elegidos.pop();
    }
  }
  dfs(0,0,[]);
  return mejor;
}
function _cruceConGrupos(pagos,movs,TOL){
  // pagos: vouchers/SMS [{ts,monto,...}] · movs: cobros del sistema [{ts,monto,ref,fp}]
  // 1) 1 a 1 exacto · 2) varios pagos → un cobro · 3) un pago → varios cobros
  var usadoP={},usadoM={};
  var ok=[],grupos=[];
  pagos.forEach(function(p,pi){
    var mejor=-1,mejorDif=Infinity;
    movs.forEach(function(mv,mi){
      if(usadoM[mi])return;
      if(mv.monto!==p.monto)return;
      var dif=Math.abs(mv.ts-p.ts);
      if(dif<=TOL&&dif<mejorDif){mejor=mi;mejorDif=dif;}
    });
    if(mejor>=0){usadoM[mejor]=true;usadoP[pi]=true;ok.push({pago:p,mov:movs[mejor],difMin:Math.round(mejorDif/60000)});}
  });
  // 2) varios pagos suman un cobro (anclado a la hora del cobro)
  movs.forEach(function(mv,mi){
    if(usadoM[mi])return;
    var cand=pagos.map(function(p,pi){return{i:pi,ts:p.ts,monto:p.monto};}).filter(function(c){return !usadoP[c.i];});
    var comb=_mejorCombinacion(mv.monto,mv.ts,cand,TOL,4);
    if(comb){
      comb.items.forEach(function(c){usadoP[c.i]=true;});
      usadoM[mi]=true;
      grupos.push({pagos:comb.items.map(function(c){return pagos[c.i];}),mov:mv,dMaxMin:Math.round(comb.dMax/60000),tipo:'pagos→cobro'});
    }
  });
  // 3) un pago cubre varios cobros del sistema
  pagos.forEach(function(p,pi){
    if(usadoP[pi])return;
    var cand=movs.map(function(mv,mi){return{i:mi,ts:mv.ts,monto:mv.monto};}).filter(function(c){return !usadoM[c.i];});
    var comb=_mejorCombinacion(p.monto,p.ts,cand,TOL,4);
    if(comb){
      comb.items.forEach(function(c){usadoM[c.i]=true;});
      usadoP[pi]=true;
      grupos.push({pago:p,movs:comb.items.map(function(c){return movs[c.i];}),dMaxMin:Math.round(comb.dMax/60000),tipo:'cobro→pagos'});
    }
  });
  // 4) FIADOS: la transferencia llega cuando el cliente quiere y el pago se registra
  //    horas después → cruce por monto exacto + MISMO DÍA, sin exigir la hora.
  // 4) 💠 Cifras parecidas: el cliente redondeó el pago (160.000 por 158.500, o 158.000 por 158.500)
  var parecidos=[];
  var _cifraParecida=function(pagado,cobrado){
    var dif=pagado-cobrado;
    var abs=Math.abs(dif);
    if(abs===0)return false;
    if(abs<=2000)return true;                                    // hasta $2.000 en cualquier dirección
    if(dif>0&&abs<=5000&&pagado%500===0&&cobrado>=100000)return true; // pagó de más redondeando, solo en cuentas grandes (≥$100.000)
    return false;
  };
  pagos.forEach(function(p,pi){
    if(usadoP[pi])return;
    var mejor=-1,mejorScore=Infinity;
    movs.forEach(function(mv,mi){
      if(usadoM[mi])return;
      if(!_cifraParecida(p.monto,mv.monto))return;
      var dt=Math.abs(mv.ts-p.ts);
      if(dt>TOL)return;
      var score=Math.abs(p.monto-mv.monto)*1000000+dt;           // primero la menor diferencia de plata, luego la de hora
      if(score<mejorScore){mejor=mi;mejorScore=score;}
    });
    if(mejor>=0){
      usadoM[mejor]=true;usadoP[pi]=true;
      parecidos.push({pago:p,mov:movs[mejor],dif:p.monto-movs[mejor].monto,difMin:Math.round(Math.abs(movs[mejor].ts-p.ts)/60000)});
    }
  });
  var fiadoDia=[];
  movs.forEach(function(mv,mi){
    if(usadoM[mi])return;
    if(!/fiado/i.test(String(mv.mesa||mv.ref||'')))return;
    var diaMov=_concilDia(new Date(mv.ts));
    var mejor=-1,mejorDif=Infinity;
    pagos.forEach(function(p,pi){
      if(usadoP[pi])return;
      if(p.monto!==mv.monto)return;
      if(_concilDia(new Date(p.ts))!==diaMov)return;
      var dif=Math.abs(p.ts-mv.ts);
      if(dif<mejorDif){mejor=pi;mejorDif=dif;}
    });
    if(mejor>=0){
      usadoP[mejor]=true;usadoM[mi]=true;
      fiadoDia.push({pago:pagos[mejor],mov:mv,difMin:Math.round(mejorDif/60000)});
    }
  });
  return{ok:ok,grupos:grupos,parecidos:parecidos,fiadoDia:fiadoDia,
    pagosSin:pagos.filter(function(p,pi){return !usadoP[pi];}),
    movsSin:movs.filter(function(mv,mi){return !usadoM[mi];})};
}

/* ═══ 🔬 ¿Por qué no cruzó? — traza del motor ═══ */
function _hhmmD(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function _estadoDeMov(D,mv){
  var o=D.ok.find(function(x){return x.mov===mv;});
  if(o)return'✅ ese cobro YA cruzó con el mensaje de '+_hhmmD(o.sms.ts)+(o.sms.de?' de '+esc(o.sms.de):'');
  var g=D.grupos.find(function(x){return x.mov===mv||(x.movs&&x.movs.indexOf(mv)>=0);});
  if(g)return'🧩 ese cobro quedó usado en un pago dividido';
  var f=D.fiadoDia.find(function(x){return x.mov===mv;});
  if(f)return'📒 ese cobro cruzó por día con el mensaje de '+_hhmmD(f.pago.ts);
  return null;
}
function _estadoDeSms(D,m){
  var o=D.ok.find(function(x){return x.sms===m;});
  if(o)return'✅ ese mensaje YA cruzó con '+o.mov.ref;
  var g=D.grupos.find(function(x){return x.pago===m||(x.pagos&&x.pagos.indexOf(m)>=0);});
  if(g)return'🧩 ese mensaje quedó usado en un pago dividido'+(g.mov?' con '+g.mov.ref:'');
  var f=D.fiadoDia.find(function(x){return x.pago===m;});
  if(f)return'📒 ese mensaje cruzó por día con '+f.mov.ref;
  return null;
}
function diagSmsSin(i){
  var box=document.getElementById('sdiag-r'+i);
  var D=window._smsDiag;
  if(!box||!D)return;
  if(box.style.display!=='none'){box.style.display='none';return;}
  var m=D.smsSin[i];
  var cand=D.movs.filter(function(mv){return mv.monto===m.monto;});
  var html='<div style="background:var(--bg);border-radius:8px;padding:7px 10px;margin-top:4px;font-size:10.5px">';
  if(!cand.length){
    html+='En los días revisados <b>no existe NINGÚN cobro o abono digital por '+fmt(m.monto).replace(/\u00A0/g,' ')+'</b>. O no se registró, o se registró por otro valor o como efectivo.';
  }else{
    html+='Cobros por el mismo monto y qué pasó con cada uno:<br>'
      +cand.map(function(mv){
        var est=_estadoDeMov(D,mv);
        var dif=Math.round(Math.abs(mv.ts-m.ts)/60000);
        if(est)return'• '+_hhmmD(mv.ts)+' · '+mv.ref+' → '+est+' <b>(por eso no quedó libre para este)</b>';
        return'• '+_hhmmD(mv.ts)+' · '+mv.ref+' → ⏱ está libre pero a Δ'+dif+' min, fuera de la tolerancia de ±'+(D.TOL/60000)+' — sube la tolerancia y vuelve a contrastar';
      }).join('<br>');
  }
  html+='</div>';
  box.innerHTML=html;box.style.display='block';
}
function diagMovSin(i){
  var box=document.getElementById('sdiag-m'+i);
  var D=window._smsDiag;
  if(!box||!D)return;
  if(box.style.display!=='none'){box.style.display='none';return;}
  var mv=D.sinSms[i];
  var cand=D.sms.filter(function(m){return m.monto===mv.monto;});
  var html='<div style="background:var(--bg);border-radius:8px;padding:7px 10px;margin-top:4px;font-size:10.5px">';
  if(!cand.length){
    html+='Entre los mensajes cargados <b>no hay NINGUNO por '+fmt(mv.monto).replace(/\u00A0/g,' ')+'</b>. O la plata nunca llegó, o el mensaje no está en lo que cargaste (revisa 🔎 Ver recibidos).';
  }else{
    html+='Mensajes por el mismo monto y qué pasó con cada uno:<br>'
      +cand.map(function(m){
        var est=_estadoDeSms(D,m);
        var dif=Math.round(Math.abs(mv.ts-m.ts)/60000);
        if(est)return'• '+_hhmmD(m.ts)+(m.de?' de '+esc(m.de):'')+' → '+est+' <b>(por eso no quedó libre para este cobro)</b>';
        return'• '+_hhmmD(m.ts)+(m.de?' de '+esc(m.de):'')+' → ⏱ está libre pero a Δ'+dif+' min, fuera de la tolerancia de ±'+(D.TOL/60000)+' — sube la tolerancia y vuelve a contrastar';
      }).join('<br>');
  }
  html+='</div>';
  box.innerHTML=html;box.style.display='block';
}

/* ═══ 💳 Contraste con el LISTADO DEL DATÁFONO (tarjetas) ═══ */
function procesarArchivoDatafono(inp){
  var f=inp.files&&inp.files[0];if(!f)return;
  var rd=new FileReader();
  rd.onload=function(){
    window._dfRows=parsearCsvDatafono(String(rd.result||''));
    analizarDatafono();
  };
  rd.readAsText(f);
  inp.value='';
}
function parsearCsvDatafono(txt){
  var lineas=txt.split(/\r?\n/).filter(function(l){return l.trim();});
  if(lineas.length<2)return [];
  var head=lineas[0].split(',').map(function(h){return h.trim().toLowerCase();});
  var ix=function(n){return head.indexOf(n);};
  var iF=ix('fecha'),iH=ix('hora'),iE=ix('estado'),iT=ix('tipotransaccion'),iM=ix('montototal'),
      iP=ix('propina'),iFr=ix('franquicia'),iTar=ix('numtarjeta'),iR=ix('recibo'),iA=ix('numaprobacion');
  if(iF<0||iM<0)return [];
  var out=[];
  for(var i=1;i<lineas.length;i++){
    var c=lineas[i].split(',');
    if(c.length<head.length-2)continue;
    var fecha=(c[iF]||'').trim();var hora=(iH>=0?(c[iH]||''):'').trim();
    var mF=fecha.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    var mH=hora.match(/(\d{1,2}):(\d{2})/);
    if(!mF)continue;
    var ts=new Date(parseInt(mF[1]),parseInt(mF[2])-1,parseInt(mF[3]),mH?parseInt(mH[1]):0,mH?parseInt(mH[2]):0).getTime();
    out.push({
      ts:ts,
      estado:(iE>=0?(c[iE]||''):'').trim().toUpperCase(),
      tipo:(iT>=0?(c[iT]||''):'').trim().toUpperCase(),
      monto:parseInt(String(c[iM]||'').replace(/[^0-9]/g,''),10)||0,
      propina:iP>=0?(parseInt(String(c[iP]||'').replace(/[^0-9]/g,''),10)||0):0,
      franquicia:(iFr>=0?(c[iFr]||''):'').trim(),
      tarjeta:(iTar>=0?(c[iTar]||''):'').trim(),
      recibo:(iR>=0?(c[iR]||''):'').trim(),
      aprob:(iA>=0?(c[iA]||''):'').trim()
    });
  }
  return out;
}
function analizarDatafono(){
  var res=document.getElementById('df-result');
  if(!res)return;
  var rows=window._dfRows||[];
  if(!rows.length){res.innerHTML='<div style="color:#f5a623;font-size:11px">Sube el CSV del datáfono para analizar.</div>';return;}
  var validas=rows.filter(function(r){return r.estado==='APROBADA'&&r.tipo==='VENTA';});
  var ignoradas=rows.length-validas.length;
  // Solo los días presentes en el archivo
  var diasSet={};validas.forEach(function(r){diasSet[_concilDia(new Date(r.ts))]=true;});
  var movs=_movsDigitales(diasSet).filter(function(mv){return mv.fp==='tarjeta';});
  var TOL=(parseInt((document.getElementById('df-tol')||{}).value)||3)*60000;
  var cruce=_cruceConGrupos(validas,movs,TOL);
  var ok=cruce.ok.map(function(x){return{v:x.pago,mov:x.mov,difMin:x.difMin};});
  var grupos=cruce.grupos;
  var fiadoDiaD=cruce.fiadoDia||[];
  var vchSin=cruce.pagosSin;
  var sinVch=cruce.movsSin;
  var hhmm=function(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);};
  var tj=function(r){return (r.franquicia||'')+(r.tarjeta?' '+r.tarjeta.slice(-4):'');};
  var totVchSin=vchSin.reduce(function(a,r){return a+r.monto;},0);
  var totSinVch=sinVch.reduce(function(a,m){return a+m.monto;},0);
  var totProp=validas.reduce(function(a,r){return a+(r.propina||0);},0);
  window._dfInforme={ok:ok,grupos:grupos,vchSin:vchSin,sinVch:sinVch,validas:validas,ignoradas:ignoradas,tolMin:TOL/60000,hhmm:hhmm,tj:tj};
  res.innerHTML=
    '<div style="background:var(--bg);border-radius:9px;padding:9px 12px;margin-bottom:8px;font-size:12px">'
      +'💳 '+validas.length+' vouchers aprobados · ✅ '+ok.length+' cruzados'+(grupos.length?' · 🧩 '+grupos.length+' agrupados':'')+(fiadoDiaD.length?' · 📒 '+fiadoDiaD.length+' fiados por día':'')+' · 📥 '+vchSin.length+' sin registro · 📤 '+sinVch.length+' sin voucher'
      +(ignoradas?' · <span style="color:var(--muted)">'+ignoradas+' ignoradas (anuladas/rechazadas)</span>':'')
      +(totProp?'<br><span style="color:#22c55e;font-size:11px">💁 Propinas en el datáfono: '+fmt(totProp)+'</span>':'')
      +'<button onclick="exportarDatafonoCsv()" style="display:block;width:100%;margin-top:8px;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:8px;padding:8px;font-size:11px;font-weight:800;cursor:pointer">📊 Exportar informe a Excel</button>'
    +'</div>'
    +(ok.length?'<div style="font-weight:800;font-size:12px;color:#22c55e;margin-bottom:3px">✅ Cruzados</div>'
      +ok.map(function(x){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#22c55e">'+fmt(x.v.monto)+'</b> · '+hhmm(x.v.ts)+' '+esc(tj(x.v))+' ↔ '+x.mov.ref+' · Δ'+x.difMin+' min</div>';}).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(grupos.length?'<div style="font-weight:800;font-size:12px;color:#38bdf8;margin-bottom:3px">🧩 Pagos divididos (varios ↔ uno, por hora del cobro)</div>'
      +grupos.map(function(g){
        if(g.tipo==='pagos→cobro')return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#38bdf8">'+g.pagos.map(function(p){return fmt(p.monto);}).join(' + ')+'</b> ('+g.pagos.length+' vouchers) ↔ '+g.mov.ref+' <b>'+fmt(g.mov.monto)+'</b> · Δmáx '+g.dMaxMin+' min</div>';
        return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#38bdf8">'+fmt(g.pago.monto)+'</b> (1 voucher) ↔ '+g.movs.map(function(m){return m.ref+' '+fmt(m.monto);}).join(' + ')+' · Δmáx '+g.dMaxMin+' min</div>';
      }).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(fiadoDiaD.length?'<div style="font-weight:800;font-size:12px;color:#a855f7;margin-bottom:3px">📒 Fiados cruzados por monto y día</div>'
      +fiadoDiaD.map(function(x){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#a855f7">'+fmt(x.v?x.v.monto:x.pago.monto)+'</b> · voucher '+hhmm((x.v||x.pago).ts)+' ↔ registrado '+hhmm(x.mov.ts)+' · '+x.mov.ref+'</div>';}).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(vchSin.length?'<div style="font-weight:800;font-size:12px;color:#ef4444;margin-bottom:3px">📥 Pasaron tarjeta y NO está registrado en el sistema · '+fmt(totVchSin)+'</div>'
      +vchSin.map(function(r,i){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)">'
        +'<div onclick="verMovsCercaDf('+i+')" style="cursor:pointer"><b style="color:#ef4444">'+fmt(r.monto)+'</b> · '+hhmm(r.ts)+' · '+esc(tj(r))+' · recibo '+esc(r.recibo||'')+' <span style="color:var(--muted)">▸ ver qué se cobró a esa hora</span></div>'
        +'<div id="df-exp-v'+i+'" style="display:none"></div>'
      +'</div>';}).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(sinVch.length?'<div style="font-weight:800;font-size:12px;color:#f5a623;margin-bottom:3px">📤 Registrado como tarjeta SIN voucher del datáfono · '+fmt(totSinVch)+'</div>'
      +sinVch.map(function(mv,i){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)">'
        +'<div onclick="verDetalleMovDf('+i+')" style="cursor:pointer"><b style="color:#f5a623">'+fmt(mv.monto)+'</b> · '+hhmm(mv.ts)+' · '+mv.ref+' <span style="color:var(--muted)">▸ ver movimiento de la mesa</span></div>'
        +'<div id="df-exp-m'+i+'" style="display:none"></div>'
      +'</div>';}).join(''):'')
    +'<div style="color:var(--muted);font-size:10px;margin-top:6px">Cruce por monto exacto y hora (±'+(TOL/60000)+' min) contra cobros y abonos con TARJETA. Solo los días del archivo. Las anulaciones y rechazadas no entran al cruce.</div>';
}

/* ═══ 🔎 Detalles desplegables + exportación del contraste de datáfono ═══ */
function _lineaVentaCerca(v,anclaTs){
  var d=new Date(v.ts);
  var hh=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
  var difMin=Math.round(Math.abs(v.ts-anclaTs)/60000);
  var fps=(v.pagos&&v.pagos.length?v.pagos:[{fp:v.fp,monto:v.total}]).map(function(pg){
    var f=FPAGO.find(function(x){return x.id===(pg.fp||'');});
    return (f?f.emoji:'')+' '+fmt(pg.monto||0).replace(/\u00A0/g,' ');
  }).join(' + ');
  return '<div style="padding:2px 0;font-size:10.5px;color:var(--text)">'+hh+' · <b>'+esc(v.mesa||'')+'</b> · '+fmt(v.total||0)+' ('+fps+')'+(v.uidNombre?' · cobró '+esc(v.uidNombre):'')+' · Δ'+difMin+' min</div>';
}
function verMovsCercaDf(i){
  var box=document.getElementById('df-exp-v'+i);
  if(!box)return;
  if(box.style.display!=='none'){box.style.display='none';return;}
  var r=(window._dfInforme&&window._dfInforme.vchSin[i]);
  if(!r)return;
  var VENT=60*60000;
  var cercanas=ventas.filter(function(v){return Math.abs(v.ts-r.ts)<=VENT;})
    .sort(function(a,b){return Math.abs(a.ts-r.ts)-Math.abs(b.ts-r.ts);}).slice(0,8);
  box.innerHTML='<div style="background:var(--bg);border-radius:8px;padding:7px 10px;margin-top:4px">'
    +'<div style="color:var(--muted);font-size:10px;margin-bottom:3px">Cobros del sistema ±60 min de ese voucher (cualquier medio de pago):</div>'
    +(cercanas.length?cercanas.map(function(v){return _lineaVentaCerca(v,r.ts);}).join(''):'<div style="color:var(--dim);font-size:10.5px">No hubo cobros en esa franja.</div>')
    +'<div style="color:var(--muted);font-size:9.5px;margin-top:4px">💡 Si ves un cobro por el mismo valor en otro medio (efectivo, Nequi...), probablemente lo registraron con el medio equivocado.</div>'
  +'</div>';
  box.style.display='block';
}
function verDetalleMovDf(i){
  var box=document.getElementById('df-exp-m'+i);
  if(!box)return;
  if(box.style.display!=='none'){box.style.display='none';return;}
  var mv=(window._dfInforme&&window._dfInforme.sinVch[i]);
  if(!mv)return;
  var v=ventas.find(function(x){return x.ts===mv.vts;});
  var html='<div style="background:var(--bg);border-radius:8px;padding:7px 10px;margin-top:4px">';
  if(!v){html+='<div style="color:var(--dim);font-size:10.5px">No encontré la venta (¿abono suelto?).</div>';}
  else{
    var d=new Date(v.ts);
    html+='<div style="font-size:10.5px;margin-bottom:3px"><b>'+esc(v.mesa||'')+'</b> · '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+(v.uidNombre?' · cobró '+esc(v.uidNombre):'')+' · total '+fmt(v.total||0)+'</div>';
    var pagos=(v.pagos&&v.pagos.length?v.pagos:[{fp:v.fp,monto:v.total}]);
    html+='<div style="font-size:10px;color:var(--muted);margin-bottom:3px">Pagos: '+pagos.map(function(pg){var f=FPAGO.find(function(x){return x.id===pg.fp;});return (f?f.emoji+' '+f.label:pg.fp)+' '+fmt(pg.monto||0).replace(/\u00A0/g,' ');}).join(' + ')+'</div>';
    var abs=v.abonos?(Array.isArray(v.abonos)?v.abonos:Object.values(v.abonos)):[];
    if(abs.length)html+='<div style="font-size:10px;color:var(--muted);margin-bottom:3px">Abonos: '+abs.map(function(ab){var f=FPAGO.find(function(x){return x.id===ab.fp;});return esc(ab.nombre||'')+' '+fmt(ab.monto||0).replace(/\u00A0/g,' ')+' ('+(f?f.label:ab.fp)+')';}).join(' · ')+'</div>';
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    if(its.length){
      html+='<div style="font-size:10px;color:var(--muted)">Consumo:</div>'
        +its.slice(0,12).map(function(it){
          var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
          var nom=it.nombre||it.customNombre||(p?p.nombre:'ítem');
          return '<div style="font-size:10px;padding:1px 0">'+(it.qty||1)+'× '+esc(nom)+(it.varianteNombre?' ('+esc(it.varianteNombre)+')':'')+(it.cubeta?' 🪣':'')+'</div>';
        }).join('')
        +(its.length>12?'<div style="font-size:9.5px;color:var(--dim)">… y '+(its.length-12)+' más</div>':'');
    }
  }
  html+='</div>';
  box.innerHTML=html;
  box.style.display='block';
}
function exportarDatafonoCsv(){
  var inf=window._dfInforme;
  if(!inf){alert('Primero analiza el CSV del datáfono.');return;}
  var S=';';var lineas=[];
  var num=function(n){return String(n||0);};
  var fyh=function(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()+S+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);};
  var clean=function(t){return String(t||'').replace(/<[^>]*>/g,'').replace(/;/g,',');};
  lineas.push(['SECCION','FECHA','HORA','MONTO','FRANQUICIA','TARJETA','RECIBO','MESA / REFERENCIA','QUIEN COBRO','DIF MIN'].join(S));
  inf.ok.forEach(function(x){lineas.push(['CRUZADO',fyh(x.v.ts),num(x.v.monto),clean(x.v.franquicia),clean(x.v.tarjeta),clean(x.v.recibo),clean(x.mov.mesa||x.mov.ref),clean(x.mov.uidNombre),num(x.difMin)].join(S));});
  inf.grupos.forEach(function(g){
    if(g.tipo==='pagos→cobro'){g.pagos.forEach(function(p){lineas.push(['AGRUPADO (varios vouchers → 1 cobro)',fyh(p.ts),num(p.monto),clean(p.franquicia),clean(p.tarjeta),clean(p.recibo),clean(g.mov.mesa||g.mov.ref),clean(g.mov.uidNombre),num(g.dMaxMin)].join(S));});}
    else{g.movs.forEach(function(m){lineas.push(['AGRUPADO (1 voucher → varios cobros)',fyh(g.pago.ts),num(g.pago.monto),clean(g.pago.franquicia),clean(g.pago.tarjeta),clean(g.pago.recibo),clean(m.mesa||m.ref),clean(m.uidNombre),num(g.dMaxMin)].join(S));});}
  });
  inf.vchSin.forEach(function(r){lineas.push(['SIN REGISTRO EN SISTEMA',fyh(r.ts),num(r.monto),clean(r.franquicia),clean(r.tarjeta),clean(r.recibo),'','',''].join(S));});
  inf.sinVch.forEach(function(mv){lineas.push(['SIN VOUCHER DEL DATAFONO',fyh(mv.ts),num(mv.monto),'','','',clean(mv.mesa||mv.ref),clean(mv.uidNombre),''].join(S));});
  var csv='\uFEFF'+lineas.join('\r\n');
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  var d=new Date();
  var nombre='Contraste_datafono_'+d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'.csv';
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=nombre;
  document.body.appendChild(a);a.click();
  setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(a.href);},500);
  showToast('📊 Informe exportado: '+nombre+'<br><span style="font-size:12px;opacity:.85">Ábrelo en Excel</span>','#22c55e');
}

/* ═══ 📱 Contraste con SMS del banco (monto + fecha + HORA) ═══ */
function procesarArchivoSms(inp){
  var f=inp.files&&inp.files[0];if(!f)return;
  var rd=new FileReader();
  rd.onload=function(){
    var ta=document.getElementById('sms-texto');
    if(ta)ta.value=(ta.value?ta.value+'\n':'')+String(rd.result||'');
    analizarSmsBanco();
  };
  rd.readAsText(f);
  inp.value='';
}
function _smsMonto(str){
  // '$500.00' → 500 · '$32,000.00' → 32000 · '$32.000' → 32000 · '$1.234.567,89' → 1234567
  var t=String(str||'').replace(/[^0-9.,]/g,'');
  if(/[.,]\d{2}$/.test(t))t=t.slice(0,-3);   // quitar decimales
  return parseInt(t.replace(/[^0-9]/g,''),10)||0;
}
function parsearSmsBanco(texto){
  // Separa mensajes (cada uno inicia con 'Bancolombia'; tolera Nequi u otros con el mismo patrón).
  // Se normalizan los saltos de línea porque los CORREOS del banco llegan con el texto partido.
  var plano=String(texto||'').replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ');
  var trozos=plano.split(/(?=Bancolombia[:\s])/i).map(function(t){return t.trim();}).filter(Boolean);
  var out=[];var vistos={};
  trozos.forEach(function(t){
    var mMonto=t.match(/por\s*\$\s*([\d.,]+)/i);
    var mFecha=t.match(/el\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+a\s+las?\s+(\d{1,2}):(\d{2})/i);
    if(!mMonto||!mFecha)return;
    var monto=_smsMonto(mMonto[1]);
    var y=mFecha[3].length===2?2000+parseInt(mFecha[3]):parseInt(mFecha[3]);
    var ts=new Date(y,parseInt(mFecha[2])-1,parseInt(mFecha[1]),parseInt(mFecha[4]),parseInt(mFecha[5])).getTime();
    var mDe=t.match(/de\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ .]+?)\s+por\s*\$/);
    var mCta=t.match(/cuenta\s*\*?(\d{3,6})/i);
    var llave=monto+'|'+ts;
    if(vistos[llave])return;   // mismo pago llegado por SMS y por correo: una sola vez
    vistos[llave]=true;
    out.push({monto:monto,ts:ts,de:mDe?mDe[1].trim():'',cta:mCta?mCta[1]:'',txt:t.slice(0,140)});
  });
  return out;
}
function _movsDigitales(diasSet){
  // Movimientos de plata digital del sistema en los días dados, SIN contar doble:
  // los 'pagos' de la venta consolidan el total (incluyen lo ya abonado), así que
  // cada abono genera su movimiento a SU hora real y se RESTA del pago del mismo
  // medio; del pago solo queda el neto cobrado al final.
  var digital=function(fp){return fp&&fp!=='efectivo';};
  var movs=[];
  ventas.forEach(function(v){
    var abs=v.abonos?(Array.isArray(v.abonos)?v.abonos:Object.values(v.abonos)):[];
    var abonadoPorFp={};var absTot=0;
    abs.forEach(function(ab){
      var m=ab.monto||0;absTot+=m;
      abonadoPorFp[ab.fp||'']=(abonadoPorFp[ab.fp||'']||0)+m;
      if(!digital(ab.fp))return;
      var d=_concilDia(new Date(ab.ts||v.ts));
      if(!diasSet[d])return;
      movs.push({ts:ab.ts||v.ts,monto:m,fp:ab.fp,ref:'Abono ('+esc(ab.nombre||'')+') · '+esc(v.mesa||''),vts:v.ts,mesa:v.mesa||'',uidNombre:v.uidNombre||''});
    });
    var pagos=v.pagos&&v.pagos.length?v.pagos:[{fp:v.fp,monto:(v.total||0)-absTot}];
    pagos.forEach(function(pg){
      var fp=pg.fp||pg[0];var monto=(pg.monto!=null?pg.monto:pg[1])||0;
      // Restar lo que ya entró como abono por ese mismo medio (evita el doble conteo)
      var yaAbonado=abonadoPorFp[fp]||0;
      if(yaAbonado>0){
        var resta=Math.min(yaAbonado,monto);
        monto-=resta;abonadoPorFp[fp]=yaAbonado-resta;
      }
      if(!digital(fp)||monto<=0)return;
      var d=_concilDia(new Date(v.ts));
      if(!diasSet[d])return;
      movs.push({ts:v.ts,monto:monto,fp:fp,ref:esc(v.mesa||'Venta')+(v.uidNombre?' · cobró '+esc(v.uidNombre):''),vts:v.ts,mesa:v.mesa||'',uidNombre:v.uidNombre||''});
    });
  });
  // 🟢 Abonos de mesas ABIERTAS: la plata ya llegó al banco aunque la mesa no se haya cobrado
  Object.keys(abonosMesa||{}).forEach(function(mid){
    var mesaN=(mesas.find(function(x){return String(x.id)===String(mid);})||{}).nombre||('Mesa '+mid);
    (abonosMesa[mid]||[]).forEach(function(ab){
      if(!ab||!digital(ab.fp))return;
      if(!diasSet[_concilDia(new Date(ab.ts||0))])return;
      var mm=parseInt(ab.monto)||0;
      if(mm<=0)return;
      movs.push({ts:ab.ts,monto:mm,fp:ab.fp,ref:'Abono en mesa abierta ('+esc(ab.nombre||'')+') · '+esc(mesaN),vts:ab.ts,mesa:mesaN,uidNombre:ab.uidNombre||''});
    });
  });
  return movs;
}
function _smsRangoLimites(){
  var m=(document.getElementById('sms-rango')||{}).value||'turno';
  var hoy0=new Date();hoy0.setHours(0,0,0,0);
  if(m==='turno')return{desde:turnoInicio||hoy0.getTime(),hasta:null,label:'turno actual'};
  if(m==='hoy')return{desde:hoy0.getTime(),hasta:null,label:'hoy'};
  if(m==='48h')return{desde:a52Ahora()-48*3600000,hasta:null,label:'últimas 48 h'};
  if(m==='rango'){
    var d1v=(document.getElementById('sms-d1')||{}).value;
    var d2v=(document.getElementById('sms-d2')||{}).value;
    var d1=d1v?new Date(d1v+'T00:00:00').getTime():0;
    var d2=d2v?new Date(d2v+'T23:59:59').getTime():null;
    return{desde:d1,hasta:d2,label:'fechas elegidas'};
  }
  return{desde:0,hasta:null,label:'todo'};
}
function analizarSmsBanco(){
  var texto=(document.getElementById('sms-texto')||{}).value||'';
  var todos=parsearSmsBanco(texto);
  var res=document.getElementById('sms-result');
  if(!res)return;
  if(!todos.length){res.innerHTML='<div style="color:#f5a623;font-size:11px">No encontré mensajes válidos. Cada SMS debe traer "por $..." y "el dd/mm/aa a las hh:mm".</div>';return;}
  var rango=_smsRangoLimites();
  var sms=todos.filter(function(m){return m.ts>=rango.desde&&(!rango.hasta||m.ts<=rango.hasta);});
  var fueraRango=todos.length-sms.length;
  if(!sms.length){res.innerHTML='<div style="color:#f5a623;font-size:11px">Hay '+todos.length+' mensajes cargados pero ninguno cae en el periodo elegido ('+rango.label+'). Cambia el periodo arriba.</div>';return;}
  // Solo se contrastan los DÍAS que aparecen en los mensajes...
  var diasSet={};sms.forEach(function(m){diasSet[_concilDia(new Date(m.ts))]=true;});
  // ...y AMBOS lados se recortan por la MISMA ventana del periodo elegido:
  // si un cobro quedó fuera del periodo, tampoco se evalúa (antes entraban
  // los días completos y salían "sin mensaje" cobros de horas ya filtradas).
  var movs=_movsDigitales(diasSet).filter(function(mv){
    return mv.ts>=rango.desde&&(!rango.hasta||mv.ts<=rango.hasta);
  });
  var TOL=(parseInt((document.getElementById('sms-tol')||{}).value)||10)*60000;
  var cruce=_cruceConGrupos(sms,movs,TOL);
  var ok=cruce.ok.map(function(x){return{sms:x.pago,mov:x.mov,difMin:x.difMin};});
  var gruposS=cruce.grupos;
  var parecidosS=cruce.parecidos||[];
  var fiadoDiaS=cruce.fiadoDia||[];
  var smsSin=cruce.pagosSin;
  var sinSms=cruce.movsSin;
  window._smsDiag={sms:sms,movs:movs,ok:ok,grupos:gruposS,parecidos:parecidosS,fiadoDia:fiadoDiaS,smsSin:smsSin,sinSms:sinSms,TOL:TOL};
  var fpN=function(fp){var f=FPAGO.find(function(x){return x.id===fp;});return f?f.emoji+' '+f.label:fp;};
  var hhmm=function(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);};
  var totSmsSin=smsSin.reduce(function(a,m){return a+m.monto;},0);
  var totSinSms=sinSms.reduce(function(a,m){return a+m.monto;},0);
  res.innerHTML=
    '<div style="background:var(--bg);border-radius:9px;padding:9px 12px;margin-bottom:8px;font-size:12px">'
      +'📱 '+sms.length+' mensajes · ✅ '+ok.length+' cruzados'+(gruposS.length?' · 🧩 '+gruposS.length+' agrupados':'')+(parecidosS.length?' · 💠 '+parecidosS.length+' con redondeo':'')+(fiadoDiaS.length?' · 📒 '+fiadoDiaS.length+' fiados por día':'')+' · 📥 '+smsSin.length+' sin registro · 📤 '+sinSms.length+' sin mensaje'
    +'</div>'
    +(ok.length?'<div style="font-weight:800;font-size:12px;color:#22c55e;margin-bottom:3px">✅ Cruzados al minuto</div>'
      +ok.map(function(x){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#22c55e">'+fmt(x.sms.monto)+'</b> · SMS '+hhmm(x.sms.ts)+(x.sms.de?' de '+esc(x.sms.de):'')+' ↔ '+x.mov.ref+' ('+fpN(x.mov.fp)+') · Δ'+x.difMin+' min</div>';}).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(gruposS.length?'<div style="font-weight:800;font-size:12px;color:#38bdf8;margin-bottom:3px">🧩 Pagos divididos (varios ↔ uno, por hora del cobro)</div>'
      +gruposS.map(function(g){
        if(g.tipo==='pagos→cobro')return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#38bdf8">'+g.pagos.map(function(p){return fmt(p.monto);}).join(' + ')+'</b> ('+g.pagos.length+' transferencias) ↔ '+g.mov.ref+' <b>'+fmt(g.mov.monto)+'</b> · Δmáx '+g.dMaxMin+' min</div>';
        return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#38bdf8">'+fmt(g.pago.monto)+'</b> (1 transferencia) ↔ '+g.movs.map(function(m){return m.ref+' '+fmt(m.monto);}).join(' + ')+' · Δmáx '+g.dMaxMin+' min</div>';
      }).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(parecidosS.length?'<div style="font-weight:800;font-size:12px;color:#38bdf8;margin-bottom:3px">💠 Cifras parecidas (el cliente redondeó el pago)</div>'
      +parecidosS.map(function(x){
        var deMas=x.dif>0;
        return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#38bdf8">'+fmt(x.pago.monto)+'</b> recibido · '+hhmm(x.pago.ts)+(x.pago.de?' de '+esc(x.pago.de):'')+' ↔ '+x.mov.ref+' <b>'+fmt(x.mov.monto)+'</b> ('+fpN(x.mov.fp)+') · '
          +(deMas?'<span style="color:#22c55e;font-weight:800">pagó '+fmt(x.dif)+' de más 🎁</span>':'<span style="color:#ef4444;font-weight:800">pagó '+fmt(-x.dif)+' de MENOS ⚠️</span>')
          +' · Δ'+x.difMin+' min</div>';
      }).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(fiadoDiaS.length?'<div style="font-weight:800;font-size:12px;color:#a855f7;margin-bottom:3px">📒 Fiados cruzados por monto y día (la plata llegó antes del registro)</div>'
      +fiadoDiaS.map(function(x){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:#a855f7">'+fmt(x.pago.monto)+'</b> · llegó '+hhmm(x.pago.ts)+(x.pago.de?' de '+esc(x.pago.de):'')+' ↔ registrado '+hhmm(x.mov.ts)+' · '+x.mov.ref+'</div>';}).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(smsSin.length?'<div style="font-weight:800;font-size:12px;color:#ef4444;margin-bottom:3px">📥 Llegó plata al banco SIN registro en el sistema · '+fmt(totSmsSin)+'</div>'
      +smsSin.map(function(m,i){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><div onclick="diagSmsSin('+i+')" style="cursor:pointer"><b style="color:#ef4444">'+fmt(m.monto)+'</b> · '+hhmm(m.ts)+(m.de?' · de '+esc(m.de):'')+' <span style="color:var(--muted)">▸ ¿por qué?</span></div><div id="sdiag-r'+i+'" style="display:none"></div></div>';}).join('')+'<div style="margin-bottom:8px"></div>':'')
    +(sinSms.length?'<div style="font-weight:800;font-size:12px;color:#f5a623;margin-bottom:3px">📤 Registrado en el sistema SIN mensaje del banco · '+fmt(totSinSms)+'</div>'
      +sinSms.map(function(mv,i){return'<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><div onclick="diagMovSin('+i+')" style="cursor:pointer"><b style="color:#f5a623">'+fmt(mv.monto)+'</b> · '+hhmm(mv.ts)+' · '+mv.ref+' ('+fpN(mv.fp)+') <span style="color:var(--muted)">▸ ¿por qué?</span></div><div id="sdiag-m'+i+'" style="display:none"></div></div>';}).join(''):'')
    +'<div style="color:var(--muted);font-size:10px;margin-top:6px">Periodo: <b>'+rango.label+'</b>'+(fueraRango?' · '+fueraRango+' mensajes de otras fechas ignorados':'')+' · Mensajes Y cobros se revisan dentro de la misma ventana de tiempo · Cruce por monto exacto y hora (±'+(TOL/60000)+' min), y por cifras parecidas: hasta $2.000 de diferencia, o hasta $5.000 si pagaron de más con cifra redonda. Ojo: si no llegan TODOS los avisos del banco, la sección 📤 puede mostrar cobros legítimos.</div>';
}
function _concilDia(d){
  // Normaliza cualquier formato de fecha a 'YYYY-MM-DD'
  if(d instanceof Date&&!isNaN(d))return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  if(typeof d==='number'&&d>20000){var dd=new Date(Math.round((d-25569)*86400*1000));return _concilDia(dd);}
  if(typeof d==='string'){
    var m=d.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if(m){var y=m[3].length===2?'20'+m[3]:m[3];return y+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);}
    var m2=d.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if(m2)return m2[1]+'-'+('0'+m2[2]).slice(-2)+'-'+('0'+m2[3]).slice(-2);
  }
  return null;
}
function _diasEntre(d1,d2){
  return Math.abs((new Date(d1+'T12:00:00')-new Date(d2+'T12:00:00'))/86400000);
}
function procesarArchivoBanco(input){
  var file=input.files&&input.files[0];
  if(!file)return;
  var res=document.getElementById('concil-result');
  if(res)res.innerHTML='<div style="color:var(--muted);font-size:12px;text-align:center;padding:14px">⏳ Leyendo y cruzando movimientos...</div>';
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var wb=XLSX.read(new Uint8Array(ev.target.result),{type:'array',cellDates:true});
      var ws=wb.Sheets[wb.SheetNames[0]];
      var rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true});
      // Encontrar la fila de encabezados (contiene Fecha y Valor)
      var hIdx=-1,cFecha=-1,cDesc=-1,cValor=-1;
      for(var i=0;i<Math.min(rows.length,15);i++){
        var r=(rows[i]||[]).map(function(c){return String(c||'').toLowerCase();});
        var fi=r.findIndex(function(c){return c.indexOf('fecha')>=0;});
        var vi=r.findIndex(function(c){return c.indexOf('valor')>=0||c.indexOf('monto')>=0||c.indexOf('importe')>=0;});
        if(fi>=0&&vi>=0){hIdx=i;cFecha=fi;cValor=vi;cDesc=r.findIndex(function(c){return c.indexOf('desc')>=0||c.indexOf('concepto')>=0||c.indexOf('transac')>=0;});break;}
      }
      if(hIdx<0)throw new Error('No encontré columnas de Fecha y Valor en el archivo. ¿Es el extracto de movimientos?');
      var movs=[];
      for(var j=hIdx+1;j<rows.length;j++){
        var row=rows[j];if(!row)continue;
        var dia=_concilDia(row[cFecha]);
        var val=row[cValor];
        if(typeof val==='string')val=parseFloat(val.replace(/[^0-9.,-]/g,'').replace(/\./g,'').replace(',','.'))||parseFloat(val.replace(/[^0-9.-]/g,''));
        val=Math.round(Number(val)||0);
        if(!dia||!val)continue;
        movs.push({dia:dia,desc:String((cDesc>=0?row[cDesc]:'')||'').trim(),valor:val,usado:false});
      }
      if(!movs.length)throw new Error('El archivo no tiene movimientos legibles.');
      window._concilMovs=movs;
      ejecutarConciliacion(movs);
    }catch(err){
      if(res)res.innerHTML='<div style="background:#ef444414;border:1px solid #ef444433;border-radius:9px;padding:10px;color:#ef4444;font-size:12px">❌ '+esc(err.message||'No pude leer el archivo.')+'</div>';
    }
  };
  reader.readAsArrayBuffer(file);
}
// Recalcula la conciliación en vivo cuando cambian los medios de pago o la tolerancia
function reconciliarBanco(){
  if(window._concilMovs)ejecutarConciliacion(window._concilMovs);
}
// Exporta el resultado de la conciliación a Excel
function exportarConcilExcel(){
  var r=window._concilRes;
  if(!r){alert('Primero sube el extracto y ejecuta la conciliación.');return;}
  if(typeof XLSX==='undefined'||!window._xlsxReady){alert('La librería de Excel aún no carga.');return;}
  var wb=XLSX.utils.book_new();
  function hoja(nombre,filas){XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(filas.length?filas:[['(sin datos)']]),nombre.slice(0,31));}
  function fpN(fp){var f=FPAGO.find(function(x){return x.id===fp;});return f?f.label:fp;}
  var sum=function(arr,k){return arr.reduce(function(a,x){return a+(x[k]||0);},0);};
  // Resumen
  hoja('Resumen',[
    ['CONCILIACIÓN BANCARIA · '+NEGOCIO.nombre],
    ['Generada',new Date().toLocaleString('es-CO')],
    ['Rango del extracto',r.dMin+' a '+r.dMax],
    ['Formas de pago conciliadas',r.fps.map(fpN).join(', ')],
    ['Tolerancia de fecha','±'+r.tol+' día(s)'],
    [],
    ['Concepto','Cantidad','Total'],
    ['Movimientos del banco',r.totalMovs,''],
    ['Pagos digitales del POS',r.pagosPOS.length,sum(r.pagosPOS,'monto')],
    ['✅ Conciliados',r.pagosPOS.filter(function(p){return p.ok;}).length,sum(r.pagosPOS.filter(function(p){return p.ok;}),'monto')],
    ['🔴 Pagos POS sin respaldo en banco',r.pagosSinBanco.length,sum(r.pagosSinBanco,'monto')],
    ['🟣 Posibles montos mal digitados',(r.malDigitados||[]).length,''],
    ['🧩 Pagos partidos (varias transferencias)',(r.partidos||[]).length,(r.partidos||[]).reduce(function(a,x){return a+x.pos.monto;},0)],
    ['🟠 Salidas del banco no reportadas',r.egresosSinReportar.length,sum(r.egresosSinReportar,'valor')],
    ['🔵 Ingresos al banco sin venta POS',r.ingresosSinPOS.length,sum(r.ingresosSinPOS,'valor')],
    ['🟡 Gastos POS sin salida en banco',r.gastosSinBanco.length,sum(r.gastosSinBanco,'monto')],
    ['⚪ Movimientos propios del banco',r.egresosDelBanco.length,sum(r.egresosDelBanco,'valor')]
  ]);
  // 1. Pagos sin respaldo (fraude potencial)
  var h1=[['Fecha','Hora','Mesa','Forma de pago','Monto','Referencia','Cobró','Tiene foto']];
  r.pagosSinBanco.forEach(function(p){h1.push([fmtFecha(p.ts),fmtTime(p.ts),p.mesa,fpN(p.fp),p.monto,p.refPago||'',p.uidNombre||'',p.compId?'Sí':'No']);});
  hoja('POS sin respaldo banco',h1);
  // 1b. Posibles mal digitados
  var h1b=[['Fecha POS','Hora','Mesa','Forma de pago','POS registró','Banco recibió','Fecha banco','Diferencia','Interpretación','Cobró','Tiene foto']];
  (r.malDigitados||[]).forEach(function(par){
    var dif=par.banco.valor-par.pos.monto;
    h1b.push([fmtFecha(par.pos.ts),fmtTime(par.pos.ts),par.pos.mesa,fpN(par.pos.fp),par.pos.monto,par.banco.valor,par.banco.dia,dif,
      dif>0?'Entró MÁS de lo registrado (posible sub-registro)':'Entró MENOS de lo registrado (pago no cubre)',
      par.pos.uidNombre||'',par.pos.compId?'Sí':'No']);
  });
  hoja('Posibles mal digitados',h1b);
  // 1c. Pagos partidos
  var h1c=[['Fecha POS','Hora','Mesa','Forma de pago','Monto venta','Transferencia banco','Fecha banco','Valor transferencia','Cobró']];
  (r.partidos||[]).forEach(function(par){
    par.bancos.forEach(function(b,i){
      h1c.push([i===0?fmtFecha(par.pos.ts):'',i===0?fmtTime(par.pos.ts):'',i===0?par.pos.mesa:'',i===0?fpN(par.pos.fp):'',i===0?par.pos.monto:'',b.desc||'',b.dia,b.valor,i===0?(par.pos.uidNombre||''):'']);
    });
  });
  hoja('Pagos partidos',h1c);
  // 2. Salidas del banco no reportadas
  var h2=[['Fecha','Descripción del banco','Valor']];
  r.egresosSinReportar.forEach(function(b){h2.push([b.dia,b.desc,b.valor]);});
  hoja('Banco sin reportar gasto',h2);
  // 3. Ingresos sin venta POS
  var h3=[['Fecha','Descripción del banco','Valor']];
  r.ingresosSinPOS.forEach(function(b){h3.push([b.dia,b.desc,b.valor]);});
  hoja('Ingresos sin venta POS',h3);
  // 4. Gastos POS sin salida
  var h4=[['Fecha','Hora','Concepto','Forma de pago','Monto','Registró']];
  r.gastosSinBanco.forEach(function(g){h4.push([fmtFecha(g.ts),fmtTime(g.ts),g.concepto,fpN(g.fp),g.monto,g.uidNombre||'']);});
  hoja('Gastos sin salida banco',h4);
  // 5. Movimientos propios del banco
  var h5=[['Fecha','Descripción','Valor']];
  r.egresosDelBanco.forEach(function(b){h5.push([b.dia,b.desc,b.valor]);});
  hoja('Movs propios del banco',h5);
  // 6. Conciliados
  var h6=[['Fecha','Hora','Mesa','Forma de pago','Monto','Referencia','Cobró']];
  r.pagosPOS.filter(function(p){return p.ok;}).forEach(function(p){h6.push([fmtFecha(p.ts),fmtTime(p.ts),p.mesa,fpN(p.fp),p.monto,p.refPago||'',p.uidNombre||'']);});
  hoja('Conciliados',h6);
  XLSX.writeFile(wb,NEGOCIO.archivo+'-Conciliacion-'+r.dMin+'-a-'+r.dMax+'.xlsx');
  showToast('📥 Conciliación exportada a Excel','#22c55e');
}
function ejecutarConciliacion(movs){
  // Resetear cruces de corridas anteriores (permite recalcular al cambiar filtros)
  movs.forEach(function(m){m.usado=false;m.usadoAprox=false;m.usadoPart=false;});
  var fps=[];document.querySelectorAll('.cb-fp').forEach(function(cb){if(cb.checked)fps.push(cb.value);});
  var res0=document.getElementById('concil-result');
  if(!fps.length){
    if(res0)res0.innerHTML='<div style="background:#f5a62314;border:1px solid #f5a62333;border-radius:9px;padding:10px;color:#f5a623;font-size:12px">⚠️ Marca al menos una forma de pago para conciliar.</div>';
    return;
  }
  var tol=parseInt((document.getElementById('concil-tol')||{}).value);if(isNaN(tol))tol=1;
  // Rango de fechas del extracto
  var dias=movs.map(function(m){return m.dia;}).sort();
  var dMin=dias[0],dMax=dias[dias.length-1];
  function enRango(ts){var d=_concilDia(new Date(ts));return d>=dMin&&d<=dMax;}
  // ── Lado POS: pagos digitales (de ventas) ──
  var pagosPOS=[];
  ventas.forEach(function(v){
    if(!enRango(v.ts))return;
    var pl=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
    pl.forEach(function(p){
      if(fps.indexOf(p.fp)<0||!(p.monto>0))return;
      pagosPOS.push({ts:v.ts,dia:_concilDia(new Date(v.ts)),mesa:v.mesa||'',fp:p.fp,monto:Math.round(p.monto),uidNombre:v.uidNombre||'',compId:v.compId||null,refPago:v.refPago||'',ok:false});
    });
  });
  // ── Lado POS: gastos digitales ──
  var gastosPOS=gastos.filter(function(g){return enRango(g.ts)&&fps.indexOf(g.fp||'')>=0;}).map(function(g){
    return {ts:g.ts,dia:_concilDia(new Date(g.ts)),concepto:g.concepto||'',monto:Math.round(g.valor||0),fp:g.fp,uidNombre:g.uidNombre||'',ok:false};
  });
  // ── Lado banco ──
  var bIngresos=movs.filter(function(m){return m.valor>0;});
  var bEgresos=movs.filter(function(m){return m.valor<0;}).map(function(m){return {dia:m.dia,desc:m.desc,valor:Math.abs(m.valor),usado:false};});
  // ── Cruce 1: pagos POS vs ingresos banco (mismo valor, fecha dentro de tolerancia) ──
  pagosPOS.sort(function(a,b){return a.ts-b.ts;});
  pagosPOS.forEach(function(p){
    var mejor=-1,mejorDist=999;
    for(var i=0;i<bIngresos.length;i++){
      var b=bIngresos[i];
      if(b.usado||b.valor!==p.monto)continue;
      var dist=_diasEntre(b.dia,p.dia);
      if(dist<=tol&&dist<mejorDist){mejor=i;mejorDist=dist;}
    }
    if(mejor>=0){bIngresos[mejor].usado=true;p.ok=true;}
  });
  // ── Cruce 2: gastos POS vs egresos banco ──
  gastosPOS.forEach(function(g){
    var mejor=-1,mejorDist=999;
    for(var i=0;i<bEgresos.length;i++){
      var b=bEgresos[i];
      if(b.usado||b.valor!==g.monto)continue;
      var dist=_diasEntre(b.dia,g.dia);
      if(dist<=tol&&dist<mejorDist){mejor=i;mejorDist=dist;}
    }
    if(mejor>=0){bEgresos[mejor].usado=true;g.ok=true;}
  });
  // ── Clasificar restos ──
  var pagosSinBanco=pagosPOS.filter(function(p){return !p.ok;});
  var ingresosSinPOS=bIngresos.filter(function(b){return !b.usado;});
  // ── Cruce 3: POSIBLES MONTOS MAL DIGITADOS (cero de más o de menos) ──
  // Un pago sin respaldo y un ingreso sin venta, en fechas cercanas, donde uno es 10x o 100x el otro
  var malDigitados=[];
  pagosSinBanco.forEach(function(p){
    var mejor=null,mejorDist=999;
    ingresosSinPOS.forEach(function(b){
      if(b.usadoAprox)return;
      var factor=(b.valor===p.monto*10||b.valor===p.monto*100||p.monto===b.valor*10||p.monto===b.valor*100);
      if(!factor)return;
      var dist=_diasEntre(b.dia,p.dia);
      if(dist<=tol&&dist<mejorDist){mejor=b;mejorDist=dist;}
    });
    if(mejor){mejor.usadoAprox=true;p.aprox=mejor;malDigitados.push({pos:p,banco:mejor});}
  });
  // Sacar los emparejados aproximados de las listas rojas/azules para no contarlos doble
  pagosSinBanco=pagosSinBanco.filter(function(p){return !p.aprox;});
  ingresosSinPOS=ingresosSinPOS.filter(function(b){return !b.usadoAprox;});
  // ── Cruce 4: PAGOS PARTIDOS — el cliente pagó con 2 o 3 transferencias que SUMAN el monto ──
  var partidos=[];
  pagosSinBanco.forEach(function(p){
    var cand=ingresosSinPOS.filter(function(b){return !b.usadoPart&&b.valor<p.monto&&_diasEntre(b.dia,p.dia)<=tol;});
    if(cand.length>60)cand=cand.slice(0,60);
    var hit=null;
    for(var i=0;i<cand.length&&!hit;i++)for(var j=i+1;j<cand.length&&!hit;j++){
      if(cand[i].valor+cand[j].valor===p.monto)hit=[cand[i],cand[j]];
    }
    if(!hit)for(var a=0;a<cand.length&&!hit;a++)for(var b2=a+1;b2<cand.length&&!hit;b2++){
      var resto=p.monto-cand[a].valor-cand[b2].valor;
      if(resto<=0)continue;
      for(var c=b2+1;c<cand.length;c++){
        if(cand[c].valor===resto){hit=[cand[a],cand[b2],cand[c]];break;}
      }
    }
    if(hit){
      hit.forEach(function(h){h.usadoPart=true;});
      p.partido=hit;
      partidos.push({pos:p,bancos:hit});
    }
  });
  pagosSinBanco=pagosSinBanco.filter(function(p){return !p.partido;});
  ingresosSinPOS=ingresosSinPOS.filter(function(b){return !b.usadoPart;});
  var esDelBanco=function(d){return /4X1000|INTERES|CUOTA.*MANEJO|C MANEJO|COMISION|IVA COMIS|GMF|RETENCION/i.test(d);};
  var egresosBancoRestantes=bEgresos.filter(function(b){return !b.usado;});
  var egresosDelBanco=egresosBancoRestantes.filter(function(b){return esDelBanco(b.desc);});
  var egresosSinReportar=egresosBancoRestantes.filter(function(b){return !esDelBanco(b.desc);});
  var gastosSinBanco=gastosPOS.filter(function(g){return !g.ok;});
  var fpLbl=function(fp){var f=FPAGO.find(function(x){return x.id===fp;});return f?f.emoji+' '+f.label:fp;};
  var sum=function(arr,k){return arr.reduce(function(a,x){return a+(x[k]||0);},0);};
  function filaPOS(p){
    return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">'+esc(p.mesa)+' · '+fpLbl(p.fp)+'</div>'
      +'<div style="color:var(--muted);font-size:10px">'+fmtFechaCorta(p.ts)+(p.refPago?' · Ref '+esc(p.refPago):'')+(p.uidNombre?' · ✍️ '+esc(p.uidNombre):'')+'</div></div>'
      +'<span style="color:#ef4444;font-weight:900;white-space:nowrap">'+fmt(p.monto)+'</span>'
      +(p.compId?'<button onclick="verComprobante(\''+p.compId+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer">📷</button>':'')
    +'</div>';
  }
  function filaBanco(b,color){
    return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">'+esc(b.desc||'Movimiento')+'</div>'
      +'<div style="color:var(--muted);font-size:10px">'+b.dia+'</div></div>'
      +'<span style="color:'+color+';font-weight:900;white-space:nowrap">'+fmt(b.valor)+'</span></div>';
  }
  function filaGasto(g){
    return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">'+esc(g.concepto)+' · '+fpLbl(g.fp)+'</div>'
      +'<div style="color:var(--muted);font-size:10px">'+fmtFechaCorta(g.ts)+(g.uidNombre?' · ✍️ '+esc(g.uidNombre):'')+'</div></div>'
      +'<span style="color:#f5a623;font-weight:900;white-space:nowrap">'+fmt(g.monto)+'</span></div>';
  }
  function seccion(titulo,color,desc,filas,total){
    return'<div style="background:'+color+'0d;border:1px solid '+color+'40;border-radius:11px;padding:10px 12px;margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center"><span style="color:'+color+';font-weight:800;font-size:13px">'+titulo+'</span>'+(total!=null?'<span style="color:'+color+';font-weight:900;font-size:14px">'+fmt(total)+'</span>':'')+'</div>'
      +'<div style="color:var(--muted);font-size:10px;margin:2px 0 6px">'+desc+'</div>'
      +'<div style="max-height:32vh;overflow-y:auto">'+(filas||'<div style="color:#22c55e;font-size:12px;font-weight:700;padding:4px 0">✅ Nada pendiente aquí</div>')+'</div>'
    +'</div>';
  }
  function filaMalDig(par){
    var p=par.pos,b=par.banco;
    var dif=b.valor-p.monto;
    var subRegistro=dif>0;  // el banco recibió MÁS de lo registrado
    return'<div style="padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
        +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">'+esc(p.mesa)+' · '+fpLbl(p.fp)+'</div>'
        +'<div style="color:var(--muted);font-size:10px">'+fmtFechaCorta(p.ts)+(p.uidNombre?' · ✍️ '+esc(p.uidNombre):'')+'</div></div>'
        +(p.compId?'<button onclick="verComprobante(\''+p.compId+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer">📷</button>':'')
      +'</div>'
      +'<div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px;background:var(--bg);border-radius:7px;padding:6px 8px">'
        +'<span>POS registró: <b style="color:#ef4444">'+fmt(p.monto)+'</b></span>'
        +'<span>Banco recibió: <b style="color:#22c55e">'+fmt(b.valor)+'</b> ('+b.dia+')</span>'
      +'</div>'
      +'<div style="font-size:10px;font-weight:700;margin-top:3px;color:'+(subRegistro?'#a855f7':'#ef4444')+'">'
        +(subRegistro?'⬆️ Entró '+fmt(dif)+' MÁS de lo registrado — posible venta sub-registrada o cero de menos al digitar':'⬇️ Entró '+fmt(Math.abs(dif))+' MENOS de lo registrado — el pago no cubre la venta')
      +'</div>'
    +'</div>';
  }
  function filaPartido(par){
    var p=par.pos;
    var det=par.bancos.map(function(b){
      return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:2px 0 2px 12px"><span>↳ '+esc(b.desc||'Transferencia')+' <span style="font-size:9px">('+b.dia+')</span></span><span style="font-weight:700;color:#22c55e">'+fmt(b.valor)+'</span></div>';
    }).join('');
    return'<div style="padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
        +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">'+esc(p.mesa)+' · '+fpLbl(p.fp)+'</div>'
        +'<div style="color:var(--muted);font-size:10px">'+fmtFechaCorta(p.ts)+(p.uidNombre?' · ✍️ '+esc(p.uidNombre):'')+'</div></div>'
        +'<span style="color:#a3e635;font-weight:900;white-space:nowrap">'+fmt(p.monto)+'</span>'
        +(p.compId?'<button onclick="verComprobante(\''+p.compId+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer">📷</button>':'')
      +'</div>'+det
    +'</div>';
  }
  var conciliados=pagosPOS.length-pagosSinBanco.length-malDigitados.length-partidos.length;
  // Guardar resultado para exportación a Excel
  window._concilRes={dMin:dMin,dMax:dMax,fps:fps,tol:tol,totalMovs:movs.length,
    pagosPOS:pagosPOS,pagosSinBanco:pagosSinBanco,egresosSinReportar:egresosSinReportar,
    ingresosSinPOS:ingresosSinPOS,gastosSinBanco:gastosSinBanco,egresosDelBanco:egresosDelBanco,
    malDigitados:malDigitados,partidos:partidos};
  var fpsTxt=fps.map(fpLbl).join(' · ');
  var html='<div style="background:var(--bg);border:1px solid var(--border);border-radius:11px;padding:10px 12px;margin-bottom:10px">'
    +'<div style="font-weight:800;font-size:13px;margin-bottom:4px">📊 Resumen · extracto del '+dMin+' al '+dMax+'</div>'
    +'<div style="color:var(--muted);font-size:11px;line-height:1.7">'
      +'Conciliando: <b style="color:var(--text)">'+fpsTxt+'</b><br>'
      +'Movimientos del banco: <b style="color:var(--text)">'+movs.length+'</b> · Pagos digitales del POS en ese rango: <b style="color:var(--text)">'+pagosPOS.length+'</b><br>'
      +'✅ Conciliados: <b style="color:#22c55e">'+conciliados+' ('+fmt(sum(pagosPOS.filter(function(p){return p.ok;}),'monto'))+')</b>'
    +'</div>'
    +'<button onclick="exportarConcilExcel()" style="width:100%;margin-top:8px;background:#22c55e;color:#fff;border:none;border-radius:9px;padding:9px;font-weight:800;font-size:12px;cursor:pointer">📥 Exportar conciliación a Excel</button>'
  +'</div>'
    +seccion('🔴 Pagos del POS SIN respaldo en el banco ('+pagosSinBanco.length+')','#ef4444','Se cobraron en el sistema pero NO aparecen consignados. Revisa el comprobante 📷 de cada uno — puede ser un pago falsificado o de otra cuenta.',pagosSinBanco.map(filaPOS).join(''),sum(pagosSinBanco,'monto'))
    +seccion('🟣 Posibles montos MAL DIGITADOS ('+malDigitados.length+')','#a855f7','Pares donde el POS y el banco muestran el mismo pago pero con un cero de más o de menos (ej: se registraron $6.000 y entraron $60.000). Verifica el comprobante y corrige la venta.',malDigitados.map(filaMalDig).join(''),null)
    +seccion('🧩 Pagos cubiertos por VARIAS transferencias ('+partidos.length+')','#a3e635','Clientes que pagaron una sola cuenta con 2 o 3 transferencias que suman el monto exacto. Estos SÍ entraron completos al banco.',partidos.map(filaPartido).join(''),partidos.reduce(function(a,x){return a+x.pos.monto;},0))
    +seccion('🟠 Salidas del banco NO reportadas como gasto ('+egresosSinReportar.length+')','#f97316','Plata que salió de la cuenta y nadie registró en Gastos.',egresosSinReportar.map(function(b){return filaBanco(b,'#f97316');}).join(''),sum(egresosSinReportar,'valor'))
    +seccion('🔵 Ingresos al banco sin venta en el POS ('+ingresosSinPOS.length+')','#38bdf8','Consignaciones que no cruzaron con ningún cobro (transferencias personales, ventas sin registrar, o pagos con fecha/valor distinto).',ingresosSinPOS.map(function(b){return filaBanco(b,'#38bdf8');}).join(''),sum(ingresosSinPOS,'valor'))
    +seccion('🟡 Gastos digitales del POS que no salieron del banco ('+gastosSinBanco.length+')','#f5a623','Registrados como gasto pero sin salida en el extracto (pueden ser de Nequi/Daviplata como apps aparte).',gastosSinBanco.map(filaGasto).join(''),sum(gastosSinBanco,'monto'))
    +seccion('⚪ Movimientos propios del banco ('+egresosDelBanco.length+')','#94a3b8','4x1000, comisiones y cuotas de manejo. Normales, pero recuerda registrarlos como gasto para que la utilidad sea real.',egresosDelBanco.map(function(b){return filaBanco(b,'#94a3b8');}).join(''),sum(egresosDelBanco,'valor'));
  var res=document.getElementById('concil-result');
  if(res)res.innerHTML=html;
}

/* ═══════════ DETALLE DE SALDO POR FORMA DE PAGO ═══════════ */
// Muestra de dónde viene el dinero por ese medio, con fecha y hora,
// en el periodo elegido: turno actual, últimos 7 días o todo el histórico.
function verDetalleSaldoFP(fpId,modo){
  var f=FPAGO.find(function(x){return x.id===fpId;});
  if(!f)return;
  modo=modo||'todo';
  var desde=modo==='turno'?(turnoInicio||0):(modo==='7d'?a52Ahora()-7*24*3600*1000:0);
  var vlist=ventas.filter(function(v){return v.ts>=desde;});
  var glist=gastos.filter(function(g){return g.ts>=desde;});
  // Entradas: cada pago de venta con esta forma de pago
  var entradas=[];
  vlist.forEach(function(v){
    var pl=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
    pl.forEach(function(p){
      if(p.fp!==fpId||!(p.monto>0))return;
      entradas.push({ts:v.ts,mesa:v.mesa||'',monto:p.monto,uidNombre:v.uidNombre||'',compId:v.compId||null,refPago:v.refPago||'',mixto:pl.length>1});
    });
  });
  var salidas=glist.filter(function(g){return (g.fp||'efectivo')===fpId;});
  var totalIn=entradas.reduce(function(a,e){return a+e.monto;},0);
  var totalOut=salidas.reduce(function(a,g){return a+(g.valor||0);},0);
  // Mezclar entradas y salidas en una sola línea de tiempo con separadores por día
  var movs=entradas.map(function(e){e._t='in';return e;}).concat(salidas.map(function(g){return {_t:'out',ts:g.ts,concepto:g.concepto,categoria:g.categoria,valor:g.valor,uidNombre:g.uidNombre};}));
  movs.sort(function(a,b){return b.ts-a.ts;});
  var LIMITE=300;var recortado=movs.length>LIMITE;
  movs=movs.slice(0,LIMITE);
  var rows='';var diaPrev='';
  movs.forEach(function(x){
    var d=new Date(x.ts);
    var dia=('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+String(d.getFullYear()).slice(-2);
    if(dia!==diaPrev){
      diaPrev=dia;
      rows+='<div style="color:var(--gold);font-size:10px;font-weight:800;letter-spacing:1px;padding:8px 0 3px;border-bottom:1px solid var(--gold)33">📅 '+dia+'</div>';
    }
    if(x._t==='in'){
      rows+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">'
        +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">'+esc(x.mesa)+(x.mixto?' <span style="color:var(--muted);font-size:9px">(pago mixto)</span>':'')+'</div>'
          +'<div style="color:var(--muted);font-size:10px">🕐 '+fmtTime(x.ts)+(x.refPago?' · Ref '+esc(x.refPago):'')+(x.uidNombre?' · ✍️ '+esc(x.uidNombre):'')+'</div></div>'
        +'<span style="color:#22c55e;font-weight:900;white-space:nowrap">+'+fmt(x.monto)+'</span>'
        +(x.compId?'<button onclick="verComprobante(\''+x.compId+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer">📷</button>':'')
      +'</div>';
    } else {
      rows+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">'
        +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">💸 '+esc(x.concepto)+'</div>'
          +'<div style="color:var(--muted);font-size:10px">🕐 '+fmtTime(x.ts)+' · '+esc(x.categoria||'')+(x.uidNombre?' · ✍️ '+esc(x.uidNombre):'')+'</div></div>'
        +'<span style="color:#ef4444;font-weight:900;white-space:nowrap">−'+fmt(x.valor)+'</span>'
      +'</div>';
    }
  });
  // Caja de totales: en "turno" cuadra con el saldo; en otros periodos son totales del periodo
  var cajaTotales;
  if(modo==='turno'){
    var ini=cajaHoy['ini_'+fpId]||0;
    var saldo=ini+totalIn-totalOut;
    cajaTotales='<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--muted)">Caja inicial del turno</span><span style="font-weight:700">'+fmt(ini)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--muted)">+ Entradas ('+entradas.length+')</span><span style="color:#22c55e;font-weight:700">+'+fmt(totalIn)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--muted)">− Salidas ('+salidas.length+')</span><span style="color:#ef4444;font-weight:700">−'+fmt(totalOut)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid var(--border);margin-top:3px"><span style="font-weight:800">= Saldo del turno</span><span style="color:'+f.color+';font-weight:900">'+fmt(saldo)+'</span></div>';
  } else {
    cajaTotales='<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--muted)">Entradas del periodo ('+entradas.length+' pago'+(entradas.length!==1?'s':'')+')</span><span style="color:#22c55e;font-weight:700">+'+fmt(totalIn)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--muted)">Salidas del periodo ('+salidas.length+' gasto'+(salidas.length!==1?'s':'')+')</span><span style="color:#ef4444;font-weight:700">−'+fmt(totalOut)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid var(--border);margin-top:3px"><span style="font-weight:800">Neto del periodo</span><span style="color:'+f.color+';font-weight:900">'+fmt(totalIn-totalOut)+'</span></div>';
  }
  function pill(id,lbl){
    var sel=modo===id;
    return'<button onclick="verDetalleSaldoFP(\''+fpId+'\',\''+id+'\')" style="flex:1;background:'+(sel?f.color:'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?f.color:'var(--border)')+';border-radius:99px;padding:7px 0;font-size:11px;font-weight:800;cursor:pointer">'+lbl+'</button>';
  }
  modal1('<div style="text-align:center;margin-bottom:10px">'
      +'<div style="font-size:26px">'+f.emoji+'</div>'
      +'<div style="font-weight:900;font-size:16px;color:'+f.color+'">'+f.label+' · movimientos</div>'
    +'</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:12px">'+pill('turno','Turno actual')+pill('7d','Últimos 7 días')+pill('todo','Todo')+'</div>'
    +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:9px 12px;margin-bottom:10px;font-size:12px">'+cajaTotales+'</div>'
    +(recortado?'<div style="color:var(--muted);font-size:10px;margin-bottom:6px">Mostrando los últimos '+LIMITE+' movimientos.</div>':'')
    +'<div style="max-height:48vh;overflow-y:auto;margin-bottom:12px">'+(rows||'<div style="color:var(--muted);font-size:12px;padding:10px 0;text-align:center">Sin movimientos por este medio en el periodo.</div>')+'</div>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text)">Cerrar</button>');
}

function renderCaja(){
  var esAdmin=usuarioActivo&&usuarioActivo.rol==='admin';
  var hoyV=ventasTurno();
  var hoyG=gastosTurno();
  var totalV=hoyV.reduce(function(a,v){return a+v.total;},0);
  var totalG=hoyG.reduce(function(a,g){return a+g.valor;},0);
  var utilidad=cajaHoy.cajaInicial+totalV-totalG;

  // Ventas por forma de pago
  var porFP={};
  hoyV.forEach(function(v){
    if(v.pagos&&v.pagos.length){
      v.pagos.forEach(function(p){porFP[p.fp]=(porFP[p.fp]||0)+p.monto;});
    } else {
      porFP[v.fp]=(porFP[v.fp]||0)+v.total;
    }
  });
  // Gastos por forma de pago
  var gastosPorFP={};
  hoyG.forEach(function(g){var gfp=g.fp||'efectivo';gastosPorFP[gfp]=(gastosPorFP[gfp]||0)+g.valor;});
  // Saldo real por casilla = caja inicial del método + ventas - gastos
  function saldoFP(fpId){
    return (cajaHoy['ini_'+fpId]||0)+(porFP[fpId]||0)-(gastosPorFP[fpId]||0);
  }

  var kpis='<div class="kpi-grid">'
    +[['💰','Caja inicial',fmt(cajaHoy.cajaInicial),'#f5a623',null],
      ['🧮','Caja calculada',fmt(cajaHoy.cajaInicial+totalV-totalG),utilidad>=0?'#22c55e':'#ef4444',null],
      ['📈','Ventas del día',fmt(totalV),'#22c55e',null],
      ['📋','Gastos del día',fmt(totalG),'#ef4444',null],
      ['🏦','Utilidad bruta',fmt(utilidad),utilidad>=0?'#22c55e':'#ef4444',null],
      ['📲','Nequi (saldo)',fmt(saldoFP('nequi')),'#8B5CF6','nequi'],
      ['🔴','Daviplata (saldo)',fmt(saldoFP('daviplata')),'#EF4444','daviplata'],
      ['💠','Bre-B (saldo)',fmt(saldoFP('breb')),'#06B6D4','breb'],
      ['💳','Tarjeta (saldo)',fmt(saldoFP('tarjeta')),'#F59E0B','tarjeta'],
      ['💵','Efectivo (saldo)',fmt(saldoFP('efectivo')),'#22C55E','efectivo']
    ].map(function(x){
      var click=x[4]?' onclick="verDetalleSaldoFP(\''+x[4]+'\')" style="cursor:pointer"':'';
      return'<div class="kpi"'+click+'><div style="font-size:20px">'+x[0]+'</div><div style="color:var(--muted);font-size:10px;margin-top:2px">'+x[1]+(x[4]?' <span style="opacity:.6">ⓘ</span>':'')+'</div><div style="color:'+x[3]+';font-weight:900;font-size:15px;margin-top:2px">'+x[2]+'</div></div>';
    }).join('')+'</div>';

  // Configurar caja inicial (solo admin)
  var turnoLabel=turnoInicio?('<div style="color:var(--muted);font-size:11px;margin-top:4px">Turno iniciado: '+fmtDT(turnoInicio)+'</div>'):'';
  var configCaja=esAdmin?'<div class="card2 mb12">'
    +'<div style="color:var(--gold);font-weight:800;font-size:14px;margin-bottom:4px">💰 Turno actual</div>'
    +turnoLabel
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px;margin-top:8px">Caja inicial por forma de pago</div>'
    +FPAGO.map(function(f){
      return'<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">'
        +'<span style="font-size:16px;flex:0 0 auto">'+f.emoji+'</span>'
        +'<span style="color:'+f.color+';font-weight:700;font-size:12px;flex:0 0 auto;width:78px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+f.label+'</span>'
        +'<input class="inp money" type="text" inputmode="numeric" placeholder="0" value="'+moneyFmt(cajaHoy['ini_'+f.id]||0)+'" data-fp-ini="'+f.id+'" style="flex:1;min-width:0;text-align:right;font-size:16px;font-weight:800;padding:10px 12px;letter-spacing:.5px"/>'
      +'</div>';
    }).join('')
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0 12px;padding-top:8px;border-top:1px solid var(--border)"><span style="color:var(--muted);font-size:12px;font-weight:700">Total</span><span style="color:var(--gold);font-weight:900;font-size:17px">'+fmt(FPAGO.reduce(function(a,f){return a+(cajaHoy['ini_'+f.id]||0);},0))+'</span></div>'
    +'<button class="btn btn-gold btn-full" onclick="guardarCajaInicial()">Guardar caja inicial</button>'
  +'</div>':'';

  // Cierre del día (solo admin)
  var cierreBtn=esAdmin?'<div class="card" style="border-color:var(--gold)44;margin-bottom:12px">'
    +'<div style="color:var(--gold);font-weight:800;font-size:14px;margin-bottom:8px">🔒 Cierre de caja</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:12px">Al hacer el cierre se guarda un resumen del día con todos los movimientos. Los datos del día quedan en el historial.</div>'
    +'<button class="btn btn-gold btn-full" onclick="abrirCierre()" style="font-size:15px;padding:12px">🔒 Hacer cierre del día</button>'
    +'</div>':'';

  // Traslado Tarjeta -> Bre-B (cuando el banco deposita)
  var trasladoCard='<div class="card mb12">'
    +'<div class="section-title">🔄 Movimientos de dinero</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:10px">Cuando el banco deposita lo de las tarjetas, pásalo a Bre-B. Caja actual en tarjeta: <b style="color:#F59E0B">'+fmt(cajaHoy.ini_tarjeta||0)+'</b></div>'
    +'<button onclick="abrirTrasladoTarjeta()" style="width:100%;background:#06B6D418;color:#06B6D4;border:1px solid #06B6D444;border-radius:10px;padding:11px;font-weight:700;font-size:13px;cursor:pointer">🔄 Pasar Tarjeta a Bre-B</button>'
    +'<button onclick="abrirTrasladoFP()" style="width:100%;margin-top:8px;background:#8B5CF618;color:#8B5CF6;border:1px solid #8B5CF644;border-radius:10px;padding:11px;font-weight:700;font-size:13px;cursor:pointer">🔀 Mover entre medios (Nequi, Bre-B, Efectivo...)</button>'
  +'</div>';

  // Préstamos de socios al negocio
  var pendientesPS=prestamosSocios.filter(function(p){return (p.monto-(p.devuelto||0))>0;}).sort(function(a,b){return b.ts-a.ts;});
  var totalPS=pendientesPS.reduce(function(a,p){return a+(p.monto-(p.devuelto||0));},0);
  var saldadosPS=prestamosSocios.filter(function(p){return (p.monto-(p.devuelto||0))<=0;}).sort(function(a,b){return b.ts-a.ts;});
  var prestamosCard='<div class="card mb12">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
      +'<div class="section-title" style="margin:0">🤝 Préstamos de socios</div>'
      +(totalPS>0?'<span style="color:#f5a623;font-weight:900;font-size:15px">'+fmt(totalPS)+'</span>':'')
    +'</div>'
    +(totalPS>0?'<div style="color:var(--muted);font-size:11px;margin-bottom:8px">El negocio les debe esto a los socios.</div>':'')
    +pendientesPS.map(function(p){
      var pend=p.monto-(p.devuelto||0);
      var f=FPAGO.find(function(x){return x.id===p.fp;});
      return'<div style="background:var(--card2);border-radius:9px;padding:9px 11px;margin-bottom:6px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center">'
          +'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800">'+(p.tipo==='compra'?'🛒':'💵')+' '+esc(p.socio)+' <span style="color:var(--muted);font-weight:600;font-size:11px">· '+esc(p.concepto||'')+'</span></div>'
          +'<div style="color:var(--muted);font-size:10px;margin-top:1px">🕐 '+fmtFechaCorta(p.ts)+(p.tipo==='dinero'&&f?' · entró a '+f.emoji+' '+f.label:'')+((p.devuelto||0)>0?' · devuelto '+fmt(p.devuelto):'')+'</div></div>'
          +'<span style="color:#f5a623;font-weight:900;font-size:14px;white-space:nowrap">'+fmt(pend)+'</span>'
        +'</div>'
        +'<div style="display:flex;gap:6px;margin-top:6px">'
          +'<button onclick="abrirDevolucionPrestamo(\''+p.id+'\')" style="flex:1;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:7px;padding:7px;font-size:12px;font-weight:700;cursor:pointer">💸 Devolver</button>'
          +'<button onclick="abrirEditarPrestamo(\''+p.id+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer">✏️</button>'
        +'</div>'
      +'</div>';
    }).join('')
    +(pendientesPS.length===0?'<div style="color:var(--dim);text-align:center;padding:10px;font-size:12px">Sin préstamos pendientes</div>':'')
    +(function(){
      // Botón de pago global por socio (cuando tiene algo pendiente)
      var porSocio={};
      pendientesPS.forEach(function(p){porSocio[p.socio]=(porSocio[p.socio]||0)+(p.monto-(p.devuelto||0));});
      return Object.keys(porSocio).map(function(so){
        return'<button onclick="abrirDevolucionTotal(\''+esc(so)+'\')" style="width:100%;margin-top:6px;background:#22c55e;color:#fff;border:none;border-radius:9px;padding:10px;font-weight:800;font-size:13px;cursor:pointer">💸 Devolver TODO a '+esc(so)+' · '+fmt(porSocio[so])+'</button>';
      }).join('');
    })()
    +(!a52Mod('socios')?'':'<button onclick="abrirPrestamoSocio()" style="width:100%;margin-top:4px;background:#f5a62318;color:#f5a623;border:1px solid #f5a62344;border-radius:10px;padding:11px;font-weight:700;font-size:13px;cursor:pointer">+ Registrar préstamo de socio</button>')
    +(saldadosPS.length?'<button data-act="toggle-sec" data-sec="prestamosHist" style="width:100%;margin-top:8px;background:none;border:none;color:var(--muted);font-size:11px;font-weight:700;cursor:pointer;text-align:left">'+(_secOpen.prestamosHist?'▼':'▶')+' Saldados ('+saldadosPS.length+')</button>'
      +(_secOpen.prestamosHist?saldadosPS.map(function(p){
        return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:4px 0;border-bottom:1px solid var(--border)"><span>✓ '+esc(p.socio)+' · '+esc(p.concepto||'')+' <span style="font-size:9px">'+fmtFechaCorta(p.ts)+'</span></span><span style="font-weight:700">'+fmt(p.monto)+'</span></div>';
      }).join(''):''):'')
  +'</div>';

  // Historial de cierres
  var histCierres='<div class="card">'
    +'<button data-act="toggle-sec" data-sec="cierresHist" style="background:none;border:none;color:var(--text);cursor:pointer;font-weight:700;font-size:14px;padding:0;margin-bottom:10px">'+(_secOpen.cierresHist?'▼':'▶')+' 📋 Historial de cierres ('+cierres.length+')</button>'
    +(!_secOpen.cierresHist?'':cierres.length===0?'<div style="color:var(--dim);text-align:center;padding:16px;font-size:13px">Sin cierres registrados</div>'
      :cierres.slice().reverse().map(function(c){
        var uid=usuarios.find(function(u){return u.id===c.uid;});
        return'<div class="cierre-hist-item" onclick="verCierre(\''+c.id+'\')">'
          +'<div class="flex-between">'
          +'<div><div style="font-weight:700;font-size:13px">Cierre '+fmtDate(c.ts)+'</div>'
          +'<div style="color:var(--muted);font-size:11px">'+fmtTime(c.ts)+' · '+(uid?uid.emoji+' '+esc(uid.nombre):esc(c.uid||''))+'</div></div>'
          +'<div style="text-align:right">'
          +'<div style="color:#22c55e;font-weight:900;font-size:14px">'+fmt(c.ventas)+'</div>'
          +'<div style="color:var(--muted);font-size:11px">ventas</div></div></div>'
          +'</div>';
      }).join(''))
    +'</div>';

  // ── Conciliación de pagos digitales del turno ──
  var digRows=[];var digTotales={};
  hoyV.slice().sort(function(a,b){return b.ts-a.ts;}).forEach(function(v){
    var pl=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,label:v.fpLabel||v.fp,monto:v.total}];
    var digs=pl.filter(function(p){return p.fp&&p.fp!=='efectivo'&&p.monto>0;});
    if(!digs.length)return;
    digs.forEach(function(p){
      if(!digTotales[p.fp])digTotales[p.fp]={n:0,t:0};
      digTotales[p.fp].n++;digTotales[p.fp].t+=p.monto;
    });
    var det=digs.map(function(p){var fD=FPAGO.find(function(x){return x.id===p.fp;});return (fD?fD.emoji+' '+fD.label:p.fp)+' '+fmt(p.monto);}).join(' + ');
    digRows.push('<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">'+esc(v.mesa||'')+' · <span style="color:var(--gold)">'+det+'</span></div>'
        +'<div style="color:var(--muted);font-size:10px;margin-top:1px">🕐 '+fmtFechaCorta(v.ts)+(v.refPago?' · Ref: <b>'+esc(v.refPago)+'</b>':'')+(v.uidNombre?' · ✍️ '+esc(v.uidNombre):'')+'</div></div>'
      +(v.compId?'<button onclick="verComprobante(\''+v.compId+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">📷 Ver</button>'
        :'<span style="color:#f5a623;font-size:10px;font-weight:700;white-space:nowrap;text-align:right">Sin foto'+(v.sinFotoMotivo?'<br><span style="font-weight:600;opacity:.8">'+esc(v.sinFotoMotivo)+'</span>':'')+'</span>')
    +'</div>');
  });
  var digResumen=Object.keys(digTotales).map(function(fp){
    var fD=FPAGO.find(function(x){return x.id===fp;});
    return'<div style="flex:1;min-width:100px;background:var(--bg);border-radius:8px;padding:7px 9px;text-align:center"><div style="color:var(--muted);font-size:9px">'+(fD?fD.emoji+' '+fD.label.toUpperCase():fp)+'</div><div style="color:'+(fD?fD.color:'var(--text)')+';font-weight:900;font-size:13px">'+fmt(digTotales[fp].t)+'</div><div style="color:var(--muted);font-size:9px">'+digTotales[fp].n+' pago'+(digTotales[fp].n!==1?'s':'')+'</div></div>';
  }).join('');
  var conciliacion='<div class="card mb12">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
      +'<button data-act="toggle-sec" data-sec="concil" style="background:none;border:none;color:var(--text);cursor:pointer;font-weight:700;font-size:14px;padding:0">'+(_secOpen.concil?'▼':'▶')+' 🧾 Conciliación pagos digitales ('+digRows.length+')</button>'
      +(esAdmin?'<button onclick="abrirConcilBanco()" style="background:#38bdf8;color:#fff;border:none;border-radius:8px;padding:7px 12px;font-weight:800;font-size:11px;cursor:pointer;white-space:nowrap">🏦 Conciliación / SMS</button>':'')
    +'</div>'
    +'<div style="margin-top:6px"></div>'
    +(!_secOpen.concil?'':(digRows.length
      ?'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Compara estos totales contra los movimientos de la app del banco. Toca 📷 para ver el comprobante de cada pago.</div>'
        +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'+digResumen+'</div>'
        +'<div style="max-height:40vh;overflow-y:auto">'+digRows.join('')+'</div>'
      :'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin pagos digitales en este turno</div>'))
  +'</div>';

  // ── Gastos del turno por forma de pago (para cruzar contra el banco) ──
  var gastosFPRows=FPAGO.map(function(f){
    var gs=hoyG.filter(function(g){return (g.fp||'efectivo')===f.id;});
    if(!gs.length)return'';
    var tot=gs.reduce(function(a,g){return a+(g.valor||0);},0);
    var det=gs.slice().sort(function(a,b){return b.ts-a.ts;}).map(function(g){
      return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:3px 0 3px 12px;border-bottom:1px solid var(--border)"><span>'+esc(g.concepto)+'<br><span style="font-size:9px">'+fmtFechaCorta(g.ts)+(g.uidNombre?' · '+esc(g.uidNombre):'')+'</span></span><span style="font-weight:700;white-space:nowrap">'+fmt(g.valor)+'</span></div>';
    }).join('');
    return'<div style="margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border-radius:8px;padding:8px 10px">'
        +'<span style="font-size:13px;font-weight:800;color:'+f.color+'">'+f.emoji+' '+f.label+' <span style="color:var(--muted);font-weight:600;font-size:11px">· '+gs.length+' gasto'+(gs.length!==1?'s':'')+'</span></span>'
        +'<span style="color:'+f.color+';font-weight:900;font-size:14px">'+fmt(tot)+'</span>'
      +'</div>'+det+'</div>';
  }).join('');
  var gastosFPCard='<div class="card mb12">'
    +'<button data-act="toggle-sec" data-sec="gastosFP" style="background:none;border:none;color:var(--text);cursor:pointer;font-weight:700;font-size:14px;padding:0;margin-bottom:6px">'+(_secOpen.gastosFP?'▼':'▶')+' 💸 Gastos por forma de pago ('+hoyG.length+' · '+fmt(totalG)+')</button>'
    +(!_secOpen.gastosFP?'':(gastosFPRows||'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin gastos en este turno</div>'))
  +'</div>';

  // ── Arqueos de efectivo del turno ──
  var arqTurno=arqueos.filter(function(a){return a.ts>=turnoInicio;}).sort(function(a,b){return b.ts-a.ts;});
  var arqRows=arqTurno.map(function(a){
    var difHtml=esAdmin?('<span style="color:'+(a.dif===0?'#22c55e':(a.dif<0?'#ef4444':'#f5a623'))+';font-weight:900;font-size:13px;white-space:nowrap">'+(a.dif===0?'✅ Cuadrada':(a.dif<0?'🔴 −'+fmt(Math.abs(a.dif)):'🟡 +'+fmt(a.dif)))+'</span>'):'';
    return'<div onclick="verArqueo(\''+a.id+'\')" style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer">'
      +'<div style="flex:1"><div style="font-size:12px;font-weight:700">🧮 Contado: <span style="color:var(--gold)">'+fmt(a.total)+'</span></div>'
        +'<div style="color:var(--muted);font-size:10px;margin-top:1px">🕐 '+fmtFechaCorta(a.ts)+' · ✍️ '+esc(a.uidNombre||'')+'</div></div>'
      +difHtml
    +'</div>';
  }).join('');
  var puedeArq=usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'||usuarioActivo.rol==='cajero');
  var arqueoCard='<div class="card mb12">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<span style="font-weight:700;font-size:14px">🧮 Arqueos de efectivo ('+arqTurno.length+')</span>'
      +(puedeArq?'<button onclick="abrirArqueo()" style="background:var(--gold);color:#1a1a22;border:none;border-radius:8px;padding:7px 14px;font-weight:800;font-size:12px;cursor:pointer">🧮 Contar caja</button>':'')
    +'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:8px">El cajero cuenta el efectivo billete por billete. '+(esAdmin?'Tú ves si falta o sobra frente a lo esperado.':'El conteo queda registrado con tu nombre.')+'</div>'
    +(arqRows||'<div style="color:var(--dim);text-align:center;padding:10px;font-size:12px">Sin arqueos en este turno</div>')
  +'</div>';

  // ═══ 📝 Novedades de mesas ═══
  var corte48=a52Ahora()-48*3600000;
  var novRec=novedades.filter(function(n){return n.ts>=corte48;});
  var novViejas=novedades.filter(function(n){return n.ts<corte48;}).slice(0,30);
  var totNovRec=novRec.reduce(function(a,n){return a+(n.monto||0);},0);
  var novFila=function(n){
    return'<div style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;min-width:0">'
        +'<div style="font-size:12px;font-weight:800">'+(n.tipoLabel||'📝')+(n.mesa?' · '+esc(n.mesa):'')+(n.monto?' · <span style="color:#ef4444">'+fmt(n.monto)+'</span>':'')+'</div>'
        +'<div style="font-size:11px;color:var(--text);margin-top:1px">'+esc(n.nota||'')+'</div>'
        +'<div style="font-size:10px;color:var(--muted);margin-top:1px">'+fmtFechaCorta(n.ts)+' · anotó '+esc(n.uidNombre||'')+'</div>'
      +'</div>'
      +(usuarioActivo.rol==='admin'?'<button onclick="eliminarNovedad(\''+n.id+'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:5px;padding:2px 8px;font-size:10px;cursor:pointer">✕</button>':'')
    +'</div>';
  };
  var novedadesCard='<div class="card mb12" style="border:1px solid #f5a62344">'
    +'<div class="section-title" style="color:#f5a623">📝 Novedades de mesas'+(novRec.length?' · '+novRec.length:'')+(totNovRec?' <span style="font-size:11px;color:#ef4444">('+fmt(totNovRec)+' en novedades)</span>':'')+'</div>'
    +(novRec.length?novRec.map(novFila).join(''):'<div style="color:var(--dim);text-align:center;padding:8px;font-size:12px">Sin novedades en las últimas 48 horas.</div>')
    +(novViejas.length?'<button data-act="toggle-sec" data-sec="novHist" style="width:100%;background:none;border:none;color:var(--muted);padding:8px 0 0;font-size:11px;font-weight:700;cursor:pointer">'+(_secOpen.novHist?'▲ Ocultar anteriores':'▼ Ver anteriores ('+novViejas.length+')')+'</button>'+(_secOpen.novHist?novViejas.map(novFila).join(''):''):'')
  +'</div>';
  return configCaja+kpis+novedadesCard+conciliacion+gastosFPCard+arqueoCard+trasladoCard+prestamosCard+cierreBtn+histCierres;
}

function guardarCajaInicial(){
  var total=0;
  document.querySelectorAll('[data-fp-ini]').forEach(function(el){
    var fp=el.getAttribute('data-fp-ini');
    var v=parseInt(String(el.value).replace(/[^0-9]/g,''))||0;
    cajaHoy['ini_'+fp]=v;
    total+=v;
  });
  cajaHoy.cajaInicial=total;
  fbSet('cajaHoy',cajaHoy);
  if(!turnoInicio){turnoInicio=a52Ahora();fbSet('turnoInicio',turnoInicio);}
  render();
}

function abrirCierre(){
  var hoyV=ventasTurno();
  var hoyG=gastosTurno();
  var totalV=hoyV.reduce(function(a,v){return a+v.total;},0);
  var totalG=hoyG.reduce(function(a,g){return a+g.valor;},0);
  var porFP={};
  hoyV.forEach(function(v){
    if(v.pagos&&v.pagos.length){
      v.pagos.forEach(function(p){porFP[p.fp]=(porFP[p.fp]||0)+p.monto;});
    } else {
      porFP[v.fp]=(porFP[v.fp]||0)+v.total;
    }
  });
  var utilidad=cajaHoy.cajaInicial+totalV-totalG;
  var mesasOcup=mesas.filter(function(m){return pedidos[m.id]&&pedidos[m.id].length>0;}).length;

  // Gastos por forma de pago para mostrar el saldo neto proyectado
  var gastosPorFP={};
  hoyG.forEach(function(g){var gfp=g.fp||'efectivo';gastosPorFP[gfp]=(gastosPorFP[gfp]||0)+g.valor;});
  var sumaProyectada=0;
  var filas=FPAGO.map(function(f){
    var ini=cajaHoy['ini_'+f.id]||0;
    var ventasFP=porFP[f.id]||0;
    var gastosFP=gastosPorFP[f.id]||0;
    var saldoFP=Math.max(0,ini+ventasFP-gastosFP);
    sumaProyectada+=saldoFP;
    return'<div class="cierre-row"><span>'+f.emoji+' '+f.label+'</span>'
      +'<span style="color:'+f.color+';font-weight:700">'+fmt(saldoFP)
      +'<span style="color:var(--muted);font-size:10px;font-weight:400"> ('+fmt(ini)+'+'+fmt(ventasFP)+(gastosFP?'-'+fmt(gastosFP):'')+')</span>'
      +'</span></div>';
  }).join('')
  +'<div class="cierre-row" style="border-top:1px solid var(--gold)33;margin-top:4px;padding-top:6px"><span style="font-weight:700">Total en caja nuevo turno</span><span style="color:var(--gold);font-weight:900">'+fmt(sumaProyectada)+'</span></div>';

  modal1('<div style="text-align:center;margin-bottom:16px">'
    +'<div style="font-size:28px">🔒</div>'
    +'<div style="font-size:18px;font-weight:900;color:var(--gold)">Cierre de turno</div>'
    +'<div style="color:var(--muted);font-size:12px">'+todayStr()+'</div></div>'
    +(mesasOcup>0?'<div class="alert-box alert-red mb12">⚠️ Hay '+mesasOcup+' mesa(s) con pedidos abiertos. Se recomienda cobrarlas antes del cierre.</div>':'')
    +(function(){
      var per=_perdidasTurno();
      if(!per.length)return'';
      var pend=per.filter(function(n){return n.estado==='pendiente';});
      var totPer=per.reduce(function(a,n){return a+(n.monto||0);},0);
      return'<div style="background:#ef444410;border:1px solid #ef444440;border-radius:11px;padding:10px 12px;margin-bottom:12px">'
        +'<div style="font-weight:900;font-size:13px;color:#ef4444;margin-bottom:6px">💀 Pérdidas del turno · '+fmt(totPer)+(pend.length?' · <span style="color:#f5a623">'+pend.length+' por aceptar</span>':'')+'</div>'
        +per.map(function(n){
          var pendiente=n.estado==='pendiente';
          return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">'
            +'<div style="flex:1;min-width:0">'
              +'<div style="font-size:11.5px;font-weight:700">'+(n.tipoLabel||'💀')+' '+esc(n.mesa||'')+' · <span style="color:#ef4444">'+fmt(n.monto||0)+'</span></div>'
              +'<div style="color:var(--muted);font-size:9.5px">'+fmtTime(n.ts)+' · '+esc(n.uidNombre||'')+(n.items?' · '+n.items.map(function(x){return x.qty+'× '+esc(x.nombre);}).join(', '):'')+(n.estado==='aceptada'?' · <span style="color:#22c55e;font-weight:800">✔ aceptada por '+esc(n.aceptadaPor||'')+'</span>':'')+'</div>'
            +'</div>'
            +(pendiente?'<button onclick="aceptarPerdida(\''+n.id+'\')" style="background:#22c55e;color:#fff;border:none;border-radius:7px;padding:6px 10px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap">✔ Aceptar</button>':'')
          +'</div>';
        }).join('')
        +'<div style="color:var(--muted);font-size:9.5px;margin-top:5px">El inventario de estas pérdidas ya quedó descontado y la caja no espera ese dinero — aceptar deja constancia de que el admin las revisó.</div>'
      +'</div>';
    })()
    +'<div class="cierre-card">'
    +'<div class="cierre-row"><span>Caja inicial</span><span style="color:var(--gold);font-weight:700">'+fmt(cajaHoy.cajaInicial)+'</span></div>'
    +'<div class="cierre-row"><span>Total ventas</span><span style="color:#22c55e;font-weight:700">'+fmt(totalV)+'</span></div>'
    +'<div class="cierre-row"><span>Total gastos</span><span style="color:#ef4444;font-weight:700">'+fmt(totalG)+'</span></div>'
    +'<div style="color:var(--muted);font-size:11px;margin:8px 0 4px;font-weight:700">💰 Saldo que queda en cada casilla:</div>'
    +filas
    +'<div class="cierre-total"><span>Utilidad bruta</span><span style="color:'+(utilidad>=0?'#22c55e':'#ef4444')+'">'+fmt(utilidad)+'</span></div>'
    +'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:14px;text-align:center">¿Confirmas el cierre del día? Esta acción guarda el resumen en el historial.</div>'
    +'<div style="display:flex;gap:10px">'
    +'<button class="btn btn-outline btn-full" onclick="closeModal1()">Cancelar</button>'
    +'<button class="btn btn-gold btn-full" onclick="confirmarCierre()">🔒 Confirmar cierre</button>'
    +'</div>');
}

function confirmarCierre(){
  purgarComprobantes();  // limpieza de fotos de comprobantes con más de 45 días
  var hoyV=ventasTurno();
  var hoyG=gastosTurno();
  var totalV=hoyV.reduce(function(a,v){return a+v.total;},0);
  var totalG=hoyG.reduce(function(a,g){return a+g.valor;},0);
  var porFP={};
  hoyV.forEach(function(v){
    if(v.pagos&&v.pagos.length){
      v.pagos.forEach(function(p){porFP[p.fp]=(porFP[p.fp]||0)+p.monto;});
    } else {
      porFP[v.fp]=(porFP[v.fp]||0)+v.total;
    }
  });
  // Descontar gastos por forma de pago
  var gastosPorFP={};
  hoyG.forEach(function(g){
    var gfp=g.fp||'efectivo';
    gastosPorFP[gfp]=(gastosPorFP[gfp]||0)+g.valor;
    porFP[gfp]=(porFP[gfp]||0)-g.valor; // neto por FP
  });
  var cierre={
    id:'c'+a52Ahora(),ts:a52Ahora(),
    turnoInicio:turnoInicio,
    turnoFin:a52Ahora(),
    cajaInicial:cajaHoy.cajaInicial,
    ventas:totalV,gastos:totalG,
    porFP:porFP,gastosPorFP:gastosPorFP,
    utilidad:cajaHoy.cajaInicial+totalV-totalG,
    numVentas:hoyV.length,numGastos:hoyG.length,
    perdidas:_perdidasTurno().reduce(function(a,n){return a+(n.monto||0);},0),
    numPerdidas:_perdidasTurno().length,
    uid:usuarioActivo.id
  };
  fbPush('cierres',cierre);
  // Nueva caja por forma de pago = inicial anterior del método + neto del método
  var nuevaCaja = {};
  var sumaCasillas = 0;
  FPAGO.forEach(function(f){
    var ini = cajaHoy['ini_'+f.id]||0;
    var neto = (porFP[f.id]||0); // ventas - gastos del método
    var saldoFP = Math.max(0, ini + neto);
    nuevaCaja['ini_'+f.id] = saldoFP;
    sumaCasillas += saldoFP;
  });
  // El total SIEMPRE es la suma exacta de las casillas (así nunca se descuadra)
  nuevaCaja.cajaInicial = sumaCasillas;
  cajaHoy = nuevaCaja;
  turnoInicio=a52Ahora();
  fbSet('cajaHoy',cajaHoy);
  fbSet('turnoInicio',turnoInicio);
  closeModal1();render();
  var resumen='Cierre guardado ✓\n\nSaldos que pasan al nuevo turno:\n';
  FPAGO.forEach(function(f){resumen+=f.emoji+' '+f.label+': '+fmt(nuevaCaja['ini_'+f.id]||0)+'\n';});
  resumen+='\nTOTAL EN CAJA: '+fmt(sumaCasillas);
  alert(resumen);
}

function verCierre(id){
  var c=cierres.find(function(x){return x.id===id;});if(!c)return;
  var uid=usuarios.find(function(u){return u.id===c.uid;});
  var filas=FPAGO.map(function(f){
    var ventas=(c.porFP&&c.porFP[f.id])||0;
    var gastos2=(c.gastosPorFP&&c.gastosPorFP[f.id])||0;
    var neto=ventas-gastos2;
    return'<div class="cierre-row"><span>'+f.emoji+' '+f.label+'</span>'
      +'<span style="color:'+f.color+';font-weight:700">'+fmt(neto)
      +(gastos2?'<span style="color:#ef4444;font-size:10px;margin-left:4px">(-'+fmt(gastos2)+')</span>':'')
      +'</span></div>';
  }).join('');
  var turnoStr=c.turnoInicio?('Turno: '+fmtDT(c.turnoInicio)+' → '+fmtTime(c.turnoFin||c.ts)):'';
  modal2('<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:24px">📋</div>'
    +'<div style="font-size:16px;font-weight:900;color:var(--gold)">Cierre de turno</div>'
    +'<div style="color:var(--muted);font-size:12px">'+turnoStr+'</div>'
    +'<div style="color:var(--muted);font-size:11px">'+(uid?uid.emoji+' '+esc(uid.nombre):'')+'</div></div>'
    +'<div class="cierre-card">'
    +'<div class="cierre-row"><span>Caja inicial</span><span style="color:var(--gold);font-weight:700">'+fmt(c.cajaInicial)+'</span></div>'
    +'<div class="cierre-row"><span>Total ventas ('+c.numVentas+')</span><span style="color:#22c55e;font-weight:700">'+fmt(c.ventas)+'</span></div>'
    +'<div class="cierre-row"><span>Total gastos ('+c.numGastos+')</span><span style="color:#ef4444;font-weight:700">'+fmt(c.gastos)+'</span></div>'
    +filas
    +'<div class="cierre-total"><span>Utilidad bruta</span><span style="color:'+(c.utilidad>=0?'#22c55e':'#ef4444')+'">'+fmt(c.utilidad)+'</span></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:4px">'
    +'<button class="btn btn-blue btn-full" onclick="exportarCierre(\''+id+'\')">📊 Exportar Excel</button>'
    +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cerrar</button>'
    +'</div>');
}


