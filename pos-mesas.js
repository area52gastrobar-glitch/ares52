/* ═══════════════ MESAS ═══════════════ */
function colorMesa(id){
  if(mesaActiva&&mesaActiva.id===id)return'#38bdf8';
  return(pedidos[id]&&pedidos[id].length>0)?'#f5a623':'#22c55e';
}
function menuFormas(){
  if(!modoEdicion){alert('Activa "✏️ Editar plano" primero para agregar y mover formas.');return;}
  modal1('<div style="color:var(--accent);font-weight:900;font-size:16px;margin-bottom:14px">🔷 Agregar forma</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:12px">Se agregan al plano y las arrastras a su lugar. Toca la ✕ de cada forma para borrarla.</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    +'<button class="btn btn-outline" onclick="agregarForma(\'rectangulo\')">▭ Rectángulo</button>'
    +'<button class="btn btn-outline" onclick="agregarForma(\'cuadrado\')">◻ Cuadrado</button>'
    +'<button class="btn btn-outline" onclick="agregarForma(\'circulo\')">⬭ Círculo</button>'
    +'<button class="btn btn-outline" onclick="agregarFormaTexto()">🔤 Texto</button>'
    +'</div>'
    +'<button class="btn btn-outline btn-full" style="margin-top:10px" onclick="closeModal1()">Cerrar</button>');
}

function agregarForma(tipo){
  var k=zonaKey(zonaActual);
  if(!formasData[k])formasData[k]=[];
  var nueva={tipo:(tipo==='cuadrado'?'cuadrado':tipo),x:40,y:40,
    w:tipo==='circulo'?90:(tipo==='cuadrado'?80:140),
    h:tipo==='circulo'?90:(tipo==='cuadrado'?80:70),
    color:'#38bdf8',relleno:'transparent',grosor:2,r:'8px'};
  formasData[k].push(nueva);
  guardarFormas(k);closeModal1();render();
}

function agregarFormaTexto(){
  var txt=prompt('Texto a mostrar (ej: BARRA, BAÑOS, COCINA, DJ):');
  if(!txt)return;
  var k=zonaKey(zonaActual);
  if(!formasData[k])formasData[k]=[];
  formasData[k].push({tipo:'texto',texto:txt,x:50,y:50,w:140,h:36,color:'#f5d676',fontSize:18});
  guardarFormas(k);closeModal1();render();
}

function guardarFormas(k){
  var rp=ref('formas/'+k);
  if(rp)rp.set(formasData[k]); else fbSet('formas',formasData);
}

function cambiarFuenteForma(idx,delta){
  var k=zonaKey(zonaActual);
  var fo=formasData[k]&&formasData[k][idx];
  if(fo){
    fo.fontSize=Math.max(8,(fo.fontSize||16)+delta*2);
    guardarFormas(k);render();
  }
}

function borrarForma(idx){
  var k=zonaKey(zonaActual);
  if(formasData[k]&&formasData[k][idx]!==undefined){
    formasData[k].splice(idx,1);
    guardarFormas(k);render();
  }
}

function dimMesa(forma,ori,sz){
  var s=sz||mesaSize;
  if(forma==='redonda')return{w:s,h:s,r:'50%'};
  if(forma==='cuadrada')return{w:s,h:s,r:'10px'};
  return ori==='vertical'?{w:Math.round(s*0.82),h:Math.round(s*1.27),r:'10px'}:{w:Math.round(s*1.34),h:Math.round(s*0.82),r:'10px'};
}
function _mesaSinPedirMin(mid){
  // Minutos desde el último producto agregado a la mesa (solo mesas con pedido abierto)
  if(!pedidos[mid]||!pedidos[mid].length)return null;
  var logs=pedidoLog[mid]||[];
  var ult=0;
  logs.forEach(function(l){if(l.ts>ult)ult=l.ts;});
  if(!ult)return null;
  return Math.floor((a52Ahora()-ult)/60000);
}
function _nivelAlertaMesa(min){
  if(min==null)return null;
  if(min>=120)return{c:'#ef4444',emoji:'🚨',txt:'+2 h sin pedir',pulso:true,nivel:3};
  if(min>=60)return{c:'#ef4444',emoji:'🔴',txt:Math.floor(min/60)+' h '+(min%60)+' m sin pedir',pulso:true,nivel:2};
  if(min>=30)return{c:'#f5a623',emoji:'⏰',txt:min+' min sin pedir',pulso:false,nivel:1};
  return null;
}
if(!window._alertaMesaTimer){window._alertaMesaTimer=setInterval(function(){if(typeof tabActual!=='undefined'&&tabActual==='mesas'&&!document.hidden)render();},60000);}
function renderMesas(){
  var zona=ZONAS.find(function(z){return z.id===zonaActual;});
  var ms=mesas.filter(function(m){return m.zona===zonaActual;});
  var puedeEditar=usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='cajero');

  var _alertasMesas=mesas.filter(function(m){return pedidos[m.id]&&pedidos[m.id].length;}).map(function(m){
    var min=_mesaSinPedirMin(m.id);
    var al=_nivelAlertaMesa(min);
    return al?{m:m,min:min,al:al}:null;
  }).filter(Boolean).sort(function(a,b){return b.min-a.min;});
  var alertaBanner=_alertasMesas.length?'<div style="background:'+(_alertasMesas[0].al.nivel>=2?'#ef444414':'#f5a62314')+';border:1px solid '+(_alertasMesas[0].al.nivel>=2?'#ef444455':'#f5a62355')+';border-radius:10px;padding:8px 12px;margin-bottom:10px'+(_alertasMesas[0].al.nivel>=2?';animation:alertaMesaPulso 1.6s ease-in-out infinite':'')+'">'
    +'<div style="font-size:11.5px;font-weight:900;color:'+(_alertasMesas[0].al.nivel>=2?'#ef4444':'#f5a623')+';margin-bottom:2px">⏰ Mesas sin pedir hace rato — ¡que las atiendan!</div>'
    +'<div style="font-size:11px;color:var(--text)">'+_alertasMesas.map(function(x){
      var t=x.min>=60?Math.floor(x.min/60)+' h '+(x.min%60)+' m':x.min+' min';
      return'<span onclick="var el=document.getElementById(\'mn-'+x.m.id+'\');if(el)el.scrollIntoView({behavior:\'smooth\',block:\'center\'});" style="display:inline-block;background:'+x.al.c+'22;color:'+x.al.c+';border-radius:7px;padding:2px 8px;margin:2px 4px 2px 0;font-weight:800;cursor:pointer">'+x.al.emoji+' '+esc(x.m.nombre||('Mesa '+x.m.num))+' · '+t+'</span>';
    }).join('')+'</div>'
  +'</div>':'';
  var zonaBtns=ZONAS.map(function(z){
    var ocp=mesas.filter(function(m){return m.zona===z.id&&pedidos[m.id]&&pedidos[m.id].length>0;}).length;
    var act=z.id===zonaActual;
    return '<button class="zona-btn'+(act?' active':'')+'" onclick="cambiarZona(\''+z.id+'\')"'
      +(act?' style="color:'+z.color+';border-color:'+z.color+';background:'+z.color+'20;box-shadow:0 0 12px '+z.color+'44"':'')+'>'
      +z.emoji+' '+z.label+' <span style="font-size:10px;opacity:.6">('+ocp+')</span></button>';
  }).join('');

  // Botón de venta rápida (con aviso si hay una a medias)
  var vrKey='vr_'+(usuarioActivo?usuarioActivo.id:'');
  var vrPend=(pedidos[vrKey]||[]).length;
  var arqBadge=(_arqNoVistos.length&&usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'))
    ?'<button onclick="verArqueosNuevos()" style="background:#f5a623;color:#1a1a22;border:none;border-radius:99px;padding:6px 12px;font-size:12px;font-weight:900;cursor:pointer;animation:pulse 1.6s ease-in-out infinite">🧮 '+_arqNoVistos.length+' conteo'+(_arqNoVistos.length!==1?'s':'')+'</button>'
    :'';
  var sndBtn=arqBadge+'<button onclick="toggleSonidos()" title="Sonidos de mesas" style="background:'+(_sndOn?'#22c55e22':'var(--card)')+';border:1px solid '+(_sndOn?'#22c55e66':'var(--border)')+';color:'+(_sndOn?'#22c55e':'var(--muted)')+';border-radius:8px;padding:6px 12px;font-size:15px;cursor:pointer">'+(_sndOn?'🔔':'🔕')+'</button>';
  var ventaRapidaBtn='<button onclick="ventaRapida()" style="width:100%;margin-bottom:10px;background:linear-gradient(135deg,#f5a62322,#8B5CF622);border:1px solid #f5a62366;border-radius:12px;padding:12px;font-weight:800;font-size:14px;color:#f5a623;cursor:pointer">⚡ Venta rápida — sin mesa, pagan de una'
    +(vrPend?' <span style="background:#ef4444;color:#fff;border-radius:99px;padding:2px 9px;font-size:11px;margin-left:6px">'+vrPend+' pendiente</span>':'')
    +'</button>';

  var formasZona=formasData[zonaKey(zonaActual)]||[];
  var formaNodes=formasZona.map(function(fo,fi){
    var editable=modoEdicion;
    var base='position:absolute;left:'+fo.x+'px;top:'+fo.y+'px;width:'+fo.w+'px;height:'+fo.h+'px;z-index:1;'
      +(editable?'cursor:move;':'pointer-events:none;');
    var delBtn=editable?'<span class="forma-del" data-fidx="'+fi+'" style="position:absolute;top:-9px;right:-9px;background:#ef4444;color:#fff;border-radius:50%;width:20px;height:20px;font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;z-index:6">✕</span>':'';
    var resizeBtn=editable?'<span class="forma-resize" data-fidx="'+fi+'" style="position:absolute;bottom:-9px;right:-9px;background:#38bdf8;color:#fff;border-radius:50%;width:20px;height:20px;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:nwse-resize;pointer-events:auto;z-index:6">⤡</span>':'';
    if(fo.tipo==='texto'){
      var fontCtrl=editable?'<span class="forma-font" data-fidx="'+fi+'" data-d="-1" style="position:absolute;bottom:-9px;left:-9px;background:#a855f7;color:#fff;border-radius:50%;width:20px;height:20px;font-size:13px;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;z-index:6">−</span><span class="forma-font" data-fidx="'+fi+'" data-d="1" style="position:absolute;bottom:-9px;right:-9px;background:#22c55e;color:#fff;border-radius:50%;width:20px;height:20px;font-size:13px;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;z-index:6">+</span>':'';
      return'<div class="forma-node" data-fidx="'+fi+'" style="'+base+'display:flex;align-items:center;justify-content:center;color:'+(fo.color||'#fff')+';font-weight:800;font-size:'+(fo.fontSize||16)+'px;text-align:center;letter-spacing:1px'+(editable?';outline:1px dashed '+(fo.color||'#fff')+'55':'')+'">'+esc(fo.texto||'')+delBtn+fontCtrl+'</div>';
    }
    var r=fo.tipo==='circulo'?'50%':(fo.r||'8px');
    return'<div class="forma-node" data-fidx="'+fi+'" style="'+base+'background:'+(fo.relleno||'transparent')+';border:'+(fo.grosor||2)+'px solid '+(fo.color||'#f5a623')+';border-radius:'+r+'">'+delBtn+resizeBtn+'</div>';
  }).join('');

  var mesaNodes=ms.map(function(m){
    var c=colorMesa(m.id);var dim=dimMesa(m.forma,m.ori,m.size);
    var its=(pedidos[m.id]||[]).reduce(function(a,b){return a+b.qty;},0);
    return '<div class="mesa-node" id="mn-'+m.id+'"'
      +' style="left:'+m.x+'px;top:'+m.y+'px;width:'+dim.w+'px;height:'+dim.h+'px;border-radius:'+dim.r
      +';background:'+c+'18;border-color:'+c
      +';box-shadow:'+(mesaActiva&&mesaActiva.id===m.id?'0 0 20px '+c+'99':'0 0 6px '+c+'33')
      +';z-index:3"'
      +' data-mesaid="'+m.id+'">'
      +'<div style="color:#fff;font-weight:800;font-size:11px;text-align:center;line-height:1.3;padding:0 4px;word-break:break-word">'
      +(m.nombre||('Mesa '+m.num))+'</div>'
      +'<div style="color:var(--muted);font-size:10px">👤'+m.cap+'</div>'
      +(its>0?'<div style="color:'+c+';font-size:10px;font-weight:700">'+its+' itm</div>':'')
      +(pelotasMesa[m.id]?'<div style="position:absolute;top:-7px;right:-7px;background:#22c55e;color:#fff;border-radius:10px;padding:1px 6px;font-size:10px;font-weight:900;box-shadow:0 0 6px #22c55e88">🐸'+pelotasMesa[m.id].qty+'</div>':'')
      +(function(){
        var al=_nivelAlertaMesa(_mesaSinPedirMin(m.id));
        if(!al)return'';
        return'<div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);background:'+al.c+';color:#fff;border-radius:9px;padding:1px 7px;font-size:9px;font-weight:900;white-space:nowrap;box-shadow:0 0 8px '+al.c+'99'+(al.pulso?';animation:alertaMesaPulso 1.2s ease-in-out infinite':'')+'">'+al.emoji+' '+(al.nivel>=3?'+2h':al.nivel===2?Math.floor(_mesaSinPedirMin(m.id)/60)+'h'+(_mesaSinPedirMin(m.id)%60)+'m':_mesaSinPedirMin(m.id)+'m')+'</div>';
      })()
      +'</div>';
  }).join('');

  var paredesSvg='';
  var pa=paredesData[zonaKey(zonaActual)]||[];
  if(pa.length||_paredDibujando){
    var lines=pa.map(function(p){
      return '<line x1="'+p.x1+'" y1="'+p.y1+'" x2="'+p.x2+'" y2="'+p.y2+'" stroke="'+p.color+'" stroke-width="'+p.grosor+'" stroke-linecap="round" opacity="0.85"/>';
    }).join('');
    if(_paredDibujando){
      lines+='<line x1="'+_paredDibujando.x1+'" y1="'+_paredDibujando.y1+'" x2="'+(_paredDibujando.x2||_paredDibujando.x1)+'" y2="'+(_paredDibujando.y2||_paredDibujando.y1)+'" stroke="'+_colorPared+'" stroke-width="'+_grosorPared+'" stroke-linecap="round" stroke-dasharray="6,4" opacity="0.7"/>';
    }
    paredesSvg='<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2">'+lines+'</svg>';
  }

  var paredesUI='';  // Panel moved outside mapa

  var leyenda='<div style="position:absolute;bottom:10px;right:14px;display:flex;gap:14px;z-index:4">'
    +[['#22c55e','Libre'],['#f5a623','Ocupada'],['#38bdf8','Activa']].map(function(x){
      return '<div style="display:flex;align-items:center;gap:4px"><div style="width:8px;height:8px;border-radius:50%;background:'+x[0]+'"></div><span style="color:var(--muted);font-size:10px">'+x[1]+'</span></div>';
    }).join('')+'</div>';

  var svgBg='<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1">'
    +Array.from({length:25},function(_,i){return'<circle cx="'+((i*173)%900)+'" cy="'+((i*97)%430)+'" r="'+(0.5+((i*31)%12)/10)+'" fill="#fff" opacity="'+(0.04+((i*7)%5)*.012)+'"/>';}).join('')
    +Array.from({length:8},function(_,i){return'<g opacity="0.025"><line x1="'+(i*120)+'" y1="0" x2="'+(i*120)+'" y2="500" stroke="'+(zona?zona.color:'#fff')+'" stroke-width="1"/><line x1="0" y1="'+(i*70)+'" x2="1400" y2="'+(i*70)+'" stroke="'+(zona?zona.color:'#fff')+'" stroke-width="1"/></g>';}).join('')
    +'</svg>';

  var ctrlBtns='';
  if(puedeEditar){
    ctrlBtns='<div class="flex">'
      +'<button class="btn btn-sm btn-green" onclick="abrirNuevaMesa()">+ Mesa</button>'
      +'<button onclick="menuFormas()" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf844;border-radius:9px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer">🔷 Formas</button>'
      +'<button class="btn btn-sm '+(modoEdicion?'btn-accent':'btn-outline')+'" onclick="toggleEdicion()">'+(modoEdicion?'✓ Guardar':'✏️ Editar plano')+'</button>'
      +'</div>';
  }

  var panelPedido='<div id="panel-pedido-slot"></div>';

  // Mesa size slider
  var sizeSlider='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;background:var(--card);border-radius:8px;padding:6px 12px">'    +'<span style="color:var(--muted);font-size:11px;white-space:nowrap">🔲 Tamaño:</span>'    +'<input type="range" min="20" max="160" value="'+mesaSize+'" style="flex:1;accent-color:var(--accent)" '    +'oninput="mesaSize=parseInt(this.value);render()"/>'    +'<span style="color:var(--accent);font-size:12px;font-weight:700;min-width:34px">'+mesaSize+'px</span>'    +'</div>';

  // Selector de vista Mapa / Lista
  var vistaToggle='<div style="display:flex;gap:6px;margin-bottom:10px">'
    +'<button onclick="vistaMesas=\'mapa\';render()" style="flex:1;background:'+(vistaMesas==='mapa'?'var(--accent)':'var(--card)')+';color:'+(vistaMesas==='mapa'?'#fff':'var(--muted)')+';border:1px solid '+(vistaMesas==='mapa'?'var(--accent)':'var(--border)')+';border-radius:9px;padding:9px;font-weight:700;font-size:13px;cursor:pointer">🗺️ Mapa</button>'
    +'<button onclick="vistaMesas=\'lista\';render()" style="flex:1;background:'+(vistaMesas==='lista'?'var(--accent)':'var(--card)')+';color:'+(vistaMesas==='lista'?'#fff':'var(--muted)')+';border:1px solid '+(vistaMesas==='lista'?'var(--accent)':'var(--border)')+';border-radius:9px;padding:9px;font-weight:700;font-size:13px;cursor:pointer">📋 Lista por zona</button>'
  +'</div>';

  // VISTA LISTA: mesas agrupadas por zona, ordenadas por número
  if(vistaMesas==='lista'){
    var listaHtml=ZONAS.map(function(z){
      var msz=mesas.filter(function(m){return m.zona===z.id;}).sort(function(a,b){return (a.num||0)-(b.num||0);});
      if(!msz.length)return'';
      var cards=msz.map(function(m){
        var c=colorMesa(m.id);
        var its=(pedidos[m.id]||[]).reduce(function(a,b){return a+b.qty;},0);
        var tot=totalPedido(m.id);
        var activa=mesaActiva&&mesaActiva.id===m.id;
        return'<button onclick="clickMesa('+m.id+')" style="text-align:left;background:'+c+'14;border:2px solid '+(activa?c:c+'44')+';border-radius:11px;padding:10px 12px;cursor:pointer;position:relative">'
          +'<div style="font-weight:800;font-size:14px;color:#fff">'+esc(m.nombre||('Mesa '+m.num))+'</div>'
          +'<div style="color:var(--muted);font-size:11px">👤 '+m.cap+(its>0?' · '+its+' ítems':'')+(pelotasMesa[m.id]?' · <span style="color:#22c55e;font-weight:800">🐸'+pelotasMesa[m.id].qty+'</span>':'')+'</div>'
          +(its>0?'<div style="color:'+c+';font-weight:800;font-size:13px;margin-top:2px">'+fmt(tot)+'</div>':'<div style="color:#22c55e;font-size:11px;font-weight:700;margin-top:2px">Libre</div>')
        +'</button>';
      }).join('');
      return'<div style="margin-bottom:16px">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
          +'<span style="color:'+z.color+';font-weight:800;font-size:14px">'+z.emoji+' '+z.label+'</span>'
          +'<span style="color:var(--muted);font-size:11px">'+msz.length+' mesas</span>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+cards+'</div>'
      +'</div>';
    }).join('');
    return '<div style="display:flex;gap:8px;align-items:stretch;margin-bottom:10px">'+ventaRapidaBtn.replace('margin-bottom:10px;','')+sndBtn+'</div>'+vrPendientesHtml()+vistaToggle
      +'<div class="'+(mesaActiva?'grid2':'grid1')+'">'
      +'<div>'+listaHtml+'</div>'
      +panelPedido+'</div>';
  }

  return '<div style="display:flex;gap:8px;align-items:stretch;margin-bottom:10px">'+ventaRapidaBtn.replace('margin-bottom:10px;','')+sndBtn+'</div>'+vrPendientesHtml()+vistaToggle+'<div class="flex-between mb12" style="flex-wrap:wrap;gap:8px">'
    +alertaBanner
    +'<div class="flex">'+zonaBtns+'</div>'
    +ctrlBtns+'</div>'
    +(modoEdicion?'<div class="alert-box alert-gold mb12">💡 Arrastra para mover · Doble clic para editar nombre, forma o eliminar</div>':'')
    +'<div class="'+(mesaActiva?'grid2':'grid1')+'">'
    +'<div id="mapa-wrap">'
    +svgBg+paredesSvg
    +'<div style="position:absolute;top:10px;left:14px;color:'+(zona?zona.color:'#fff')+';font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;opacity:.5;z-index:4">'+(zona?zona.emoji+' '+zona.label:'')+'</div>'
    +(modoEdicion?'<div style="position:absolute;top:8px;right:14px;background:#f5a62318;color:#f5a623;font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;border:1px solid #f5a62333;z-index:5">Arrastra · Doble clic = editar</div>':'')
    +formaNodes+mesaNodes+leyenda
    +'</div>'
    +panelPedido+'</div>';
}

// Productos más pedidos (por unidades vendidas en el histórico de ventas)
function topProductosMesa(n){
  var cnt={};
  (ventas||[]).forEach(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    its.forEach(function(it){
      if(it.isCustom||it.isCombo||it.isCubetazoMix)return;
      if(it.pid==null)return;
      var q=(it.qty||1)*(it.cubeta?5:1);
      cnt[it.pid]=(cnt[it.pid]||0)+q;
    });
  });
  var arr=Object.keys(cnt).map(function(pid){
    var p=menu.find(function(m){return String(m.id)===String(pid);});
    return p?{p:p,qty:cnt[pid]}:null;
  }).filter(Boolean);
  arr.sort(function(a,b){return b.qty-a.qty;});
  return arr.slice(0,n||6).map(function(x){return x.p;});
}

function renderPanelPedido(){
  if(!mesaActiva)return'';
  var zona=ZONAS.find(function(z){return z.id===mesaActiva.zona;});
  var ped=pedidos[mesaActiva.id]||[];
  var total=totalPedido(mesaActiva.id);
  var cats=['Todos','🎁 Combos'].concat(menu.reduce(function(a,m){if(a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort());
  var esCombosTab=catFiltroPed==='🎁 Combos';
  var fil=catFiltroPed==='Todos'?menu:(esCombosTab?[]:menu.filter(function(m){return m.cat===catFiltroPed;}));
  var esMesero=usuarioActivo&&usuarioActivo.rol==='mesero';

  var pills=cats.map(function(c){
    var ce=catEmojis[c]||getCatEmoji(c)||(menu.find(function(m){return m.cat===c;})||{}).emoji||'';
    return'<button class="pill'+(c===catFiltroPed?' active':'')+'" data-setcat="'+esc(c)+'">'+(ce?ce+' ':'')+c+'</button>';
  }).join('');

  // 🔍 Buscador: si hay texto, mostrar coincidencias de TODA la carta
  var busqActiva=!!(_busqPed&&_busqPed.trim());
  var busqBlock=busqActiva?_bpBusqHTML():'';

  // ⭐ Sección "Más pedidos" (solo en la vista Todos)
  var masPedidosHtml='';
  if(catFiltroPed==='Todos'){
    var tops=topProductosMesa(6);
    if(tops.length){
      masPedidosHtml='<div style="background:#f5a62310;border:1px solid #f5a62333;border-radius:12px;padding:8px 10px;margin-top:10px">'
        +'<div style="color:#f5a623;font-size:11px;font-weight:800;letter-spacing:.5px;margin-bottom:6px">⭐ MÁS PEDIDOS</div>'
        +'<div class="carta-grid">'+tops.filter(a52Vendible).map(_cartaCard).join('')+'</div>'
      +'</div>';
    }
  }

  // Bloque de la carta (con acordeón de subcategorías minimizadas)
  var cartaBlock;
  if(catFiltroPed==='Todos'){
    cartaBlock='<div class="carta-grid">'+fil.filter(a52Vendible).map(_cartaCard).join('')+'</div>';
  } else {
    var subsP=fil.reduce(function(a,m){var s=m.subcat||'';if(a.indexOf(s)<0)a.push(s);return a;},[]).sort();
    if(subsP.length<=1){
      cartaBlock='<div class="carta-grid">'+fil.filter(a52Vendible).map(_cartaCard).join('')+'</div>';
    } else {
      // Subcategorías minimizadas por defecto: se tocan para desplegar
      cartaBlock=subsP.map(function(s){
        var lista=fil.filter(function(m){return (m.subcat||'')===s;});
        var label=s||'General';
        var key=catFiltroPed+'|'+s;
        var abierta=!!_pedSubAbierta[key];
        return'<button data-act="ped-subtoggle" data-sub="'+esc(key)+'" style="width:100%;text-align:left;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:9px 12px;margin-top:8px;color:var(--text);font-size:12px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
          +'<span>'+(abierta?'▼':'▶')+' '+esc(label)+'</span><span style="color:var(--muted);font-weight:600;text-transform:none">'+lista.length+' 🍺</span></button>'
          +(abierta?'<div class="carta-grid" style="margin-top:8px">'+lista.filter(a52Vendible).map(_cartaCard).join('')+'</div>':'');
      }).join('');
    }
  }

  var pedItems=ped.map(function(it,idx_){
    var p=(it.isCombo||it.isCustom)?null:menu.find(function(m){return m.id===it.pid;});
    var pr=precioItem(it);  // maneja variantes, combos, cubetazos correctamente
    var ingDesc=it.isCombo&&it.comboIngredientes?it.comboIngredientes.map(function(ing){var pm=menu.find(function(m){return m.id===ing.prodId;});return(pm?pm.emoji:'')+'×'+ing.cantidad;}).join(' '):'';
    return'<div style="display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1">'
      +'<div style="color:var(--text);font-size:12px;font-weight:600">'
        +(it.isCustom?'✏️ '+esc(it.customNombre):it.isCombo?(it.comboEmoji+' '+esc(it.comboNombre)):it.isCubetazoMix?('🪣 '+esc(it.cubMixNombre||'Cubetazo mixto')):(p?p.emoji+' ':'')+esc((p&&p.nombre)||'?'))
      +'</div>'
      +(it.isCustom?'<div style="color:#f5a623;font-size:10px;font-weight:700">Producto personalizado</div>':'')
      +(it.isCombo?'<div style="color:var(--gold);font-size:10px;font-weight:700">🎁 Combo · '+ingDesc+'</div>':'')
      +(it.isCubetazoMix?'<div style="color:#22c55e;font-size:10px;font-weight:700">🪣 '+esc((it.cubMixNombre||'Cubetazo mixto').toUpperCase())+' · '+(it.cubMixDetalle||[]).map(function(dd){return dd.cantidad+'×'+dd.emoji;}).join(' ')+'</div>':'')
      +(it.cubeta?'<div style="color:#22c55e;font-size:10px;font-weight:700">🪣 CUBETAZO ×5</div>':'')
      +(it.varianteNombre?'<div style="color:var(--accent);font-size:10px;font-weight:700">📐 '+esc(it.varianteNombre)+'</div>':'')+'</div>'
      +((usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'))?'<button data-act="ped-minus" data-idx="'+idx_+'" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:16px;line-height:1">−</button>':'<button data-act="ped-minus-bloq" style="background:rgba(255,255,255,.05);color:var(--dim);border:none;border-radius:6px;width:26px;height:26px;cursor:not-allowed;font-size:13px;line-height:1" title="Solo admin o subadmin pueden restar">🔒</button>')
      +'<button data-act="ped-editqty" data-idx="'+idx_+'" style="background:rgba(255,255,255,.08);color:#fff;font-weight:800;min-width:34px;text-align:center;border:1px solid var(--border);border-radius:6px;height:26px;cursor:pointer;font-size:14px" title="Tocar para elegir cuántas agregar">'+it.qty+'</button>'
      +'<button data-act="ped-plus" data-idx="'+idx_+'" title="Elegir cuántas agregar" style="background:#22c55e18;color:#22c55e;border:none;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:16px;line-height:1">+</button>'
      +'<span style="color:var(--gold);font-size:12px;font-weight:700;min-width:72px;text-align:right">'+fmt(pr*it.qty)+'</span>'
      +'</div>';
  }).join('');

  var desc=mesaActiva&&descuentos[mesaActiva.id]?descuentos[mesaActiva.id]:null;
  var botonesBottom=esMesero
    ?'<div style="background:var(--card2);border-radius:10px;border:1px solid var(--border);padding:10px 12px">'
      +'<div class="flex-between mb8"><span style="color:var(--muted);font-weight:800;font-size:12px">TOTAL</span>'
      +'<span style="color:var(--gold);font-size:20px;font-weight:900">'+fmt(total)+'</span></div>'
      +'<div style="background:#22c55e18;border:1px solid #22c55e33;border-radius:8px;padding:8px;text-align:center;color:#22c55e;font-size:12px;font-weight:700">✓ Pedido registrado</div>'
      +(mesaActiva.rapida&&ped.length&&vrPuedeCancelar(mesaActiva.id)?'<button class="btn btn-sm btn-full" onclick="cancelarVentaRapida(\''+mesaActiva.id+'\')" style="margin-top:7px;background:#ef444418;color:#ef4444;border:1px solid #ef444433">🗑️ Cancelar esta venta rápida</button>':'')+'</div>'
    :'<div style="background:var(--card2);border-radius:10px;border:1px solid var(--border);padding:10px 12px">'
      +'<div class="flex-between mb8"><span style="color:var(--muted);font-weight:800;font-size:12px">TOTAL</span>'
      +'<span style="color:var(--gold);font-size:22px;font-weight:900">'+fmt(total)+'</span></div>'
      +(desc?'<div class="flex-between mb8" style="background:#22c55e18;border-radius:8px;padding:4px 8px"><span style="color:#22c55e;font-size:12px;font-weight:700">🏷️ 10% · '+esc(desc.auth)+'</span><span style="color:#22c55e;font-weight:800">-'+fmt(Math.round(total*0.1))+'</span></div><div class="flex-between mb8"><span style="color:var(--gold);font-weight:800">CON DESCUENTO</span><span style="color:var(--gold);font-size:18px;font-weight:900">'+fmt(Math.round(total*0.9))+'</span></div>':'')
      +'<div style="display:flex;gap:7px">'
      +'<button class="btn btn-sm btn-blue btn-full" onclick="imprimirPrecuenta()" '+(ped.length?'':'disabled')+'>🖨️ Preorden</button>'
      +((ped.length&&(descuentoHabilitado||desc))?'<button data-act="toggle-desc" style="flex:1;background:'+(desc?'#ef444418':'#22c55e18')+';color:'+(desc?'#ef4444':'#22c55e')+';border:1px solid '+(desc?'#ef444433':'#22c55e33')+';border-radius:8px;padding:5px 4px;font-size:10px;font-weight:700;cursor:pointer">'+(desc?'❌ Quitar desc':'🏷️ 10% Desc')+'</button>':'')
      +'<button class="btn btn-sm btn-outline btn-full" onclick="abrirTrasladoMesa()" '+(ped.length?'':'disabled')+' style="font-size:11px">🔀 Trasladar</button>'
      +'</div>'
      +(function(){
        var abs=(abonosMesa[mesaActiva.id]||[]);
        var totalAbonado=abs.reduce(function(a,x){return a+(x.monto||0);},0);
        var totalReal=desc?Math.round(total*0.9):total;
        var falta=Math.max(0,totalReal-totalAbonado);
        var abonosHtml='';
        if(abs.length){
          abonosHtml='<div style="background:var(--bg);border-radius:8px;padding:8px 10px;margin-top:8px">'
            +'<div style="color:var(--muted);font-size:10px;font-weight:700;margin-bottom:4px">💵 ABONOS RECIBIDOS</div>'
            +abs.map(function(x,i){var f=FPAGO.find(function(z){return z.id===x.fp;});return'<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:2px 0"><span>'+(f?f.emoji:'')+' '+esc(x.nombre||'Abono')+'</span><span style="display:flex;gap:6px;align-items:center"><b style="color:#22c55e">'+fmt(x.monto)+'</b><button data-act="quitar-abono" data-idx="'+i+'" style="background:none;border:none;color:#ef4444;cursor:pointer">✕</button></span></div>';}).join('')
            +'<div style="display:flex;justify-content:space-between;margin-top:5px;padding-top:5px;border-top:1px solid var(--border);font-size:12px"><span style="color:var(--muted)">Abonado</span><b style="color:#22c55e">'+fmt(totalAbonado)+'</b></div>'
            +'<div style="display:flex;justify-content:space-between;font-size:13px"><span style="font-weight:700">Falta</span><b style="color:'+(falta>0?'#f5a623':'#22c55e')+'">'+fmt(falta)+'</b></div>'
          +'</div>';
        }
        return abonosHtml;
      })()
      +'<div style="display:flex;gap:7px;margin-top:7px">'
      +'<button class="btn btn-sm btn-full" onclick="abrirAbonoMesa()" '+(ped.length?'':'disabled')+' style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;font-size:11px">💵 Abonar</button>'
      +'<button class="btn btn-sm btn-full" onclick="abrirDividirCuenta()" '+(ped.length?'':'disabled')+' style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;font-size:11px">🧾 Dividir</button>'
      +'</div>'
      +(function(){var _pl=pelotasMesa[mesaActiva.id];
        if(!_pl&&!a52Mod('pelotas'))return'';
        return _pl
          ?'<button class="btn btn-sm btn-full" onclick="abrirPelotasMesa()" style="margin-top:7px;background:#22c55e;color:#fff;border:none;font-weight:800">🐸 '+_pl.qty+' pelotas prestadas · tocar para recibir</button>'
          :'<button class="btn btn-sm btn-full" onclick="prestarPelotas()" style="margin-top:7px;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33">🐸 Prestar pelotas bolirrana</button>';
      })()
      +'<button class="btn btn-sm btn-full" onclick="abrirNovedadMesa()" style="margin-top:7px;background:#f5a62318;color:#f5a623;border:1px solid #f5a62333">📝 Anotar novedad (descuento, se voló, cortesía...)</button>'
      +((usuarioActivo.rol!=='mesero'&&a52Mod('socios'))?'<button class="btn btn-sm btn-full" onclick="abrirSocioAsumeMesa()" style="margin-top:7px;background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833">🤝 Un socio asume parte de la cuenta</button>':'')
      +'<button class="btn btn-sm btn-green btn-full" onclick="abrirCobro()" '+(ped.length?'':'disabled')+' style="margin-top:7px">💳 Cobrar todo</button>'
      +(mesaActiva.rapida&&ped.length&&vrPuedeCancelar(mesaActiva.id)?'<button class="btn btn-sm btn-full" onclick="cancelarVentaRapida(\''+mesaActiva.id+'\')" style="margin-top:7px;background:#ef444418;color:#ef4444;border:1px solid #ef444433">🗑️ Cancelar esta venta rápida</button>':'')
      +'</div>';

  // Build combo items for pedido panel
  var combosItems=combos.map(function(cb){
    var disponible=comboDisponible(cb);
    var ingDesc=cb.ingredientes.map(function(ing){
      if(ing.tipo==='categoria') return'🗂️'+ing.cat+'×'+ing.cantidad;
      var p=menu.find(function(m){return m.id===ing.prodId;});
      return(p?p.emoji:'')+'×'+ing.cantidad;
    }).join(' + ');
    return'<div class="carta-item" style="opacity:'+(disponible?1:0.4)+'">'
      +'<div class="flex-between">'
        +'<span style="font-size:20px">'+cb.emoji+'</span>'
        +(disponible?'':'<span class="tag" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;font-size:10px">Sin stock</span>')
      +'</div>'
      +'<div style="color:var(--text);font-size:12px;font-weight:700;margin:3px 0 1px">'+esc(cb.nombre)+'</div>'
      +'<div style="color:var(--muted);font-size:10px;margin-bottom:5px">'+ingDesc+'</div>'
      +'<button data-cbid="'+cb.id+'" data-act="addcombo" '+(disponible?'':'disabled')+' style="width:100%;background:var(--gold)22;color:var(--gold);border:1px solid var(--gold)33;border-radius:6px;padding:4px 0;font-size:11px;font-weight:700;cursor:'+(disponible?'pointer':'not-allowed')+'">'+fmt(cb.precio)+'</button>'
      +'</div>';
  }).join('')||(combos.length?'':'<div style="color:var(--dim);font-size:12px;text-align:center;padding:12px">Sin combos creados</div>');

  return'<div class="flex-between mb8">'
    +'<div><div style="color:#fff;font-weight:900;font-size:15px">'+(zona?zona.label:'')+' · '+(mesaActiva.nombre||'Mesa '+mesaActiva.num)+'</div>'
    +'<div style="color:var(--muted);font-size:11px">👤 cap. '+mesaActiva.cap+' · '+usuarioActivo.emoji+' '+esc(usuarioActivo.nombre)+'</div></div>'
    +'<button class="btn btn-sm btn-dark" onclick="cerrarPanel()">✕</button></div>'
    // PEDIDO ACTIVO ARRIBA
    +'<div style="background:var(--bg);border-radius:10px;border:2px solid var(--accent)44;padding:10px 12px;margin-bottom:10px;min-height:90px;max-height:38vh;overflow-y:auto;-webkit-overflow-scrolling:touch">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<div class="section-title" style="color:var(--accent);margin:0">🧾 Pedido activo'+(ped.length?' · '+ped.reduce(function(a,b){return a+b.qty;},0)+' ítems':'')+'</div>'
      +'<button onclick="verHistorialMesa()" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:99px;padding:3px 11px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🕐 Historial</button>'
    +'</div>'
    +(ped.length?pedItems:'<div style="color:var(--dim);font-size:13px;text-align:center;padding:20px 14px">Sin productos aún<br><span style="font-size:11px">Selecciona productos abajo 👇</span></div>')
    +'</div>'
    // TOTAL + BOTONES DE COBRO (arriba, después del pedido)
    +botonesBottom
    // SELECTOR DE PRODUCTOS ABAJO
    +'<div style="display:flex;gap:6px;align-items:center;margin-top:10px;margin-bottom:8px">'
      +'<input id="busq-ped" class="inp" placeholder="🔍 Buscar producto..." value="'+esc(_busqPed)+'" oninput="filtrarBusqPed(this.value)" style="flex:1;padding:9px 12px;font-size:13px"/>'
      +(busqActiva?'<button onclick="limpiarBusqPed()" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:8px;padding:8px 12px;font-size:13px;font-weight:800;cursor:pointer">✕</button>':'')
    +'</div>'
    +'<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center" class="mb8">'+pills
  +(puedeUsarOtro()?'<button onclick="abrirItemPersonalizado()" style="background:#f5a62322;color:#f5a623;border:1px solid #f5a62344;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">✏️ Otro</button>':'')
  +a52AgotadosBtn()
  +(!a52Mod('cubetazos')?'':'<button onclick="abrirCubetazoMixto()" style="background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">🪣 Cubetazo mixto</button>'+'<button onclick="abrirCubetazoNacional()" style="background:#f5a62322;color:#f5a623;border:1px solid #f5a62344;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">🪣 Cubetazo nacional</button>'+'<button onclick="abrirCubetazoMitica()" style="background:#38bdf822;color:#38bdf8;border:1px solid #38bdf844;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">🪣 Cubetazo Mítica</button>')
  +'</div>'
    +'<div id="bp-zona">'
    +(busqActiva?busqBlock
      :(masPedidosHtml
        +(esCombosTab?('<div class="carta-grid" style="margin-top:10px">'+combosItems+'</div>'):('<div style="margin-top:6px">'+cartaBlock+'</div>'))))
    +'</div>';
}

function renderSoloPedido(){
  var pp=document.getElementById('panel-pedido')||document.getElementById('panel-pedido-slot');
  if(pp&&mesaActiva){
    pp.id='panel-pedido';
    pp.style.cssText='background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:14px;display:block';
    pp.innerHTML=renderPanelPedido();
    // Re-bind combo/pedido events since innerHTML was replaced
    var c=document.getElementById('content');
    if(c){c._comboBound=false;bindComboEvents();}
  }
}
function actualizarColorMesas(){
  mesas.forEach(function(m){
    var el=document.getElementById('mn-'+m.id);if(!el)return;
    var c=colorMesa(m.id);
    el.style.borderColor=c;el.style.background=c+'18';
    el.style.boxShadow=mesaActiva&&mesaActiva.id===m.id?'0 0 20px '+c+'99':'0 0 6px '+c+'33';
  });
}

/* ═══════════════ MAPA EVENTS ═══════════════ */
function bindMapaEvents(){
  var el=document.getElementById('mapa-wrap');
  if(!el)return;
  var newEl=el.cloneNode(true);
  el.parentNode.replaceChild(newEl,el);
  el=newEl;

  function getCoords(e){
    var r=el.getBoundingClientRect();
    var src=e.touches?e.touches[0]:e;
    return{x:src.clientX-r.left, y:src.clientY-r.top};
  }
  function savePared(x2,y2){
    var k2=zonaKey(zonaActual);
    if(!paredesData[k2])paredesData[k2]=[];
    var dx=x2-_paredDibujando.x1, dy=y2-_paredDibujando.y1;
    if(Math.sqrt(dx*dx+dy*dy)>8){
      paredesData[k2].push({x1:_paredDibujando.x1,y1:_paredDibujando.y1,x2:x2,y2:y2,color:_colorPared,grosor:_grosorPared});
      var rp=ref('paredes/'+k2);
      if(rp)rp.set(paredesData[k2]); else fbSet('paredes',paredesData);
    }
    _paredDibujando=null;
    render();
  }
  function updatePreview(x2,y2){
    if(!_paredDibujando)return;
    _paredDibujando.x2=x2; _paredDibujando.y2=y2;
    var svgs=el.querySelectorAll('svg');
    var last=svgs[svgs.length-1];
    if(last){var ls=last.querySelectorAll('line');var ll=ls[ls.length-1];
      if(ll&&ll.getAttribute('stroke-dasharray')){ll.setAttribute('x2',x2);ll.setAttribute('y2',y2);}}
  }

  // ── TOUCH EVENTS (mobile - no delay) ──────────────────────────────────────
  el.addEventListener('touchstart',function(e){
    var fdel=e.target.closest('.forma-del');
    if(fdel&&modoEdicion){e.preventDefault();borrarForma(parseInt(fdel.getAttribute('data-fidx')));return;}
    var ffont=e.target.closest('.forma-font');
    if(ffont&&modoEdicion){e.preventDefault();cambiarFuenteForma(parseInt(ffont.getAttribute('data-fidx')),parseInt(ffont.getAttribute('data-d')));return;}
    var fres=e.target.closest('.forma-resize');
    if(fres&&modoEdicion){var tr=e.touches[0];var k=zonaKey(zonaActual);var fo0=formasData[k][parseInt(fres.getAttribute('data-fidx'))];_formaResizeState={idx:parseInt(fres.getAttribute('data-fidx')),sx:tr.clientX,sy:tr.clientY,w0:fo0.w,h0:fo0.h};e.preventDefault();return;}
    var fn=e.target.closest('.forma-node');
    if(fn&&modoEdicion){var t0=e.touches[0];_formaDragState={idx:parseInt(fn.getAttribute('data-fidx')),sx:t0.clientX,sy:t0.clientY};e.preventDefault();return;}
    var mn=e.target.closest('.mesa-node');
    if(mn&&modoEdicion){
      var t=e.touches[0];
      dragState={id:parseInt(mn.getAttribute('data-mesaid')),sx:t.clientX,sy:t.clientY};
    }
  },{passive:false});

  el.addEventListener('touchmove',function(e){
    if(_formaResizeState){
      var tr=e.touches[0];var k=zonaKey(zonaActual);var fo=formasData[k]&&formasData[k][_formaResizeState.idx];
      if(fo){fo.w=Math.max(20,_formaResizeState.w0+(tr.clientX-_formaResizeState.sx));fo.h=Math.max(20,_formaResizeState.h0+(tr.clientY-_formaResizeState.sy));
        var node=el.querySelector('.forma-node[data-fidx="'+_formaResizeState.idx+'"]');if(node){node.style.width=fo.w+'px';node.style.height=fo.h+'px';}}
      e.preventDefault();return;
    }
    if(_formaDragState){
      var t0=e.touches[0];var dx0=t0.clientX-_formaDragState.sx,dy0=t0.clientY-_formaDragState.sy;
      _formaDragState.sx=t0.clientX;_formaDragState.sy=t0.clientY;
      var k=zonaKey(zonaActual);var fo=formasData[k]&&formasData[k][_formaDragState.idx];
      if(fo){fo.x=Math.max(0,fo.x+dx0);fo.y=Math.max(0,fo.y+dy0);
        var node=el.querySelector('.forma-node[data-fidx="'+_formaDragState.idx+'"]');
        if(node){node.style.left=fo.x+'px';node.style.top=fo.y+'px';}}
      e.preventDefault();return;
    }
    if(dragState){
      var t=e.touches[0];
      var dx=t.clientX-dragState.sx, dy=t.clientY-dragState.sy;
      dragState.sx=t.clientX; dragState.sy=t.clientY;
      var m=mesas.find(function(m){return m.id===dragState.id;});
      if(m){m.x=Math.max(0,m.x+dx);m.y=Math.max(0,m.y+dy);}
      var node=document.getElementById('mn-'+dragState.id);
      if(node&&m){node.style.left=m.x+'px';node.style.top=m.y+'px';}
      e.preventDefault();
    }
  },{passive:false});

  el.addEventListener('touchend',function(e){
    if(_formaResizeState){guardarFormas(zonaKey(zonaActual));_formaResizeState=null;return;}
    if(_formaDragState){guardarFormas(zonaKey(zonaActual));_formaDragState=null;return;}
    if(dragState){fbSet('mesas',mesasObj());dragState=null;return;}
    // Mesa click (touchend = tap)
    var mn=e.target.closest('.mesa-node');
    if(mn){
      e.preventDefault();
      var mid=parseInt(mn.getAttribute('data-mesaid'));
      if(modoEdicion){abrirEditorMesa(mid);}else{clickMesa(mid);}
    }
  },{passive:false});

  // ── MOUSE EVENTS (desktop) ────────────────────────────────────────────────
  el.addEventListener('mousedown',function(e){
    if(modoParedes){
      if(e.target.closest('.mesa-node')||e.target.closest('#paredes-ui'))return;
      var c=getCoords(e);
      _paredDibujando={x1:c.x,y1:c.y,x2:c.x,y2:c.y};
      e.preventDefault();return;
    }
    var fdel=e.target.closest('.forma-del');
    if(fdel&&modoEdicion){e.preventDefault();borrarForma(parseInt(fdel.getAttribute('data-fidx')));return;}
    var ffont=e.target.closest('.forma-font');
    if(ffont&&modoEdicion){e.preventDefault();cambiarFuenteForma(parseInt(ffont.getAttribute('data-fidx')),parseInt(ffont.getAttribute('data-d')));return;}
    var fres=e.target.closest('.forma-resize');
    if(fres&&modoEdicion){var k=zonaKey(zonaActual);var fo0=formasData[k][parseInt(fres.getAttribute('data-fidx'))];_formaResizeState={idx:parseInt(fres.getAttribute('data-fidx')),sx:e.clientX,sy:e.clientY,w0:fo0.w,h0:fo0.h};e.preventDefault();return;}
    var fn=e.target.closest('.forma-node');
    if(fn&&modoEdicion){_formaDragState={idx:parseInt(fn.getAttribute('data-fidx')),sx:e.clientX,sy:e.clientY};e.preventDefault();return;}
    var mn=e.target.closest('.mesa-node');
    if(mn&&modoEdicion){
      dragState={id:parseInt(mn.getAttribute('data-mesaid')),sx:e.clientX,sy:e.clientY};
      e.preventDefault();
    }
  });
  el.addEventListener('mousemove',function(e){
    if(_formaResizeState){
      var k=zonaKey(zonaActual);var fo=formasData[k]&&formasData[k][_formaResizeState.idx];
      if(fo){fo.w=Math.max(20,_formaResizeState.w0+(e.clientX-_formaResizeState.sx));fo.h=Math.max(20,_formaResizeState.h0+(e.clientY-_formaResizeState.sy));
        var node=el.querySelector('.forma-node[data-fidx="'+_formaResizeState.idx+'"]');if(node){node.style.width=fo.w+'px';node.style.height=fo.h+'px';}}
      return;
    }
    if(_formaDragState){
      var dx0=e.clientX-_formaDragState.sx,dy0=e.clientY-_formaDragState.sy;
      _formaDragState.sx=e.clientX;_formaDragState.sy=e.clientY;
      var k=zonaKey(zonaActual);var fo=formasData[k]&&formasData[k][_formaDragState.idx];
      if(fo){fo.x=Math.max(0,fo.x+dx0);fo.y=Math.max(0,fo.y+dy0);
        var node=el.querySelector('.forma-node[data-fidx="'+_formaDragState.idx+'"]');
        if(node){node.style.left=fo.x+'px';node.style.top=fo.y+'px';}}
      return;
    }
    if(modoParedes&&_paredDibujando){var c=getCoords(e);updatePreview(c.x,c.y);return;}
    if(dragState){
      var dx=e.clientX-dragState.sx, dy=e.clientY-dragState.sy;
      dragState.sx=e.clientX; dragState.sy=e.clientY;
      var m=mesas.find(function(m){return m.id===dragState.id;});
      if(m){m.x=Math.max(0,m.x+dx);m.y=Math.max(0,m.y+dy);}
      var node=document.getElementById('mn-'+dragState.id);
      if(node&&m){node.style.left=m.x+'px';node.style.top=m.y+'px';}
    }
  });
  el.addEventListener('mouseup',function(e){
    if(_formaResizeState){guardarFormas(zonaKey(zonaActual));_formaResizeState=null;return;}
    if(_formaDragState){guardarFormas(zonaKey(zonaActual));_formaDragState=null;return;}
    if(modoParedes&&_paredDibujando){var c=getCoords(e);savePared(c.x,c.y);return;}
    if(dragState){fbSet('mesas',mesasObj());dragState=null;}
  });
  el.addEventListener('mouseleave',function(){
    if(dragState){fbSet('mesas',mesasObj());dragState=null;}
    _paredDibujando=null;
  });
  el.addEventListener('click',function(e){
    // Mesa click only - paredes handled by document listener
    if(modoParedes)return;
    var mn=e.target.closest('.mesa-node');
    if(!mn)return;
    var mid=parseInt(mn.getAttribute('data-mesaid'));
    if(modoEdicion){abrirEditorMesa(mid);}else{clickMesa(mid);}
  });
}




function mesasObj(){var o={};mesas.forEach(function(m){o[m.id]=m;});return o;}
// Limpia las marcas de "entregado" de cocina de una mesa (al cobrarla o eliminarla)
function limpiarCocinaMesa(mesaId){
  var pref=String(mesaId)+'_';var cambio=false;
  Object.keys(cocinaEntregados||{}).forEach(function(k){
    if(k.indexOf(pref)===0){delete cocinaEntregados[k];cambio=true;}
  });
  if(cambio)fbSet('cocinaEntregados',cocinaEntregados);
}
function clickMesa(id){
  if(modoEdicion)return;
  if(modoParedes){modoParedes=false;}
  var m=mesas.find(function(m){return m.id===id;});
  mesaActiva=mesaActiva&&mesaActiva.id===id?null:m;
  catFiltroPed='Todos';_busqPed='';_pedSubAbierta={};
  render();
  if(mesaActiva){
    setTimeout(function(){
      var pp=document.getElementById('panel-pedido');
      if(pp)pp.scrollIntoView({behavior:'smooth',block:'start'});
    },150);
  }
}
function dblMesa(id){if(!modoEdicion)return;abrirEditorMesa(id);}
function cerrarPanel(){mesaActiva=null;_busqPed='';render();}
/* ═══ SONIDOS DEL BAR (por dispositivo): mesa nueva, mesa pagada, todo cobrado ═══ */
var _sndOn=false;
try{_sndOn=localStorage.getItem('_a52_sonidos')==='1';}catch(e){}
var _sndCtx=null;
var _sndPrevOcup=null;   // ids de mesas ocupadas en el snapshot anterior
var _sndPrevVMax=null;   // ts de la venta más reciente conocida
function _sndAudio(){
  if(!_sndCtx){
    try{_sndCtx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}
  }
  if(_sndCtx&&_sndCtx.state==='suspended'){try{_sndCtx.resume();}catch(e){}}
  return _sndCtx;
}
// seq: [[freq, duracionMs, delayMs], ...]
function _beep(seq){
  if(!_sndOn)return;
  var ctx=_sndAudio();if(!ctx)return;
  seq.forEach(function(n){
    var t0=ctx.currentTime+(n[2]||0)/1000;
    var osc=ctx.createOscillator();var g=ctx.createGain();
    osc.type='sine';osc.frequency.value=n[0];
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(0.25,t0+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+n[1]/1000);
    osc.connect(g);g.connect(ctx.destination);
    osc.start(t0);osc.stop(t0+n[1]/1000+0.05);
  });
}
function sonidoMesaNueva(){_beep([[660,150,0],[880,220,140]]);}                    // din-don ascendente
function sonidoMesaPagada(){_beep([[880,90,0],[1175,90,100],[1568,180,200]]);}     // arpegio caja registradora
function sonidoTodoCobrado(){_beep([[988,160,0],[784,160,180],[659,160,360],[523,420,540]]);} // melodía de cierre
function toggleSonidos(){
  _sndOn=!_sndOn;
  try{localStorage.setItem('_a52_sonidos',_sndOn?'1':'0');}catch(e){}
  if(_sndOn){_sndAudio();_beep([[880,120,0],[1175,160,120]]);}  // beep de prueba (desbloquea el audio con el toque)
  showToast(_sndOn?'🔔 Sonidos ACTIVADOS en este equipo<br><span style="font-size:12px;opacity:.85">Mesa nueva · mesa pagada · todo cobrado</span>':'🔕 Sonidos desactivados en este equipo',_sndOn?'#22c55e':'#64748b');
  render();
}
function _mesasOcupadasIds(){
  return mesas.filter(function(m){return (pedidos[m.id]&&pedidos[m.id].length)||(pedidos[String(m.id)]&&pedidos[String(m.id)].length);}).map(function(m){return String(m.id);});
}
// Llamado desde el sync de pedidos: detecta mesas que pasan de vacías a ocupadas
/* ═══ 🔔 NOTIFICACIONES DE ADMINISTRADOR (por dispositivo) ═══ */
var _notifOn=false;
try{_notifOn=localStorage.getItem('_a52_notif')==='1';}catch(e){}
function notifDisponible(){return typeof Notification!=='undefined';}
function a52CampanaPintar(){var b=document.getElementById('a52Campana');if(b){b.textContent=_notifOn?'🔔':'🔕';b.title=_notifOn?'Avisos encendidos en este celular (toque para apagar)':'Encender los avisos en este celular';}}
function toggleNotifAdmin(){
  if(!notifDisponible()){alert('Este navegador no soporta notificaciones.');return;}
  if(_notifOn){
    _notifOn=false;if(A52APP.es)setTimeout(A52APP.fondo,300);
    try{localStorage.setItem('_a52_notif','0');}catch(e){}
    showToast('🔕 Avisos apagados en este equipo','#6b7280');a52CampanaPintar();
    render();return;
  }
  Notification.requestPermission().then(function(perm){
    if(perm==='granted'){
      _notifOn=true;if(A52APP.es){setTimeout(A52APP.fondo,300);A52APP.revisarBateria();}
      try{localStorage.setItem('_a52_notif','1');}catch(e){}
      try{new Notification(NEGOCIO.emoji+' '+NEGOCIO.nombreSimple,{body:'Notificaciones de administrador activas en este equipo.',tag:'a52-test'});}catch(e){}
      a52CampanaPintar();showToast('🔔 Notificaciones activas<br><span style="font-size:12px;opacity:.85">Te avisarán de pedidos y cobros con la app minimizada</span>','#22c55e');
    }else{
      alert('El navegador bloqueó las notificaciones. Revisa los permisos del sitio (candado junto a la dirección) y vuelve a intentar.');
    }
    render();
  });
}
function _notifAdmin(titulo,cuerpo,tag){
  if(!_notifOn||!notifDisponible())return;
  if(!usuarioActivo)return;
  if(!A52APP.oculta())return; // con la app visible ya se ve/oye en pantalla
  if(Notification.permission!=='granted')return;
  try{new Notification(titulo,{body:cuerpo,tag:tag||('a52-'+a52Ahora()),silent:false});}catch(e){}
}
// Detalle de ítems por mesa para poder decir QUÉ se pidió
var _notifPrevItems=null;
function _notifChequearPedidos(){
  var ahora={};
  Object.keys(pedidos||{}).forEach(function(mid){
    (pedidos[mid]||[]).forEach(function(it){
      ahora[mid+'|'+it.uidItem]={qty:it.qty||1,mid:mid,
        nom:it.isCustom?(it.customNombre||'Otro'):it.isCombo?('Combo '+(it.comboNombre||'')):it.isCubetazoMix?(it.cubMixNombre||'Cubetazo mixto'):(function(){var p=menu.find(function(m){return m.id===it.pid;});return (p?p.emoji+' '+p.nombre:'Producto')+(it.cubeta?' 🪣':'');})()};
    });
  });
  if(_notifPrevItems!==null){
    var porMesa={};
    Object.keys(ahora).forEach(function(k){
      var prev=_notifPrevItems[k];
      var dif=ahora[k].qty-(prev?prev.qty:0);
      if(dif>0){
        var mid=ahora[k].mid;
        (porMesa[mid]=porMesa[mid]||[]).push(dif+'× '+ahora[k].nom);
      }
    });
    Object.keys(porMesa).forEach(function(mid){
      var mesa=_nombreMesaNotif(mid);
      _notifAdmin('🍺 Pedido · '+mesa,porMesa[mid].join(', '),'a52-ped-'+mid);
    });
  }
  _notifPrevItems=ahora;
}
function _nombreMesaNotif(mid){
  if(String(mid).indexOf('vr_')===0)return '⚡ Venta rápida';
  var m=(typeof mesas!=='undefined'?mesas:[]).find(function(mm){return String(mm.id)===String(mid);});
  return m?(m.nombre||('Mesa '+m.num)):('Mesa '+mid);
}
function _sndChequearPedidos(){
  var ocup=_mesasOcupadasIds();
  if(_sndPrevOcup!==null){
    var nuevas=ocup.filter(function(id){return _sndPrevOcup.indexOf(id)<0;});
    if(nuevas.length){sonidoMesaNueva();var _nOc=ocup.length;nuevas.forEach(function(id){_notifAdmin('🟢 '+_nombreMesaNotif(id)+' abierta','Van '+_nOc+(_nOc===1?' mesa ocupada':' mesas ocupadas'),'a52-mesas');});}if(A52APP.es)A52APP.fondo();
  }
  _sndPrevOcup=ocup;
}
// Llamado desde el sync de ventas: detecta cobros nuevos y el momento "sin mesas por cobrar"
function _sndChequearVentas(){
  var max=ventas.reduce(function(a,v){return Math.max(a,v.ts||0);},0);
  if(_sndPrevVMax!==null&&max>_sndPrevVMax){
    var nuevas=ventas.filter(function(v){return v.ts>_sndPrevVMax&&!v.esPagoCredito;});
    if(nuevas.length){
      nuevas.forEach(function(v){
        var fpN=(FPAGO.find(function(f){return f.id===v.fp;})||{}).label||v.fp||'';
        _notifAdmin('💰 Cobro · '+(v.mesa||'Venta'),fmt(v.total||0).replace(/\u00A0/g,' ')+' · '+fpN+(v.uidNombre?' · cobró '+v.uidNombre:''),'a52-cobro-'+(v._fbkey||v.ts));
      });
      sonidoMesaPagada();
      // Si tras el cobro no queda ninguna mesa ocupada: melodía de "todo cobrado"
      setTimeout(function(){
        if(_mesasOcupadasIds().length===0)sonidoTodoCobrado();
      },700);
    }
  }
  _sndPrevVMax=max;
}

/* ═══ Venta rápida: cliente sin mesa que paga de una (barra / para llevar) ═══ */
function ventaRapida(vid){
  if(!usuarioActivo)return;
  vid=vid||('vr_'+usuarioActivo.id);
  var due=usuarios.find(function(x){return 'vr_'+x.id===vid;});
  var propia=vid==='vr_'+usuarioActivo.id;
  mesaActiva={id:vid,num:'',nombre:'⚡ Venta rápida'+(!propia&&due?' · '+due.nombre:''),zona:zonaActual,rapida:true};
  catFiltroPed='Todos';_busqPed='';_pedSubAbierta={};
  render();
  setTimeout(function(){
    var pp=document.getElementById('panel-pedido');
    if(pp)pp.scrollIntoView({behavior:'smooth',block:'start'});
  },150);
}

/* Ventas rápidas a medias (de cualquier usuario): cada una vive en pedidos/vr_<usuario> y antes solo la veía su dueño,
   así que la de un mesero que se fue quedaba colgada para siempre. Aquí se ven todas, se abren y se cancelan. */
function vrPuedeCancelar(vid){
  if(!usuarioActivo)return false;
  return usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'||usuarioActivo.rol==='cajero'||vid==='vr_'+usuarioActivo.id;
}
function vrPendientesHtml(){
  var lista=Object.keys(pedidos).filter(function(k){return String(k).indexOf('vr_')===0&&(pedidos[k]||[]).length;});
  if(!lista.length)return '';
  var esMes=usuarioActivo&&usuarioActivo.rol==='mesero';
  return '<div class="card mb12" style="border:1px solid #f5a62355;padding:10px 12px">'
    +'<div style="color:#f5a623;font-weight:800;font-size:12px;margin-bottom:6px">⚡ Ventas rápidas sin cobrar ('+lista.length+')</div>'
    +lista.map(function(k){
      var u=usuarios.find(function(x){return 'vr_'+x.id===k;});
      var ped=pedidos[k]||[],n=ped.reduce(function(a,it){return a+(it.qty||1);},0);
      var propia=usuarioActivo&&k==='vr_'+usuarioActivo.id;
      var puedeAbrir=propia||!esMes;
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--border)">'
        +'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">'+(u?(u.emoji||'')+' '+esc(u.nombre):esc(k))+(propia?' <span style="color:var(--muted);font-weight:600;font-size:11px">(la mía)</span>':'')+'</div>'
        +'<div style="color:var(--muted);font-size:11px">'+n+' ítem'+(n===1?'':'s')+' · '+fmt(totalPedido(k))+'</div></div>'
        +(puedeAbrir?'<button onclick="ventaRapida(\''+k+'\')" style="background:#f5a62318;color:#f5a623;border:1px solid #f5a62344;border-radius:7px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer">Abrir</button>':'')
        +(vrPuedeCancelar(k)?'<button onclick="cancelarVentaRapida(\''+k+'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer">🗑️ Cancelar</button>':'')
      +'</div>';
    }).join('')
  +'</div>';
}
function cancelarVentaRapida(vid){
  if(!vrPuedeCancelar(vid)){showToast('🔒 Solo quien la abrió, el cajero o el administrador pueden cancelar esta venta rápida.','#ef4444',3500);return;}
  var raw=pedidos[vid]||[],ped=Array.isArray(raw)?raw:Object.values(raw);
  var u=usuarios.find(function(x){return 'vr_'+x.id===vid;});
  var total=totalPedido(vid),n=ped.reduce(function(a,it){return a+(it.qty||1);},0);
  if(!confirm('¿Cancelar la venta rápida'+(u?' de '+u.nombre:'')+'?\n\n'+n+' producto'+(n===1?'':'s')+' por '+fmt(total).replace(/\u00A0/g,' ')+'. No se cobra nada y los productos vuelven al inventario. Queda anotado en novedades.'))return;
  ped.forEach(function(it){ajustarStockItem(it,+(it.qty||1),'Venta rápida cancelada: devolución');});
  var det=ped.map(function(it){var p=it.isCustom||it.isCombo?null:menu.find(function(m){return m.id===it.pid;});return (it.qty||1)+'× '+(it.customNombre||it.comboNombre||it.cubMixNombre||(p?p.nombre:'ítem'));}).join(', ');
  fbPush('novedades',{id:'nov_'+Date.now(),ts:Date.now(),mesa:'⚡ Venta rápida'+(u?' · '+u.nombre:''),tipo:'otra',tipoLabel:'⚡ Venta rápida cancelada',monto:total,
    nota:'Cancelada por '+(usuarioActivo?usuarioActivo.nombre:'')+' · productos devueltos al inventario: '+det,uid:usuarioActivo?usuarioActivo.id:'',uidNombre:usuarioActivo?usuarioActivo.nombre:''});
  delete pedidos[vid];
  var rp=ref('pedidos/'+vid);if(rp)rp.set(null);
  if(abonosMesa[vid]){delete abonosMesa[vid];fbSet('abonosMesa',abonosMesa);}
  if(descuentos[vid])delete descuentos[vid];
  if(pedidoLog[vid]){delete pedidoLog[vid];fbSet('pedidoLog/'+vid,null);}
  limpiarCocinaMesa(vid);
  if(mesaActiva&&mesaActiva.id===vid)mesaActiva=null;
  showToast('🗑️ Venta rápida cancelada · '+fmt(total)+' · inventario devuelto','#ef4444');
  render();
}

function abrirTrasladoMesa(){
  if(!mesaActiva)return;
  var origen=mesaActiva;
  // Build list of available target mesas (different from current, in any zone)
  var disponibles=mesas.filter(function(m){
    return m.id!==origen.id;
  });
  var zonaGroups={};
  disponibles.forEach(function(m){
    if(!zonaGroups[m.zona])zonaGroups[m.zona]=[];
    zonaGroups[m.zona].push(m);
  });
  var mesaOpts=Object.keys(zonaGroups).map(function(z){
    var zona=ZONAS.find(function(x){return x.id===z;});
    return'<optgroup label="'+(zona?zona.label:z)+'">'+zonaGroups[z].map(function(m){
      var tieneped=(pedidos[m.id]&&pedidos[m.id].length>0);
      return'<option value="'+m.id+'">'+(m.nombre||'Mesa '+m.num)+(tieneped?' ⚠️ ocupada':'')+'</option>';
    }).join('')+'</optgroup>';
  }).join('');

  modal2('<div style="text-align:center;margin-bottom:16px">'
    +'<div style="font-size:24px">🔀</div>'
    +'<div style="font-weight:800;font-size:16px">Trasladar mesa</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:4px">Desde: '+(origen.nombre||'Mesa '+origen.num)+'</div></div>'
    +'<div style="margin-bottom:16px">'
      +'<div style="color:var(--muted);font-size:12px;margin-bottom:6px">Mover pedido a:</div>'
      +'<select class="inp" id="traslado-dest"><option value="">— Selecciona mesa destino —</option>'+mesaOpts+'</select>'
    +'</div>'
    +'<div style="background:#f5a62318;border:1px solid #f5a62333;border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:12px;color:#f5a623">'
      +'⚠️ Si la mesa destino ya tiene pedido, los items se fusionan.'
    +'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button class="btn btn-green btn-full" onclick="confirmarTrasladoMesa()">✅ Trasladar</button>'
    +'</div>');
}

function confirmarTrasladoMesa(){
  if(!mesaActiva)return;
  var destId=parseInt((document.getElementById('traslado-dest')||{}).value);
  if(!destId){alert('Selecciona la mesa destino.');return;}
  var destMesa=mesas.find(function(m){return m.id===destId;});
  if(!destMesa){alert('Mesa no encontrada.');return;}
  var origenId=mesaActiva.id;
  // Merge pedidos
  var pedOrigen=pedidos[origenId]||[];
  var pedDest=pedidos[destId]||[];
  // Combine: solo fusionar productos simples idénticos (mismo producto, cubeta y variante).
  // Combos, cubetazos mixtos y personalizados se pasan como líneas aparte.
  pedOrigen.forEach(function(it){
    var esEspecial=it.isCombo||it.isCubetazoMix||it.isCustom;
    var existe=esEspecial?-1:pedDest.findIndex(function(d){
      return !d.isCombo&&!d.isCubetazoMix&&!d.isCustom
        &&d.pid===it.pid&&d.cubeta===it.cubeta
        &&(d.varianteNombre||'')===(it.varianteNombre||'');
    });
    if(existe>=0) pedDest[existe].qty+=it.qty;
    else pedDest.push(it);
  });
  // Save dest pedido, clear origen
  pedidos[destId]=pedDest;
  pedidos[origenId]=[];
  var r1=ref('pedidos/'+destId); if(r1)r1.set(pedDest);
  var r2=ref('pedidos/'+origenId); if(r2)r2.set(null);
  // Trasladar también los ABONOS de la mesa origen
  if(abonosMesa[origenId]&&abonosMesa[origenId].length){
    if(!Array.isArray(abonosMesa[destId]))abonosMesa[destId]=abonosMesa[destId]?Object.values(abonosMesa[destId]):[];
    abonosMesa[destId]=abonosMesa[destId].concat(abonosMesa[origenId]);
    delete abonosMesa[origenId];
    fbSet('abonosMesa',abonosMesa);
  }
  // Trasladar el HISTORIAL de pedido y registrar el traslado
  if(!Array.isArray(pedidoLog[destId]))pedidoLog[destId]=pedidoLog[destId]?Object.values(pedidoLog[destId]):[];
  if(Array.isArray(pedidoLog[origenId])&&pedidoLog[origenId].length){
    pedidoLog[destId]=pedidoLog[destId].concat(pedidoLog[origenId]);
    delete pedidoLog[origenId];
    fbSet('pedidoLog/'+origenId,null);
  }
  fbSet('pedidoLog/'+destId,pedidoLog[destId]);
  logPedido(destId,'🔀 Traslado desde '+(mesaActiva.nombre||'Mesa '+mesaActiva.num),null);
  // Migrar marcas de cocina (entregados) de la mesa origen a la destino por ID de item
  var cambioCocina=false;
  pedOrigen.forEach(function(it){
    if(!it.uidItem)return;
    var kOld=origenId+'_'+it.uidItem;
    if(cocinaEntregados[kOld]!=null){
      var kNew=destId+'_'+it.uidItem;
      cocinaEntregados[kNew]=(cocinaEntregados[kNew]||0)+cocinaEntregados[kOld];
      delete cocinaEntregados[kOld];
      cambioCocina=true;
    }
  });
  // Limpiar cualquier marca vieja restante de la mesa origen (items sin uidItem)
  Object.keys(cocinaEntregados||{}).forEach(function(k){
    if(k.indexOf(origenId+'_')===0){delete cocinaEntregados[k];cambioCocina=true;}
  });
  if(cambioCocina)fbSet('cocinaEntregados',cocinaEntregados);
  // Switch active mesa to destination
  mesaActiva=destMesa;
  closeModal2();
  render();
  actualizarColorMesas();
  updateHeader();
}
function cambiarZona(z){zonaActual=z;mesaActiva=null;render();}
function toggleEdicion(){modoEdicion=!modoEdicion;modoParedes=false;mesaActiva=null;render();}
function toggleParedes(){
  modoParedes=!modoParedes;
  modoEdicion=false;
  mesaActiva=null;
  var panel=document.getElementById('paredes-panel');
  if(panel) panel.style.display=modoParedes?'block':'none';
  actualizarParedesPanel();
  render();
}
function actualizarParedesPanel(){
  var panel=document.getElementById('paredes-panel');
  if(!panel)return;
  // Update selected color
  panel.querySelectorAll('.pc').forEach(function(el){
    el.style.border=el.getAttribute('data-pcolor')===_colorPared?'3px solid #fff':'2px solid transparent';
  });
  // Update selected grosor
  panel.querySelectorAll('.pg').forEach(function(el){
    var g=parseInt(el.getAttribute('data-pgrosor'));
    el.style.background=g===_grosorPared?'#38bdf8':'#1a1a2e';
    el.style.color=g===_grosorPared?'#000':'#888';
  });
}
function selColorP(c){_colorPared=c;actualizarParedesPanel();}
function selGrosorP(g){_grosorPared=g;actualizarParedesPanel();}
function deshacerPared(){
  var k=zonaKey(zonaActual);
  var pa=paredesData[k];
  if(pa&&pa.length){
    pa.pop();
    var r=ref('paredes/'+k);
    if(r) r.set(pa.length?pa:null);
    else fbSet('paredes',paredesData);
  }
  render();}
function borrarParedes(){
  var k=zonaKey(zonaActual);
  paredesData[k]=[];
  // Update Firebase directly at zone level
  var r=ref('paredes/'+k);
  if(r) r.set(null);
  else fbSet('paredes',paredesData);
  // Force re-render immediately with local state
  render();
}
function setCatPed(c){catFiltroPed=c;renderSoloPedido();}


