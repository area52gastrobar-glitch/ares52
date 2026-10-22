/* Módulos del POS (equipos, carta pública, llamados, herramientas, app Android, seguridad). Se arma desde fuente/. */
/* ═══ 🔐 EQUIPOS AUTORIZADOS — aprobación desde el POS (pestaña Admin) ═══ */
var a52Equipos={},a52Solic={};
var A52_SOLIC_VIGENCIA=30*60*1000;   // una solicitud sin atender deja de mostrarse a los 30 minutos
function a52Pendientes(){
  var lim=a52Ahora()-A52_SOLIC_VIGENCIA;
  return Object.keys(a52Solic).filter(function(k){var s=a52Solic[k];return s&&s.nombre&&(s.ts||0)>=lim&&!(a52Equipos[k]&&a52Equipos[k].ok);})
    .map(function(k){var s=a52Solic[k];return{uid:k,nombre:s.nombre,ts:s.ts,tipo:s.tipo||''};}).sort(function(a,b){return a.ts-b.ts;});
}
function a52Admins(){return Object.keys(a52Equipos).filter(function(k){var e=a52Equipos[k];return e&&e.ok===true&&e.admin===true;});}
function a52NoPuede(){alert('Este equipo no puede aprobar ni quitar equipos.\n\nHágalo desde un equipo de administración (por ejemplo, la caja).');}
function a52Aprobar(uid,comoAdmin){
  var s=a52Solic[uid]||{},d=getDb();if(!d)return;
  if(comoAdmin&&!confirm('¿Aprobar «'+(s.nombre||'Equipo')+'» como equipo de ADMINISTRACIÓN?\n\nPodrá aprobar y quitar otros equipos. Úselo solo para la caja o el celular de un socio.'))return;
  var reg={ok:true,nombre:String(s.nombre||'Equipo').slice(0,40),tipo:s.tipo||'',ts:a52Ahora(),por:(usuarioActivo&&usuarioActivo.nombre)||''};
  if(comoAdmin)reg.admin=true;
  d.ref('equipos/'+uid).set(reg).then(function(){d.ref('solicitudes/'+uid).remove();showToast('✅ Equipo aprobado: '+reg.nombre,'#22c55e');},a52NoPuede);
}
function a52Rechazar(uid){var d=getDb();if(d)d.ref('solicitudes/'+uid).remove().catch(function(){});}
function a52Quitar(uid){
  var e=a52Equipos[uid]||{},d=getDb(),E=window._a52;if(!d)return;
  var adm=a52Admins();
  if(e.admin&&adm.length<=1){alert('Es el único equipo de administración.\n\nPrimero dé administración a otro equipo; si no, nadie podría aprobar equipos nuevos.');return;}
  if(!confirm('¿Quitar «'+(e.nombre||'Equipo')+'»?\n\n'+(uid===E.uid?'ES ESTE MISMO EQUIPO: dejará de funcionar hasta que lo aprueben de nuevo.':'Ese equipo dejará de funcionar hasta que lo aprueben de nuevo.')))return;
  d.ref('equipos/'+uid).remove().then(function(){showToast('Equipo quitado','#f5a623');},a52NoPuede);
}
function a52CambiarAdmin(uid,on){
  var e=a52Equipos[uid]||{},d=getDb();if(!d)return;
  if(!on&&a52Admins().length<=1){alert('Debe quedar al menos un equipo de administración.');return;}
  if(on&&!confirm('¿Dar administración a «'+(e.nombre||'Equipo')+'»?\n\nPodrá aprobar y quitar otros equipos.'))return;
  d.ref('equipos/'+uid+'/admin').set(on?true:null).catch(a52NoPuede);
}
// Solo sirve mientras las reglas de la base siguen abiertas: deja autorizado el equipo desde el que se está trabajando
function a52AutorizarEste(){
  var E=window._a52,d=getDb();if(!d)return;
  if(!E.uid){alert(E.sinAuth?'Falta habilitar el ingreso «Anónimo» en Firebase:\nAuthentication → Sign-in method → Anónimo → Habilitar.':'Este equipo aún no se ha identificado. Revise el internet y recargue la página.');return;}
  var prev='';try{prev=localStorage.getItem(LSK('nombreEquipo'))||'';}catch(x){}
  var n=prompt('Nombre de este equipo (ej.: Caja, Celular de un socio, Cocina):',prev);
  if(n===null)return;n=n.trim().slice(0,40);
  if(n.length<2){alert('Escriba un nombre para el equipo.');return;}
  var adm=!a52Admins().length||confirm('¿Este equipo podrá aprobar otros equipos?\n\nAceptar = equipo de administración (caja, celular de un socio)\nCancelar = equipo normal');
  var reg={ok:true,nombre:n,tipo:a52TipoEquipo(),ts:a52Ahora(),por:(usuarioActivo&&usuarioActivo.nombre)||''};
  if(adm)reg.admin=true;
  try{localStorage.setItem(LSK('nombreEquipo'),n);}catch(x){}
  d.ref('equipos/'+E.uid).set(reg).then(function(){d.ref('solicitudes/'+E.uid).remove().catch(function(){});showToast('✅ Este equipo quedó autorizado','#22c55e');},a52NoPuede);
}
function a52EquiposInner(){
  var E=window._a52,pend=a52Pendientes(),h='';
  var b='border-radius:8px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;border:1px solid ';
  if(!E.uid)h+='<div style="background:#ef444415;border:1px solid #ef444433;border-radius:10px;padding:10px;font-size:12px;line-height:1.45;margin-bottom:10px">⚠️ <b style="color:#ef4444">Este equipo no se pudo identificar.</b><br><span style="color:var(--muted)">'+(E.sinAuth?'Falta habilitar el ingreso «Anónimo» en Firebase (Authentication → Sign-in method).':'Revise el internet y recargue la página.')+'</span></div>';
  else if(E.autorizado)h+='<div style="background:#22c55e12;border:1px solid #22c55e33;border-radius:10px;padding:10px;font-size:12px;line-height:1.45;margin-bottom:10px">🔐 <b>Este equipo está autorizado</b> · '+esc(E.nombre||'')+(E.admin?' · <span style="color:#f5a623;font-weight:800">administración</span>':'')+'</div>';
  else h+='<div style="background:#f5a62315;border:1px solid #f5a62344;border-radius:10px;padding:10px;font-size:12px;line-height:1.45;margin-bottom:10px">🔓 <b style="color:#f5a623">La base sigue abierta y este equipo no está autorizado.</b><br><span style="color:var(--muted)">Autorice primero la caja y el celular de un socio. Después publique las reglas nuevas en Firebase; los demás equipos piden aprobación y usted los acepta aquí.</span>'
    +'<button class="btn btn-sm btn-full" style="margin-top:8px;background:#f5a623;color:#000;font-weight:800" onclick="a52AutorizarEste()">🔐 Autorizar este equipo</button></div>';
  if(pend.length){
    h+='<div style="font-size:11px;font-weight:800;color:#38bdf8;margin:4px 0 6px">PIDEN ENTRAR ('+pend.length+')</div>';
    h+=pend.map(function(p){
      return'<div style="background:#38bdf812;border:1px solid #38bdf833;border-radius:10px;padding:10px;margin-bottom:8px;font-size:12px">'
        +'<div style="font-weight:800">📱 '+esc(p.nombre)+' <span style="color:#f5a623;letter-spacing:2px">· '+a52Codigo(p.uid)+'</span></div>'
        +'<div style="color:var(--muted);font-size:10px;margin:2px 0 8px">'+esc(p.tipo)+' · pidió '+fmtFechaCorta(p.ts)+' · confirme que el código sea el que muestra el equipo</div>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
        +'<button style="'+b+'#22c55e55;background:#22c55e22;color:#22c55e" onclick="a52Aprobar(\''+p.uid+'\',false)">✓ Aprobar</button>'
        +'<button style="'+b+'#f5a62355;background:#f5a62318;color:#f5a623" onclick="a52Aprobar(\''+p.uid+'\',true)">✓ Como administración</button>'
        +'<button style="'+b+'#ef444455;background:#ef444418;color:#ef4444" onclick="a52Rechazar(\''+p.uid+'\')">✕ Rechazar</button>'
        +'</div></div>';
    }).join('');
  }
  var ids=Object.keys(a52Equipos).filter(function(k){return a52Equipos[k]&&a52Equipos[k].ok===true;}).sort(function(x,y){return(a52Equipos[x].ts||0)-(a52Equipos[y].ts||0);});
  if(ids.length){
    h+='<div style="font-size:11px;font-weight:800;color:var(--muted);margin:6px 0 4px">AUTORIZADOS ('+ids.length+')</div>';
    h+=ids.map(function(k){
      var e=a52Equipos[k];
      return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px">'
        +'<div style="flex:1;min-width:0"><span style="font-weight:700">'+esc(e.nombre||'Equipo')+'</span>'+(k===E.uid?' <span style="color:#22c55e;font-size:10px">(este)</span>':'')+(e.admin?' <span style="color:#f5a623;font-size:10px;font-weight:800">ADMINISTRACIÓN</span>':'')
        +'<div style="color:var(--muted);font-size:10px">'+esc(e.tipo||'')+' · '+a52Codigo(k)+(e.ts?' · desde '+fmtFechaCorta(e.ts):'')+(e.por?' · '+esc(e.por):'')+'</div></div>'
        +'<button title="'+(e.admin?'Quitar administración':'Dar administración')+'" style="'+b+'var(--border);background:var(--card2);color:'+(e.admin?'#f5a623':'var(--muted)')+'" onclick="a52CambiarAdmin(\''+k+'\','+(e.admin?'false':'true')+')">👑</button>'
        +'<button style="'+b+'#ef444444;background:#ef444412;color:#ef4444" onclick="a52Quitar(\''+k+'\')">Quitar</button></div>';
    }).join('');
  } else h+='<div style="color:var(--muted);font-size:12px;padding:6px 0">Todavía no hay equipos autorizados.</div>';
  return h;
}
function a52EquipoHtml(){
  return'<div class="card"><div style="color:var(--accent);font-weight:800;font-size:15px;margin-bottom:12px">📱 Equipos autorizados</div><div id="a52-equipos-box">'+a52EquiposInner()+'</div></div>';
}
// Aviso flotante para el administrador cuando un equipo nuevo pide entrar (no interrumpe lo que esté haciendo)
function a52Refrescar(){
  var box=document.getElementById('a52-equipos-box');if(box)box.innerHTML=a52EquiposInner();
  var f=document.getElementById('a52-solic'),pend=(usuarioActivo&&usuarioActivo.rol==='admin')?a52Pendientes():[];
  if(!pend.length){if(f)f.remove();return;}
  if(!f){f=document.createElement('div');f.id='a52-solic';f.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:9000;max-width:460px;margin:0 auto;background:#13131f;border:1px solid #38bdf8;border-radius:14px;padding:12px;box-shadow:0 12px 30px rgba(0,0,0,.6);font-size:12px;color:#e8e8f5';document.body.appendChild(f);}
  var p=pend[0];
  f.innerHTML='<div style="font-weight:800;margin-bottom:2px">📱 Un equipo pide entrar'+(pend.length>1?' (y '+(pend.length-1)+' más)':'')+'</div>'
    +'<div style="margin-bottom:8px">'+esc(p.nombre)+' · código <b style="color:#f5a623;letter-spacing:2px">'+a52Codigo(p.uid)+'</b> <span style="color:#8a8ab5">· '+esc(p.tipo)+'</span></div>'
    +'<div style="display:flex;gap:6px"><button style="flex:1;background:#22c55e;color:#000;border:none;border-radius:8px;padding:9px;font-weight:800;cursor:pointer" onclick="a52Aprobar(\''+p.uid+'\',false)">✓ Aprobar</button>'
    +'<button style="flex:1;background:#ef444422;color:#ef4444;border:1px solid #ef444455;border-radius:8px;padding:9px;font-weight:800;cursor:pointer" onclick="a52Rechazar(\''+p.uid+'\')">✕ Rechazar</button>'
    +'<button style="background:none;color:#8a8ab5;border:1px solid #2a2a45;border-radius:8px;padding:9px;cursor:pointer" onclick="setTab(\'admin\')">Ver</button></div>';
}
window.a52AlCambiarEquipo=a52Refrescar;
/* ═══ 📋 CARTA PÚBLICA ═══
   Copia de la carta solo con lo que ve el cliente (sin costos, existencias ni recetas).
   El POS la mantiene al día sola; la carta y la página de clientes leen esta copia, no el menú interno. */
var _cpRemoto=null,_cpReloj=null,_cpMenuListo=false;   // solo se publica cuando ya llegó el menú real de la base (nunca el de fábrica)
function a52CartaCanon(lista){
  var txt=function(v){return v==null?'':String(v);};
  return JSON.stringify((lista||[]).filter(function(m){return m&&m.id!=null&&m.nombre;}).map(function(m){
    var vs=m.variantes?(Array.isArray(m.variantes)?m.variantes:Object.values(m.variantes)):[];
    var o={id:m.id,nombre:txt(m.nombre),precio:Number(m.precio)||0,cat:txt(m.cat),subcat:txt(m.subcat),emoji:txt(m.emoji),descripcion:txt(m.descripcion)};
    if(m.cubeta)o.cubeta=Number(m.cubeta)||0;
    if(m.esCerveza)o.esCerveza=true;
    if(m.esComida)o.esComida=true;
    if(vs.length)o.variantes=vs.filter(Boolean).map(function(v){return{nombre:txt(v.nombre),precio:Number(v.precio)||0,und:txt(v.und),desc:txt(v.desc)};});
    return o;
  }).sort(function(a,b){return String(a.id)<String(b.id)?-1:String(a.id)>String(b.id)?1:0;}));
}
function a52PublicarCarta(){
  clearTimeout(_cpReloj);
  _cpReloj=setTimeout(function(){
    if(!getDb()||!usuarioActivo||!_cpMenuListo||_cpRemoto===null||!menu||!menu.length)return;
    var j=a52CartaCanon(menu);
    if(j===_cpRemoto)return;
    var o={};JSON.parse(j).forEach(function(p){o['p'+p.id]=p;});
    _cpRemoto=j;fbSet('cartaPublica',o);
  },1500);
}

/* ═══ 🔔 LLAMADOS DESDE LA MESA ═══
   El cliente escanea el QR de su mesa y toca «Llamar a la mesera» (puede decir qué necesita).
   No es un pedido: es un aviso para que alguien se acerque y lo confirme. */
var a52Llamados={};
var _llVistos={};
function a52LlamadosPend(){
  var lim=a52Ahora()-3*60*60*1000;
  return Object.keys(a52Llamados).map(function(k){var l=a52Llamados[k]||{};l._k=k;return l;})
    .filter(function(l){return l.mesa!=null&&!l.atendido&&(l.ts||0)>=lim;}).sort(function(a,b){return(a.ts||0)-(b.ts||0);});
}
function a52LlamadoAtender(k){
  var d=getDb();if(!d)return;
  d.ref('llamados/'+k).update({atendido:true,tsAt:a52Ahora(),por:(usuarioActivo&&usuarioActivo.nombre)||''}).catch(function(){});
}
function a52LlamadosLimpiar(){
  // borra los de más de 12 horas (los hace cualquier equipo autorizado, sin molestar a nadie)
  var d=getDb(),lim=a52Ahora()-12*60*60*1000;if(!d)return;
  Object.keys(a52Llamados).forEach(function(k){if(((a52Llamados[k]||{}).ts||0)<lim)d.ref('llamados/'+k).remove().catch(function(){});});
}
function a52LlamadosPintar(){
  var f=document.getElementById('a52-llamados'),pend=usuarioActivo?a52LlamadosPend():[];
  if(!pend.length){if(f)f.remove();return;}
  var nuevos=pend.filter(function(l){return !_llVistos[l._k];});
  pend.forEach(function(l){_llVistos[l._k]=1;});
  if(nuevos.length){
    nuevos.forEach(function(l){try{_notifAdmin('🔔 Mesa '+l.mesa+' llama',(l.motivo||'Llama a la mesera')+(l.nota?' · «'+l.nota+'»':''),'a52-ll-'+l._k);}catch(e){}});
    try{var ctx=_sndAudio();if(ctx){[[880,140,0],[880,140,220],[1175,260,440]].forEach(function(n){var t0=ctx.currentTime+n[2]/1000,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=n[0];g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(0.3,t0+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+n[1]/1000);o.connect(g);g.connect(ctx.destination);o.start(t0);o.stop(t0+n[1]/1000+0.05);});}}catch(e){}
    try{if(navigator.vibrate)navigator.vibrate([200,100,200]);}catch(e){}
  }
  if(!f){f=document.createElement('div');f.id='a52-llamados';f.style.cssText='position:fixed;right:12px;top:70px;z-index:8900;width:min(320px,calc(100vw - 24px));display:flex;flex-direction:column;gap:8px;max-height:70vh;overflow-y:auto';document.body.appendChild(f);}
  f.innerHTML=pend.slice(0,8).map(function(l){
    var min=Math.max(0,Math.round((a52Ahora()-(l.ts||0))/60000));
    return'<div style="background:#13131f;border:2px solid #f5a623;border-radius:14px;padding:11px 12px;box-shadow:0 12px 30px rgba(0,0,0,.6);color:#e8e8f5;font-size:12px">'
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b style="font-size:16px;color:#f5a623">🔔 Mesa '+esc(String(l.mesa))+'</b><span style="color:#8a8ab5;font-size:10px">'+(min<1?'ahora':'hace '+min+' min')+'</span></div>'
      +'<div style="margin:4px 0 2px;font-weight:700;font-size:13px">'+esc(l.motivo||'Llama a la mesera')+'</div>'
      +(l.nota?'<div style="color:#c9c9e8;font-style:italic">«'+esc(l.nota)+'»</div>':'')
      +(l.nombre?'<div style="color:#8a8ab5;font-size:11px;margin-top:2px">🙋 '+esc(l.nombre)+'</div>':'')
      +'<button onclick="a52LlamadoAtender(\''+l._k+'\')" style="width:100%;margin-top:8px;background:#22c55e;color:#000;border:none;border-radius:9px;padding:9px;font-weight:800;font-size:13px;cursor:pointer">✓ Ya voy / Atendido</button></div>';
  }).join('')+(pend.length>8?'<div style="text-align:center;color:#8a8ab5;font-size:11px">y '+(pend.length-8)+' más</div>':'');
}

/* ═══ 🧰 HERRAMIENTAS ═══ las demás pantallas del personal se abren dentro del POS */
var A52_HERR=[
  {id:'dj',titulo:'Consola DJ',emoji:'🎧',url:'dj.html',roles:null},
  {id:'impresora',titulo:'Impresión',emoji:'🖨️',url:'impresora.html',roles:null},
  {id:'tarjetas',titulo:'Tarjetas de mesa',emoji:'🪪',url:'tarjetas.html',roles:['admin','subadmin','cajero']},
  {id:'qr',titulo:'QR de la carta',emoji:'🔳',url:'qr.html',roles:['admin','subadmin','cajero']},
  {id:'carta',titulo:'Carta para imprimir',emoji:'📋',url:'carta.html',roles:['admin','subadmin','cajero']},
  {id:'clientes',titulo:'Ver como cliente',emoji:'👀',url:'clientes.html',roles:null}
];
function a52HerrDeRol(){var rol=usuarioActivo&&usuarioActivo.rol;return A52_HERR.filter(function(h){return !h.roles||h.roles.indexOf(rol)>=0;});}
function a52HerrMenuHtml(){
  var hs=a52HerrDeRol();if(!hs.length)return'';
  return'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin:10px 0 6px">🧰 HERRAMIENTAS</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+hs.map(function(h){
      return'<button onclick="closeModal2();a52Herramienta(\''+h.id+'\')" style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:12px 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px">'
        +'<span style="font-size:22px">'+h.emoji+'</span><span style="font-size:10px;font-weight:700;color:var(--text)">'+esc(h.titulo)+'</span></button>';
    }).join('')+'</div>';
}
function a52Herramienta(id){
  var h=A52_HERR.filter(function(x){return x.id===id;})[0];if(!h)return;
  a52HerramientaCerrar();
  var o=document.createElement('div');o.id='a52-herr';
  o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:9500;background:#07070e;display:flex;flex-direction:column';
  o.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#0d0d18;border-bottom:1px solid #22223a;color:#e8e8f5">'
    +'<button onclick="a52HerramientaCerrar()" style="background:#a855f7;color:#fff;border:none;border-radius:9px;padding:8px 14px;font-weight:800;font-size:13px;cursor:pointer">← Volver al POS</button>'
    +'<b style="flex:1;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+h.emoji+' '+esc(h.titulo)+'</b>'
    +'<button onclick="window.open(\''+h.url+'\',\'_blank\')" title="Abrir en otra pestaña (para dejarla fija en un equipo)" style="background:none;color:#8a8ab5;border:1px solid #2a2a45;border-radius:9px;padding:8px 10px;font-size:12px;cursor:pointer">↗ Abrir aparte</button></div>'
    +'<iframe src="'+h.url+'" title="'+esc(h.titulo)+'" allow="autoplay; fullscreen; clipboard-write" style="flex:1;width:100%;border:0;background:#07070e"></iframe>';
  document.body.appendChild(o);
  try{history.replaceState(null,'','#'+id);}catch(e){}
}
function a52HerramientaCerrar(){var o=document.getElementById('a52-herr');if(o)o.remove();try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}

/* ═══ 🎨 TEMA ═══ el administrador elige el aspecto de todas las pantallas (clientes y personal) */
function a52TemaHtml(){
  var act=MarcaTemaActual();
  return'<div class="card"><div style="color:var(--accent);font-weight:800;font-size:15px;margin-bottom:6px">🎨 Tema</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:12px;line-height:1.45">Cambia los colores y el estilo de la página de inicio, la carta, la rocola y el POS. Los clientes lo ven la próxima vez que abran la página.</div>'
    +Object.keys(TEMAS).map(function(id){
      var T=TEMAS[id],on=id===act;
      return'<button onclick="a52Tema(\''+id+'\')" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:'+(on?'var(--card2)':'var(--bg)')+';border:'+(on?'2px solid var(--accent)':'1px solid var(--border)')+';border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer;color:var(--text)">'
        +'<span style="font-size:26px;flex:none;width:36px;text-align:center" title="Iconos del tema">'+T.emoji+'</span>'
        +'<span style="display:flex;flex:none;border-radius:8px;overflow:hidden;border:1px solid var(--border)">'+T.muestra.map(function(c){return'<i style="display:block;width:18px;height:34px;background:'+c+'"></i>';}).join('')+'</span>'
        +'<span style="flex:1;min-width:0"><b style="font-size:14px">'+esc(T.nombre)+'</b> <span style="font-size:13px">'+T.emoji+' '+T.emoji2+'</span><br><span style="color:var(--muted);font-size:11px">'+esc(T.desc)+'</span></span>'
        +(on?'<span style="color:var(--accent);font-weight:800;font-size:12px">En uso</span>':'')+'</button>';
    }).join('')+'</div>';
}
var TAB_NOMBRES={};Object.keys(TAB_LABELS).forEach(function(k){TAB_NOMBRES[k]=TAB_LABELS[k].replace(/^\S+\s/,'');});
function a52TabIconos(){Object.keys(TAB_NOMBRES).forEach(function(k){TAB_LABELS[k]=(window.MarcaIcono?MarcaIcono(k):'')+' '+TAB_NOMBRES[k];});}
a52TabIconos();
window.alCambiarTema=function(){try{a52TabIconos();if(usuarioActivo){renderTabs();render();}}catch(e){}};
function a52Tema(id){
  if(!TEMAS[id])return;
  MarcaTema(id,true);
  var d=getDb();if(d)d.ref('config/tema').set(id).then(function(){showToast('🎨 Tema «'+TEMAS[id].nombre+'» guardado','#22c55e');},function(){alert('Este equipo no pudo guardar el tema en la base. Quedó aplicado solo aquí.');});
  if(tabActual==='admin')render();
}

/* ═══ 🔎 AL VENDER: solo lo que hay ═══ los productos agotados no se muestran (se pueden ver con un toque) */
var _verAgotados=false;
function a52HayStock(p){return p.sinStock?p.disponible!==false:(ventaSinStock||(parseInt(p.stock)||0)>0);}
function a52Vendible(p){return _verAgotados||a52HayStock(p);}
function a52AgotadosBtn(){
  var n=menu.filter(function(p){return !a52HayStock(p);}).length;if(!n&&!_verAgotados)return'';
  return'<button onclick="_verAgotados=!_verAgotados;renderSoloPedido()" style="background:var(--card2);color:var(--muted);border:1px solid var(--border);border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">'+(_verAgotados?'🙈 Ocultar agotados':'👁 Ver agotados ('+n+')')+'</button>';
}

/* ═══ 📷 FOTOS DE PRODUCTOS ═══ se guardan reducidas en la base (config/fotos) y salen en la carta y al vender */
var a52Fotos={};
function a52FotoDe(id){var f=a52Fotos['p'+id];return(typeof f==='string'&&f.indexOf('data:image/')===0)?f:'';}
function a52FotoMini(p){var f=a52FotoDe(p.id);return f?'<img src="'+f+'" alt="" style="width:38px;height:38px;border-radius:8px;object-fit:cover;display:block">':'<span style="font-size:18px">'+p.emoji+'</span>';}
function a52FotoCampo(p){
  if(window._fotoDe!==editandoProd){window._fotoDe=editandoProd;window._fotoTemp=undefined;}
  var f=window._fotoTemp!==undefined?(window._fotoTemp||''):a52FotoDe(p.id);
  return'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Foto (opcional — aparece en la carta y al vender)</div>'
    +'<div style="display:flex;align-items:center;gap:10px">'
    +'<div id="f-foto-prev" style="width:64px;height:64px;border-radius:12px;border:1px '+(f?'solid':'dashed')+' var(--border);background:var(--bg) center/cover no-repeat;display:flex;align-items:center;justify-content:center;font-size:22px;flex:none'+(f?';background-image:url('+f+')':'')+'">'+(f?'':'📷')+'</div>'
    +'<label class="btn btn-sm" style="background:var(--card2);border:1px solid var(--border);color:var(--text);cursor:pointer">Elegir foto<input id="f-foto" type="file" accept="image/*" style="display:none" onchange="a52FotoElegir(this)"></label>'
    +'<button type="button" class="btn btn-sm" style="background:none;border:1px solid var(--border);color:var(--muted)" onclick="a52FotoQuitar()">Quitar</button>'
    +'</div></div>';
}
function a52FotoPrev(url){var d=document.getElementById('f-foto-prev');if(!d)return;d.style.backgroundImage=url?'url('+url+')':'none';d.style.borderStyle=url?'solid':'dashed';d.textContent=url?'':'📷';}
function a52FotoElegir(inp){
  var file=inp.files&&inp.files[0];if(!file)return;
  if(!/^image\//.test(file.type)){alert('Elija una imagen.');return;}
  var rd=new FileReader();
  rd.onload=function(){
    var im=new Image();
    im.onload=function(){
      // se reduce a 360 px para que la carta cargue rápido en el celular del cliente
      var M=360,k=Math.min(1,M/Math.max(im.width,im.height)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      var url=c.toDataURL('image/jpeg',0.72);if(url.length>90000)url=c.toDataURL('image/jpeg',0.5);
      window._fotoTemp=url;a52FotoPrev(url);
    };
    im.onerror=function(){alert('No se pudo leer esa imagen. Pruebe con otra.');};
    im.src=rd.result;
  };
  rd.readAsDataURL(file);inp.value='';
}
function a52FotoQuitar(){window._fotoTemp=null;a52FotoPrev('');}
function a52FotoGuardar(id){
  if(window._fotoTemp===undefined)return;
  var v=window._fotoTemp;window._fotoTemp=undefined;window._fotoDe=null;
  if(v)a52Fotos['p'+id]=v;else delete a52Fotos['p'+id];
  var r=ref('config/fotos/p'+id);if(r){if(v)r.set(v).catch(function(){alert('La foto no se pudo guardar en la base.');});else r.remove().catch(function(){});}
}

/* ═══ 📶 CONEXIÓN ═══ avisa cuando el equipo se queda sin internet, cuenta lo que falta por enviar
   y no deja trabajar a ciegas un equipo que abrió la página sin haber cargado los datos. */
var a52Con={on:null,vio:false,aviso:false,pend:0,fallos:0,volvio:0,reloj:null,listo:false,seguir:false};
function a52ConCuenta(r){
  if(!r||typeof r.then!=='function')return;
  a52Con.pend++;a52ConPintar();
  r.then(function(){a52Con.pend=Math.max(0,a52Con.pend-1);a52ConPintar();},
         function(){a52Con.pend=Math.max(0,a52Con.pend-1);a52Con.fallos++;a52ConPintar();});
}
function a52ConIniciar(){
  var d=getDb();if(!d||a52Con.listo)return;a52Con.listo=true;
  try{
    var P=Object.getPrototypeOf(d.ref());
    ['set','update','remove','transaction','push'].forEach(function(m){
      var f=P[m];if(typeof f!=='function'||f._a52)return;
      P[m]=function(){var r=f.apply(this,arguments);if(m!=='push'||(arguments.length&&arguments[0]!==undefined))a52ConCuenta(r);return r;};
      P[m]._a52=true;
    });
  }catch(e){console.warn('conexión: no se pudo contar lo pendiente',e);}
  function espera(ms){clearTimeout(a52Con.reloj);a52Con.reloj=setTimeout(function(){if(a52Con.on!==true){a52Con.aviso=true;a52ConPintar();}},ms);}
  espera(8000);   // al abrir: margen para conectarse
  d.ref('.info/connected').on('value',function(s){
    if(s.val()===true){
      clearTimeout(a52Con.reloj);
      if(a52Con.aviso)a52Con.volvio=a52Ahora();
      a52Con.on=true;a52Con.vio=true;a52Con.aviso=false;a52ConPintar();
    }else{
      a52Con.on=false;
      if(a52Con.vio&&!a52Con.aviso)espera(4000);   // cortes de un instante no molestan
    }
  });
  window.addEventListener('beforeunload',function(ev){
    if(a52Con.on===false&&a52Con.pend>0){ev.preventDefault();ev.returnValue='Hay cambios sin enviar';return ev.returnValue;}
  });
}
function a52ConPintar(){
  var dot=document.getElementById('sync-dot'),lab=dot&&dot.nextElementSibling,sin=a52Con.aviso&&a52Con.on!==true;
  if(dot){dot.style.background=sin?'#ef4444':'#22c55e';dot.title=sin?'Sin conexión':'Conectado';}
  if(lab&&lab.tagName==='SPAN'){lab.textContent=sin?'Sin conexión':'En vivo';lab.style.color=sin?'#ef4444':'';lab.style.fontWeight=sin?'800':'';}
  var n=a52Con.pend,txtN=n?(' · <b>'+n+(n===1?' cambio':' cambios')+' por enviar</b>'):'';
  // 1) Abrió la página y nunca ha conectado: no hay datos cargados, no se debe trabajar
  var tapa=document.getElementById('a52-con-tapa');
  if(sin&&!a52Con.vio&&!a52Con.seguir){
    if(!tapa){
      tapa=document.createElement('div');tapa.id='a52-con-tapa';
      tapa.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:99980;background:rgba(7,7,14,.94);display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit';
      tapa.innerHTML='<div style="width:100%;max-width:360px;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px;color:var(--text);text-align:center">'
        +'<div style="font-size:34px">📡</div><div style="font-weight:800;font-size:17px;margin:6px 0">Sin internet</div>'
        +'<div style="color:var(--muted);font-size:13px;line-height:1.5;margin-bottom:14px">Este equipo todavía no ha podido cargar los datos del negocio. Revise el wifi o los datos del celular. La pantalla se abre sola cuando vuelva la conexión.</div>'
        +'<button class="btn btn-green btn-full" onclick="location.reload()">Reintentar</button>'
        +'<div style="margin-top:12px"><a href="#" onclick="a52Con.seguir=true;a52ConPintar();return false" style="color:var(--muted);font-size:11px">Seguir sin conexión (no recomendado: lo que anote puede no guardarse)</a></div></div>';
      document.body.appendChild(tapa);
    }
  }else if(tapa){tapa.remove();}
  // 2) Barra de aviso
  var b=document.getElementById('a52-con'),html='',fondo='';
  if(sin&&a52Con.vio){fondo='#f5a623';html='📡 <b>Sin conexión.</b> Lo que anote queda en este equipo y se envía solo cuando vuelva el internet. No cierre ni recargue esta página'+txtN+'.';}
  else if(sin&&a52Con.seguir){fondo='#f5a623';html='📡 <b>Sin conexión y sin datos cargados.</b> Lo que anote puede no guardarse'+txtN+'.';}
  else if(a52Con.on===true&&a52Con.volvio){
    if(n>0){fondo='#38bdf8';html='🔄 <b>Volvió la conexión.</b> Enviando '+n+(n===1?' cambio':' cambios')+'…';}
    else if(a52Ahora()-a52Con.volvio<6000||!a52Con.cerrando){
      fondo='#22c55e';html='✅ <b>Volvió la conexión.</b> Todo quedó guardado.';
      if(!a52Con.cerrando){a52Con.cerrando=setTimeout(function(){a52Con.volvio=0;a52Con.cerrando=null;a52ConPintar();},5000);}
    }
  }
  if(html){
    if(!b){b=document.createElement('div');b.id='a52-con';b.style.cssText='position:sticky;top:0;z-index:9990;color:#111;font-size:13px;line-height:1.35;padding:9px 14px;text-align:center';document.body.insertBefore(b,document.body.firstChild);}
    b.style.background=fondo;b.innerHTML=html;
  }else if(b){b.remove();}
  // 3) Un cambio que la base rechazó
  var f=document.getElementById('a52-con-fallo');
  if(a52Con.fallos>0){
    if(!f){f=document.createElement('div');f.id='a52-con-fallo';f.style.cssText='position:sticky;top:0;z-index:9991;background:#ef4444;color:#fff;font-size:13px;line-height:1.35;padding:9px 14px;text-align:center';document.body.insertBefore(f,document.body.firstChild);}
    f.innerHTML='⚠️ <b>'+(a52Con.fallos===1?'Un cambio no se guardó':a52Con.fallos+' cambios no se guardaron')+'.</b> Revise lo último que anotó y vuelva a registrarlo. <a href="#" onclick="a52Con.fallos=0;a52ConPintar();return false" style="color:#fff;font-weight:800;margin-left:8px">Entendido ✕</a>';
  }else if(f){f.remove();}
}
// Arranca apenas hay base, sin esperar al ingreso: así el aviso también sale en la pantalla de claves
(function a52ConArranque(){var d=null;try{d=getDb();}catch(e){}if(d){a52ConIniciar();return;}setTimeout(a52ConArranque,700);})();
/* ═══ 📱 APP PARA ANDROID: avisos con el teléfono bloqueado y voz de pagos ═══
   En el navegador no cambia nada. Dentro de la app (APK) los avisos de administrador salen como notificaciones del teléfono
   y un servicio de Android mantiene el POS conectado a la base con la pantalla apagada: así llegan las mesas nuevas, los
   pedidos, los cobros y los pagos aunque el teléfono esté bloqueado. No usa servidores ni servicios de pago. */
var A52APP=(function(){
  var C=null,nat=false,listo=false;
  function ver(){C=window.Capacitor;nat=!!(C&&C.isNativePlatform&&C.isNativePlatform());return nat;}
  // Las funciones del teléfono se piden por el puente de Capacitor; en la página remota Capacitor.Plugins puede no estar
  function llamar(pl,m,d){
    if(!ver())return Promise.reject(new Error('sin app'));
    var o=C.Plugins&&C.Plugins[pl];
    if(o&&typeof o[m]==='function')return o[m](d||{});
    if(typeof C.nativePromise==='function')return C.nativePromise(pl,m,d||{});
    return Promise.reject(new Error('sin '+pl));
  }
  var P=function(n){
    if(!ver())return null;
    var f=function(m){return function(d){return llamar(n,m,d);};};
    return {createChannel:f('createChannel'),schedule:f('schedule'),requestPermissions:f('requestPermissions'),checkPermissions:f('checkPermissions'),
      iniciar:f('iniciar'),detener:f('detener'),estado:f('estado'),bateria:f('bateria'),
      addListener:function(ev,cb){try{var o=C.Plugins&&C.Plugins[n];if(o&&o.addListener)return o.addListener(ev,cb);}catch(e){}}};
  };
  var activa=true,canal=false,reloj=null,fondoOn=false,ultimoTxt='';
  function id(tag){var h=0,t=String(tag||a52Ahora()+Math.random());for(var i=0;i<t.length;i++){h=(h*31+t.charCodeAt(i))|0;}return (Math.abs(h)%2000000000)+1;}
  function crearCanal(){
    var LN=P('LocalNotifications');if(!LN||canal)return Promise.resolve();
    canal=true;
    return LN.createChannel({id:'avisos',name:'Avisos del negocio',description:'Mesas nuevas, pedidos, cobros y pagos',importance:5,visibility:1,vibration:true,lights:true}).catch(function(){canal=false;});
  }
  function notificar(titulo,cuerpo,tag){
    var LN=P('LocalNotifications');if(!LN)return;
    crearCanal().then(function(){
      LN.schedule({notifications:[{id:id(tag),title:String(titulo||''),body:String(cuerpo||''),channelId:'avisos',smallIcon:'ic_tracking',iconColor:'#C9A84C'}]}).catch(function(){});
    });
  }
  function instalar(){
    if(listo||!ver())return;listo=true;
    // Las notificaciones del navegador no existen dentro de la app: se reemplazan por las del teléfono
    var permiso='default';try{permiso=localStorage.getItem('_a52_app_perm')||'default';}catch(e){}
    var N=function(titulo,op){op=op||{};notificar(titulo,op.body,op.tag);};
    Object.defineProperty(N,'permission',{get:function(){return permiso;}});
    N.requestPermission=function(){
      var LN=P('LocalNotifications');if(!LN)return Promise.resolve('denied');
      return LN.requestPermissions().then(function(r){
        permiso=r&&r.display==='granted'?'granted':'denied';try{localStorage.setItem('_a52_app_perm',permiso);}catch(e){}
        if(permiso==='granted')crearCanal();
        return permiso;
      }).catch(function(){return 'denied';});
    };
    window.Notification=N;
    // El navegador de la app no trae voz (speechSynthesis): se reemplaza por la voz del teléfono (plugin Voz)
    if(typeof window.speechSynthesis==='undefined'||!window.speechSynthesis||typeof window.speechSynthesis.speak!=='function'){
      window.SpeechSynthesisUtterance=function(t){this.text=String(t||'');this.lang='es-CO';this.rate=1;this.volume=1;this.voice=null;};
      window.speechSynthesis={
        speak:function(u){var V=P('Voz');if(!V)return;llamar('Voz','hablar',{texto:String(u&&u.text||'')}).catch(function(){});},
        cancel:function(){llamar('Voz','callar',{}).catch(function(){});},
        getVoices:function(){return [];},
        speaking:false,pending:false,paused:false,pause:function(){},resume:function(){},onvoiceschanged:null,addEventListener:function(){},removeEventListener:function(){}
      };
    }
    var LN0=P('LocalNotifications');
    if(LN0&&LN0.checkPermissions)LN0.checkPermissions().then(function(r){permiso=r&&r.display==='granted'?'granted':(r&&r.display==='denied'?'denied':'default');}).catch(function(){});
    var AP=P('App');
    if(AP&&AP.addListener)AP.addListener('appStateChange',function(s){activa=!!(s&&s.isActive);});
    reloj=setInterval(fondo,60000);setTimeout(fondo,3000);
    // Dentro de la app no hay ventanas aparte: los tiquetes, cuadres y reportes que el POS abre en una ventana nueva
    // se muestran encima del POS, con «Cerrar» para volver. Sin esto el POS se reemplazaba por la hoja y quedaba en negro.
    var abrirOrig=window.open;
    window.open=function(url){
      var u=String(url||'');
      if(u&&u!=='about:blank'){
        try{var dest=new URL(u,location.href);if(dest.origin!==location.origin)return abrirOrig.apply(window,arguments);}catch(e){return abrirOrig.apply(window,arguments);}
        return hoja(null,u);
      }
      return hoja('',null);
    };
  }
  function hoja(html,src){
    var caja=document.createElement('div');
    caja.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff;display:flex;flex-direction:column';
    var barra=document.createElement('div');
    barra.style.cssText='display:flex;gap:10px;justify-content:flex-end;padding:10px;padding-top:calc(10px + env(safe-area-inset-top));background:#111;border-bottom:1px solid #333';
    var cerrar=document.createElement('button');cerrar.textContent='✕ Cerrar';
    cerrar.style.cssText='font-size:16px;font-weight:700;padding:10px 18px;border-radius:10px;border:0;background:#c9a84c;color:#111';
    barra.appendChild(cerrar);
    var marco=document.createElement('iframe');marco.style.cssText='flex:1;border:0;width:100%;background:#fff';
    caja.appendChild(barra);caja.appendChild(marco);document.body.appendChild(caja);
    var buf=html||'',pintado=false;
    function pintar(){pintado=false;if(src)return;try{marco.srcdoc=buf;}catch(e){}}
    function pedir(){if(!pintado){pintado=true;setTimeout(pintar,0);}}
    if(src)marco.src=src;
    var falsa={closed:false,
      document:{write:function(t){buf+=String(t);pedir();},writeln:function(t){buf+=String(t)+'\n';pedir();},open:function(){buf='';},close:function(){pedir();},title:''},
      print:function(){},focus:function(){},blur:function(){},addEventListener:function(ev,fn){if(ev==='load')setTimeout(fn,50);},
      close:function(){falsa.closed=true;caja.remove();}};
    cerrar.onclick=function(){falsa.close();};
    return falsa;
  }
  // El puente con Android puede llegar un instante después de cargar la página
  instalar();
  if(!listo){document.addEventListener('DOMContentLoaded',instalar);window.addEventListener('load',instalar);}
  // El aviso fijo de Android: mientras esté, el teléfono no duerme el POS. Se renueva cada minuto con el número de mesas.
  function texto(){
    try{var n=_mesasOcupadasIds().length;return n===0?'Sin mesas ocupadas':n===1?'1 mesa ocupada':n+' mesas ocupadas';}catch(e){return '';}
  }
  function fondo(){
    var RF=P('RadioFondo');if(!RF)return;
    var quiere=nat&&_notifOn&&!!usuarioActivo;   // cualquier usuario que haya encendido los avisos en su celular
    if(!quiere){if(fondoOn){fondoOn=false;RF.detener().catch(function(){});}return;}
    var t=texto();ultimoTxt=t;
    RF.iniciar({titulo:(NEGOCIO.nombreSimple||NEGOCIO.nombreCorto||'POS')+' · recibiendo avisos',texto:t}).then(function(){fondoOn=true;}).catch(function(){});
  }
  function revisarBateria(){
    var RF=P('RadioFondo');if(!RF)return;
    RF.estado().then(function(e){
      if(e&&!e.sinRestriccion&&confirm('Para que los avisos lleguen con el teléfono bloqueado, Android debe dejar esta app sin ahorro de batería.\n\nToque Aceptar y en la ventana que sale escoja «Permitir».'))RF.bateria().catch(function(){});
    }).catch(function(){});
  }
  var api={oculta:function(){return (typeof document!=='undefined'&&document.hidden)||(nat&&!activa);},fondo:fondo,revisarBateria:revisarBateria,texto:texto};
  Object.defineProperty(api,'es',{get:function(){return ver();}});
  return api;
})();
/* ═══ 🔐 SEGURIDAD Y ROBUSTEZ (2026-10-16) ═══
   1. Las claves (PIN) ya no se guardan en claro: queda una huella (PBKDF2-SHA256 con sal por negocio y usuario).
      La primera vez que entra un administrador, el sistema convierte las claves viejas y las borra de la base.
   2. Cinco claves erradas seguidas bloquean el ingreso en ese equipo 30 s; cada racha siguiente dobla la espera (máx. 10 min).
   3. Un guardado que la base rechace avisa en pantalla (antes se perdía en silencio). Sin conexión sale una franja arriba.
   4. La hora de los registros sale del reloj del servidor de Firebase (a52Ahora), no del celular.
   5. Dentro de la app Android los cuadros alert() salen como un aviso propio con botón Entendido (no bloquean la app). */

/* ---------- 1. Huella de la clave ---------- */
var A52_HASH_ITER=60000;
function a52HashPin(pin,uid){
  var sal=String((window.NEGOCIO&&NEGOCIO.id)||'negocio')+':'+String(uid||'')+':a52';
  if(!(window.crypto&&crypto.subtle&&window.TextEncoder))return Promise.reject(new Error('Este navegador no puede proteger la clave. Entre por la dirección segura (https).'));
  var enc=new TextEncoder();
  return crypto.subtle.importKey('raw',enc.encode(String(pin)),'PBKDF2',false,['deriveBits']).then(function(k){
    return crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(sal),iterations:A52_HASH_ITER,hash:'SHA-256'},k,256);
  }).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2);}).join('');});
}
/* ¿La clave escrita es la del usuario? Acepta la huella nueva y, mientras se migra, la clave vieja en claro. */
function a52PinCoincide(u,pin){
  if(!u)return Promise.resolve(false);
  if(u.pinHash)return a52HashPin(pin,u.id).then(function(h){return h===u.pinHash;});
  return Promise.resolve(u.pin!=null&&String(pin)===String(u.pin));
}
/* Convierte las claves en claro a huellas y las borra de la base (lo hace el administrador al entrar). */
var _a52Migrando=false;
function a52MigrarPins(){
  if(_a52Migrando||!getDb()||!usuarioActivo||usuarioActivo.rol!=='admin')return;
  var pend=(usuarios||[]).filter(function(u){return u&&u.pin!=null&&!u.pinHash;});
  if(!pend.length)return;
  _a52Migrando=true;
  Promise.all(pend.map(function(u){return a52HashPin(String(u.pin),u.id).then(function(h){u.pinHash=h;u.pinLen=String(u.pin).length;delete u.pin;});})).then(function(){
    var o={};usuarios.forEach(function(u){o[u.id]=u;});
    return getDb().ref('usuarios').set(o);
  }).then(function(){showToast('🔐 Las claves del personal quedaron protegidas','#22c55e');}).catch(function(e){a52Falla('usuarios',e);}).then(function(){_a52Migrando=false;});
}

/* ---------- 2. Intentos fallidos ---------- */
function a52Bloqueo(){try{return JSON.parse(localStorage.getItem('_a52_pinfail')||'{}');}catch(e){return {};}}
function a52BloqueoGuardar(b){try{localStorage.setItem('_a52_pinfail',JSON.stringify(b));}catch(e){}}
/* Segundos que faltan para poder intentar de nuevo (0 = libre) */
function a52BloqueoSeg(){var b=a52Bloqueo();return Math.max(0,Math.ceil(((b.hasta||0)-Date.now())/1000));}
function a52PinFallo(){
  var b=a52Bloqueo();b.n=(b.n||0)+1;
  if(b.n>=5){b.rachas=(b.rachas||0)+1;var esp=Math.min(600,30*Math.pow(2,b.rachas-1));b.hasta=Date.now()+esp*1000;b.n=0;}
  a52BloqueoGuardar(b);return a52BloqueoSeg();
}
function a52PinOk(){a52BloqueoGuardar({});}

/* ---------- 3. Guardados que fallan y conexión ---------- */
var _a52FallaUlt=0;
function a52Falla(path,e){
  var ahora=Date.now();if(ahora-_a52FallaUlt<8000)return;_a52FallaUlt=ahora;
  var perm=/permission|denied/i.test(String(e&&e.message||e));
  try{showToast(perm?'⛔ La base rechazó un guardado ('+String(path).split('/')[0]+'). Este equipo puede no estar autorizado.':'⚠️ No se pudo guardar en '+String(path).split('/')[0]+'. Revise la conexión.','#ef4444',6000);}catch(x){}
  try{console.error('Guardado fallido',path,e);}catch(x){}
}
function a52Conexion(){
  var d=getDb();if(!d||window._a52ConOk)return;window._a52ConOk=true;
  var t=null;
  d.ref('.info/connected').on('value',function(s){
    var on=s.val()===true,f=document.getElementById('a52-sincon');
    clearTimeout(t);
    if(on){if(f)f.remove();return;}
    t=setTimeout(function(){
      if(document.getElementById('a52-sincon'))return;
      f=document.createElement('div');f.id='a52-sincon';
      f.style.cssText='position:fixed;left:0;right:0;top:0;z-index:9500;background:#b91c1c;color:#fff;font-size:12px;font-weight:700;text-align:center;padding:6px 10px';
      f.textContent='📵 Sin conexión con la base. Lo que registre se envía cuando vuelva el internet.';
      document.body.appendChild(f);
    },6000);
  });
  d.ref('.info/serverTimeOffset').on('value',function(s){window._a52Off=Number(s.val())||0;});
}

/* ---------- 4. Hora del servidor: a52Ahora() está en comun.js; el desfase se mide en a52Conexion ---------- */

/* ---------- 5. alert() sin bloquear ---------- */
(function(){
  var cola=[],abierto=false,orig=window.alert;
  function pintar(){
    if(abierto||!cola.length)return;abierto=true;
    var msg=cola.shift(),f=document.createElement('div');
    f.style.cssText='position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px';
    var c=document.createElement('div');c.style.cssText='background:#16161f;color:#eee;border:1px solid #444;border-radius:14px;padding:18px 18px 14px;max-width:420px;width:100%;font-size:14px;line-height:1.45;white-space:pre-wrap;box-shadow:0 20px 50px rgba(0,0,0,.6)';
    c.textContent=String(msg);
    var b=document.createElement('button');b.textContent='Entendido';b.style.cssText='display:block;margin:14px 0 0 auto;background:#c9a84c;color:#111;border:0;border-radius:9px;padding:10px 20px;font-weight:800;font-size:14px;cursor:pointer';
    b.onclick=function(){f.remove();abierto=false;pintar();};
    c.appendChild(b);f.appendChild(c);document.body.appendChild(f);
    try{b.focus();}catch(e){}
  }
  // Solo dentro de la app Android: en el navegador el alert() de siempre funciona bien
  window.alert=function(m){
    var app=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
    if(!app||!document.body){try{orig.call(window,m);}catch(e){}return;}
    cola.push(m);pintar();
  };
})();
