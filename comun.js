/* comun.js — lo que comparten todas las páginas del sistema.
   1) La marca: todo lo propio del negocio viene de negocio.js (window.NEGOCIO). El programa no nombra a ningún negocio.
   2) Equipos autorizados: la base solo atiende a los equipos que un administrador aprobó. */
/* Hora de los registros: el reloj del servidor de Firebase (el desfase lo mide el POS al conectar) */
function a52Ahora(){return new Date().getTime()+(window._a52Off||0);}
(function(){
  var N=window.NEGOCIO=window.NEGOCIO||{};
  function def(k,v){if(N[k]==null||N[k]==='')N[k]=v;}
  // Lo que se guarda en el navegador lleva el nombre del negocio (dos negocios en el mismo dominio no se mezclan)
  window.LSK=function(k){return'a52_'+(N.id?String(N.id).replace(/[^a-z0-9]/gi,'')+'_':'')+k;};
  var EM0=N.emoji||'',EM2=N.emoji2||'';   // emojis propios de la marca (opcionales)
  def('nombre','Mi Negocio');def('nombreCorto',N.nombre);def('tipo','');def('ciudad','');def('pais','Colombia');
  def('lema','');def('direccion','');def('telefono','');def('whatsapp','');def('correo','');def('instagram','');def('tiktok','');
  def('desde','');def('logo','');def('logoGrande',N.logo);def('horario','');def('fondos',[]);def('enlaces',[]);def('videoPromo','');
  def('rocolaPinStaff','');def('colores',{});def('firebase',null);def('decoracion',true);
  // Nombre sin tildes y en mayúsculas (tiquetes, encabezados del POS, nombres de archivo)
  def('nombreSimple',N.nombre.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase());
  def('archivo',N.nombreSimple.replace(/[^A-Z0-9]+/g,' ').trim().split(' ').map(function(p){return p.charAt(0)+p.slice(1).toLowerCase();}).join(''));
  N.nombreTipo=(N.nombre+(N.tipo?' '+N.tipo:'')).trim();
  N.telefonoBonito=String(N.telefono).replace(/^(\d{3})(\d{3})(\d{4})$/,'$1 $2 $3');
  N.direccionCiudad=[N.direccion,N.ciudad].filter(Boolean).join(', ');
  N.waUrl=N.whatsapp?'https://wa.me/'+String(N.whatsapp).replace(/\D/g,''):'';
  N.mapaUrl=N.mapa||(N.direccion?'https://maps.google.com/?q='+encodeURIComponent(N.direccionCiudad):'');
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  // M('nombre') → texto del negocio listo para poner dentro de HTML
  window.M=function(k){return esc(N[k]);};
  window.MU=function(k){return esc(String(N[k]==null?'':N[k]).toUpperCase());};   // igual, en mayúsculas
  // Dirección completa de otra página del sistema (sirve en cualquier hosting, sin escribir el dominio)
  window.MarcaUrl=function(p){try{return new URL(p,location.href.split('#')[0].split('?')[0]).href;}catch(e){return p;}};
  // Nombre partido para títulos de dos colores: «ÁREA <span>52</span>»
  window.MarcaTitulo=function(){var p=N.nombre.split(' ');if(p.length<2)return esc(N.nombre);var u=p.pop();return esc(p.join(' '))+' <span>'+esc(u)+'</span>';};
  // Rellena lo marcado en el HTML: data-m="clave" (texto) · data-m-src="logo" · data-m-href="waUrl" · data-m-si="clave" (se oculta si está vacío)
  window.MarcaAplicar=function(raiz){
    raiz=raiz||document;
    raiz.querySelectorAll('[data-m]').forEach(function(e){e.textContent=N[e.getAttribute('data-m')]||'';});
    raiz.querySelectorAll('[data-m-src]').forEach(function(e){var v=N[e.getAttribute('data-m-src')];if(v)e.src=v;else e.style.display='none';});
    raiz.querySelectorAll('[data-m-href]').forEach(function(e){var v=N[e.getAttribute('data-m-href')];if(v)e.href=v;else e.style.display='none';});
    raiz.querySelectorAll('[data-m-si]').forEach(function(e){if(!N[e.getAttribute('data-m-si')])e.style.display='none';});
    raiz.querySelectorAll('[data-ic]').forEach(function(e){var k=e.getAttribute('data-ic');if(window.MarcaIcono)e.textContent=window.MarcaIcono(k);});
    // Logo pequeño (POS): el dibujo propio del negocio, su imagen o, si no hay, su emoji
    raiz.querySelectorAll('[data-m-logo]').forEach(function(e){
      var d=(e.getAttribute('data-m-logo')||'40x26').split('x'),w=+d[0]||40,h=+d[1]||26;
      if(N.logoSvg)e.innerHTML=String(N.logoSvg).replace('<svg','<svg width="'+w+'" height="'+h+'"');
      else if(N.logo)e.innerHTML='<img src="'+esc(N.logo)+'" alt="" style="height:'+h+'px;max-width:'+(w*2)+'px;object-fit:contain;border-radius:6px;display:block">';
      else{e.textContent=N.emoji;e.style.fontSize=h+'px';e.style.lineHeight='1';}
    });
  };
  function titulo(){document.title=document.title.replace('{nombre}',N.nombre).replace('{nombreCorto}',N.nombreCorto).replace('{tipo}',N.tipo).replace(/\s+[·—–-]?\s*$/,'');}
  function listo(){
    titulo();
    window.MarcaAplicar(document);
  }
  /* ═══ 🎨 TEMAS ═══
     Un tema es una paleta completa (más tipo de letra de los títulos y adornos) que cambia todas las pantallas a la vez.
     Se elige en el POS (Admin → Tema) y queda guardado en la base (config/tema); negocio.js trae el tema de arranque.
     Para agregar un tema nuevo basta sumar otro bloque a esta lista. */
  var TEMAS=window.TEMAS={
    espacial:{nombre:'Espacial',desc:'Neón violeta y verde sobre noche',muestra:['#a855f7','#7cffb2','#4de1ff','#05030d'],decoracion:true,emoji:'🛸',emoji2:'👽',
      v:{p:'168,85,247',p2:'123,47,247',p3:'176,38,255',s:'124,255,178',s2:'57,255,20',c:'77,225,255',c2:'34,211,238',c3:'0,229,255',k:'255,94,200',k2:'255,77,141',o:'201,168,76',o2:'240,192,64',b0:'5,3,13',b1:'10,6,24',b2:'20,10,40',tx:'236,231,255',mu:'154,122,192',l:'185,166,255'}},
    pub:{nombre:'Pub',desc:'Madera oscura, latón y crema',muestra:['#d9a441','#aac48c','#f4ead6','#0e0a07'],decoracion:false,emoji:'🍺',emoji2:'🍻',
      fuente:{familia:"'Abril Fatface'"},
      pos:{bg:'#0e0a07',panel:'#15100a',card:'#1c150e',card2:'#241b12',border:'#3a2c1c',accent:'#d9a441',text:'#f4ead6',muted:'#8f7a5c',dim:'#33271a'},
      v:{p:'217,164,65',p2:'166,107,42',p3:'217,164,65',s:'170,196,140',s2:'170,196,140',c:'222,184,135',c2:'222,184,135',c3:'222,184,135',k:'196,84,64',k2:'196,84,64',o:'201,168,76',o2:'240,192,64',b0:'14,10,7',b1:'24,17,11',b2:'38,27,17',tx:'244,234,214',mu:'168,146,116',l:'226,205,160'}},
    discoteca:{nombre:'Discoteca',desc:'Negro con magenta, azul eléctrico y amarillo láser',muestra:['#ff2d95','#ffe600','#00d4ff','#050508'],decoracion:false,emoji:'🎶',emoji2:'💃',
      fuente:{familia:"'Unbounded'"},
      pos:{bg:'#050508',panel:'#0b0a12',card:'#12101c',card2:'#191628',border:'#2a2440',accent:'#ff2d95',text:'#f5f5ff',muted:'#6f6a90',dim:'#2a2545'},
      v:{p:'255,45,149',p2:'196,0,255',p3:'196,0,255',s:'255,230,0',s2:'255,230,0',c:'0,212,255',c2:'0,212,255',c3:'0,212,255',k:'255,90,54',k2:'255,90,54',o:'255,214,10',o2:'255,214,10',b0:'5,5,8',b1:'10,8,18',b2:'20,14,32',tx:'245,245,255',mu:'150,150,178',l:'255,170,215'}},
    sobrio:{nombre:'Sobrio',desc:'Grafito y azul acero, sin brillos',muestra:['#6e8caa','#d6ba8c','#e8eaee','#101216'],decoracion:false,brillo:false,emoji:'🍸',emoji2:'🥂',
      fuente:{familia:"'Figtree'"},
      pos:{bg:'#101216',panel:'#151920',card:'#1b2029',card2:'#232a35',border:'#323b49',accent:'#6e8caa',text:'#e8eaee',muted:'#7f8a99',dim:'#2c3440'},
      v:{p:'110,140,170',p2:'80,105,135',p3:'110,140,170',s:'214,186,140',s2:'214,186,140',c:'150,170,190',c2:'150,170,190',c3:'150,170,190',k:'176,120,110',k2:'176,120,110',o:'190,165,110',o2:'214,186,140',b0:'16,18,22',b1:'22,25,31',b2:'32,36,44',tx:'232,234,238',mu:'140,148,160',l:'190,200,212'}},
    elegante:{nombre:'Elegante',desc:'Negro con dorado champaña y vino',muestra:['#c8a96a','#7a2e3a','#f0ece4','#0c0c0e'],decoracion:false,brillo:false,emoji:'🍷',emoji2:'🥂',
      fuente:{familia:"'Playfair Display'"},
      pos:{bg:'#0c0c0e',panel:'#121214',card:'#19191c',card2:'#212125',border:'#34323a',accent:'#c8a96a',text:'#f0ece4',muted:'#8a857c',dim:'#2d2b31'},
      v:{p:'200,169,106',p2:'150,120,70',p3:'200,169,106',s:'232,220,196',s2:'232,220,196',c:'200,169,106',c2:'200,169,106',c3:'200,169,106',k:'140,58,70',k2:'140,58,70',o:'200,169,106',o2:'214,190,130',b0:'12,12,14',b1:'19,19,22',b2:'30,29,33',tx:'240,236,228',mu:'150,144,134',l:'222,208,180'}},
    claro:{nombre:'Claro',desc:'Blanco con azul, para locales de día y cafeterías',muestra:['#2563eb','#15181f','#eef1f5','#ffffff'],decoracion:false,brillo:false,claro:true,emoji:'☕',emoji2:'🥐',
      fuente:{familia:"'Figtree'"},
      pos:{bg:'#f3f4f7',panel:'#ffffff',card:'#ffffff',card2:'#e9edf3',border:'#cfd5de',accent:'#2563eb',text:'#15181f',muted:'#5b6472',dim:'#dde2e9'},
      v:{p:'37,99,235',p2:'29,78,216',p3:'37,99,235',s:'22,163,74',s2:'22,163,74',c:'14,116,144',c2:'14,116,144',c3:'14,116,144',k:'190,24,93',k2:'190,24,93',o:'180,120,20',o2:'202,138,4',b0:'243,244,247',b1:'255,255,255',b2:'233,237,243',tx:'21,24,31',mu:'91,100,114',l:'29,78,216'}},
    negro:{nombre:'Negro',desc:'Negro total con blanco, sin colores',muestra:['#ffffff','#9a9a9a','#1a1a1a','#000000'],decoracion:false,brillo:false,emoji:'🖤',emoji2:'🤍',
      fuente:{familia:"'Figtree'"},
      pos:{bg:'#000000',panel:'#0a0a0a',card:'#121212',card2:'#1c1c1c',border:'#2e2e2e',accent:'#ffffff',text:'#f2f2f2',muted:'#8c8c8c',dim:'#262626'},
      v:{p:'255,255,255',p2:'200,200,200',p3:'255,255,255',s:'220,220,220',s2:'220,220,220',c:'190,190,190',c2:'190,190,190',c3:'190,190,190',k:'255,255,255',k2:'200,200,200',o:'230,230,230',o2:'255,255,255',b0:'0,0,0',b1:'10,10,10',b2:'20,20,20',tx:'242,242,242',mu:'140,140,140',l:'220,220,220'}},
    cerveceria:{nombre:'Cervecería',desc:'Verde botella y ámbar, como una taberna artesanal',muestra:['#e0a526','#2f7d4f','#f1e9d2','#0b1510'],decoracion:false,brillo:false,emoji:'🍻',emoji2:'🥨',
      fuente:{familia:"'Abril Fatface'"},
      pos:{bg:'#0b1510',panel:'#101d16',card:'#15261d',card2:'#1c3126',border:'#2b4a39',accent:'#e0a526',text:'#f1e9d2',muted:'#8fa394',dim:'#24392d'},
      v:{p:'224,165,38',p2:'184,130,20',p3:'224,165,38',s:'122,184,120',s2:'122,184,120',c:'150,200,170',c2:'150,200,170',c3:'150,200,170',k:'200,90,60',k2:'200,90,60',o:'224,165,38',o2:'240,190,70',b0:'11,21,16',b1:'16,29,22',b2:'28,49,38',tx:'241,233,210',mu:'143,163,148',l:'235,205,140'}},
    cantina:{nombre:'Cantina',desc:'Rojo vino y naranja sobre negro cálido',muestra:['#e8502a','#b4232e','#ffe3c8','#120807'],decoracion:false,brillo:false,emoji:'🌶️',emoji2:'🎸',
      fuente:{familia:"'Unbounded'"},
      pos:{bg:'#120807',panel:'#1a0c0a',card:'#22100d',card2:'#2d1612',border:'#4a2620',accent:'#e8502a',text:'#ffe3c8',muted:'#a8827a',dim:'#3a1e19'},
      v:{p:'232,80,42',p2:'180,35,46',p3:'232,80,42',s:'255,190,60',s2:'255,190,60',c:'255,150,100',c2:'255,150,100',c3:'255,150,100',k:'180,35,46',k2:'180,35,46',o:'255,170,60',o2:'255,200,90',b0:'18,8,7',b1:'26,12,10',b2:'45,22,18',tx:'255,227,200',mu:'168,130,122',l:'255,190,160'}}
  };
  // Juego de iconos de la interfaz (pestañas del POS, navegación y tarjetas de los clientes): cada tema trae el suyo
  var ICONOS_BASE={mesas:'🛸',inventario:'📦',carta:'📋',combos:'🎁',caja:'💰',gastos:'📋',ventas:'📊',rappi:'🛵',socios:'🤝',empleados:'👷',creditos:'📒',saneamiento:'🧼',cocina:'👨‍🍳',admin:'⚙️',
    inicio:'🏠',rocola:'🎵',llamar:'🔔',mesera:'🙋',nuestracarta:'🍽️',encuentranos:'📍',video:'🎬'};
  var ICONOS_TEMA={
    espacial:{mesas:'🛸',carta:'📋',rocola:'🎵',llamar:'🔔',inicio:'🏠',caja:'💰',ventas:'📊',admin:'⚙️',mesera:'👽',nuestracarta:'🍽️',video:'🎬'},
    pub:{mesas:'🍺',carta:'📜',rocola:'🎻',llamar:'🛎️',inicio:'🏡',caja:'🪙',gastos:'🧾',ventas:'📈',admin:'🔧',mesera:'🧑‍🍳',nuestracarta:'🍖',encuentranos:'🗺️',video:'📽️'},
    discoteca:{mesas:'🪩',carta:'🍸',rocola:'🎧',llamar:'📣',inicio:'✨',caja:'💳',gastos:'🧾',ventas:'📈',admin:'🎛️',mesera:'💃',nuestracarta:'🍹',encuentranos:'📍',video:'🎥'},
    sobrio:{mesas:'▦',carta:'☰',rocola:'♪',llamar:'◎',inicio:'⌂',caja:'◇',gastos:'▭',ventas:'▲',admin:'⚙',mesera:'◉',nuestracarta:'☰',encuentranos:'➤',video:'▶'},
    elegante:{mesas:'🍷',carta:'📖',rocola:'🎼',llamar:'🕯️',inicio:'🏛️',caja:'💎',gastos:'🧾',ventas:'📈',admin:'🗝️',mesera:'🥂',nuestracarta:'🍽️',encuentranos:'📍',video:'🎞️'},
    claro:{mesas:'☕',carta:'📋',rocola:'🎶',llamar:'🔔',inicio:'🏠',caja:'💵',gastos:'🧾',ventas:'📈',admin:'⚙️',mesera:'🥐',nuestracarta:'🥗',encuentranos:'📍',video:'🎬'},
    negro:{mesas:'■',carta:'≡',rocola:'♫',llamar:'◆',inicio:'⌂',caja:'●',gastos:'▬',ventas:'▲',admin:'⚙',mesera:'◉',nuestracarta:'≡',encuentranos:'➤',video:'▶'},
    cerveceria:{mesas:'🍻',carta:'🥨',rocola:'🪕',llamar:'🛎️',inicio:'🏠',caja:'🪙',gastos:'🧾',ventas:'📈',admin:'🔧',mesera:'🧑‍🍳',nuestracarta:'🍺',encuentranos:'🗺️',video:'🎬'},
    cantina:{mesas:'🌶️',carta:'🌮',rocola:'🎸',llamar:'🔔',inicio:'🏠',caja:'💰',gastos:'🧾',ventas:'📈',admin:'⚙️',mesera:'🎺',nuestracarta:'🌮',encuentranos:'📍',video:'🎬'}
  };
  window.MarcaIcono=function(k){var j=ICONOS_TEMA[temaActual]||{};return j[k]||ICONOS_BASE[k]||'';};
  // Iconos: los del tema, salvo que el negocio fije los suyos (emojiFijo en negocio.js)
  function emojiDe(i){var T=TEMAS[temaActual]||{},marca=i?(EM2||EM0):EM0;if(N.emojiFijo&&marca)return marca;return(i?T.emoji2:T.emoji)||marca||'🍽️';}
  try{Object.defineProperty(N,'emoji',{get:function(){return emojiDe(0);},configurable:true});Object.defineProperty(N,'emoji2',{get:function(){return emojiDe(1);},configurable:true});}catch(e){}
  var POSV=['bg','panel','card','card2','border','accent','text','muted','dim'],temaActual=null,estiloTema=null;
  window.MarcaTemaActual=function(){return temaActual;};
  window.MarcaTema=function(id,recordar){
    if(!TEMAS[id])id='espacial';
    var T=TEMAS[id],r=document.documentElement,c=N.colores||{};
    temaActual=id;r.setAttribute('data-tema',id);
    Object.keys(T.v).forEach(function(k){r.style.setProperty('--t-'+k+'-rgb',T.v[k]);r.style.setProperty('--t-'+k,'rgb('+T.v[k]+')');});
    if(r.getAttribute('data-app')==='pos')POSV.forEach(function(k){if(T.pos&&T.pos[k])r.style.setProperty('--'+k,T.pos[k]);else r.style.removeProperty('--'+k);});
    Object.keys(c).forEach(function(k){if(c[k])r.style.setProperty('--'+k,c[k]);});   // los colores propios del negocio mandan sobre el tema
    r.classList.toggle('sin-decoracion',T.decoracion===false||N.decoracion===false);
    r.classList.toggle('sin-brillo',T.brillo===false);
    r.classList.toggle('tema-claro',T.claro===true);
    r.style.setProperty('--m-emoji',JSON.stringify(N.emoji));r.style.setProperty('--m-emoji2',JSON.stringify(N.emoji2));
    if(!estiloTema){estiloTema=document.createElement('style');(document.head||r).appendChild(estiloTema);}
    var css='.sin-decoracion .ovni,.sin-decoracion .wrap::after,.sin-decoracion .footer::before{display:none!important}'
      +'.sin-brillo *{text-shadow:none!important}.sin-brillo .logo-wrap,.sin-brillo .logo{animation:none!important;box-shadow:0 0 0 2px rgba(var(--t-p-rgb),.7)!important}'
      // Negro: el acento es blanco, así que lo que va escrito encima se pone en negro
      +'html[data-tema="negro"] [style*="background:var(--accent)"],html[data-tema="negro"] .btn-accent,html[data-tema="negro"] .tab.active{color:#000!important}';
    if(T.fuente){
      r.style.setProperty('--t-fd',T.fuente.familia);
      css+='.name,.cover-title,.wrap>h1,.top>h1{font-family:'+T.fuente.familia+',Georgia,serif!important;letter-spacing:.02em!important}';
      if(!document.getElementById('tema-fuentes')&&!document.querySelector('link[href*="fuentes.css"]')){var l=document.createElement('link');l.id='tema-fuentes';l.rel='stylesheet';l.href='fuentes.css';(document.head||r).appendChild(l);}
    }else r.style.removeProperty('--t-fd');
    estiloTema.textContent=css;
    if(document.body){try{window.MarcaAplicar(document);}catch(e){}}   // los iconos del tema, en lo que ya está pintado
    try{window.dispatchEvent(new CustomEvent('marca-tema',{detail:{tema:id}}));}catch(e){}
    if(recordar){try{localStorage.setItem(LSK('tema'),id);}catch(e){}}
    if(typeof window.alCambiarTema==='function'){try{window.alCambiarTema(id);}catch(e){}}
  };
  // Se aplica de una vez (antes de pintar la página): primero el último tema visto en este equipo, si no el de negocio.js
  (function(){
    var r=document.documentElement,porDefecto=TEMAS[N.tema]?N.tema:'espacial',visto=null;
    try{visto=localStorage.getItem(LSK('tema'));}catch(e){}
    window.MarcaTema(TEMAS[visto]?visto:porDefecto,false);
    // …y se confirma con el que el administrador dejó guardado en la base (lectura pública, sin identificar a nadie)
    try{
      if(N.firebase&&N.firebase.databaseURL&&window.fetch&&/^https:/.test(N.firebase.databaseURL))
        fetch(N.firebase.databaseURL+'/config/tema.json').then(function(x){return x.ok?x.json():undefined;}).then(function(t){
          if(t===undefined)return;
          var debe=(typeof t==='string'&&TEMAS[t])?t:porDefecto;
          if(debe!==temaActual)window.MarcaTema(debe,true);else{try{localStorage.setItem(LSK('tema'),debe);}catch(e){}}
        }).catch(function(){});
    }catch(e){}
    try{titulo();}catch(e){}
  })();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',listo);else listo();
})();

/* ═══ 🔐 EQUIPOS AUTORIZADOS ═══
   La base de datos solo atiende a los equipos que un administrador aprobó desde el POS.
   Cada equipo se identifica solo (sin correo ni contraseña); el personal sigue entrando con su PIN.
   Mientras las reglas de la base sigan abiertas, todo funciona igual que antes (transición). */
window._a52={uid:null,autorizado:false,admin:false,nombre:'',sinAuth:false};
function a52Codigo(uid){return String(uid||'').slice(-4).toUpperCase();}
function a52TipoEquipo(){var u=navigator.userAgent||'';return /Android/i.test(u)?'Android':/iPhone/i.test(u)?'iPhone':/iPad/i.test(u)?'iPad':/Windows/i.test(u)?'Computador Windows':/Mac/i.test(u)?'Mac':'Equipo';}
function a52Esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function A52Candado(db,rutaPrueba,alSeguir){
  var hecho=false,au=null,reloj=null,E=window._a52,vigia=false;
  try{au=firebase.auth();}catch(e){}
  window._a52Auth=au;window._a52Db=db;
  function seguir(){
    if(hecho)return;hecho=true;
    A52EsperaCerrar();
    try{alSeguir();}catch(e){console.warn(e);}
  }
  // Vigía: si la base deja de atender a este equipo mientras la página está abierta (cambiaron las reglas o
  // lo quitaron de la lista), aparece la pantalla de aprobación en vez de seguir trabajando sin guardar.
  function vigilar(u){
    if(vigia)return;vigia=true;
    db.ref(rutaPrueba).limitToFirst(1).on('value',function(){},function(){vigia=false;A52Espera(u);});
  }
  function probar(u){
    clearTimeout(reloj);
    E.uid=u?u.uid:null;
    // Sin respuesta en 4 s (sin internet): sigue como antes; si después la base niega el acceso, aparece la pantalla
    reloj=setTimeout(seguir,4000);
    db.ref(rutaPrueba).limitToFirst(1).once('value',function(){
      clearTimeout(reloj);
      vigilar(u);
      if(!u){seguir();return;}
      // ¿Este equipo ya está en la lista de autorizados? (si lo quitan después, vuelve a quedar por fuera)
      db.ref('equipos/'+u.uid).on('value',function(s){
        var v=s.val()||{},antes=E.autorizado;
        E.autorizado=v.ok===true;E.admin=E.autorizado&&v.admin===true;E.nombre=v.nombre||'';
        if(antes&&!E.autorizado){location.reload();return;}
        seguir();
        if(typeof window.a52AlCambiarEquipo==='function')window.a52AlCambiarEquipo();
      },function(){seguir();});
    },function(){clearTimeout(reloj);A52Espera(u);});
  }
  if(!au){probar(null);return;}
  var pidio=false;
  au.onAuthStateChanged(function(u){
    if(u){probar(u);return;}
    if(pidio){probar(null);return;}
    pidio=true;
    au.signInAnonymously().catch(function(e){E.sinAuth=(e&&e.code)||'error';probar(null);});
  });
}
function A52EsperaCerrar(){var o=document.getElementById('a52-candado');if(o)o.remove();}
// Pantalla de un equipo que la base todavía no atiende: pide el nombre, envía la solicitud y espera la aprobación
function A52Espera(u){
  if(!document.body){document.addEventListener('DOMContentLoaded',function(){A52Espera(u);});return;}
  A52EsperaCerrar();
  var db=window._a52Db,E=window._a52;
  var o=document.createElement('div');o.id='a52-candado';
  o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483000;background:#07070e;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Trebuchet MS,Arial,sans-serif';
  var caja='width:100%;max-width:340px;background:#13131f;border:1px solid #22223a;border-radius:16px;padding:22px;color:#e8e8f5;text-align:center';
  var gris='color:#8a8ab5;font-size:12px;line-height:1.5';
  document.body.appendChild(o);
  if(!u){
    var falta=E.sinAuth==='auth/operation-not-allowed'||E.sinAuth==='auth/admin-restricted-operation';
    o.innerHTML='<div style="'+caja+'"><div style="font-size:34px">📡</div><div style="font-weight:800;font-size:17px;margin:6px 0">No se pudo identificar este equipo</div>'
      +'<div style="'+gris+';margin-bottom:14px">'+(falta?'Falta habilitar el ingreso «Anónimo» en Firebase (Authentication → Sign-in method).':'Revise la conexión a internet y vuelva a intentar.')+'</div>'
      +'<button onclick="location.reload()" style="width:100%;background:#a855f7;color:#fff;border:none;border-radius:10px;padding:12px;font-size:15px;font-weight:800;cursor:pointer">Reintentar</button></div>';
    return;
  }
  var cod=a52Codigo(u.uid),enviada=false;
  function pedir(){
    if(!o.isConnected)return;
    var guardado='';try{guardado=localStorage.getItem(LSK('nombreEquipo'))||'';}catch(e){}
    o.innerHTML='<form id="a52-ef" style="'+caja+'"><div style="font-size:34px">🔐</div>'
      +'<div style="font-weight:800;font-size:17px;margin:6px 0 4px">Este equipo necesita aprobación</div>'
      +'<div style="'+gris+';margin-bottom:14px">Escriba un nombre para reconocerlo y un administrador lo aprueba desde su pantalla. Se hace una sola vez.</div>'
      +'<input id="a52-en" maxlength="40" placeholder="Ej.: Celular de Laura · Caja · Cocina" value="'+a52Esc(guardado)+'" style="width:100%;box-sizing:border-box;background:#07070e;border:1px solid #2a2a45;border-radius:10px;padding:12px;color:#e8e8f5;font-size:15px;margin-bottom:9px;outline:none;text-align:center">'
      +'<div id="a52-ee" style="min-height:18px;color:#ef4444;font-size:12px;font-weight:700;margin-bottom:8px"></div>'
      +'<button id="a52-eb" type="submit" style="width:100%;background:#a855f7;color:#fff;border:none;border-radius:10px;padding:12px;font-size:15px;font-weight:800;cursor:pointer">Pedir aprobación</button></form>';
    document.getElementById('a52-ef').onsubmit=function(ev){
      ev.preventDefault();
      var n=document.getElementById('a52-en').value.trim().slice(0,40),err=document.getElementById('a52-ee'),b=document.getElementById('a52-eb');
      if(n.length<2){err.textContent='Escriba un nombre para el equipo.';return false;}
      b.disabled=true;b.textContent='Enviando...';
      try{localStorage.setItem(LSK('nombreEquipo'),n);}catch(e){}
      db.ref('solicitudes/'+u.uid).set({nombre:n,ts:Date.now(),tipo:a52TipoEquipo()}).then(function(){enviada=true;esperando(n);},
        function(){err.textContent='No se pudo enviar. Revise el internet.';b.disabled=false;b.textContent='Pedir aprobación';});
      return false;
    };
  }
  function esperando(n){
    if(!o.isConnected)return;
    o.innerHTML='<div style="'+caja+'"><div style="font-size:34px">⏳</div>'
      +'<div style="font-weight:800;font-size:17px;margin:6px 0 4px">Esperando aprobación</div>'
      +'<div style="'+gris+'">Pídale a un administrador que apruebe este equipo desde el POS.</div>'
      +'<div style="margin:14px 0 4px;font-weight:800;font-size:15px">'+a52Esc(n)+'</div>'
      +'<div style="'+gris+'">Código de este equipo</div>'
      +'<div id="a52-cod" style="font-size:30px;font-weight:800;letter-spacing:6px;color:#f5a623;margin:2px 0 12px">'+cod+'</div>'
      +'<div style="'+gris+'">Esta pantalla se abre sola cuando lo aprueben.</div>'
      +'<button id="a52-eo" style="background:none;color:#8a8ab5;border:none;padding:10px;font-size:12px;cursor:pointer;margin-top:6px;text-decoration:underline">Cambiar el nombre</button></div>';
    document.getElementById('a52-eo').onclick=pedir;
  }
  // Entra solo en cuanto lo aprueban
  db.ref('equipos/'+u.uid).on('value',function(s){var v=s.val();if(v&&v.ok===true)location.reload();},function(){});
  db.ref('solicitudes/'+u.uid).on('value',function(s){
    var v=s.val();
    if(v&&v.nombre){enviada=true;esperando(v.nombre);}
    else if(enviada){enviada=false;pedir();var e=document.getElementById('a52-ee');if(e)e.textContent='La solicitud no fue aprobada. Puede pedirla de nuevo.';}
    else pedir();
  },function(){pedir();});
}
