/* ═══ ⚙️ AJUSTES DEL NEGOCIO ═══
   Lo que cambia de un negocio a otro dentro del POS: zonas, socios, medios de pago y qué módulos usa.
   Orden de mando: lo que el administrador guardó (base: «ajustes») → lo de negocio.js (NEGOCIO.pos) → lo de fábrica. */
var SOCIOS=[],MODS={},A52_AJ={},A52_ZONAS_CONF=[],A52_FPAGO_BASE=null,_mesasDeFabrica=true;
var A52_MODULOS=[{id:'combos',t:'🎁 Combos'},{id:'cocina',t:'👨‍🍳 Cocina'},{id:'cubetazos',t:'🪣 Cubetazos'},{id:'creditos',t:'📒 Fiados'},{id:'socios',t:'🤝 Socios'},{id:'empleados',t:'👷 Empleados'},{id:'rappi',t:'🛵 Rappi'},{id:'saneamiento',t:'🧼 Saneamiento'},{id:'pelotas',t:'🐸 Bolirana'}];
var A52_COLORES=['#a855f7','#38bdf8','#22c55e','#f5a623','#ef4444','#06b6d4','#ec4899','#84cc16'];
function a52Mod(k){return MODS[k]!==false&&(k!=='socios'||SOCIOS.length>0);}
function tabsDeRol(rol){var t=((ROLES[rol]&&ROLES[rol].tabs)||['mesas']).filter(function(x){return a52Mod(x);});return t.length?t:['mesas'];}
function FPV(){return FPAGO.filter(function(f){return !f.off;});}     // medios de pago que se ofrecen (los ocultos siguen sirviendo para el historial)
function socColor(id,def){var s=SOCIOS.filter(function(x){return x.id===id;})[0];return s?s.color:(def||'#a855f7');}
function socTxt(id){var c=String(socColor(id)).replace('#','');if(c.length!==6)return'#fff';return(parseInt(c.substr(0,2),16)*299+parseInt(c.substr(2,2),16)*587+parseInt(c.substr(4,2),16)*114)/1000>150?'#000':'#fff';}
function socDef(){return SOCIOS.length?SOCIOS[0].id:'';}
function socDlg(){var d=A52_AJ.socioDialogo;return SOCIOS.some(function(x){return x.id===d;})?d:socDef();}
function socNom(id){id=String(id||'');return id.charAt(0)+id.slice(1).toLowerCase();}
function socTotal(id){return consumoSocios.filter(function(c){return c.socio===id;}).reduce(function(a,c){return a+c.total;},0);}
function a52PeSocio(btn,n){window._peSocio=n;var c=btn.parentNode;if(!c)return;Array.prototype.forEach.call(c.children,function(b){var s=b===btn;b.style.background=s?'var(--accent)':'var(--bg)';b.style.color=s?'#fff':'var(--muted)';b.style.borderColor=s?'var(--accent)':'var(--border)';});}
function a52Lista(v){return v?(Array.isArray(v)?v:Object.values(v)).filter(Boolean):null;}
function a52AjCache(aj){if(aj!==undefined){try{localStorage.setItem(LSK('ajustes'),JSON.stringify(aj||{}));}catch(e){}return aj;}try{return JSON.parse(localStorage.getItem(LSK('ajustes'))||'{}')||{};}catch(e){return{};}}
function a52ZonasArmar(){
  // las zonas configuradas, más cualquier zona que aún tenga mesas (para que ninguna mesa quede sin zona)
  var z=A52_ZONAS_CONF.slice();
  if(!_mesasDeFabrica)mesas.forEach(function(m){if(m&&m.zona&&!z.some(function(x){return x.id===m.zona;}))z.push({id:m.zona,label:String(m.zona),emoji:'📍',color:'#71717a',huerfana:true});});
  ZONAS.length=0;z.forEach(function(x){ZONAS.push(x);});
  if(!ZONAS.some(function(x){return x.id===zonaActual;}))zonaActual=ZONAS[0].id;
}
function a52AplicarAjustes(aj){
  aj=aj||{};var conf=aj.conf||{},fab=(window.NEGOCIO&&NEGOCIO.pos)||{};
  // zonas
  var z=(conf.zonas?a52Lista(aj.zonas):null)||a52Lista(fab.zonas)||[{id:'salon',label:'Salón',emoji:'🪑',color:'#a855f7'}];
  A52_ZONAS_CONF=z.filter(function(x){return x&&x.id&&x.label;}).map(function(x,i){return{id:String(x.id),label:String(x.label),emoji:x.emoji||'📍',color:x.color||A52_COLORES[i%A52_COLORES.length]};});
  if(!A52_ZONAS_CONF.length)A52_ZONAS_CONF=[{id:'salon',label:'Salón',emoji:'🪑',color:'#a855f7'}];
  if(_mesasDeFabrica){var ini=fab.mesasIniciales||[8],off=0;mesas=[];A52_ZONAS_CONF.forEach(function(x,i){var n=ini[i]||0;if(n){mesas=mesas.concat(genMesas(x.id,n,off));off+=n;}});}
  a52ZonasArmar();
  // socios
  var s=conf.socios?(a52Lista(aj.socios)||[]):(a52Lista(fab.socios)||[]);
  SOCIOS=s.map(function(x,i){var id=String((x&&(x.id||x.nombre))||'').trim().toUpperCase();return id?{id:id,color:(x.color||A52_COLORES[(i+1)%A52_COLORES.length])}:null;}).filter(Boolean);
  A52_AJ={socioDialogo:aj.socioDialogo||fab.socioDialogo||''};
  if(!SOCIOS.some(function(x){return x.id===_socioActivo;}))_socioActivo=socDef();
  // medios de pago
  if(!A52_FPAGO_BASE)A52_FPAGO_BASE=JSON.parse(JSON.stringify(FPAGO));
  var f=(conf.fpago?a52Lista(aj.fpago):null)||a52Lista(fab.fpago),res=JSON.parse(JSON.stringify(A52_FPAGO_BASE));
  if(f){var ord=[];f.forEach(function(x){if(!x||!x.id)return;var b=res.filter(function(y){return y.id===x.id;})[0]||{id:String(x.id)};
      b.label=x.label||b.label||String(x.id);b.emoji=x.emoji||b.emoji||'💳';b.color=x.color||b.color||'#71717a';if(x.off&&b.id!=='efectivo')b.off=true;else delete b.off;if(ord.indexOf(b)<0)ord.push(b);});
    res.forEach(function(y){if(ord.indexOf(y)<0)ord.push(y);});res=ord;}
  FPAGO.length=0;res.forEach(function(x){FPAGO.push(x);});
  // módulos
  MODS={};var m=Object.assign({},fab.modulos||{},aj.modulos||{});Object.keys(m).forEach(function(k){if(m[k]===false)MODS[k]=false;});
  if(usuarioActivo){var tabs=tabsDeRol(usuarioActivo.rol);if(tabs.indexOf(tabActual)<0)tabActual=tabs[0];try{renderTabs();render();}catch(e){console.warn(e);}}
}
function a52GuardarAjuste(clave,valor){
  var aj=a52AjCache();aj[clave]=valor;aj.conf=aj.conf||{};aj.conf[clave]=true;a52AjCache(aj);a52AplicarAjustes(aj);
  var d=getDb();if(d){d.ref('ajustes/'+clave).set(valor).catch(function(){alert('Este equipo no pudo guardar el cambio en la base.');});d.ref('ajustes/conf/'+clave).set(true).catch(function(){});}
  showToast('✅ Guardado','#22c55e');
}
function a52ModToggle(id){var o={};A52_MODULOS.forEach(function(x){o[x.id]=MODS[x.id]!==false;});o[id]=!o[id];a52GuardarAjuste('modulos',o);}

// ── Tarjeta en Admin
function a52NegocioHtml(){
  var b='border-radius:99px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;';
  var fila=function(tit,txt,fn){return'<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--border)"><div style="flex:1;min-width:0"><div style="font-weight:800;font-size:13px">'+tit+'</div><div style="color:var(--muted);font-size:11.5px;line-height:1.4">'+txt+'</div></div>'
    +'<button class="btn btn-sm" style="background:var(--card2);border:1px solid var(--border);color:var(--text)" onclick="'+fn+'">Editar</button></div>';};
  return'<div class="card" style="grid-column:1/-1"><div style="color:var(--accent);font-weight:800;font-size:15px;margin-bottom:6px">⚙️ Negocio</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:10px;line-height:1.45">Lo que cambia de un negocio a otro. Apague lo que no use: desaparece del menú de todos los equipos.</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px">'+A52_MODULOS.map(function(x){var on=MODS[x.id]!==false;
      return'<button onclick="a52ModToggle(\''+x.id+'\')" style="'+b+'background:'+(on?'#22c55e18':'var(--bg)')+';color:'+(on?'#22c55e':'var(--muted)')+';border:1px solid '+(on?'#22c55e55':'var(--border)')+'">'+x.t+' · '+(on?'activo':'apagado')+'</button>';}).join('')+'</div>'
    +fila('Zonas',A52_ZONAS_CONF.map(function(z){return esc(z.emoji+' '+z.label);}).join(' · '),'a52EditarZonas()')
    +fila('Socios',SOCIOS.length?SOCIOS.map(function(x){return esc(socNom(x.id));}).join(' · '):'Sin socios: el módulo de socios queda oculto.','a52EditarSocios()')
    +fila('Medios de pago',FPAGO.map(function(f){return'<span style="'+(f.off?'opacity:.45;text-decoration:line-through':'')+'">'+esc(f.emoji+' '+f.label)+'</span>';}).join(' · '),'a52EditarFpago()')
    +'</div>';
}
// ── Editores (una fila por elemento)
function a52EdFila(tipo,x){
  var inp='background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px;color:var(--text);font-size:14px;';
  var fijo=tipo==='socios'&&x.id;   // un socio con historia no cambia de nombre (sus consumos quedan a ese nombre)
  return'<div class="a52-fila" data-id="'+esc(x.id||'')+'" style="display:flex;gap:6px;align-items:center;margin-bottom:7px">'
    +(tipo!=='socios'?'<input class="e" maxlength="4" value="'+esc(x.emoji||'')+'" placeholder="🙂" style="'+inp+'width:52px;text-align:center">':'')
    +'<input class="n" maxlength="24" value="'+esc(tipo==='socios'?socNom(x.id||''):(x.label||''))+'" placeholder="Nombre" '+(fijo?'readonly ':'')+'style="'+inp+'flex:1;min-width:0'+(fijo?';opacity:.7':'')+'">'
    +'<input class="c" type="color" value="'+esc(x.color||'#a855f7')+'" style="width:40px;height:38px;border:1px solid var(--border);border-radius:8px;background:var(--bg);padding:2px">'
    +(tipo==='fpago'?'<label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;white-space:nowrap"><input class="v" type="checkbox"'+(x.off?'':' checked')+(x.id==='efectivo'?' disabled':'')+'>Usar</label>'
      :'<button type="button" onclick="this.parentNode.remove()" style="background:#ef444418;color:#ef4444;border:1px solid #ef444444;border-radius:8px;padding:8px 10px;cursor:pointer">✕</button>')
    +'</div>';
}
function a52Editor(tipo,titulo,nota,items){
  window._a52Ed=tipo;
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">'+titulo+'</div><div style="color:var(--muted);font-size:11.5px;margin-bottom:12px;line-height:1.45">'+nota+'</div>'
    +'<div id="a52-ed-filas">'+items.map(function(x){return a52EdFila(tipo,x);}).join('')+'</div>'
    +'<button class="btn btn-sm btn-full" style="background:var(--card2);border:1px dashed var(--border);color:var(--text);margin:4px 0 12px" onclick="document.getElementById(\'a52-ed-filas\').insertAdjacentHTML(\'beforeend\',a52EdFila(\''+tipo+'\',{color:A52_COLORES[document.querySelectorAll(\'.a52-fila\').length%A52_COLORES.length]}))">+ Agregar</button>'
    +'<div style="display:flex;gap:8px"><button class="btn btn-full" style="background:var(--card2);border:1px solid var(--border);color:var(--text)" onclick="closeModal1()">Cancelar</button><button class="btn btn-green btn-full" onclick="a52EditorGuardar()">Guardar</button></div>');
}
function a52EditarZonas(){a52Editor('zonas','📍 Zonas','Las áreas donde hay mesas (salón, terraza, segundo piso…). Una zona con mesas no se puede quitar: primero mueva o borre sus mesas.',A52_ZONAS_CONF);}
function a52EditarSocios(){a52Editor('socios','🤝 Socios','Los dueños que consumen o retiran por cuenta propia. Si no hay socios, el módulo queda oculto. Un socio con saldo pendiente no se puede quitar.',SOCIOS);}
function a52EditarFpago(){a52Editor('fpago','💳 Medios de pago','Cambie el nombre, el emoji o el color, y desmarque «Usar» en los que no maneje. El efectivo siempre queda. Puede agregar otros (por ejemplo, un bono o una transferencia de otro banco).',FPAGO);}
function a52EditorGuardar(){
  var tipo=window._a52Ed,filas=Array.prototype.slice.call(document.querySelectorAll('#a52-ed-filas .a52-fila')),out=[],ids={},err='';
  filas.forEach(function(f,i){
    var id=f.getAttribute('data-id')||'',n=(f.querySelector('.n').value||'').trim(),c=f.querySelector('.c').value||'#a855f7',e=f.querySelector('.e'),v=f.querySelector('.v');
    if(!n)return;
    if(tipo==='socios'){id=id||n.toUpperCase();if(ids[id]){err='Hay dos socios con el mismo nombre.';return;}ids[id]=1;out.push({id:id,color:c});}
    else if(tipo==='zonas'){id=id||('z'+Date.now().toString(36)+i);out.push({id:id,label:n,emoji:(e.value||'').trim()||'📍',color:c});}
    else{id=id||('fp'+Date.now().toString(36)+i);var o={id:id,label:n,emoji:(e.value||'').trim()||'💳',color:c};if(v&&!v.checked&&id!=='efectivo')o.off=true;out.push(o);}
  });
  if(err){alert(err);return;}
  if(tipo==='zonas'){
    if(!out.length){alert('Debe quedar al menos una zona.');return;}
    var falta=A52_ZONAS_CONF.filter(function(z){return !out.some(function(o){return o.id===z.id;})&&mesas.some(function(m){return m.zona===z.id;});});
    if(falta.length){alert('No se puede quitar «'+falta[0].label+'» porque todavía tiene mesas.\n\nMueva o borre esas mesas primero.');return;}
  }
  if(tipo==='socios'){
    var debe=SOCIOS.filter(function(s){return !out.some(function(o){return o.id===s.id;})&&(socTotal(s.id)>0||(prestamosSocios||[]).some(function(p){return p.socio===s.id&&((p.monto||0)-(p.devuelto||0))>0;}));});
    if(debe.length){alert('No se puede quitar a '+socNom(debe[0].id)+' porque tiene consumos o préstamos pendientes.\n\nLiquide primero su cuenta.');return;}
  }
  if(tipo==='fpago'&&!out.some(function(o){return o.id==='efectivo';})){alert('El efectivo no se puede quitar.');return;}
  closeModal1();a52GuardarAjuste(tipo,out);
}

// ── Primera vez de un negocio nuevo: no hay usuarios en la base → se crea el administrador (nada de claves de fábrica)
function a52PrimerAdmin(){
  var ul=document.getElementById('user-list');if(!ul||document.getElementById('a52-pa'))return;
  var inp='width:100%;box-sizing:border-box;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:11px;color:var(--text);font-size:15px;margin-bottom:8px;text-align:center';
  ul.innerHTML='<form id="a52-pa" style="text-align:center"><div style="font-weight:800;font-size:15px;margin-bottom:4px">Primera configuración</div>'
    +'<div style="color:var(--muted);font-size:12px;line-height:1.45;margin-bottom:12px">Este negocio todavía no tiene usuarios. Cree el administrador; después podrá agregar a los demás en Admin → Usuarios.</div>'
    +'<input id="a52-pa-n" maxlength="24" placeholder="Nombre del administrador" style="'+inp+'">'
    +'<input id="a52-pa-p" type="password" inputmode="numeric" maxlength="4" placeholder="Clave de 4 números" style="'+inp+'">'
    +'<input id="a52-pa-q" type="password" inputmode="numeric" maxlength="4" placeholder="Repita la clave" style="'+inp+'">'
    +'<div id="a52-pa-e" style="color:var(--red);font-size:12px;min-height:16px;margin-bottom:6px"></div>'
    +'<button class="btn btn-green btn-full" type="submit">Crear administrador</button></form>';
  document.getElementById('a52-pa').onsubmit=function(ev){
    ev.preventDefault();
    var n=document.getElementById('a52-pa-n').value.trim(),p=document.getElementById('a52-pa-p').value,q=document.getElementById('a52-pa-q').value,e=document.getElementById('a52-pa-e');
    if(n.length<2){e.textContent='Escriba el nombre.';return false;}
    if(!/^[0-9]{4}$/.test(p)){e.textContent='La clave debe tener 4 números.';return false;}
    if(p!==q){e.textContent='Las dos claves no coinciden.';return false;}
    if(/^(\d)\1{3}$/.test(p)||p==='1234'){e.textContent='Elija una clave menos fácil de adivinar.';return false;}
    var r=ref('usuarios');if(!r){e.textContent='Sin conexión con la base.';return false;}
    r.set([{id:'admin',nombre:n,pin:p,rol:'admin',emoji:'👑'}]).catch(function(){e.textContent='La base no dejó guardar. Revise la conexión o autorice este equipo.';});
    return false;
  };
}
// Si una tarjeta nueva falla, Admin sigue abriendo con las demás
function a52Seguro(f){try{return f();}catch(e){console.warn(e);return'<div class="card" style="color:var(--muted);font-size:12px">Esta sección no cargó. Recargue la página (Ctrl + F5).</div>';}}
function completarLogin(){setTimeout(a52CampanaPintar,100);setTimeout(function(){try{a52Conexion();a52MigrarPins();}catch(e){}},1500);
  registrarSesion('login',usuarioSelLogin);
    usuarioActivo=usuarioSelLogin;
  window._usuarioActivoGlobal=usuarioActivo;
    document.getElementById('login-screen').style.display='none';
    document.getElementById('header').style.display='flex';
    document.getElementById('tabs').style.display='flex';
    document.getElementById('h-emoji').textContent=usuarioActivo.emoji;
    document.getElementById('h-nombre').textContent=usuarioActivo.nombre;
    document.getElementById('h-rol').textContent=(ROLES[usuarioActivo.rol]||{}).label||usuarioActivo.rol;
    iniciarSync();
    tabActual=tabsDeRol(usuarioActivo.rol)[0];
    renderTabs();render();
    try{var _h=(location.hash||'').slice(1);if(_h&&a52HerrDeRol().some(function(x){return x.id===_h;}))a52Herramienta(_h);}catch(e){}
    iniciarVigilanciaRed();
}
// Re-verifica la red durante la sesión (cada 10 min y al volver a la app):
// evita que alguien entre en el bar y siga usando la sesión desde la casa.
function iniciarVigilanciaRed(){
  if(window._vigRedInt){clearInterval(window._vigRedInt);window._vigRedInt=null;}
  if(!usuarioActivo||!rolRestringidoRed(usuarioActivo.rol))return;
  function chequear(){
    if(!redBarCfg.on||!usuarioActivo||!rolRestringidoRed(usuarioActivo.rol))return;
    obtenerIPPublica(function(ip){
      if(!usuarioActivo)return;
      if(ip&&!ipAutorizada(ip)){
        alert('🚫 Saliste de la red del bar. Tu sesión se cerró por seguridad.');
        cerrarSesion();
      }
    });
  }
  window._vigRedInt=setInterval(chequear,10*60*1000);
  if(!window._vigRedVisBound){
    window._vigRedVisBound=true;
    document.addEventListener('visibilitychange',function(){
      if(document.visibilityState==='visible')chequear();
    });
  }
}
function cerrarSesion(){if(A52APP.es)setTimeout(A52APP.fondo,500);
  if(usuarioActivo)registrarSesion('logout',usuarioActivo);
  window._usuarioActivoGlobal=null;
  if(getDb())['pedidos','ventas','gastos','menu','mesas','paredes','cierres','cajaHoy','combos','equipos','solicitudes','cartaPublica','llamados','ajustes','config/fotos'].forEach(fbOff);
  ['a52-solic','a52-llamados','a52-herr'].forEach(function(i){var e=document.getElementById(i);if(e)e.remove();});
  usuarioActivo=null;mesaActiva=null;tabActual='mesas';
  document.getElementById('header').style.display='none';
  document.getElementById('tabs').style.display='none';
  document.getElementById('content').innerHTML='';
  document.getElementById('login-screen').style.display='flex';
  pinBuffer='';usuarioSelLogin=null;
  document.getElementById('login-step-user').style.display='block';
  document.getElementById('login-step-pin').style.display='none';
  renderLogin();
}

/* ═══════════════ TABS + RENDER ═══════════════ */
function renderTabs(){
  var rol=usuarioActivo&&usuarioActivo.rol;
  var tabs=tabsDeRol(rol);
  // Pestañas favoritas del rol (solo las que el rol tiene permitidas)
  var favoritas=(TABS_FAVORITOS[rol]||tabs.slice(0,4)).filter(function(t){return tabs.indexOf(t)>=0;});
  var visibles=favoritas.slice(0,4);
  // Si la pestaña activa no está entre las visibles, mostrarla en el último puesto
  if(visibles.indexOf(tabActual)<0&&tabs.indexOf(tabActual)>=0){
    visibles=visibles.slice(0,3).concat([tabActual]);
  }
  var html=visibles.map(function(t){
    return '<button class="tab-btn'+(t===tabActual?' active':'')+'" onclick="setTab(\''+t+'\')">'+(TAB_LABELS[t]||t)+'</button>';
  }).join('');
  if(tabs.length>visibles.length){
    html+='<button class="tab-btn" onclick="abrirMenuTabs()" style="border:1px dashed var(--border);border-radius:8px">☰ Más</button>';
  }
  document.getElementById('tabs').innerHTML=html;
}
// Menú de secciones agrupado por categorías
function abrirMenuTabs(){
  var rol=usuarioActivo&&usuarioActivo.rol;
  var tabs=tabsDeRol(rol);
  var grupos=TABS_GRUPOS.map(function(g){
    var propias=g.tabs.filter(function(t){return tabs.indexOf(t)>=0;});
    if(!propias.length)return'';
    var botones=propias.map(function(t){
      var lbl=TAB_LABELS[t]||t;
      var partes=lbl.split(' ');
      var emoji=partes.shift();
      var nombre=partes.join(' ');
      var activa=t===tabActual;
      return'<button onclick="setTab(\''+t+'\');closeModal2();" style="background:'+(activa?'var(--accent)22':'var(--bg)')+';border:1px solid '+(activa?'var(--accent)':'var(--border)')+';border-radius:12px;padding:12px 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px">'
        +'<span style="font-size:22px">'+emoji+'</span>'
        +'<span style="font-size:10px;font-weight:700;color:'+(activa?'var(--accent)':'var(--text)')+'">'+esc(nombre)+'</span>'
      +'</button>';
    }).join('');
    return'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin:10px 0 6px">'+g.titulo.toUpperCase()+'</div>'
      +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+botones+'</div>';
  }).join('');
  modal2('<div style="font-weight:800;font-size:16px;margin-bottom:4px;text-align:center">☰ Ir a sección</div>'
    +'<div style="max-height:64vh;overflow-y:auto;margin-top:-4px">'+grupos+a52HerrMenuHtml()+'</div>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:12px">Cerrar</button>');
}
function setTab(t){tabActual=t;mesaActiva=null;editandoProd=null;renderTabs();render();}
function render(){
  if(!usuarioActivo)return;
  updateHeader();
  var c=document.getElementById('content');
  if(tabActual==='mesas'){
    c.innerHTML=renderMesas();
    var slot=document.getElementById('panel-pedido-slot');
    if(slot&&mesaActiva){
      slot.id='panel-pedido';
      slot.style.cssText='background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;max-height:85vh';
        slot.innerHTML=renderPanelPedido();
    }
  }
  if(tabActual==='inventario')c.innerHTML=renderInventario();
  if(tabActual==='carta'){c.innerHTML=renderCarta();setTimeout(bindEmojiPicker,50);}
  if(tabActual==='combos')    c.innerHTML=renderCombos();
  if(tabActual==='caja')      c.innerHTML=renderCaja();
  if(tabActual==='gastos')    c.innerHTML=renderGastos();
  if(tabActual==='ventas')    c.innerHTML=renderVentas();
  if(tabActual==='socios')    c.innerHTML=renderSocios();
  if(tabActual==='empleados') {c.innerHTML=renderEmpleados();}
  if(tabActual==='creditos')  {c.innerHTML=renderCreditos();}
  if(tabActual==='rappi')     {c.innerHTML=renderRappi();}
  if(tabActual==='saneamiento'){c.innerHTML=renderSaneamiento();}
  if(tabActual==='cocina')    {c.innerHTML=renderCocina();bindCocinaEvents();}
  if(tabActual==='admin')     c.innerHTML=renderAdmin();
  bindMapaEvents();
  setTimeout(bindComboEvents, 50);
  setTimeout(bindAdminEvents, 50);
}
function updateHeader(){
  if(!usuarioActivo)return;
  var lib=mesas.filter(function(m){return!(pedidos[m.id]&&pedidos[m.id].length>0);}).length;
  var ocp=mesas.length-lib;
  // Cobrado en el turno
  var cobrado=totalVentasHoy();
  // Por cobrar: suma de pedidos activos en todas las mesas
  var porCobrar=mesas.reduce(function(a,m){return a+totalPedido(m.id);},0);
  var totalGen=cobrado+porCobrar;
  document.getElementById('h-libres').textContent=lib+' libres';
  document.getElementById('h-ocup').textContent=ocp+' ocup.';
  var ec=document.getElementById('h-cobrado');
  var ep=document.getElementById('h-porcobrar');
  var et=document.getElementById('h-total');
  // Los meseros NO ven los totales de dinero del bar
  var ocultarDinero=(usuarioActivo.rol==='mesero');
  if(ec){ec.textContent='✅ '+fmt(cobrado);ec.style.display=ocultarDinero?'none':'';}
  if(ep){ep.textContent='⏳ '+fmt(porCobrar);ep.style.display=ocultarDinero?'none':'';}
  if(et){et.textContent='💰 '+fmt(totalGen);et.style.display=ocultarDinero?'none':'';}
}


