/* ═══════════════ INIT ═══════════════ */
function initApp(){
  // Wire paredes panel buttons ONCE at startup
  var btnD=document.getElementById('btn-deshacer-pared');
  var btnL=document.getElementById('btn-limpiar-pared');
  if(btnD)btnD.onclick=function(){deshacerPared();};
  if(btnL)btnL.onclick=function(){borrarParedes();};
  document.querySelectorAll('.pc').forEach(function(el){
    el.onclick=function(){selColorP(el.getAttribute('data-pcolor'));};
  });
  document.querySelectorAll('.pg').forEach(function(el){
    el.onclick=function(){selGrosorP(parseInt(el.getAttribute('data-pgrosor')));};
  });
  a52AplicarAjustes(a52AjCache());   // zonas, socios, medios de pago y módulos de este negocio
  // Wait for Firebase to be ready, then load usuarios
  function cargarUsuariosYLogin(intentos){
    intentos=intentos||0;
    var r=ref('usuarios');
    if(!r){
      if(intentos<20||window._a52Pendiente){
        // Firebase not ready yet (o el equipo aún espera aprobación), retry in 300ms
        setTimeout(function(){cargarUsuariosYLogin(intentos+1);},300);
      } else {
        // Firebase never loaded - use defaults
        renderLogin();
      }
      return;
    }
    r.on('value',function(snap){
      var v=snap.val();
      if(v){
        var loaded=Array.isArray(v)?v:Object.values(v);
        loaded.sort(function(a,b){var o={admin:0,cajero:1,mesero:2};return(o[a.rol]||3)-(o[b.rol]||3);});
        if(loaded.length>0&&loaded.some(function(u){return u.rol==='admin';})){
          usuarios=loaded;
        }
      }
      if(!v){window._loginRendered=true;window._sinUsuarios=true;renderLogin();a52PrimerAdmin();return;}
      window._sinUsuarios=false;
      if(!window._loginRendered){
        window._loginRendered=true;
        renderLogin();
      } else {
        var ul=document.getElementById('user-list');
        if(ul) renderLogin();
      }
    });
    // Cargar la configuración de red ANTES del login (para poder bloquear el ingreso)
    var rn=ref('redBarCfg');
    if(rn)rn.on('value',function(snap){
      var v=snap.val();
      if(v){redBarCfg=v;if(!Array.isArray(redBarCfg.ips))redBarCfg.ips=redBarCfg.ips?Object.values(redBarCfg.ips):[];}
    });
  }
  cargarUsuariosYLogin();
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initApp);}else{initApp();}
