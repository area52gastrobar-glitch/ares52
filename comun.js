/* comun.js — lo que comparten todas las páginas del sistema.
   1) La marca: todo lo propio del negocio viene de negocio.js (window.NEGOCIO). El programa no nombra a ningún negocio.
   2) Equipos autorizados: la base solo atiende a los equipos que un administrador aprobó. */
(function(){
  var N=window.NEGOCIO=window.NEGOCIO||{};
  function def(k,v){if(N[k]==null||N[k]==='')N[k]=v;}
  def('nombre','Mi Negocio');def('nombreCorto',N.nombre);def('tipo','');def('ciudad','');def('pais','Colombia');
  def('lema','');def('direccion','');def('telefono','');def('whatsapp','');def('correo','');def('instagram','');def('tiktok','');
  def('desde','');def('emoji','🍽️');def('emoji2',N.emoji);def('logo','');def('fondos',[]);def('enlaces',[]);def('videoPromo','');
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
  // Colores y adornos del tema: se aplican de una vez (antes de pintar la página)
  (function(){
    var c=N.colores||{},r=document.documentElement;
    Object.keys(c).forEach(function(k){if(c[k])r.style.setProperty('--'+k,c[k]);});
    r.style.setProperty('--m-emoji',JSON.stringify(N.emoji));r.style.setProperty('--m-emoji2',JSON.stringify(N.emoji2));
    if(N.decoracion===false){
      r.classList.add('sin-decoracion');
      var st=document.createElement('style');st.textContent='.sin-decoracion .ovni,.sin-decoracion .nave,.sin-decoracion .wrap::after,.sin-decoracion .footer::before{display:none!important}';
      (document.head||r).appendChild(st);
    }
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
    var guardado='';try{guardado=localStorage.getItem('a52_nombreEquipo')||'';}catch(e){}
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
      try{localStorage.setItem('a52_nombreEquipo',n);}catch(e){}
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
