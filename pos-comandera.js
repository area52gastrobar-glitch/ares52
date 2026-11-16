/* ═══════════ ⚡ COMANDERA ═══════════
   Una pantalla sola para anotar: se toca la mesa, se tocan los productos y listo.
   Sin caja, sin cobros, sin menús. Cada toque suma una unidad y descuenta inventario
   al instante, igual que el pedido normal; lo que lleve tamaños, sabores o combos
   abre su ventana de siempre. */
var _cmd={abierta:false,zona:'',cat:'⭐',busca:'',top:null,auto:false,autoHecho:false,oyendo:false};
function cmdCss(){
  if(document.getElementById('cmd-css'))return;
  var s=document.createElement('style');s.id='cmd-css';
  s.textContent='#cmd{position:fixed;inset:0;z-index:900;background:var(--bg);display:flex;flex-direction:column;color:var(--text)}'
   +'#cmd-cab{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--panel);border-bottom:1px solid var(--border)}'
   +'#cmd-cab h2{flex:1;margin:0;font-size:19px;line-height:1.1}#cmd-cab small{display:block;color:var(--muted);font-size:12px;font-weight:600}'
   +'.cmd-b{border:1px solid var(--border);background:var(--card2);color:var(--text);border-radius:12px;padding:12px 14px;font-size:15px;font-weight:800;cursor:pointer}'
   +'.cmd-b.ok{background:#22c55e;border-color:#22c55e;color:#04150a}'
   +'#cmd-cuerpo{flex:1;overflow-y:auto;padding:12px;-webkit-overflow-scrolling:touch}'
   +'.cmd-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:6px}'
   +'.cmd-chip{flex:0 0 auto;border:1px solid var(--border);background:var(--card2);color:var(--text);border-radius:99px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap}'
   +'.cmd-chip.on{background:var(--accent);border-color:var(--accent);color:#fff}'
   +'.cmd-mesas{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}'
   +'.cmd-mesa{border:2px solid var(--border);background:var(--card2);color:var(--text);border-radius:16px;padding:14px 6px;min-height:92px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}'
   +'.cmd-mesa b{font-size:26px;line-height:1}.cmd-mesa span{font-size:11px;color:var(--muted);font-weight:700}'
   +'.cmd-mesa.oc{border-color:#f5a623;background:#f5a62318}.cmd-mesa.oc span{color:#f5a623}'
   +'.cmd-prods{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}'
   +'.cmd-p{position:relative;border:1px solid var(--border);background:var(--card2);color:var(--text);border-radius:14px;padding:10px 6px 8px;min-height:104px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center}'
   +'.cmd-p i{font-style:normal;font-size:28px;line-height:1}.cmd-p b{font-size:12.5px;line-height:1.15}.cmd-p span{font-size:11px;color:var(--muted)}'
   +'.cmd-p.ago{opacity:.35;cursor:not-allowed}.cmd-p.con{border-color:#22c55e;background:#22c55e14}'
   +'.cmd-p em{position:absolute;top:-7px;right:-5px;background:#22c55e;color:#04150a;border-radius:99px;min-width:26px;height:26px;font-style:normal;font-weight:900;font-size:14px;display:grid;place-items:center;padding:0 6px}'
   +'.cmd-p u{text-decoration:none;font-size:10px;font-weight:800;color:#38bdf8}'
   +'#cmd-pie{background:var(--panel);border-top:1px solid var(--border);padding:8px 12px;max-height:38vh;overflow-y:auto}'
   +'.cmd-l{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:14px}'
   +'.cmd-l span{flex:1}.cmd-l button{width:40px;height:40px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:20px;font-weight:900;cursor:pointer}'
   +'#cmd-busca{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;color:var(--text);padding:12px 14px;font-size:16px;margin-bottom:8px}'
   +'#cmd-fab{position:fixed;right:14px;bottom:16px;z-index:800;background:#22c55e;color:#04150a;border:0;border-radius:99px;padding:14px 20px;font-size:15px;font-weight:900;box-shadow:0 6px 18px #0008;cursor:pointer}';
  document.head.appendChild(s);
}
function cmdNombreMesa(m){return m.nombre||('Mesa '+m.num);}
function cmdTop(){
  // Lo que más se ha pedido en los últimos 30 días (para que quede a un toque)
  if(!_cmd.top){
    var desde=a52Ahora()-30*86400000,c={};
    ventas.forEach(function(v){if(v.ts<desde)return;(v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[]).forEach(function(it){if(!it||it.isCombo||it.isCustom||it.isCubetazoMix)return;c[it.pid]=(c[it.pid]||0)+(it.qty||1)*(it.cubeta?5:1);});});
    _cmd.top=Object.keys(c).sort(function(a,b){return c[b]-c[a];});   // solo los códigos: el producto se lee del menú vigente cada vez
  }
  return _cmd.top.map(function(id){return menu.find(function(m){return String(m.id)===String(id);});}).filter(function(p){return p&&p.activo!==false;}).slice(0,12);
}
function cmdEnMesa(pid){var mid=mesaActiva&&mesaActiva.id;return (pedidos[mid]||[]).filter(function(it){return it.pid===pid;}).reduce(function(a,it){return a+(it.qty||0)*(it.cubeta?5:1);},0);}
function cmdProdsHTML(){
  var q=_normTxt(_cmd.busca||''),lista,esCombos=_cmd.cat==='🎁'&&!q;
  if(esCombos){
    var cs=combos.filter(function(c){return c.activo!==false;});
    if(!cs.length)return '<div style="color:var(--muted);padding:20px;text-align:center">No hay combos activos.</div>';
    return '<div class="cmd-prods">'+cs.map(function(c){var ok=ventaSinStock||comboDisponible(c);
      return '<button class="cmd-p'+(ok?'':' ago')+'" '+(ok?'data-cmd-combo="'+esc(c.id)+'"':'disabled')+'><i>'+(c.emoji||'🎁')+'</i><b>'+esc(c.nombre)+'</b><span>'+fmt(c.precio||0)+'</span></button>';}).join('')+'</div>';
  }
  if(q)lista=menu.filter(function(p){return p.activo!==false&&_normTxt(p.nombre).indexOf(q)>=0;});
  else if(_cmd.cat==='⭐'){lista=cmdTop();if(!lista.length)lista=menu.filter(function(p){return p.activo!==false;}).slice(0,24);}
  else lista=menu.filter(function(p){return p.activo!==false&&p.cat===_cmd.cat;});
  if(!lista.length)return '<div style="color:var(--muted);padding:20px;text-align:center">No hay productos'+(q?' con «'+esc(_cmd.busca)+'»':' en esta categoría')+'.</div>';
  return '<div class="cmd-prods">'+lista.map(function(p){
    var hay=a52HayStock(p),n=cmdEnMesa(p.id),tv=p.variantes&&p.variantes.length;
    return '<button class="cmd-p'+(hay?'':' ago')+(n?' con':'')+'" '+(hay?'data-cmd-p="'+p.id+'"':'disabled')+'>'
      +(n?'<em>'+n+'</em>':'')+'<i>'+(p.emoji||'📦')+'</i><b>'+esc(p.nombre)+'</b>'
      +'<span>'+(hay?(tv?'elige tamaño':fmt(p.precio||0)):'agotado')+'</span>'
      +(hay&&p.cubeta>0&&!tv&&(ventaSinStock||(parseInt(p.stock)||0)>=5)?'<u data-cmd-cub="'+p.id+'">🪣 cubetazo '+fmt(p.cubeta)+'</u>':'')
    +'</button>';
  }).join('')+'</div>';
}
function cmdPieHTML(){
  var ped=pedidos[mesaActiva.id]||[];
  if(!ped.length)return '<div style="color:var(--muted);font-size:13px;text-align:center;padding:6px">Toca un producto para anotarlo en la mesa.</div>';
  return ped.map(function(it,i){
    var fijo=it.isCombo||it.isCubetazoMix||it.isCustom||it.recGrupos||it.es2x1Gratis;
    return '<div class="cmd-l"><b style="min-width:30px;text-align:right">'+it.qty+'×</b><span>'+nombreItemPed(it)+'</span>'
      +'<button data-cmd-menos="'+i+'" aria-label="Quitar uno">−</button>'+(fijo?'':'<button data-cmd-mas="'+i+'" aria-label="Agregar uno">+</button>')+'</div>';
  }).join('');
}
function cmdPintar(){
  var el=document.getElementById('cmd');if(!el||!_cmd.abierta)return;
  if(mesaActiva&&!mesas.some(function(m){return m.id===mesaActiva.id;}))mesaActiva=null;
  if(!mesaActiva){
    var zs=ZONAS.filter(function(z){return mesas.some(function(m){return m.zona===z.id;});});
    if(_cmd.zona&&!zs.some(function(z){return z.id===_cmd.zona;}))_cmd.zona='';
    var ms=mesas.filter(function(m){return !_cmd.zona||m.zona===_cmd.zona;}).slice().sort(function(a,b){return (a.zona||'').localeCompare(b.zona||'')||(parseInt(a.num)||0)-(parseInt(b.num)||0);});
    el.innerHTML='<div id="cmd-cab"><h2>⚡ Comandera<small>'+esc(usuarioActivo.nombre||'')+' · toca la mesa</small></h2>'
        +(usuarioActivo.rol==='admin'?'<button class="cmd-b" data-cmd-auto style="font-size:12px;padding:8px 10px">'+(_cmd.auto?'✅':'⬜')+' Meseros entran aquí</button>':'')
        +'<button class="cmd-b" data-cmd-salir>Salir</button></div>'
      +'<div id="cmd-cuerpo">'
        +(zs.length>1?'<div class="cmd-chips"><button class="cmd-chip'+(_cmd.zona?'':' on')+'" data-cmd-zona="">Todas</button>'+zs.map(function(z){return '<button class="cmd-chip'+(_cmd.zona===z.id?' on':'')+'" data-cmd-zona="'+esc(z.id)+'">'+(z.emoji||'')+' '+esc(z.label)+'</button>';}).join('')+'</div>':'')
        +'<div class="cmd-mesas">'+ms.map(function(m){
            var n=(pedidos[m.id]||[]).reduce(function(a,it){return a+(it.qty||0);},0),z=ZONAS.find(function(x){return x.id===m.zona;});
            return '<button class="cmd-mesa'+(n?' oc':'')+'" data-cmd-mesa="'+esc(m.id)+'"><b>'+esc(m.nombre||m.num)+'</b><span>'+(n?n+' ítem'+(n!==1?'s':''):'libre')+'</span>'+(!_cmd.zona&&z&&zs.length>1?'<span style="color:var(--muted);font-weight:600">'+esc(z.label)+'</span>':'')+'</button>';
          }).join('')+'</div>'
        +(ms.length?'':'<div style="color:var(--muted);text-align:center;padding:24px">No hay mesas creadas en esta zona.</div>')
      +'</div>';
    return;
  }
  var cats=[];menu.forEach(function(p){if(p.activo!==false&&p.cat&&cats.indexOf(p.cat)<0)cats.push(p.cat);});
  var z2=ZONAS.find(function(x){return x.id===mesaActiva.zona;}),nIt=(pedidos[mesaActiva.id]||[]).reduce(function(a,it){return a+(it.qty||0);},0);
  var foco=document.activeElement&&document.activeElement.id==='cmd-busca';
  el.innerHTML='<div id="cmd-cab"><button class="cmd-b" data-cmd-volver>← Mesas</button>'
      +'<h2>'+esc(cmdNombreMesa(mesaActiva))+'<small>'+(z2?esc(z2.label)+' · ':'')+nIt+' ítem'+(nIt!==1?'s':'')+(usuarioActivo.rol==='mesero'?'':' · '+fmt(totalPedido(mesaActiva.id)))+'</small></h2>'
      +'<button class="cmd-b ok" data-cmd-volver>✓ Listo</button></div>'
    +'<div id="cmd-cuerpo">'
      +'<input id="cmd-busca" type="search" placeholder="Buscar producto…" value="'+esc(_cmd.busca)+'" autocomplete="off">'
      +'<div class="cmd-chips"><button class="cmd-chip'+(_cmd.cat==='⭐'?' on':'')+'" data-cmd-cat="⭐">⭐ Lo más pedido</button>'
        +cats.map(function(c){return '<button class="cmd-chip'+(_cmd.cat===c?' on':'')+'" data-cmd-cat="'+esc(c)+'">'+esc(c)+'</button>';}).join('')
        +(combos.some(function(c){return c.activo!==false;})?'<button class="cmd-chip'+(_cmd.cat==='🎁'?' on':'')+'" data-cmd-cat="🎁">🎁 Combos</button>':'')+'</div>'
      +'<div id="cmd-grid">'+cmdProdsHTML()+'</div>'
    +'</div><div id="cmd-pie">'+cmdPieHTML()+'</div>';
  if(foco){var b=document.getElementById('cmd-busca');if(b){b.focus();try{b.setSelectionRange(b.value.length,b.value.length);}catch(e){}}}
}
function cmdAbrir(){
  if(!usuarioActivo)return;
  cmdCss();_cmd.abierta=true;_cmd.top=null;_cmd.busca='';_cmd.cat='⭐';mesaActiva=null;
  if(!document.getElementById('cmd')){var d=document.createElement('div');d.id='cmd';document.body.appendChild(d);}
  document.getElementById('cmd').style.display='flex';cmdPintar();cmdFab();
}
function cmdCerrar(){_cmd.abierta=false;mesaActiva=null;var el=document.getElementById('cmd');if(el)el.style.display='none';render();}
function cmdFab(){
  var f=document.getElementById('cmd-fab'),ver=!!usuarioActivo&&!_cmd.abierta;
  if(ver&&!f){cmdCss();f=document.createElement('button');f.id='cmd-fab';f.type='button';f.textContent='⚡ Comandera';f.onclick=cmdAbrir;document.body.appendChild(f);}
  if(f)f.style.display=ver?'block':'none';
}
document.addEventListener('click',function(e){
  if(!_cmd.abierta||!e.target.closest)return;
  var t=e.target.closest('#cmd [data-cmd-salir],#cmd [data-cmd-volver],#cmd [data-cmd-auto],#cmd [data-cmd-zona],#cmd [data-cmd-mesa],#cmd [data-cmd-cat],#cmd [data-cmd-cub],#cmd [data-cmd-p],#cmd [data-cmd-combo],#cmd [data-cmd-menos],#cmd [data-cmd-mas]');
  if(!t)return;var d=t.dataset;
  if('cmdSalir' in d){cmdCerrar();return;}
  if('cmdVolver' in d){mesaActiva=null;_cmd.busca='';cmdPintar();return;}
  if('cmdAuto' in d){var r=ref('configBar/comanderaAuto');_cmd.auto=!_cmd.auto;if(r)r.set(_cmd.auto);cmdPintar();return;}
  if('cmdZona' in d){_cmd.zona=d.cmdZona;cmdPintar();return;}
  if('cmdMesa' in d){mesaActiva=mesas.find(function(m){return String(m.id)===d.cmdMesa;})||null;_cmd.cat='⭐';_cmd.busca='';cmdPintar();return;}
  if('cmdCat' in d){_cmd.cat=d.cmdCat;_cmd.busca='';cmdPintar();return;}
  if(!mesaActiva)return;
  if('cmdCub' in d){e.stopPropagation();agregarItemQty(Number(d.cmdCub),true,1);cmdPintar();return;}
  if('cmdP' in d){
    var p=menu.find(function(m){return String(m.id)===d.cmdP;});if(!p)return;
    if(p.variantes&&p.variantes.length)abrirSelectorVariante(p.id);else agregarItemQty(p.id,false,1);
    cmdPintar();return;
  }
  if('cmdCombo' in d){var cb=combos.find(function(c){return String(c.id)===d.cmdCombo;});if(cb)agregarComboAPedido(cb.id);cmdPintar();return;}
  var ped=pedidos[mesaActiva.id]||[];
  if('cmdMenos' in d){var a=ped[Number(d.cmdMenos)];if(a)_aplicarNuevaCantidad(Number(d.cmdMenos),a.qty-1);cmdPintar();return;}
  if('cmdMas' in d){var b=ped[Number(d.cmdMas)];if(b)_aplicarNuevaCantidad(Number(d.cmdMas),b.qty+1);cmdPintar();return;}
},true);
document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='cmd-busca'){_cmd.busca=e.target.value;var g=document.getElementById('cmd-grid');if(g)g.innerHTML=cmdProdsHTML();}
});
/* La comandera se repinta sola cuando otro equipo cambia un pedido o el inventario */
(function(){
  var r0=render;
  render=function(){
    r0.apply(this,arguments);
    if(usuarioActivo&&!_cmd.oyendo){var r=ref('configBar/comanderaAuto');if(r){_cmd.oyendo=true;r.on('value',function(s){_cmd.auto=!!s.val();
      if(_cmd.auto&&!_cmd.autoHecho&&usuarioActivo&&usuarioActivo.rol==='mesero'){_cmd.autoHecho=true;cmdAbrir();}else if(_cmd.abierta)cmdPintar();});}}
    if(!usuarioActivo){_cmd.oyendo=false;_cmd.autoHecho=false;if(_cmd.abierta){_cmd.abierta=false;var el=document.getElementById('cmd');if(el)el.style.display='none';}}
    if(usuarioActivo&&usuarioActivo.rol==='mesero'&&_cmd.auto&&!_cmd.autoHecho){_cmd.autoHecho=true;cmdAbrir();return;}
    cmdFab();if(_cmd.abierta)cmdPintar();
  };
  var c0=cerrarSesion;
  cerrarSesion=function(){_cmd.abierta=false;_cmd.autoHecho=false;var el=document.getElementById('cmd');if(el)el.style.display='none';var f=document.getElementById('cmd-fab');if(f)f.style.display='none';return c0.apply(this,arguments);};
  var s0=renderSoloPedido;
  renderSoloPedido=function(){s0.apply(this,arguments);if(_cmd.abierta)cmdPintar();};
})();
