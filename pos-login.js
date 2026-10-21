/* ═══════════════ LOGIN ═══════════════ */
var pinBuffer='';
var usuarioSelLogin=null;
function renderLogin(){
  var ul=document.getElementById('user-list');
  if(!ul)return;
  ul.innerHTML=usuarios.filter(function(u){
    // Mostrar siempre el admin; los demás solo si están activos (de turno)
    return u.rol==='admin' || u.activo!==false;
  }).map(function(u){
    var roleInfo=ROLES[u.rol]||{};
    return '<div class="user-card" onclick="selUsuario(\''+u.id+'\')">'
      +'<span style="font-size:24px">'+u.emoji+'</span>'
      +'<div><div style="font-weight:700;font-size:14px">'+esc(u.nombre)+'</div>'
      +'<div style="font-size:11px;color:'+(roleInfo.color||'#fff')+'">'+esc(roleInfo.label||u.rol)+'</div></div>'
      +'</div>';
  }).join('')
  +'<div style="text-align:center;color:var(--dim);font-size:11px;margin-top:10px">Solo aparecen los usuarios de turno. El administrador activa los turnos.</div>';
}
function selUsuario(id){
  usuarioSelLogin=usuarios.find(function(u){return u.id===id;});
  if(!usuarioSelLogin)return;
  if(usuarioSelLogin.rol!=='admin' && usuarioSelLogin.activo===false){alert('Este usuario está fuera de turno. Pide al administrador que lo active.');usuarioSelLogin=null;return;}
  document.getElementById('login-step-user').style.display='none';
  document.getElementById('login-step-pin').style.display='block';
  document.getElementById('pin-username').textContent=usuarioSelLogin.emoji+' '+usuarioSelLogin.nombre;
  pinBuffer='';renderPinDots();renderPinKeypad();
}
function backToUsers(){
  usuarioSelLogin=null;pinBuffer='';
  document.getElementById('login-step-user').style.display='block';
  document.getElementById('login-step-pin').style.display='none';
  document.getElementById('pin-err').textContent='';
}
function renderPinDots(){
  var c=document.getElementById('pin-dots');
  if(!c)return;
  c.innerHTML=Array.from({length:4},function(_,i){
    return '<div class="pin-dot'+(i<pinBuffer.length?' filled':'')+'"></div>';
  }).join('');
}
function renderPinKeypad(){
  var kp=document.getElementById('pin-keypad');
  if(!kp)return;
  var keys=['1','2','3','4','5','6','7','8','9','','0','DEL'];
  kp.innerHTML=keys.map(function(k){
    if(k==='')return '<div></div>';
    return '<button class="pin-btn" onclick="pinKey(\''+k+'\')">'+(k==='DEL'?'&#9003;':k)+'</button>';
  }).join('');
}
document.addEventListener('keydown',function(ev){
  var paso=document.getElementById('login-step-pin'),pantalla=document.getElementById('login-screen');
  if(!paso||paso.style.display!=='block'||!pantalla||pantalla.style.display==='none')return;
  if(document.getElementById('a52-candado')||ev.ctrlKey||ev.metaKey||ev.altKey)return;
  var num=/^Numpad[0-9]$/.test(ev.code||'')?ev.code.slice(-1):(/^[0-9]$/.test(ev.key)?ev.key:null);   // el teclado numérico sirve con o sin Bloq Num
  if(num!==null){ev.preventDefault();pinKey(num);}
  else if(ev.key==='Backspace'||(ev.key==='Delete'&&ev.code!=='NumpadDecimal')){ev.preventDefault();pinKey('DEL');}
  else if(ev.key==='Escape'){ev.preventDefault();backToUsers();}
});
function pinKey(k){
  if(k==='DEL'){pinBuffer=pinBuffer.slice(0,-1);renderPinDots();return;}
  if(pinBuffer.length>=4)return;
  pinBuffer+=k;renderPinDots();
  if(pinBuffer.length===4)setTimeout(verificarPin,120);
}
function verificarPin(){
  if(!usuarioSelLogin){backToUsers();return;}
  var _esp=a52BloqueoSeg();
  if(_esp>0){pinBuffer='';renderPinDots();var _e=document.getElementById('pin-err');if(_e){_e.textContent='⏳ Demasiados intentos. Espere '+_esp+' s.';setTimeout(function(){_e.textContent='';},2500);}return;}
  var _pinEscrito=pinBuffer;
  a52PinCoincide(usuarioSelLogin,_pinEscrito).catch(function(){return false;}).then(function(_ok){verificarPin2(_ok);});
}
function verificarPin2(_ok){
  if(!usuarioSelLogin){backToUsers();return;}
  if(_ok){a52PinOk();
    // ── BLOQUEO POR RED: meseros y cajeros solo desde la red del bar ──
    if(redBarCfg.on&&rolRestringidoRed(usuarioSelLogin.rol)){
      var errEl=document.getElementById('pin-err');
      if(errEl){errEl.style.color='#38bdf8';errEl.textContent='📶 Verificando red del bar...';}
      obtenerIPPublica(function(ip){
        if(errEl)errEl.style.color='';
        if(ip&&ipAutorizada(ip)){
          completarLogin();
        } else {
          registrarSesion('red_bloqueada',usuarioSelLogin);
          pinBuffer='';renderPinDots();
          if(errEl){
            errEl.style.color='#ef4444';
            errEl.textContent=ip?'🚫 Solo puedes ingresar conectado al WiFi del bar.':'🚫 No pude verificar la red. Conéctate al WiFi del bar e intenta de nuevo.';
            setTimeout(function(){errEl.textContent='';errEl.style.color='';},4500);
          }
        }
      });
      return;
    }
    completarLogin();
  } else {
    registrarSesion('pin_fallido',usuarioSelLogin);
    var _seg=a52PinFallo();
    document.getElementById('pin-err').textContent=_seg>0?'⏳ Demasiados intentos. Espere '+_seg+' s.':'PIN incorrecto';
    pinBuffer='';renderPinDots();
    setTimeout(function(){document.getElementById('pin-err').textContent='';},2000);
  }
}
// Registro de inicios de sesión (quién entra, sale, falla el PIN o es bloqueado por red)
function registrarSesion(tipo,u){
  if(!u)return;
  fbPush('sesiones',{ts:a52Ahora(),tipo:tipo,uid:u.id||'',nombre:u.nombre||'',rol:u.rol||''});
}
function abrirSesiones(){
  var d=getDb();
  if(!d){alert('Se necesita conexión a Firebase para ver los inicios de sesión.');return;}
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:8px">👥 Inicios de sesión</div><div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Cargando...</div>');
  d.ref('sesiones').limitToLast(300).once('value',function(snap){
    var v=snap.val();
    window._sesCache=v?Object.values(v).sort(function(a,b){return b.ts-a.ts;}):[];
    window._sesFiltro='';
    renderSesionesModal();
  });
}
function renderSesionesModal(){
  var f=(window._sesFiltro||'').toLowerCase();
  var TIPOS={login:{e:'✅',l:'Entró',c:'#22c55e'},logout:{e:'🚪',l:'Salió',c:'var(--muted)'},pin_fallido:{e:'⚠️',l:'PIN incorrecto',c:'#f5a623'},red_bloqueada:{e:'🚫',l:'Bloqueado por red',c:'#ef4444'}};
  var lista=(window._sesCache||[]).filter(function(e){
    if(!f)return true;
    return (e.nombre||'').toLowerCase().indexOf(f)>=0||(e.rol||'').toLowerCase().indexOf(f)>=0;
  }).slice(0,250);
  var rows=lista.length?lista.map(function(e){
    var t=TIPOS[e.tipo]||{e:'•',l:e.tipo,c:'var(--muted)'};
    return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1"><span style="font-weight:700">'+t.e+' '+esc(e.nombre||'?')+'</span> <span style="color:var(--muted);font-size:10px">· '+esc((ROLES[e.rol]||{}).label||e.rol||'')+'</span>'
        +'<div style="color:var(--muted);font-size:10px;margin-top:1px">🕐 '+fmtFechaCorta(e.ts)+'</div></div>'
      +'<span style="color:'+t.c+';font-weight:800;font-size:11px;white-space:nowrap">'+t.l+'</span>'
    +'</div>';
  }).join(''):'<div style="color:var(--muted);text-align:center;padding:18px;font-size:13px">Sin registros'+(f?' que coincidan':'')+'.</div>';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:2px">👥 Inicios de sesión</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Últimos '+(window._sesCache||[]).length+' eventos: entradas, salidas, PIN fallidos y bloqueos por red</div>'
    +'<input class="inp" id="ses-busq" placeholder="🔍 Filtrar por nombre o rol..." value="'+esc(window._sesFiltro||'')+'" oninput="window._sesFiltro=this.value;_debounceBusq(function(){renderSesionesModal();_refocusBusq(\'ses-busq\');})" style="margin-bottom:10px"/>'
    +'<div style="max-height:56vh;overflow-y:auto">'+rows+'</div>');
}

