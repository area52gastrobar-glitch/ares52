/* ═══ GESTIÓN DE PROMOCIONES (Admin) ═══ */
function abrirPromos(){window._prEdit=null;renderPromosModal();}
function renderPromosModal(){
  var lista=promos.slice().sort(function(a,b){return (b.on!==false?1:0)-(a.on!==false?1:0);}).map(function(pr){
    var es2=pr.tipo==='2x1';
    var p=es2?null:menu.find(function(m){return String(m.id)===String(pr.prodId);});
    var vig=es2?(pr.on!==false&&_promoEnVentana(pr)):(promoVigente(pr.prodId,pr.tipo||'unidad')===pr);
    var normal=p?((pr.tipo==='cubeta')?(p.cubeta||0):(p.precio||0)):0;
    if(es2){
      return'<div style="background:var(--bg);border:1px solid '+(vig?'#ff5ec888':'var(--border)')+';border-radius:10px;padding:9px 11px;margin-bottom:7px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
          +'<div style="flex:1;min-width:0">'
            +'<div style="font-size:13px;font-weight:800"><span style="background:#ff5ec8;color:#fff;border-radius:5px;padding:1px 7px;font-size:11px;font-weight:900">2x1</span> '+esc(pr.cat||'')+(vig?' <span style="background:#22c55e22;color:#22c55e;border-radius:5px;padding:1px 6px;font-size:9px;font-weight:900">ACTIVA AHORA</span>':'')+'</div>'
            +'<div style="color:var(--muted);font-size:10px;margin-top:1px">'+_promoDiasTxt(pr)+(pr.horaIni&&pr.horaFin?' · '+pr.horaIni+' a '+pr.horaFin:' · todo el día')+'</div>'
          +'</div>'
          +'<button onclick="togglePromo(\''+pr.id+'\')" style="background:'+(pr.on!==false?'#22c55e':'var(--card2)')+';color:'+(pr.on!==false?'#fff':'var(--muted)')+';border:none;border-radius:7px;padding:7px 10px;font-size:10px;font-weight:900;cursor:pointer">'+(pr.on!==false?'ON':'OFF')+'</button>'
          +'<button onclick="editarPromo(\''+pr.id+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:7px 10px;font-size:11px;cursor:pointer">✏️</button>'
          +'<button onclick="eliminarPromo(\''+pr.id+'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:7px 10px;font-size:11px;cursor:pointer">🗑</button>'
        +'</div>'
      +'</div>';
    }
    return'<div style="background:var(--bg);border:1px solid '+(vig?'#22c55e66':'var(--border)')+';border-radius:10px;padding:9px 11px;margin-bottom:7px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
        +'<div style="flex:1;min-width:0">'
          +'<div style="font-size:13px;font-weight:800">'+(pr.tipo==='cubeta'?'🪣 ':'')+esc(p?p.nombre:('#'+pr.prodId))+(vig?' <span style="background:#22c55e22;color:#22c55e;border-radius:5px;padding:1px 6px;font-size:9px;font-weight:900">ACTIVA AHORA</span>':'')+'</div>'
          +'<div style="color:var(--muted);font-size:10px;margin-top:1px">'+_promoDiasTxt(pr)+(pr.horaIni&&pr.horaFin?' · '+pr.horaIni+' a '+pr.horaFin:' · todo el día')+'</div>'
          +'<div style="font-size:11px;margin-top:2px"><span style="color:#f5a623;font-weight:900">🏷️ '+fmt(pr.valor)+'</span> <span style="color:var(--muted);text-decoration:line-through;font-size:10px">'+fmt(normal)+'</span></div>'
        +'</div>'
        +'<div style="display:flex;flex-direction:column;gap:5px">'
          +'<button onclick="togglePromo(\''+pr.id+'\')" style="background:'+(pr.on!==false?'#22c55e':'var(--card2)')+';color:'+(pr.on!==false?'#fff':'var(--muted)')+';border:none;border-radius:6px;padding:4px 10px;font-size:10px;font-weight:800;cursor:pointer">'+(pr.on!==false?'✅ ON':'⭕ OFF')+'</button>'
          +'<div style="display:flex;gap:4px">'
            +'<button onclick="editarPromo(\''+pr.id+'\')" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:6px;padding:4px 8px;font-size:10px;cursor:pointer">✏️</button>'
            +'<button onclick="eliminarPromo(\''+pr.id+'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:6px;padding:4px 8px;font-size:10px;cursor:pointer">🗑️</button>'
          +'</div>'
        +'</div>'
      +'</div>'
    +'</div>';
  }).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🏷️ Promociones</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Precios especiales por días y horas. El mesero las ve marcadas 🏷️ y el precio se aplica solo mientras la promo está vigente.</div>'
    +(lista||'<div style="color:var(--dim);text-align:center;padding:14px;font-size:12px">Sin promociones creadas.</div>')
    +'<button class="btn btn-green btn-full" style="margin-top:8px" onclick="editarPromo(null)">+ Nueva promoción</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cerrar</button>');
}
function editarPromo(id){
  var pr=id?promos.find(function(x){return x.id===id;}):null;
  window._prEdit={id:id,prodId:pr?pr.prodId:null,tipo:pr?(pr.tipo||'unidad'):'unidad',valor:pr?pr.valor:0,
    cat:pr?(pr.cat||''):'',
    dias:pr?(pr.dias||[]).slice():[],horaIni:pr?(pr.horaIni||''):'',horaFin:pr?(pr.horaFin||''):'',busq:''};
  renderPromoForm();
}
function renderPromoForm(){
  var e=window._prEdit;
  var es2x1=e.tipo==='2x1';
  var modoHtml='<div style="display:flex;gap:8px;margin-bottom:12px">'
    +'<button onclick="window._prEdit.tipo=\'unidad\';renderPromoForm();" style="flex:1;background:'+(!es2x1?'#f5a623':'var(--bg)')+';color:'+(!es2x1?'#1a1a22':'var(--muted)')+';border:1px solid '+(!es2x1?'#f5a623':'var(--border)')+';border-radius:9px;padding:10px 0;font-weight:900;font-size:12px;cursor:pointer">🏷️ Precio especial</button>'
    +'<button onclick="window._prEdit.tipo=\'2x1\';renderPromoForm();" style="flex:1;background:'+(es2x1?'#ff5ec8':'var(--bg)')+';color:'+(es2x1?'#fff':'var(--muted)')+';border:1px solid '+(es2x1?'#ff5ec8':'var(--border)')+';border-radius:9px;padding:10px 0;font-weight:900;font-size:12px;cursor:pointer">🍹 2x1</button>'
  +'</div>';
  if(es2x1){
    var catsP=menu.reduce(function(a,m){if(m.cat&&a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
    var horas2='';for(var h2=0;h2<24;h2++){['00','30'].forEach(function(mm2){var v2=('0'+h2).slice(-2)+':'+mm2;horas2+='<option value="'+v2+'">'+v2+'</option>';});}
    var diasHtml2='<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Días de la promo</div><div style="display:flex;gap:5px;margin-bottom:10px">'
      +DIAS_SEMANA.map(function(d){
        var sel=e.dias.indexOf(d.n)>=0;
        return'<button onclick="var i=window._prEdit.dias.indexOf('+d.n+');if(i>=0)window._prEdit.dias.splice(i,1);else window._prEdit.dias.push('+d.n+');renderPromoForm();" style="flex:1;background:'+(sel?'#ff5ec8':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'#ff5ec8':'var(--border)')+';border-radius:8px;padding:9px 0;font-weight:900;font-size:12px;cursor:pointer">'+d.l+'</button>';
      }).join('')+'</div>';
    modal1('<div style="font-weight:800;font-size:16px;margin-bottom:10px">'+(e.id?'✏️ Editar promoción':'🏷️ Nueva promoción')+'</div>'
      +modoHtml
      +'<div style="background:#ff5ec812;border:1px solid #ff5ec833;border-radius:9px;padding:8px 11px;margin-bottom:10px;font-size:11px;color:var(--muted)">🍹 <b style="color:#ff5ec8">2x1</b>: el cliente pide 2 y paga 1 (con 3 paga 2, con 4 paga 2). Se aplica solo al agregar productos de la categoría elegida en las mesas, y sale destacada en la carta y los links.</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Categoría del 2x1</div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'
        +catsP.map(function(c){var sel=e.cat===c;return'<button onclick="window._prEdit.cat=\''+esc(c).replace(/\'/g,"\\'")+'\';renderPromoForm();" style="background:'+(sel?'#ff5ec8':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'#ff5ec8':'var(--border)')+';border-radius:8px;padding:8px 13px;font-weight:800;font-size:12px;cursor:pointer">'+esc(c)+'</button>';}).join('')
      +'</div>'
      +diasHtml2
      +'<div style="display:flex;gap:8px;margin-bottom:4px">'
        +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Desde (hora)</div><select class="inp" id="pr-hini"><option value="">Todo el día</option>'+horas2.replace('value="'+e.horaIni+'"','value="'+e.horaIni+'" selected')+'</select></div>'
        +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Hasta (hora)</div><select class="inp" id="pr-hfin"><option value="">Todo el día</option>'+horas2.replace('value="'+e.horaFin+'"','value="'+e.horaFin+'" selected')+'</select></div>'
      +'</div>'
      +'<div style="color:var(--muted);font-size:10px;margin-bottom:12px">💡 Ej: martes y miércoles de 14:00 a 20:00.</div>'
      +'<button class="btn btn-full" onclick="guardarPromo()" style="background:#ff5ec8;color:#fff;border:none;font-weight:900">💾 Guardar promoción 2x1</button>'
      +'<button class="btn btn-full" onclick="renderPromosModal()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">← Volver</button>');
    return;
  }
  var p=e.prodId?menu.find(function(m){return String(m.id)===String(e.prodId);}):null;
  var q=_normTxt((e.busq||'').trim());
  var matches=(!p&&q)?menu.filter(function(m){return _normTxt(m.nombre).indexOf(q)>=0;}).slice(0,6):[];
  var prodHtml=p
    ?'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border:1px solid var(--accent)66;border-radius:9px;padding:9px 12px;margin-bottom:10px">'
      +'<span style="font-weight:800;font-size:13px">'+p.emoji+' '+esc(p.nombre)+'</span>'
      +'<button onclick="window._prEdit.prodId=null;window._prEdit.tipo=\'unidad\';renderPromoForm();" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:12px">cambiar</button></div>'
    :'<input class="inp" id="pr-busq" placeholder="🔍 Buscar producto (ej: miller...)" value="'+esc(e.busq||'')+'" oninput="window._prEdit.busq=this.value;_debounceBusq(function(){renderPromoForm();_refocusBusq(\'pr-busq\');})" style="margin-bottom:6px"/>'
      +matches.map(function(m){return'<button onclick="window._prEdit.prodId='+m.id+';window._prEdit.busq=\'\';renderPromoForm();" style="display:flex;justify-content:space-between;width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 11px;margin-bottom:4px;cursor:pointer;color:var(--text)"><span style="font-size:12px;font-weight:700">'+m.emoji+' '+esc(m.nombre)+'</span><span style="color:var(--muted);font-size:11px">'+fmt(m.precio)+(m.cubeta?' · 🪣'+fmt(m.cubeta):'')+'</span></button>';}).join('');
  var tieneCubeta=p&&p.esCerveza&&p.cubeta;
  var tipoHtml=p?'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿A qué precio aplica?</div><div style="display:flex;gap:8px;margin-bottom:10px">'
    +'<button onclick="window._prEdit.tipo=\'unidad\';renderPromoForm();" style="flex:1;background:'+(e.tipo==='unidad'?'var(--accent)':'var(--bg)')+';color:'+(e.tipo==='unidad'?'#fff':'var(--muted)')+';border:1px solid '+(e.tipo==='unidad'?'var(--accent)':'var(--border)')+';border-radius:9px;padding:9px 0;font-weight:800;font-size:12px;cursor:pointer">Unidad ('+fmt(p.precio)+')</button>'
    +(tieneCubeta?'<button onclick="window._prEdit.tipo=\'cubeta\';renderPromoForm();" style="flex:1;background:'+(e.tipo==='cubeta'?'#22c55e':'var(--bg)')+';color:'+(e.tipo==='cubeta'?'#fff':'var(--muted)')+';border:1px solid '+(e.tipo==='cubeta'?'#22c55e':'var(--border)')+';border-radius:9px;padding:9px 0;font-weight:800;font-size:12px;cursor:pointer">🪣 Cubetazo ('+fmt(p.cubeta)+')</button>':'')
  +'</div>':'';
  var diasHtml='<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Días de la promo</div><div style="display:flex;gap:5px;margin-bottom:10px">'
    +DIAS_SEMANA.map(function(d){
      var sel=e.dias.indexOf(d.n)>=0;
      return'<button onclick="var i=window._prEdit.dias.indexOf('+d.n+');if(i>=0)window._prEdit.dias.splice(i,1);else window._prEdit.dias.push('+d.n+');renderPromoForm();" style="flex:1;background:'+(sel?'#f5a623':'var(--bg)')+';color:'+(sel?'#1a1a22':'var(--muted)')+';border:1px solid '+(sel?'#f5a623':'var(--border)')+';border-radius:8px;padding:9px 0;font-weight:900;font-size:12px;cursor:pointer">'+d.l+'</button>';
    }).join('')+'</div>';
  var horas='';for(var h=0;h<24;h++){['00','30'].forEach(function(mm){var v=('0'+h).slice(-2)+':'+mm;horas+='<option value="'+v+'">'+v+'</option>';});}
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:10px">'+(e.id?'✏️ Editar promoción':'🏷️ Nueva promoción')+'</div>'
    +modoHtml
    +prodHtml+tipoHtml
    +(p?'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Precio de promoción</div>'
      +'<input class="inp money" id="pr-valor" type="text" inputmode="numeric" value="'+(e.valor?moneyFmt(e.valor):'')+'" placeholder="Ej: 30.000" style="margin-bottom:10px"/>'
      +diasHtml
      +'<div style="display:flex;gap:8px;margin-bottom:4px">'
        +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Desde (hora)</div><select class="inp" id="pr-hini"><option value="">Todo el día</option>'+horas.replace('value="'+e.horaIni+'"','value="'+e.horaIni+'" selected')+'</select></div>'
        +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Hasta (hora)</div><select class="inp" id="pr-hfin"><option value="">Todo el día</option>'+horas.replace('value="'+e.horaFin+'"','value="'+e.horaFin+'" selected')+'</select></div>'
      +'</div>'
      +'<div style="color:var(--muted);font-size:10px;margin-bottom:12px">💡 Si "Hasta" es menor que "Desde" (ej: 20:00 → 02:00), la promo cubre la noche y cruza la medianoche.</div>'
      +'<button class="btn btn-green btn-full" onclick="guardarPromo()">💾 Guardar promoción</button>':'')
    +'<button class="btn btn-full" onclick="renderPromosModal()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">← Volver</button>');
}
function guardarPromo(){
  var e=window._prEdit;
  var hini=(document.getElementById('pr-hini')||{}).value||'';
  var hfin=(document.getElementById('pr-hfin')||{}).value||'';
  if((hini&&!hfin)||(!hini&&hfin)){alert('Define las dos horas, o deja ambas en "Todo el día".');return;}
  if(!e.dias.length){alert('Elige al menos un día.');return;}
  var pr;
  if(e.tipo==='2x1'){
    if(!e.cat){alert('Elige la categoría del 2x1.');return;}
    pr={id:e.id||('pr_'+a52Ahora()),tipo:'2x1',cat:e.cat,dias:e.dias.slice(),horaIni:hini,horaFin:hfin,on:true};
  }else{
    if(!e.prodId){alert('Elige el producto.');return;}
    var valor=moneyVal('pr-valor')||0;
    if(valor<=0){alert('Escribe el precio de la promoción.');return;}
    pr={id:e.id||('pr_'+a52Ahora()),prodId:e.prodId,tipo:e.tipo||'unidad',valor:valor,dias:e.dias.slice(),horaIni:hini,horaFin:hfin,on:true};
  }
  var i=promos.findIndex(function(x){return x.id===pr.id;});
  if(i>=0){pr.on=promos[i].on!==false;promos[i]=pr;}else promos.push(pr);
  var ob={};promos.forEach(function(x){ob[x.id]=x;});fbSet('promos',ob);
  showToast('🏷️ Promoción guardada','#22c55e');
  renderPromosModal();
}
function togglePromo(id){
  var pr=promos.find(function(x){return x.id===id;});if(!pr)return;
  pr.on=(pr.on===false);
  var ob={};promos.forEach(function(x){ob[x.id]=x;});fbSet('promos',ob);
  renderPromosModal();
}
function eliminarPromo(id){
  if(!confirm('¿Eliminar esta promoción?'))return;
  promos=promos.filter(function(x){return x.id!==id;});
  var ob={};promos.forEach(function(x){ob[x.id]=x;});fbSet('promos',promos.length?ob:null);
  renderPromosModal();
}

/* ═══ Saldo actual por medio de pago (misma fórmula de la pestaña Caja) ═══ */
function saldoActualFP(fpId){
  var porFP=0;
  ventasTurno().forEach(function(v){
    if(v.pagos&&v.pagos.length){v.pagos.forEach(function(p){if(p.fp===fpId)porFP+=(p.monto||0);});}
    else if(v.fp===fpId){porFP+=v.total;}
  });
  var gFP=0;
  gastosTurno().forEach(function(g){if((g.fp||'efectivo')===fpId)gFP+=g.valor;});
  return (cajaHoy['ini_'+fpId]||0)+porFP-gFP;
}

/* ═══ Mover dinero entre medios de pago (Nequi→Bre-B, Efectivo→Bre-B, etc.) ═══ */
function _tarjetaPorDia(nDias){
  // Recibido con tarjeta por día calendario (todas las ventas, no solo el turno)
  var porDia={};
  ventas.forEach(function(v){
    var pagos=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
    pagos.forEach(function(p){
      if(p.fp!=='tarjeta')return;
      var d=_concilDia(new Date(v.ts));
      porDia[d]=(porDia[d]||0)+(p.monto||0);
    });
  });
  var dias=Object.keys(porDia).sort().reverse().slice(0,nDias||8);
  return dias.map(function(d){return{dia:d,monto:porDia[d]};});
}
function _tarjetaDiasPend(){
  // Por día: recibido y cuánto queda pendiente (lo ya trasladado cubre primero los días más viejos)
  var porDia={};
  ventas.forEach(function(v){
    var pagos=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
    pagos.forEach(function(p){
      if(p.fp!=='tarjeta')return;
      var d=_concilDia(new Date(v.ts));
      porDia[d]=(porDia[d]||0)+(p.monto||0);
    });
  });
  var tra=0;
  trasladosFP.forEach(function(t){if(t.de==='tarjeta')tra+=(t.monto||0);});
  var dias=Object.keys(porDia).sort();   // viejo → nuevo
  var out=[];
  dias.forEach(function(d){
    var rec=porDia[d];
    var cubre=Math.min(rec,tra);
    tra-=cubre;
    out.push({dia:d,recibido:rec,pendiente:rec-cubre});
  });
  return out.reverse().slice(0,10);      // nuevo → viejo, últimos 10 días
}
function _tarjetaPendienteTraslado(){
  var rec=0;
  ventas.forEach(function(v){
    var pagos=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
    pagos.forEach(function(p){if(p.fp==='tarjeta')rec+=(p.monto||0);});
  });
  var tra=0;
  trasladosFP.forEach(function(t){if(t.de==='tarjeta')tra+=(t.monto||0);});
  return rec-tra;
}
function _actividadTurno(){
  // Primera y última acción de cada persona en el turno (cobros, pedidos, novedades, gastos, traslados)
  if(window._actCache&&a52Ahora()-window._actCache.ts<5000)return window._actCache.map;
  var desde=turnoInicio||0;
  var map={};
  var marca=function(nombre,ts){
    if(!nombre||!ts||ts<desde)return;
    if(!map[nombre])map[nombre]={min:ts,max:ts,n:0};
    if(ts<map[nombre].min)map[nombre].min=ts;
    if(ts>map[nombre].max)map[nombre].max=ts;
    map[nombre].n++;
  };
  ventasTurno().forEach(function(v){
    marca(v.uidNombre,v.ts);
    (v.abonos?(Array.isArray(v.abonos)?v.abonos:Object.values(v.abonos)):[]).forEach(function(a){marca(a.nombre,a.ts);});
  });
  Object.keys(pedidoLog||{}).forEach(function(mid){
    (pedidoLog[mid]||[]).forEach(function(l){marca(l.uidNombre,l.ts);});
  });
  novedades.forEach(function(n){marca(n.uidNombre,n.ts);});
  gastosTurno().forEach(function(g){marca(g.uidNombre,g.ts);});
  trasladosFP.forEach(function(t){marca(t.uidNombre,t.ts);});
  window._actCache={ts:a52Ahora(),map:map};
  return map;
}
function abrirTrasladoFP(){
  var chips=FPV().map(function(f){
    return f.emoji+' '+f.label+': <b style="color:'+f.color+'">'+fmt(saldoActualFP(f.id))+'</b>';
  }).join(' · ');
  var opts=function(sel){return FPV().map(function(f){return'<option value="'+f.id+'"'+(f.id===sel?' selected':'')+'>'+f.emoji+' '+f.label+'</option>';}).join('');};
  var ultimos=trasladosFP.slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,8).map(function(t){
    var fD=FPAGO.find(function(x){return x.id===t.de;});var fA=FPAGO.find(function(x){return x.id===t.a;});
    return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:4px 0;border-bottom:1px solid var(--border)">'
      +'<span>'+(fD?fD.emoji:'')+' → '+(fA?fA.emoji+' '+fA.label:'')+' <span style="font-size:9px">'+fmtFechaCorta(t.ts)+' · '+esc(t.uidNombre||'')+'</span></span>'
      +'<span style="font-weight:700">'+fmt(t.monto)+'</span></div>';
  }).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🔄 Mover dinero entre medios</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">'+chips+'</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:10px">'
      +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Sale de</div><select class="inp" id="tfp-de" onchange="window._tfpDe=this.value;window._tfpA=(document.getElementById(\'tfp-a\')||{}).value;abrirTrasladoFP();">'+opts(window._tfpDe||'nequi')+'</select></div>'
      +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Entra a</div><select class="inp" id="tfp-a">'+opts(window._tfpA||'breb')+'</select></div>'
    +'</div>'
    +((window._tfpDe||'nequi')==='tarjeta'?(function(){
      var dias=_tarjetaDiasPend();
      var pend=_tarjetaPendienteTraslado();
      if(!dias.length)return'<div style="background:#f5a62310;border:1px solid #f5a62333;border-radius:10px;padding:9px 12px;margin-bottom:10px;font-size:11px;color:var(--muted)">💳 Aún no hay pagos con tarjeta registrados.</div>';
      var DIASN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      return'<div style="background:#f5a62310;border:1px solid #f5a62333;border-radius:10px;padding:9px 12px;margin-bottom:10px">'
        +'<div style="font-size:11px;font-weight:800;color:#f5a623;margin-bottom:2px">💳 Tarjeta por día — recibido y pendiente por pasar</div>'
        +'<div style="color:var(--muted);font-size:10px;margin-bottom:6px">El datáfono consigna al día siguiente. Toca "→ pasar" en el día que ya te ingresó al banco.</div>'
        +dias.map(function(x){
          var f=new Date(x.dia+'T12:00:00');
          var fecha=DIASN[f.getDay()]+' '+('0'+f.getDate()).slice(-2)+'/'+('0'+(f.getMonth()+1)).slice(-2);
          var estado=x.pendiente<=0
            ?'<span style="color:#22c55e;font-size:10px;font-weight:800">✅ trasladado</span>'
            :(x.pendiente<x.recibido?'<span style="color:#f5a623;font-size:10px;font-weight:800">falta '+fmt(x.pendiente)+'</span>':'');
          var btn=x.pendiente>0
            ?'<button onclick="trasladarTarjetaDia(\''+x.dia+'\','+x.pendiente+')" style="background:#22c55e;color:#fff;border:none;border-radius:7px;padding:6px 10px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap">→ pasar '+fmt(x.pendiente)+'</button>'
            :'';
          return'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">'
            +'<div style="flex:1;min-width:0"><div style="font-size:11.5px;font-weight:700">'+fecha+' <span style="color:var(--muted);font-weight:600">'+fmt(x.recibido)+'</span></div>'+(estado?'<div>'+estado+'</div>':'')+'</div>'
            +btn
          +'</div>';
        }).join('')
        +'<div style="display:flex;justify-content:space-between;padding:6px 0 1px">'
          +'<span style="font-size:11px;font-weight:900;color:var(--text)">TOTAL PENDIENTE</span>'
          +'<span style="font-weight:900;color:#22c55e;font-size:13px">'+fmt(Math.max(0,pend))+'</span>'
        +'</div>'
      +'</div>';
    })():(function(){
      var pend=_tarjetaPendienteTraslado();
      if(pend<=0)return'';
      return'<div onclick="window._tfpDe=\'tarjeta\';window._tfpA=(document.getElementById(\'tfp-a\')||{}).value||\'breb\';abrirTrasladoFP();" style="background:#f5a62315;border:1px dashed #f5a62366;border-radius:9px;padding:7px 11px;margin-bottom:10px;font-size:11px;cursor:pointer">💳 Tienes <b style="color:#f5a623">'+fmt(pend)+'</b> de tarjeta pendientes por pasar — toca aquí para verlos por día</div>';
    })())
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto</div>'
    +'<input class="inp money" id="tfp-monto" type="text" inputmode="numeric" placeholder="0"/></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarTrasladoFP()">🔄 Mover el dinero</button>'
    +(ultimos?'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin:14px 0 4px">ÚLTIMOS TRASLADOS</div>'+ultimos:''));
}
function trasladarTarjetaDia(dia,monto){
  var a=(document.getElementById('tfp-a')||{}).value||'breb';
  if(a==='tarjeta'){alert('Elige otro destino (arriba en "Entra a").');return;}
  monto=parseInt(monto)||0;
  if(monto<=0)return;
  var f=new Date(dia+'T12:00:00');
  var DIASN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var fA=FPAGO.find(function(x){return x.id===a;});
  if(!confirm('¿Pasar '+fmt(monto).replace(/\u00A0/g,' ')+' de 💳 Tarjeta a '+(fA?fA.emoji+' '+fA.label:a)+'?\n(recibido el '+DIASN[f.getDay()]+' '+('0'+f.getDate()).slice(-2)+'/'+('0'+(f.getMonth()+1)).slice(-2)+')'))return;
  cajaHoy['ini_tarjeta']=(cajaHoy['ini_tarjeta']||0)-monto;
  cajaHoy['ini_'+a]=(cajaHoy['ini_'+a]||0)+monto;
  fbSet('cajaHoy',cajaHoy);
  var reg={ts:a52Ahora(),de:'tarjeta',a:a,monto:monto,dia:dia,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  trasladosFP.push(reg);
  var r=ref('trasladosFP');if(r)r.push(reg);else fbSet('trasladosFP',trasladosFP);
  showToast('💳 '+fmt(monto)+' pasados a '+(fA?fA.emoji+' '+fA.label:a)+'<br><span style="font-size:12px;opacity:.85">tarjeta del '+dia+'</span>','#22c55e');
  abrirTrasladoFP();
  render();
}
function confirmarTrasladoFP(){
  var de=(document.getElementById('tfp-de')||{}).value;
  var a=(document.getElementById('tfp-a')||{}).value;
  var monto=moneyVal('tfp-monto')||0;
  if(!de||!a)return;
  if(de===a){alert('Elige dos medios distintos.');return;}
  if(monto<=0){alert('Escribe el monto.');return;}
  var disp=saldoActualFP(de);
  if(monto>disp){alert('No hay saldo suficiente en '+de+' (disponible: '+fmt(disp)+').');return;}
  cajaHoy['ini_'+de]=(cajaHoy['ini_'+de]||0)-monto;
  cajaHoy['ini_'+a]=(cajaHoy['ini_'+a]||0)+monto;
  fbSet('cajaHoy',cajaHoy);
  var reg={ts:a52Ahora(),de:de,a:a,monto:monto,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  trasladosFP.push(reg);
  var r=ref('trasladosFP');if(r)r.push(reg);else fbSet('trasladosFP',trasladosFP);
  var fD=FPAGO.find(function(x){return x.id===de;});var fA=FPAGO.find(function(x){return x.id===a;});
  closeModal1();
  showToast('🔄 '+fmt(monto)+' movidos<br><span style="font-size:12px;opacity:.85">'+(fD?fD.emoji+' '+fD.label:de)+' → '+(fA?fA.emoji+' '+fA.label:a)+'</span>','#06B6D4');
  render();
}

/* ═══ Préstamos de socios al negocio (dinero o compras, para devolver) ═══ */
function abrirPrestamoSocio(){
  window._psSocio=window._psSocio||socDlg();window._psTipo=window._psTipo||'dinero';
  renderPrestamoModal();
}
function renderPrestamoModal(){
  var socioBtn=function(n){var sel=window._psSocio===n;
    return'<button onclick="window._psSocio=\''+n+'\';renderPrestamoModal();" style="flex:1;background:'+(sel?'var(--accent)':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:10px;padding:10px 0;font-weight:800;font-size:13px;cursor:pointer">'+n+'</button>';};
  var tipoBtn=function(t,lbl){var sel=window._psTipo===t;
    return'<button onclick="window._psTipo=\''+t+'\';renderPrestamoModal();" style="flex:1;background:'+(sel?'#22c55e':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'#22c55e':'var(--border)')+';border-radius:10px;padding:10px 0;font-weight:800;font-size:12px;cursor:pointer">'+lbl+'</button>';};
  var fpOpts=FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🤝 Registrar préstamo de socio</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">El socio le presta al negocio. Queda pendiente hasta que el negocio se lo devuelva.</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Quién presta?</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:10px">'+SOCIOS.map(function(x){return socioBtn(x.id);}).join('')+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Qué prestó?</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:10px">'+tipoBtn('dinero','💵 Dinero a la caja')+tipoBtn('compra','🛒 Compra / pagó algo')+'</div>'
    +(window._psTipo==='dinero'
      ?'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿A qué medio entró el dinero?</div><select class="inp" id="ps-fp" style="margin-bottom:10px">'+fpOpts+'</select>'
      :'<div style="background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:8px 11px;margin-bottom:10px;color:var(--muted);font-size:11px">El socio pagó con su plata (no entra dinero a la caja). Solo queda la deuda del negocio con él.</div>')
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto</div>'
    +'<input class="inp money" id="ps-monto" type="text" inputmode="numeric" placeholder="0"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Concepto</div>'
    +'<input class="inp" id="ps-concepto" placeholder="Ej: préstamo para nómina, compró licor, pagó arriendo..."/></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarPrestamoSocio()">🤝 Registrar préstamo</button>');
}
function confirmarPrestamoSocio(){
  var monto=moneyVal('ps-monto')||0;
  var concepto=((document.getElementById('ps-concepto')||{}).value||'').trim();
  if(monto<=0){alert('Escribe el monto.');return;}
  if(!concepto){alert('Escribe el concepto (para qué fue).');return;}
  var tipo=window._psTipo||'dinero';
  var fp=tipo==='dinero'?(((document.getElementById('ps-fp')||{}).value)||'efectivo'):'';
  if(tipo==='dinero'){
    cajaHoy['ini_'+fp]=(cajaHoy['ini_'+fp]||0)+monto;
    fbSet('cajaHoy',cajaHoy);
  }
  var reg={id:'ps_'+a52Ahora(),ts:a52Ahora(),socio:window._psSocio||socDlg(),tipo:tipo,monto:monto,fp:fp,concepto:concepto,devuelto:0,devoluciones:[],uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  prestamosSocios.push(reg);
  var r=ref('prestamosSocios');if(r)r.push(reg);else fbSet('prestamosSocios',prestamosSocios);
  var f=FPAGO.find(function(x){return x.id===fp;});
  closeModal1();
  showToast('🤝 Préstamo registrado<br><span style="font-size:12px;opacity:.85">'+esc(reg.socio)+' · '+fmt(monto)+(tipo==='dinero'?' → '+(f?f.emoji+' '+f.label:fp):' (compra)')+'</span>','#22c55e');
  render();
}
function abrirDevolucionPrestamo(pid){
  var p=prestamosSocios.find(function(x){return x.id===pid;});
  if(!p)return;
  var pend=p.monto-(p.devuelto||0);
  var fpOpts=FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+' (disp: '+fmt(saldoActualFP(f.id))+')</option>';}).join('');
  var dev=(p.devoluciones||[]).map(function(d,di){
    var f=FPAGO.find(function(x){return x.id===d.fp;});
    return'<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--muted);padding:2px 0;gap:6px"><span style="flex:1">'+(f?f.emoji+' '+f.label:d.fp)+' · '+fmtFechaCorta(d.ts)+'</span><span style="font-weight:700">'+fmt(d.monto)+'</span>'
      +'<button onclick="eliminarDevolucionPrestamo(\''+p.id+'\','+di+')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:5px;padding:1px 7px;font-size:10px;cursor:pointer">✕</button></div>';
  }).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💸 Devolver préstamo</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:10px">'+esc(p.socio)+' · '+esc(p.concepto)+'<br>Prestó '+fmt(p.monto)+' · pendiente <b style="color:#f5a623">'+fmt(pend)+'</b></div>'
    +(dev?'<div style="background:var(--bg);border-radius:8px;padding:7px 10px;margin-bottom:10px">'+dev+'</div>':'')
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto a devolver</div>'
    +'<input class="inp money" id="dp-monto" type="text" inputmode="numeric" value="'+moneyFmt(pend)+'"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿De qué medio sale?</div>'
    +'<select class="inp" id="dp-fp">'+fpOpts+'</select></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarDevolucionPrestamo(\''+pid+'\')">💸 Registrar devolución</button>');
}
function confirmarDevolucionPrestamo(pid){
  var p=prestamosSocios.find(function(x){return x.id===pid;});
  if(!p)return;
  var monto=moneyVal('dp-monto')||0;
  var fp=(document.getElementById('dp-fp')||{}).value||'efectivo';
  var pend=p.monto-(p.devuelto||0);
  if(monto<=0){alert('Escribe el monto.');return;}
  if(monto>pend){alert('No puedes devolver más de lo pendiente ('+fmt(pend)+').');return;}
  var disp=saldoActualFP(fp);
  if(monto>disp){alert('Saldo insuficiente en ese medio (disponible: '+fmt(disp)+').');return;}
  cajaHoy['ini_'+fp]=(cajaHoy['ini_'+fp]||0)-monto;
  fbSet('cajaHoy',cajaHoy);
  p.devuelto=(p.devuelto||0)+monto;
  p.devoluciones=p.devoluciones||[];
  p.devoluciones.push({ts:a52Ahora(),monto:monto,fp:fp,uidNombre:usuarioActivo.nombre});
  var ob={};prestamosSocios.forEach(function(x){ob[x.id]=x;});fbSet('prestamosSocios',ob);
  var f=FPAGO.find(function(x){return x.id===fp;});
  closeModal1();
  showToast('💸 Devolución registrada<br><span style="font-size:12px;opacity:.85">'+esc(p.socio)+' · '+fmt(monto)+' desde '+(f?f.emoji+' '+f.label:fp)+(p.devuelto>=p.monto?' · ✓ Saldado':'')+'</span>','#22c55e');
  render();
}

/* ═══ Devolver TODO lo pendiente a un socio de una sola vez ═══ */
function abrirDevolucionTotal(socio){
  var pend=prestamosSocios.filter(function(p){return p.socio===socio&&(p.monto-(p.devuelto||0))>0;}).sort(function(a,b){return a.ts-b.ts;});
  if(!pend.length)return;
  var total=pend.reduce(function(a,p){return a+(p.monto-(p.devuelto||0));},0);
  var fpOpts=FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+' (disp: '+fmt(saldoActualFP(f.id))+')</option>';}).join('');
  var filas=pend.map(function(p){
    return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:3px 0;border-bottom:1px solid var(--border)"><span>'+(p.tipo==='compra'?'🛒':'💵')+' '+esc(p.concepto||'')+' <span style="font-size:9px">'+fmtFechaCorta(p.ts)+'</span></span><span style="font-weight:700">'+fmt(p.monto-(p.devuelto||0))+'</span></div>';
  }).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💸 Devolver todo a '+esc(socio)+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">'+pend.length+' préstamo'+(pend.length!==1?'s':'')+' pendiente'+(pend.length!==1?'s':'')+':</div>'
    +'<div style="background:var(--bg);border-radius:9px;padding:8px 11px;margin-bottom:8px">'+filas
      +'<div style="display:flex;justify-content:space-between;font-size:13px;padding-top:6px"><span style="font-weight:800">TOTAL</span><span style="font-weight:900;color:#f5a623">'+fmt(total)+'</span></div>'
    +'</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto a devolver (puedes bajar el valor: se abona del préstamo más viejo al más nuevo)</div>'
    +'<input class="inp money" id="dt-monto" type="text" inputmode="numeric" value="'+moneyFmt(total)+'"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿De qué medio sale?</div>'
    +'<select class="inp" id="dt-fp">'+fpOpts+'</select></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarDevolucionTotal(\''+esc(socio)+'\')">💸 Devolver de una sola vez</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function confirmarDevolucionTotal(socio){
  var pend=prestamosSocios.filter(function(p){return p.socio===socio&&(p.monto-(p.devuelto||0))>0;}).sort(function(a,b){return a.ts-b.ts;});
  if(!pend.length)return;
  var totalPend=pend.reduce(function(a,p){return a+(p.monto-(p.devuelto||0));},0);
  var monto=moneyVal('dt-monto')||0;
  var fp=(document.getElementById('dt-fp')||{}).value||'efectivo';
  if(monto<=0){alert('Escribe el monto.');return;}
  if(monto>totalPend){alert('No puedes devolver más de lo pendiente ('+fmt(totalPend).replace(/\u00A0/g,' ')+').');return;}
  var disp=saldoActualFP(fp);
  if(monto>disp){alert('Saldo insuficiente en ese medio (disponible: '+fmt(disp).replace(/\u00A0/g,' ')+').');return;}
  // Repartir del préstamo más viejo al más nuevo
  var resta=monto;var cubiertos=0;
  pend.forEach(function(p){
    if(resta<=0)return;
    var deuda=p.monto-(p.devuelto||0);
    var abono=Math.min(deuda,resta);
    p.devuelto=(p.devuelto||0)+abono;
    p.devoluciones=p.devoluciones||[];
    p.devoluciones.push({ts:a52Ahora(),monto:abono,fp:fp,uidNombre:usuarioActivo.nombre,nota:'Pago global'});
    resta-=abono;
    if(p.devuelto>=p.monto)cubiertos++;
  });
  cajaHoy['ini_'+fp]=(cajaHoy['ini_'+fp]||0)-monto;
  fbSet('cajaHoy',cajaHoy);
  var ob={};prestamosSocios.forEach(function(x){ob[x.id]=x;});fbSet('prestamosSocios',ob);
  var f=FPAGO.find(function(x){return x.id===fp;});
  closeModal1();
  showToast('💸 '+fmt(monto)+' devueltos a '+esc(socio)+'<br><span style="font-size:12px;opacity:.85">'+(monto>=totalPend?'✓ Todo saldado ('+pend.length+' préstamo'+(pend.length!==1?'s':'')+')':cubiertos+' saldado'+(cubiertos!==1?'s':'')+' · queda pendiente '+fmt(totalPend-monto))+' · desde '+(f?f.emoji+' '+f.label:fp)+'</span>','#22c55e');
  render();
}

/* ═══ Corregir / eliminar préstamos de socios ═══ */
function abrirEditarPrestamo(pid){
  var p=prestamosSocios.find(function(x){return x.id===pid;});
  if(!p)return;
  window._peSocio=p.socio;
  var socioBtn=function(n){var sel=window._peSocio===n;
    return'<button onclick="a52PeSocio(this,\''+n+'\')" style="flex:1;background:'+(sel?'var(--accent)':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:10px;padding:10px 0;font-weight:800;font-size:13px;cursor:pointer">'+n+'</button>';};
  var f=FPAGO.find(function(x){return x.id===p.fp;});
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">✏️ Corregir préstamo</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">'+(p.tipo==='compra'?'🛒 Compra':'💵 Dinero'+(f?' → '+f.emoji+' '+f.label:''))+' · registrado '+fmtFechaCorta(p.ts)+((p.devuelto||0)>0?' · ya devuelto '+fmt(p.devuelto):'')+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Quién prestó?</div>'
    +'<div id="pe-socio-c" style="display:flex;gap:8px;margin-bottom:10px">'+SOCIOS.map(function(x){return socioBtn(x.id);}).join('')+'</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto del préstamo</div>'
    +'<input class="inp money" id="pe-monto" type="text" inputmode="numeric" value="'+moneyFmt(p.monto)+'"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Concepto</div>'
    +'<input class="inp" id="pe-concepto" value="'+esc(p.concepto||'')+'"/></div>'
    +'<button class="btn btn-green btn-full" onclick="guardarEditarPrestamo(\''+pid+'\')">💾 Guardar corrección</button>'
    +'<button class="btn btn-full" onclick="eliminarPrestamo(\''+pid+'\')" style="background:#ef444418;border:1px solid #ef444444;color:#ef4444;margin-top:8px">🗑️ Eliminar préstamo (revierte la caja)</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function abrirEditarPrestamoRe(pid){abrirEditarPrestamo(pid);}
function guardarEditarPrestamo(pid){
  var p=prestamosSocios.find(function(x){return x.id===pid;});
  if(!p)return;
  var monto=moneyVal('pe-monto')||0;
  var concepto=((document.getElementById('pe-concepto')||{}).value||'').trim();
  if(monto<=0){alert('Escribe el monto.');return;}
  if(monto<(p.devuelto||0)){alert('El monto no puede ser menor que lo ya devuelto ('+fmt(p.devuelto||0)+'). Elimina primero las devoluciones si toca corregirlas.');return;}
  if(!concepto){alert('Escribe el concepto.');return;}
  // Si el préstamo fue de DINERO y cambió el monto: ajustar la caja por la diferencia
  if(p.tipo==='dinero'&&monto!==p.monto){
    var dif=monto-p.monto;
    cajaHoy['ini_'+(p.fp||'efectivo')]=(cajaHoy['ini_'+(p.fp||'efectivo')]||0)+dif;
    fbSet('cajaHoy',cajaHoy);
  }
  p.monto=monto;
  p.concepto=concepto;
  p.socio=window._peSocio||p.socio;
  var ob={};prestamosSocios.forEach(function(x){ob[x.id]=x;});fbSet('prestamosSocios',ob);
  closeModal1();
  showToast('✏️ Préstamo corregido<br><span style="font-size:12px;opacity:.85">'+esc(p.socio)+' · '+fmt(p.monto)+'</span>','#38bdf8');
  render();
}
function eliminarPrestamo(pid){
  var p=prestamosSocios.find(function(x){return x.id===pid;});
  if(!p)return;
  var msj='¿Eliminar este préstamo de '+p.socio+' por '+fmt(p.monto).replace(/\u00A0/g,' ')+'?';
  if(p.tipo==='dinero')msj+='\n• El dinero que entró a la caja se retira del saldo.';
  if((p.devuelto||0)>0)msj+='\n• Las devoluciones hechas ('+fmt(p.devuelto).replace(/\u00A0/g,' ')+') vuelven a la caja.';
  if(p.entradas&&p.entradas.length)msj+='\n• Se descuenta del inventario lo que ingresó con esta compra.';
  if(!confirm(msj))return;
  if(p.entradas&&p.entradas.length&&typeof gInvAplicar==='function')gInvAplicar(p.entradas,p.concepto||'',-1);
  // Revertir: el ingreso del préstamo sale de la caja
  if(p.tipo==='dinero'){
    cajaHoy['ini_'+(p.fp||'efectivo')]=(cajaHoy['ini_'+(p.fp||'efectivo')]||0)-p.monto;
  }
  // Revertir devoluciones: ese dinero regresa al medio del que salió
  (p.devoluciones||[]).forEach(function(d){
    cajaHoy['ini_'+(d.fp||'efectivo')]=(cajaHoy['ini_'+(d.fp||'efectivo')]||0)+(d.monto||0);
  });
  fbSet('cajaHoy',cajaHoy);
  prestamosSocios=prestamosSocios.filter(function(x){return x.id!==pid;});
  var ob={};prestamosSocios.forEach(function(x){ob[x.id]=x;});fbSet('prestamosSocios',prestamosSocios.length?ob:null);
  closeModal1();
  showToast('🗑️ Préstamo eliminado · caja revertida','#ef4444');
  render();
}
function eliminarDevolucionPrestamo(pid,idx){
  var p=prestamosSocios.find(function(x){return x.id===pid;});
  if(!p||!p.devoluciones||!p.devoluciones[idx])return;
  var d=p.devoluciones[idx];
  if(!confirm('¿Eliminar esta devolución de '+fmt(d.monto).replace(/\u00A0/g,' ')+'? El dinero vuelve a la caja y el préstamo vuelve a deber ese monto.'))return;
  cajaHoy['ini_'+(d.fp||'efectivo')]=(cajaHoy['ini_'+(d.fp||'efectivo')]||0)+(d.monto||0);
  fbSet('cajaHoy',cajaHoy);
  p.devuelto=Math.max(0,(p.devuelto||0)-(d.monto||0));
  p.devoluciones.splice(idx,1);
  var ob={};prestamosSocios.forEach(function(x){ob[x.id]=x;});fbSet('prestamosSocios',ob);
  showToast('↩️ Devolución eliminada · dinero de vuelta en caja','#f5a623');
  abrirDevolucionPrestamo(pid);
}

function abrirTrasladoTarjeta(){
  var disponible=cajaHoy.ini_tarjeta||0;
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🔄 Trasladar Tarjeta → Bre-B</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:14px">Disponible en tarjeta: <b style="color:#F59E0B">'+fmt(disponible)+'</b></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto a trasladar a Bre-B</div>'
    +'<input class="inp money" id="trasl-valor" type="text" value="'+moneyFmt(disponible)+'" inputmode="numeric"/></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarTraslado()">🔄 Confirmar traslado</button>');
}

function confirmarTraslado(){
  var valor=moneyVal('trasl-valor')||0;
  var disponible=cajaHoy.ini_tarjeta||0;
  if(valor<=0){alert('Escribe el monto.');return;}
  if(valor>disponible){alert('No puedes trasladar más de lo disponible en tarjeta ('+fmt(disponible)+').');return;}
  cajaHoy.ini_tarjeta=(cajaHoy.ini_tarjeta||0)-valor;
  cajaHoy.ini_breb=(cajaHoy.ini_breb||0)+valor;
  fbSet('cajaHoy',cajaHoy);
  closeModal1();
  showToast('🔄 Traslado realizado<br><span style="font-size:12px;opacity:.85">'+fmt(valor)+' de Tarjeta a Bre-B</span>','#06B6D4');
  render();
}

function renderRappi(){
  var esAdmin=usuarioActivo&&usuarioActivo.rol==='admin';

  // Total histórico Rappi (separado de la caja del bar)
  var totalRappi=ventasRappi.reduce(function(a,v){return a+(v.saldo!=null?v.saldo:(v.total||0));},0);
  var hoyRappi=ventasRappi.filter(function(v){var d=new Date(v.ts),h=new Date();return d.toDateString()===h.toDateString();});
  var totalHoyRappi=hoyRappi.reduce(function(a,v){return a+(v.total||0);},0);

  // Pedido en construcción
  var totalPed=_rappiPedido.reduce(function(a,it){return a+(it.valor||0)*it.qty;},0);
  var pedRows=_rappiPedido.map(function(it,idx){
    var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
    return'<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-size:18px">'+(p?p.emoji:'📦')+'</span>'
      +'<div style="flex:1"><div style="font-size:13px;font-weight:600">'+esc(p?p.nombre:it.nombre||'?')+'</div>'
        +'<div style="color:var(--muted);font-size:11px">x'+it.qty+'</div></div>'
      +'<input type="text" inputmode="numeric" class="money" value="'+moneyFmt(it.valor||0)+'" onchange="setValorRappi('+idx+',this.value)" style="width:90px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:5px;font-size:13px;text-align:right" inputmode="numeric"/>'
      +'<button onclick="quitarRappiItem('+idx+')" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:14px">✕</button>'
    +'</div>';
  }).join('');

  // Selector de productos por ACORDEÓN de categorías
  var catsR=menu.reduce(function(a,m){if(a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
  var acordeonRappi=catsR.map(function(cat){
    var prods=menu.filter(function(m){return m.cat===cat;});
    if(!prods.length)return'';
    var abierta=(_rappiCat===cat);
    var head='<button onclick="_rappiCat=(_rappiCat===\''+cat.replace(/'/g,"\\'")+'\'?\'\':\''+cat.replace(/'/g,"\\'")+'\');render()" style="width:100%;text-align:left;background:var(--card);border:1px solid '+(abierta?'#FF6B00':'var(--border)')+';border-radius:10px;padding:11px 14px;font-weight:700;font-size:13px;color:'+(abierta?'#FF6B00':'var(--text)')+';cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
      +'<span>'+esc(cat)+'</span><span style="font-size:11px;color:var(--muted)">'+prods.length+' '+(abierta?'▲':'▼')+'</span></button>';
    var body='';
    if(abierta){
      body='<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px">'+prods.map(function(p){
        var vars=p.variantes?(Array.isArray(p.variantes)?p.variantes:Object.values(p.variantes)):[];
        var pApp=p.precioRappi||p.precio;
        if(vars.length){
          // 📏 Producto con tamaños: un botón por variante (Alitas x8 · x16 · x24) — con precio de apps si lo tiene
          return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px;grid-column:span 2">'
            +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="font-size:16px">'+p.emoji+'</span>'
            +'<span style="font-size:12px;font-weight:700;color:var(--text)">'+esc(p.nombre)+'</span>'
            +'<span style="font-size:9.5px;color:var(--muted)">'+(p.sinStock?(p.disponible!==false?'✅':'🚫 Agotado'):'Stock: '+(parseInt(p.stock)||0))+'</span></div>'
            +'<div style="display:grid;grid-template-columns:repeat('+Math.min(vars.length,3)+',minmax(0,1fr));gap:5px">'
            +vars.map(function(v,vi){
              var vApp=v.precioRappi||v.precio||0;
              return'<button onclick="agregarRappiItem('+p.id+','+vi+')" style="background:#FF6B0014;border:1px solid #FF6B0033;border-radius:8px;padding:6px 4px;cursor:pointer;color:#FF6B00;font-size:10.5px;font-weight:800">'+esc(v.nombre)+'<br><span style="font-weight:700;opacity:.85">'+fmt(vApp)+(v.precioRappi?' 🛵':'')+'</span></button>';
            }).join('')+'</div>'
          +'</div>';
        }
        return'<button onclick="agregarRappiItem('+p.id+')" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px;cursor:pointer;text-align:left;min-width:0">'
          +'<div style="font-size:18px">'+p.emoji+'</div>'
          +'<div style="font-size:12px;font-weight:700;color:var(--text)">'+esc(p.nombre)+'</div>'
          +'<div style="font-size:10px;color:var(--muted)">'+(p.sinStock?(p.disponible!==false?'✅ Disponible':'🚫 Agotado'):'Stock: '+(parseInt(p.stock)||0))+' · '+fmt(pApp)+(p.precioRappi?' 🛵':'')+'</div>'
        +'</button>';
      }).join('')+'</div>';
    }
    return'<div style="margin-bottom:6px">'+head+body+'</div>';
  }).join('');

  return'<div>'
    // KPIs Rappi
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
      +'<div style="background:#FF6B0018;border:2px solid #FF6B0044;border-radius:12px;padding:12px;text-align:center">'
        +'<div style="color:#FF6B00;font-size:10px;font-weight:700">🛵 RAPPI HOY</div>'
        +'<div style="color:#FF6B00;font-weight:900;font-size:20px">'+fmt(totalHoyRappi)+'</div></div>'
      +'<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center">'
        +'<div style="color:var(--muted);font-size:10px;font-weight:700">TOTAL ACUMULADO</div>'
        +'<div style="color:var(--gold);font-weight:900;font-size:20px">'+fmt(totalRappi)+'</div></div>'
    +'</div>'
    +'<div style="background:#FF6B0011;border:1px solid #FF6B0033;border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#FF6B00">🛵 Las ventas de Rappi se manejan aparte y NO entran a la caja ni al cierre del bar. Solo descuentan inventario.</div>'
    // Pedido en construcción
    +'<div class="card mb12">'
      +'<div class="section-title">🛒 Pedido en construcción</div>'
      +'<div style="display:flex;gap:6px;margin-bottom:10px">'
        +Object.keys(APPS_DOMI).map(function(k){
          var a=APPS_DOMI[k];var sel=(_appPlat===k);
          return'<button onclick="_appPlat=\''+k+'\';render()" style="flex:1;background:'+(sel?a.c:'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?a.c:'var(--border)')+';border-radius:9px;padding:8px 2px;font-size:11.5px;font-weight:900;cursor:pointer;white-space:nowrap">'+a.e+' '+a.n+'</button>';
        }).join('')
      +'</div>'
      +(_rappiPedido.length?pedRows:'<div style="color:var(--dim);font-size:12px;text-align:center;padding:14px">Agrega productos abajo</div>')
      +(_rappiPedido.length?'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--accent)33">'
        +'<span style="font-weight:800;font-size:14px">Total cobrado</span>'
        +'<span style="color:#FF6B00;font-weight:900;font-size:20px">'+fmt(totalPed)+'</span></div>'
        +'<button onclick="abrirGaseosaRappi()" style="width:100%;margin-top:10px;background:#22c55e14;color:#22c55e;border:1px dashed #22c55e55;border-radius:9px;padding:8px;font-size:12px;font-weight:800;cursor:pointer">🥤 + Gaseosa INCLUIDA en el combo ($0)</button>'
        +'<div style="margin-top:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">💵 Recibido en EFECTIVO al entregar (opcional — el resto queda esperando la transferencia)</div>'
        +'<input class="inp money" id="rap-efectivo" type="text" value="'+moneyFmt(window._rapEf||0)+'" inputmode="numeric" oninput="window._rapEf=moneyVal(this)"/></div>'
        +'<button onclick="registrarVentaRappi()" style="width:100%;margin-top:10px;background:#FF6B00;color:#fff;border:none;border-radius:10px;padding:12px;font-weight:800;font-size:14px;cursor:pointer">🛵 Registrar venta</button>':'')
    +'</div>'
    // Selector productos
    +'<div style="color:var(--muted);font-size:11px;font-weight:700;margin-bottom:8px">➕ AGREGAR PRODUCTO (toca una categoría)</div>'
    +'<div style="margin-bottom:14px">'+acordeonRappi+'</div>'
    // Cierre de Rappi (manual, cuando Rappi deposita en la cuenta)
    +(esAdmin
      ?'<div style="background:#FF6B0018;border:1px solid #FF6B0033;border-radius:10px;padding:12px;margin-bottom:12px">'
        +'<div style="color:#FF6B00;font-weight:700;font-size:13px;margin-bottom:2px">🔒 Cierre de cuenta Rappi</div>'
        +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Hazlo cada vez que una app (Rappi, Didi, Uber Eats) deposite el dinero. Cada plataforma se cierra por separado y el neto entra a Bre-B 💠. Por consignar (saldos): <b style="color:#FF6B00">'+fmt(totalRappi)+'</b></div>'
        +(totalRappi>0
          ?'<button onclick="cerrarRappi()" style="width:100%;background:#FF6B00;color:#fff;border:none;border-radius:8px;padding:11px;font-weight:800;font-size:14px;cursor:pointer">💰 Registrar depósito y cerrar (dejar en 0)</button>'
          :'<div style="text-align:center;color:var(--muted);font-size:12px;padding:6px">Aún no hay ventas Rappi para cerrar</div>')
      +'</div>'
      :'')
    // Historial ventas Rappi (plegable)
    +'<button data-act="toggle-sec" data-sec="rappiHist" style="width:100%;text-align:left;background:#FF6B0018;border:1px solid #FF6B0033;border-radius:10px;padding:10px 14px;margin-bottom:8px;font-size:12px;color:#FF6B00;font-weight:700;cursor:pointer">'+(_secOpen.rappiHist?'▼':'▶')+' 🧾 Historial de ventas Rappi ('+ventasRappi.length+')</button>'
    +(_secOpen.rappiHist?'<div class="card">'+rappiHistorial()+'</div>':'')
    // Historial de cierres Rappi (plegable)
    +'<button data-act="toggle-sec" data-sec="rappiCierres" style="width:100%;text-align:left;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin:8px 0;font-size:12px;color:var(--text);font-weight:700;cursor:pointer">'+(_secOpen.rappiCierres?'▼':'▶')+' 📋 Historial de cierres Rappi ('+cierresRappi.length+')</button>'
    +(_secOpen.rappiCierres?'<div class="card">'+rappiCierresHistorial()+'</div>':'')
  +'</div>';
}

function agregarRappiItem(pid,vi,recGrupos){
  var p=menu.find(function(m){return Number(m.id)===Number(pid);});
  if(!p)return;
  var vars=p.variantes?(Array.isArray(p.variantes)?p.variantes:Object.values(p.variantes)):[];
  var v=(vi!=null&&vars[vi])?vars[vi]:null;
  var vNom=v?v.nombre:'';
  // 🎛 Receta con grupos (sabores de alitas, etc.): se reparte igual que en la mesa; si no, esas alas no se descontaban
  var gruposRec=(p.receta||[]).filter(function(r){return r.grupo;});
  if(gruposRec.length&&!recGrupos){
    window._repRappi={pid:pid,vi:vi};
    abrirRepartoGrupos(p.id,false,1,vNom||undefined,null);
    return;
  }
  var idx=recGrupos?-1:_rappiPedido.findIndex(function(it){return Number(it.pid)===Number(pid)&&(it.varianteNombre||'')===vNom&&!it.recGrupos;});
  if(idx>=0)_rappiPedido[idx].qty++;
  else _rappiPedido.push({pid:pid,qty:1,valor:(v?(v.precioRappi||v.precio||0):(p.precioRappi||p.precio||0)),
    nombre:p.nombre+(v?' ('+v.nombre+')':'')+(recGrupos&&recGrupos.txt?' · '+recGrupos.txt:''),
    varianteNombre:v?v.nombre:undefined,varianteUnd:v?(parseInt(v.und)||1):undefined,
    recGrupos:recGrupos?recGrupos.recGrupos:undefined});
  render();
}

function abrirGaseosaRappi(){
  // 🥤 Gaseosa que viene incluida en el combo de la app: entra a $0 pero SÍ descuenta inventario
  var gas=menu.filter(function(m){
    var t=_normTxt((m.nombre||'')+' '+(m.cat||'')+' '+(m.subcat||''));
    return t.indexOf('gaseosa')>=0||t.indexOf('refresco')>=0||t.indexOf('soda')>=0;
  }).filter(function(m){return ventaSinStock||m.sinStock?m.disponible!==false:m.stock>0;});
  if(!gas.length){alert('No encontré gaseosas en la carta. Crea el producto (categoría o nombre con "gaseosa") para poder descontarla.');return;}
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:4px">🥤 Gaseosa incluida</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Entra al pedido en $0 (ya está dentro del precio del combo) pero descuenta del inventario.</div>'
    +gas.map(function(p){
      return'<button onclick="agregarGaseosaRappi('+p.id+')" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:7px;cursor:pointer;color:var(--text)">'
        +'<span style="font-weight:800;font-size:13px">'+(p.emoji||'🥤')+' '+esc(p.nombre)+'</span>'
        +'<span style="color:var(--muted);font-size:10.5px">'+(p.sinStock?'✅':'stock '+(parseInt(p.stock)||0))+'</span>'
      +'</button>';
    }).join(''));
}
function agregarGaseosaRappi(pid){
  var p=menu.find(function(m){return Number(m.id)===Number(pid);});
  if(!p)return;
  var nom=p.nombre+' (incluida 🥤)';
  var idx=_rappiPedido.findIndex(function(it){return Number(it.pid)===Number(pid)&&it.nombre===nom;});
  if(idx>=0)_rappiPedido[idx].qty++;
  else _rappiPedido.push({pid:pid,qty:1,valor:0,nombre:nom,incluida:true});
  closeModal2();
  render();
}
function quitarRappiItem(idx){
  _rappiPedido.splice(idx,1);
  render();
}

function setValorRappi(idx,val){
  if(_rappiPedido[idx])_rappiPedido[idx].valor=parseInt(String(val).replace(/[^0-9]/g,''))||0;
  // no render para no perder foco; el total se actualiza al registrar
}

function registrarVentaRappi(){
  if(!_rappiPedido.length){alert('Agrega productos al pedido.');return;}
  var total=_rappiPedido.reduce(function(a,it){return a+(it.valor||0)*it.qty;},0);
  if(total<=0){alert('Asigna un valor a los productos.');return;}
  var efectivo=moneyVal(document.getElementById('rap-efectivo'));
  if(efectivo<0)efectivo=0;
  if(efectivo>total){alert('El efectivo recibido ('+fmt(efectivo).replace(/\u00A0/g,' ')+') no puede superar el total de la venta ('+fmt(total).replace(/\u00A0/g,' ')+').');return;}
  // Descontar inventario por el motor central (solo cuando la venta ya pasó las validaciones; antes se descontaba aunque luego fallara):
  // variantes multiplican, las recetas (insumos) corren en cascada y el reparto de sabores viaja en el ítem
  var aPlat=APPS_DOMI[_appPlat]||APPS_DOMI.rappi;
  _rappiPedido.forEach(function(it){
    ajustarStockItem({pid:it.pid,qty:1,varianteNombre:it.varianteNombre,varianteUnd:it.varianteUnd,recGrupos:it.recGrupos},-it.qty,'Venta '+aPlat.n);
  });
  var venta={id:'rap'+a52Ahora(),ts:a52Ahora(),plataforma:_appPlat,
    items:JSON.parse(JSON.stringify(_rappiPedido)),total:total,
    efectivo:efectivo,saldo:total-efectivo,
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  // 💵 El efectivo recibido entra a la caja de una vez (para que el arqueo lo espere)
  if(efectivo>0){
    cajaHoy['ini_efectivo']=(cajaHoy['ini_efectivo']||0)+efectivo;
    fbSet('cajaHoy',cajaHoy);
  }
  window._rapEf=0;
  ventasRappi.push(venta);
  var r=ref('ventasRappi');if(r)r.push(venta);else fbSet('ventasRappi',ventasRappi);
  _rappiPedido=[];
  var aP=APPS_DOMI[_appPlat]||APPS_DOMI.rappi;
  showToast(aP.e+' Venta '+aP.n+' registrada<br><span style="font-size:12px;opacity:.85">'+fmt(total)+(efectivo>0?' · 💵 '+fmt(efectivo)+' en efectivo (a caja) · ⏳ '+fmt(total-efectivo)+' por transferencia':'')+'</span>',aP.c);
  render();
}

function rappiHistorial(){
  var todas=ventasRappi.slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,100);
  if(!todas.length)return'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin ventas Rappi</div>';
  return todas.map(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    var det=its.map(function(it){var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});return (p?p.emoji+' '+esc(p.nombre):esc(it.nombre||'?'))+' x'+it.qty;}).join(', ');
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:8px 12px;margin-bottom:6px">'
      +'<div style="display:flex;justify-content:space-between"><span style="font-size:11px;color:var(--muted)">'+(function(){var a=APPS_DOMI[v.plataforma||'rappi']||APPS_DOMI.rappi;return'<span style="color:'+a.c+';font-weight:800">'+a.e+' '+a.n+'</span> · ';})()+fmtDT(v.ts)+' · '+esc(v.uidNombre||'')+'</span>'
      +'<span style="color:#FF6B00;font-weight:900;font-size:15px">'+fmt(v.saldo!=null?v.saldo:v.total)+(v.efectivo>0?' <span style="font-size:9.5px;color:#22c55e;font-weight:700">+💵'+fmt(v.efectivo).replace(/\u00A0/g,' ')+'</span>':'')+'</span></div>'
      +'<div style="font-size:11px;color:var(--muted);margin-top:4px">'+det+'</div>'
    +'</div>';
  }).join('');
}

function cerrarRappi(plat){
  // 💰 Las apps consignan por tandas y por separado: elegir plataforma y QUÉ ventas entran en este depósito
  if(!ventasRappi.length){alert('No hay ventas de apps para cerrar.');return;}
  if(plat)_appPlatCierre=plat;
  if(!ventasRappi.some(function(v){return (v.plataforma||'rappi')===_appPlatCierre;})){
    var conVentas=Object.keys(APPS_DOMI).find(function(k){return ventasRappi.some(function(v){return (v.plataforma||'rappi')===k;});});
    if(conVentas)_appPlatCierre=conVentas;
  }
  var aC=APPS_DOMI[_appPlatCierre]||APPS_DOMI.rappi;
  var chipsPlat='<div style="display:flex;gap:6px;margin-bottom:10px">'
    +Object.keys(APPS_DOMI).map(function(k){
      var a=APPS_DOMI[k];var sel=(_appPlatCierre===k);
      var n=ventasRappi.filter(function(v){return (v.plataforma||'rappi')===k;}).length;
      return'<button onclick="cerrarRappi(\''+k+'\')" style="flex:1;background:'+(sel?a.c:'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?a.c:'var(--border)')+';border-radius:9px;padding:7px 2px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap">'+a.e+' '+a.n+(n?' ('+n+')':'')+'</button>';
    }).join('')+'</div>';
  var lista=ventasRappi.filter(function(v){return (v.plataforma||'rappi')===_appPlatCierre;}).sort(function(a,b){return a.ts-b.ts;});
  if(!lista.length){
    modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💰 Cierre de cuenta de apps</div>'+chipsPlat
      +'<div style="color:var(--dim);text-align:center;padding:14px;font-size:12px">Sin ventas pendientes de '+aC.n+'</div>'
      +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cerrar</button>');
    return;
  }
  var filas=lista.map(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    var det=its.map(function(it){return esc((it.nombre||'?'))+' x'+it.qty;}).join(', ');
    return'<label style="display:flex;gap:9px;align-items:flex-start;background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:8px 10px;margin-bottom:6px;cursor:pointer">'
      +'<input type="checkbox" class="rap-sel" data-vid="'+esc(String(v.id))+'" data-total="'+(v.saldo!=null?v.saldo:(v.total||0))+'" checked onchange="_rapSelTotal()" style="margin-top:2px;width:17px;height:17px;accent-color:#FF6B00"/>'
      +'<span style="flex:1;min-width:0">'
        +'<span style="display:flex;justify-content:space-between"><span style="font-size:11px;color:var(--muted)">'+fmtDT(v.ts)+'</span>'
        +'<span style="color:#FF6B00;font-weight:900;font-size:14px">'+fmt(v.saldo!=null?v.saldo:(v.total||0))+'</span></span>'
        +(v.efectivo>0?'<span style="display:block;font-size:10px;color:#22c55e;font-weight:700">💵 '+fmt(v.efectivo).replace(/\u00A0/g,' ')+' ya en efectivo · venta total '+fmt(v.total).replace(/\u00A0/g,' ')+'</span>':'')
        +'<span style="display:block;font-size:10.5px;color:var(--muted);margin-top:2px">'+det+'</span>'
      +'</span>'
    +'</label>';
  }).join('');
  var total=lista.reduce(function(a,v){return a+(v.saldo!=null?v.saldo:(v.total||0));},0);
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💰 Cierre de cuenta · '+aC.e+' '+aC.n+'</div>'
    +chipsPlat
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">Marca las ventas que '+aC.n+' te consignó en este depósito. Las que dejes sin marcar quedan pendientes para el próximo.</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:8px">'
      +'<button onclick="_rapSelTodo(true)" style="flex:1;background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:6px;font-size:11px;color:var(--text);font-weight:700;cursor:pointer">☑ Todas</button>'
      +'<button onclick="_rapSelTodo(false)" style="flex:1;background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:6px;font-size:11px;color:var(--text);font-weight:700;cursor:pointer">☐ Ninguna</button>'
    +'</div>'
    +'<div style="max-height:46vh;overflow-y:auto">'+filas+'</div>'
    +'<button class="btn btn-full" id="rap-cerrar-btn" onclick="confirmarCierreRappiSel()" style="background:#FF6B00;color:#fff;margin-top:10px;font-weight:900">🔒 Cerrar seleccionadas · '+fmt(total)+'</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function _rapSelTotal(){
  var t=0,n=0;
  document.querySelectorAll('.rap-sel').forEach(function(c){if(c.checked){t+=parseInt(c.getAttribute('data-total'))||0;n++;}});
  var b=document.getElementById('rap-cerrar-btn');
  if(b)b.innerHTML='🔒 Cerrar seleccionadas · '+fmt(t).replace(/\u00A0/g,' ')+(n?'':'');
}
function _rapSelTodo(v){
  document.querySelectorAll('.rap-sel').forEach(function(c){c.checked=v;});
  _rapSelTotal();
}
function confirmarCierreRappiSel(){
  var ids=[];
  document.querySelectorAll('.rap-sel').forEach(function(c){if(c.checked)ids.push(c.getAttribute('data-vid'));});
  if(!ids.length){alert('Marca al menos una venta.');return;}
  var sel=ventasRappi.filter(function(v){return ids.indexOf(String(v.id))>=0;});
  var total=sel.reduce(function(a,v){return a+(v.saldo!=null?v.saldo:(v.total||0));},0);
  var aC=APPS_DOMI[_appPlatCierre]||APPS_DOMI.rappi;
  // 💸 Paso 2: ¿cuánto CONSIGNÓ la app? (descuentan comisiones y retenciones) — el neto entra a Bre-B
  window._rapCierreIds=ids;
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:4px">💸 ¿Cuánto consignó '+aC.n+'?</div>'
    +'<div style="color:var(--muted);font-size:11.5px;margin-bottom:12px">Saldo por transferencia: <b style="color:'+aC.c+'">'+fmt(total)+'</b> en '+sel.length+' venta'+(sel.length!==1?'s':'')+' (el efectivo ya entró a la caja al registrarlas). Escribe lo que de verdad llegó — la diferencia queda como descuento de '+aC.n+' y el neto <b style="color:#06B6D4">entra a Bre-B 💠</b>.</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor consignado</div>'
    +'<input class="inp money" id="rap-consignado" type="text" value="'+moneyFmt(total)+'" inputmode="numeric" style="margin-bottom:12px;font-size:18px;font-weight:800"/>'
    +'<button class="btn btn-full" onclick="finalizarCierreRappi()" style="background:'+aC.c+';color:#fff;font-weight:900">🔒 Registrar depósito</button>');
  setTimeout(function(){var el=document.getElementById('rap-consignado');if(el&&el.select)el.select();},80);
}
function finalizarCierreRappi(){
  var ids=window._rapCierreIds||[];
  var sel=ventasRappi.filter(function(v){return ids.indexOf(String(v.id))>=0;});
  var quedan=ventasRappi.filter(function(v){return ids.indexOf(String(v.id))<0;});
  if(!sel.length)return;
  var total=sel.reduce(function(a,v){return a+(v.saldo!=null?v.saldo:(v.total||0));},0);
  var brutoVentas=sel.reduce(function(a,v){return a+(v.total||0);},0);
  var efPrevio=sel.reduce(function(a,v){return a+(v.efectivo||0);},0);
  var consignado=moneyVal(document.getElementById('rap-consignado'));
  if(consignado<=0){alert('Escribe el valor consignado.');return;}
  var descuento=total-consignado;
  var aF=APPS_DOMI[_appPlatCierre]||APPS_DOMI.rappi;
  var quedanPlat=quedan.filter(function(v){return (v.plataforma||'rappi')===_appPlatCierre;}).length;
  if(descuento<0&&!confirm('Consignaron MÁS de lo vendido ('+fmt(consignado).replace(/\u00A0/g,' ')+' vs '+fmt(total).replace(/\u00A0/g,' ')+'). ¿Seguro?'))return;
  if(!confirm('¿Cerrar '+sel.length+' venta'+(sel.length!==1?'s':'')+' de '+aF.n+'?\n\nVenta bruta: '+fmt(brutoVentas).replace(/\u00A0/g,' ')+(efPrevio?'\n💵 Ya en efectivo: '+fmt(efPrevio).replace(/\u00A0/g,' '):'')+'\nSaldo esperado: '+fmt(total).replace(/\u00A0/g,' ')+'\nConsignado: '+fmt(consignado).replace(/\u00A0/g,' ')+'\nDescuento '+aF.n+': '+fmt(Math.max(0,descuento)).replace(/\u00A0/g,' ')+'\n\n💠 El consignado entra a Bre-B en la caja.'+(quedanPlat?'\n\nQuedan '+quedanPlat+' de '+aF.n+' pendientes.':'')))return;
  var porProd={};
  sel.forEach(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    its.forEach(function(it){
      var nombre=it.nombre||'?';
      if(!porProd[nombre])porProd[nombre]={nombre:nombre,qty:0};
      porProd[nombre].qty+=it.qty;
    });
  });
  var cierre={id:'cr'+a52Ahora(),ts:a52Ahora(),plataforma:_appPlatCierre,total:total,brutoVentas:brutoVentas,efectivoPrevio:efPrevio,consignado:consignado,descuentoRappi:Math.max(0,descuento),nVentas:sel.length,
    productos:Object.values(porProd),
    desde:Math.min.apply(null,sel.map(function(v){return v.ts;})),
    hasta:Math.max.apply(null,sel.map(function(v){return v.ts;})),
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  var r=ref('cierresRappi');if(r)r.push(cierre);else fbSet('cierresRappi',cierresRappi.concat([cierre]));
  // 💠 El dinero consignado entra a la caja como Bre-B
  cajaHoy['ini_breb']=(cajaHoy['ini_breb']||0)+consignado;
  fbSet('cajaHoy',cajaHoy);
  // Dejar SOLO las pendientes (regrabar el nodo completo, llaveado por id)
  ventasRappi=quedan;
  if(quedan.length){
    var ob={};quedan.forEach(function(v){ob[v.id]=v;});
    fbSet('ventasRappi',ob);
  }else{
    var rv=ref('ventasRappi');if(rv)rv.set(null);else fbSet('ventasRappi',null);
  }
  closeModal2();closeModal1();
  showToast('🔒 Cierre '+aF.e+' '+aF.n+'<br><span style="font-size:12px;opacity:.85">Vendido '+fmt(total)+' · consignado '+fmt(consignado)+' → 💠 Bre-B'+(descuento>0?' · descuento '+fmt(descuento):'')+'</span>',aF.c);
  render();
}

function rappiCierresHistorial(){
  var cierres=cierresRappi.slice().sort(function(a,b){return b.ts-a.ts;});
  if(!cierres.length)return'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin cierres registrados</div>';
  return cierres.map(function(c){
    var prods=(c.productos||[]).sort(function(a,b){return b.qty-a.qty;});
    var detalle=prods.map(function(p){return esc(p.nombre)+' x'+p.qty;}).join(', ');
    var rango=fmtFecha(c.desde)+(fmtFecha(c.desde)!==fmtFecha(c.hasta)?' al '+fmtFecha(c.hasta):'');
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:10px 12px;margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center">'
        +'<div><div style="font-weight:800;font-size:14px;color:#FF6B00">'+fmt(c.consignado!=null?c.consignado:c.total)+(c.consignado!=null&&c.consignado!==c.total?' <span style="font-size:10px;color:var(--muted);font-weight:600">de '+fmt(c.total).replace(/\u00A0/g,' ')+' vendidos</span>':'')+'</div>'
        +'<div style="color:var(--muted);font-size:11px">'+(function(){var a=APPS_DOMI[c.plataforma||'rappi']||APPS_DOMI.rappi;return'<span style="color:'+a.c+';font-weight:800">'+a.e+' '+a.n+'</span> · ';})()+rango+' · '+c.nVentas+' ventas · '+esc(c.uidNombre||'')+(c.descuentoRappi?' · <span style="color:#ef4444;font-weight:800">−'+fmt(c.descuentoRappi).replace(/\u00A0/g,' ')+' comisión</span>':'')+(c.efectivoPrevio?' · <span style="color:#22c55e;font-weight:700">💵 '+fmt(c.efectivoPrevio).replace(/\u00A0/g,' ')+' fue en efectivo</span>':'')+'</div></div>'
      +'</div>'
      +(detalle?'<div style="color:var(--muted);font-size:11px;margin-top:6px;padding-top:6px;border-top:1px solid var(--border)">'+detalle+'</div>':'')
    +'</div>';
  }).join('');
}

function exportarSaneamientoExcel(){
  var DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var lunes=_sanLunes(_sanSemanaOffset);
  var fechas=[];for(var i=0;i<7;i++){var d=new Date(lunes);d.setDate(d.getDate()+i);fechas.push(d);}
  var rows=[[NEGOCIO.nombre+' - PLAN DE SANEAMIENTO']];
  rows.push(['Semana:',_fechaKey(lunes)+' al '+_fechaKey(fechas[6])]);
  rows.push([]);
  rows.push(['FORMATO 1: VERIFICACIÓN DIARIA']);
  rows.push(['Área/Equipo'].concat(DIAS));
  SAN_AREAS.forEach(function(a){
    var fila=[a.nombre];
    fechas.forEach(function(d){var k=_fechaKey(d)+'_'+a.id;fila.push(saneamientoChecks[k]&&saneamientoChecks[k].check?'X':'');});
    rows.push(fila);
  });
  rows.push([]);
  rows.push(['FORMATO 2: ASEO PROFUNDO SEMANAL']);
  rows.push(['Actividad','Realizado','Fecha/Hora','Responsable']);
  var semKey=_fechaKey(lunes);
  SAN_SEMANAL.forEach(function(s){
    var rec=saneamientoSemanal[semKey+'_'+s.id]||{};
    rows.push([s.nombre,rec.check?'SÍ':'NO',rec.hora||'',rec.uidNombre||'']);
  });
  var csv='\uFEFF';
  rows.forEach(function(r){csv+=r.map(function(v){var s=String(v).replace(/"/g,'""');return (s.indexOf(',')>=0)?'"'+s+'"':s;}).join(',')+'\r\n';});
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download=NEGOCIO.archivo+'-Saneamiento-'+_fechaKey(lunes)+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

function imprimirSaneamiento(){
  var DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var lunes=_sanLunes(_sanSemanaOffset);
  var fechas=[];for(var i=0;i<7;i++){var d=new Date(lunes);d.setDate(d.getDate()+i);fechas.push(d);}
  var semKey=_fechaKey(lunes);
  var filas=SAN_AREAS.map(function(a){
    var celdas=fechas.map(function(d){var k=_fechaKey(d)+'_'+a.id;var m=saneamientoChecks[k]&&saneamientoChecks[k].check;return'<td style="text-align:center;border:1px solid #999;padding:6px">'+(m?'✓':'')+'</td>';}).join('');
    return'<tr><td style="border:1px solid #999;padding:6px;font-size:11px"><b>'+a.nombre+'</b><br><span style="font-size:9px;color:#555">'+a.cond+'</span></td>'+celdas+'</tr>';
  }).join('');
  var semFilas=SAN_SEMANAL.map(function(s){
    var rec=saneamientoSemanal[semKey+'_'+s.id]||{};
    return'<tr><td style="border:1px solid #999;padding:6px;font-size:11px"><b>'+s.nombre+'</b></td><td style="border:1px solid #999;padding:6px;text-align:center">'+(rec.check?'✓':'')+'</td><td style="border:1px solid #999;padding:6px;font-size:10px">'+(rec.hora||'')+'</td><td style="border:1px solid #999;padding:6px;font-size:10px">'+(rec.uidNombre||'')+'</td></tr>';
  }).join('');
  var w=window.open('','_blank');
  w.document.write('<html><head><title>Saneamiento '+M('nombreCorto')+'</title></head><body style="font-family:Arial;padding:20px">'
    +'<h2 style="text-align:center">'+M('nombre')+' — PLAN DE SANEAMIENTO</h2>'
    +'<p style="text-align:center;color:#555">Semana del '+_fechaKey(lunes)+' al '+_fechaKey(fechas[6])+'</p>'
    +'<h3>Formato 1: Verificación Diaria</h3>'
    +'<table style="width:100%;border-collapse:collapse"><thead><tr><th style="border:1px solid #999;padding:6px;text-align:left">Área/Equipo</th>'+DIAS.map(function(d,i){return'<th style="border:1px solid #999;padding:6px">'+d+'<br>'+fechas[i].getDate()+'</th>';}).join('')+'</tr></thead><tbody>'+filas+'</tbody></table>'
    +'<h3 style="margin-top:20px">Formato 2: Aseo Profundo Semanal</h3>'
    +'<table style="width:100%;border-collapse:collapse"><thead><tr><th style="border:1px solid #999;padding:6px;text-align:left">Actividad</th><th style="border:1px solid #999;padding:6px">Realizado</th><th style="border:1px solid #999;padding:6px">Hora</th><th style="border:1px solid #999;padding:6px">Responsable</th></tr></thead><tbody>'+semFilas+'</tbody></table>'
    +'<p style="margin-top:30px;font-size:11px;color:#555">'+[M('direccionCiudad'),NEGOCIO.telefono?'Tel: '+M('telefonoBonito'):'',NEGOCIO.instagram?'@'+M('instagram'):''].filter(Boolean).join(' · ')+'</p>'
    +'<div style="margin-top:40px;display:flex;justify-content:space-between"><div>_______________________<br>Firma Responsable</div><div>_______________________<br>Firma Administrador</div></div>'
    +'</body></html>');
  w.document.close();
  setTimeout(function(){w.print();},400);
}

function _sanLunes(offset){
  // Devuelve el lunes de la semana con el offset dado
  var d=new Date();
  d.setDate(d.getDate()+offset*7);
  var day=d.getDay();  // 0=dom
  var diff=(day===0?-6:1-day);
  d.setDate(d.getDate()+diff);
  d.setHours(0,0,0,0);
  return d;
}
function _fechaKey(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function _semanaKey(lunes){return _fechaKey(lunes);}
// Lunes (Date) a partir de una semanaKey 'YYYY-MM-DD'
function _lunesDeSemKey(semKey){var p=String(semKey).split('-');return new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));}
// semanaKey desplazada n semanas
function _semKeyMas(semKey,n){var d=_lunesDeSemKey(semKey);d.setDate(d.getDate()+7*n);return _fechaKey(d);}
// Calcula el saldo de la semana de un empleado (ganado, préstamos, pagos, ajustes traídos)
function calcSaldoSemana(empId,semKey){
  var emp=empleados.find(function(e){return e.id===empId;});
  var diario=emp?(parseInt(emp.pagoDiario)||0):0;
  var lunes=_lunesDeSemKey(semKey);
  var ganado=0;
  for(var i=0;i<7;i++){var d=new Date(lunes);d.setDate(d.getDate()+i);var rec=asistenciaEmp[empId+'_'+_fechaKey(d)];if(rec)ganado+=(typeof rec==='number')?rec:diario;}
  var prest=movEmpleados.filter(function(m){return m.empId===empId&&((m.tipo==='prestamo'&&!m.largoPlazo)||m.tipo==='consumo')&&m.semanaKey===semKey;}).reduce(function(s,m){return s+(m.valor||0);},0);
  var pagado=movEmpleados.filter(function(m){return m.empId===empId&&m.tipo==='salario'&&m.semanaKey===semKey;}).reduce(function(s,m){return s+(m.valor||0);},0);
  var ajuste=movEmpleados.filter(function(m){return m.empId===empId&&m.tipo==='ajuste'&&m.semanaKey===semKey;}).reduce(function(s,m){return s+(m.valor||0);},0);
  var neto=ganado-prest+ajuste;
  return {ganado:ganado,prest:prest,pagado:pagado,ajuste:ajuste,neto:neto,saldo:neto-pagado};
}

function diligenciarSaneamientoTodo(){
  if(!usuarioActivo||usuarioActivo.rol!=='admin'){alert('Solo el administrador.');return;}
  var lunes=_sanLunes(_sanSemanaOffset);
  var fechas=[];for(var i=0;i<7;i++){var d=new Date(lunes);d.setDate(d.getDate()+i);fechas.push(d);}
  var semKey=_semanaKey(lunes);
  var rango=lunes.getDate()+'/'+(lunes.getMonth()+1)+' al '+fechas[6].getDate()+'/'+(fechas[6].getMonth()+1);
  if(!confirm('¿Marcar como COMPLETO todo el saneamiento de la semana ('+rango+')?\n\nSe marcarán todas las áreas diarias (sin fechas futuras) y todas las tareas semanales. Quedará registrado a tu nombre.'))return;
  var hoy=new Date();
  function horaDe(d){
    // Si el día ya pasó, usar una hora típica de cierre; si es hoy, la hora actual
    var base=new Date(d);
    if(_fechaKey(d)===_fechaKey(hoy)){base=hoy;}
    else{base.setHours(23,0,0,0);}
    return ('0'+base.getHours()).slice(-2)+':'+('0'+base.getMinutes()).slice(-2);
  }
  // Diario: todas las áreas en los días que NO son futuros
  SAN_AREAS.forEach(function(a){
    fechas.forEach(function(d){
      if(d>hoy)return;  // no marcar días futuros
      var key=_fechaKey(d)+'_'+a.id;
      if(!(saneamientoChecks[key]&&saneamientoChecks[key].check)){
        saneamientoChecks[key]={check:true,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,hora:horaDe(d),ts:a52Ahora()};
      }
    });
  });
  // Semanal: todas las tareas
  SAN_SEMANAL.forEach(function(s){
    var key=semKey+'_'+s.id;
    if(!(saneamientoSemanal[key]&&saneamientoSemanal[key].check)){
      saneamientoSemanal[key]={check:true,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,hora:horaDe(hoy),ts:a52Ahora()};
    }
  });
  fbSet('saneamientoChecks',saneamientoChecks);
  fbSet('saneamientoSemanal',saneamientoSemanal);
  showToast('✅ Saneamiento de la semana diligenciado completo','#22c55e');
  render();
}

function renderSaneamiento(){
  var DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var lunes=_sanLunes(_sanSemanaOffset);
  var fechas=[];for(var i=0;i<7;i++){var d=new Date(lunes);d.setDate(d.getDate()+i);fechas.push(d);}
  var domingo=fechas[6];
  var rangoLabel=lunes.getDate()+'/'+(lunes.getMonth()+1)+' al '+domingo.getDate()+'/'+(domingo.getMonth()+1)+'/'+domingo.getFullYear();
  var semKey=_semanaKey(lunes);

  // Grid diario: filas=áreas, columnas=días
  var headerDias=DIAS.map(function(dn,i){
    var esHoy=_fechaKey(fechas[i])===_fechaKey(new Date());
    return'<th style="padding:4px;font-size:10px;color:'+(esHoy?'var(--accent)':'var(--muted)')+';font-weight:700">'+dn+'<br><span style="font-size:9px;font-weight:400">'+fechas[i].getDate()+'</span></th>';
  }).join('');

  var filas=SAN_AREAS.map(function(a){
    var celdas=fechas.map(function(d){
      var key=_fechaKey(d)+'_'+a.id;
      var rec=saneamientoChecks[key];
      var marcado=rec&&rec.check;
      var futuro=d>new Date();
      return'<td style="text-align:center;padding:3px">'
        +'<button data-act="san-check" data-key="'+key+'" '+(futuro?'disabled':'')+' style="width:30px;height:30px;border-radius:7px;border:2px solid '+(marcado?'#22c55e':'var(--border)')+';background:'+(marcado?'#22c55e':'transparent')+';color:#fff;font-size:15px;cursor:'+(futuro?'not-allowed':'pointer')+';opacity:'+(futuro?'.3':'1')+'">'+(marcado?'✓':'')+'</button>'
      +'</td>';
    }).join('');
    return'<tr><td style="padding:6px 4px;font-size:11px;font-weight:700;border-bottom:1px solid var(--border)"><div>'+esc(a.nombre)+'</div><div style="color:var(--muted);font-size:9px;font-weight:400">'+esc(a.cond)+'</div></td>'+celdas+'</tr>';
  }).join('');

  // % cumplimiento de la semana
  var totalCeldas=SAN_AREAS.length*7;
  var marcadas=0;
  SAN_AREAS.forEach(function(a){fechas.forEach(function(d){var k=_fechaKey(d)+'_'+a.id;if(saneamientoChecks[k]&&saneamientoChecks[k].check)marcadas++;});});
  var pct=totalCeldas?Math.round(marcadas/totalCeldas*100):0;

  // Aseo profundo semanal
  var semanalRows=SAN_SEMANAL.map(function(s){
    var key=semKey+'_'+s.id;
    var rec=saneamientoSemanal[key]||{};
    var hecho=rec.check;
    return'<div style="background:var(--bg);border:1px solid '+(hecho?'#22c55e44':'var(--border)')+';border-radius:9px;padding:10px;margin-bottom:8px">'
      +'<div style="display:flex;align-items:center;gap:10px">'
        +'<button data-act="san-sem-check" data-key="'+key+'" style="width:30px;height:30px;border-radius:7px;border:2px solid '+(hecho?'#22c55e':'var(--border)')+';background:'+(hecho?'#22c55e':'transparent')+';color:#fff;font-size:15px;cursor:pointer;flex-shrink:0">'+(hecho?'✓':'')+'</button>'
        +'<div style="flex:1"><div style="font-size:12px;font-weight:700">'+esc(s.nombre)+'</div>'
        +'<div style="color:var(--muted);font-size:10px">'+esc(s.desc)+'</div>'
        +(hecho&&rec.hora?'<div style="color:#22c55e;font-size:10px;margin-top:2px">✓ '+rec.hora+(rec.uidNombre?' · '+esc(rec.uidNombre):'')+'</div>':'')
        +'</div>'
      +'</div>'
    +'</div>';
  }).join('');

  return'<div>'
    +'<div class="flex-between mb12">'
      +'<div style="font-weight:800;font-size:16px">🧼 Plan de Saneamiento</div>'
      +'<div style="display:flex;gap:6px">'
        +'<button onclick="exportarSaneamientoExcel()" style="background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">📥 Excel</button>'
        +'<button onclick="imprimirSaneamiento()" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">🖨️ PDF</button>'
      +'</div>'
    +'</div>'
    +((usuarioActivo&&usuarioActivo.rol==='admin')?'<button onclick="diligenciarSaneamientoTodo()" style="width:100%;background:#a855f7;color:#fff;border:none;border-radius:10px;padding:11px;font-weight:800;font-size:13px;cursor:pointer;margin-bottom:12px">✅ Diligenciar TODA la semana (admin)</button>':'')
    // Navegación de semana
    +'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--card);border-radius:10px;padding:8px 12px;margin-bottom:12px">'
      +'<button onclick="_sanSemanaOffset--;render()" style="background:var(--card2);border:none;color:var(--text);border-radius:7px;padding:6px 12px;cursor:pointer;font-size:16px">‹</button>'
      +'<div style="text-align:center"><div style="font-size:12px;font-weight:700">Semana '+rangoLabel+'</div>'
        +'<div style="color:'+(pct>=80?'#22c55e':pct>=50?'#f5a623':'#ef4444')+';font-size:11px;font-weight:700">'+pct+'% cumplimiento diario</div></div>'
      +'<button onclick="if(_sanSemanaOffset<0){_sanSemanaOffset++;render()}" style="background:var(--card2);border:none;color:var(--text);border-radius:7px;padding:6px 12px;cursor:'+(_sanSemanaOffset<0?'pointer':'not-allowed')+';font-size:16px;opacity:'+(_sanSemanaOffset<0?'1':'.3')+'">›</button>'
    +'</div>'
    // Formato 1: diario
    +'<div class="card mb12">'
      +'<div class="section-title">📋 Formato 1 · Verificación Diaria de Áreas y Equipos</div>'
      +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">'
        +'<thead><tr><th style="text-align:left;padding:4px;font-size:10px;color:var(--muted)">Área / Equipo</th>'+headerDias+'</tr></thead>'
        +'<tbody>'+filas+'</tbody>'
      +'</table></div>'
    +'</div>'
    // Formato 2: semanal
    +'<div class="card mb12">'
      +'<div class="section-title">🧽 Formato 2 · Verificación Semanal (Aseo Profundo)</div>'
      +semanalRows
    +'</div>'
    // Plan de referencia (plegable)
    +'<button data-act="toggle-sec" data-sec="sanPlan" style="width:100%;text-align:left;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--text);font-weight:700;cursor:pointer">'+(_secOpen.sanPlan?'▼':'▶')+' 📖 Plan de saneamiento (referencia)</button>'
    +(_secOpen.sanPlan?'<div class="card" style="margin-top:8px;font-size:12px;color:var(--muted);line-height:1.6">'+planSaneamientoTexto()+'</div>':'')
  +'</div>';
}

function planSaneamientoTexto(){
  return'<b style="color:var(--text)">1. Manejo de Residuos (Resolución 2184 de 2019)</b><br>'
    +'• <b>Blanco:</b> aprovechables (vidrio, PET, latas, cartón, papel limpio).<br>'
    +'• <b>Negro:</b> no aprovechables (servilletas, colillas, pitillos, vidrios rotos envueltos).<br>'
    +'• <b>Verde:</b> orgánicos (frutas de coctelería, cuncho de café, restos de alimentos).<br>'
    +'• Contenedores plásticos, lisos, con tapa de pedal. Recolección 2 veces por turno o al 80% de capacidad. Bolsas con doble nudo, nunca arrastrar.<br><br>'
    +'<b style="color:var(--text)">2. Limpieza y Desinfección (POES)</b><br>'
    +'• Primero se limpia (agua + detergente), luego se desinfecta (hipoclorito o amonio cuaternario).<br>'
    +'• Prohibido material poroso (madera, esponjas gastadas). Usar acero, teflón, nylon o silicona.<br>'
    +'• Implementos de baño de color distinto a los de barra (evitar contaminación cruzada).<br>'
    +'• Pisos: diario inicio/cierre. Neveras: externa diaria, profunda semanal. Baños: 2 veces por turno.<br>'
    +'• Baños: verificar jabón líquido, toallas de papel, papel higiénico y protocolos visibles de lavado de manos.<br><br>'
    +'<i>La ejecución no es válida para Secretaría de Salud si no se documenta: fecha, hora, responsable y firma del administrador.</i>';
}

function pasarFiadoASocio(deudaId){
  if(!usuarioActivo||(usuarioActivo.rol!=='admin'&&usuarioActivo.rol!=='subadmin')){alert('Solo admin o subadmin pueden pasar deudas a un socio.');return;}
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var pend=(d.total||0)-(d.pagado||0);
  window._pfsSocio=window._pfsSocio||socDlg();
  var chip=function(so){var sel=window._pfsSocio===so;var col=socColor(so);
    return'<button onclick="window._pfsSocio=\''+so+'\';pasarFiadoASocio(\''+deudaId+'\')" style="flex:1;background:'+(sel?col:'var(--bg)')+';color:'+(sel?socTxt(so):'var(--muted)')+';border:1px solid '+(sel?col:'var(--border)')+';border-radius:9px;padding:10px;font-weight:900;font-size:13px;cursor:pointer">'+so+'</button>';};
  var vMonto=(document.getElementById('pfs-monto')||{}).value||'';
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:6px">🤝 Pasar deuda a un socio</div>'
    +'<div style="background:var(--bg);border-radius:9px;padding:8px 11px;margin-bottom:10px;font-size:12px"><b>'+esc(d.clienteNombre||'Cliente')+'</b> · '+esc(d.mesa||'')+'<br><span style="color:#f5a623;font-weight:800">Pendiente: '+fmt(pend)+'</span></div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:4px">¿Qué socio asume?</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:10px">'+SOCIOS.map(function(x){return chip(x.id);}).join('')+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto que asume</div>'
    +'<input class="inp money" id="pfs-monto" type="text" inputmode="numeric" placeholder="Ej: 30.000" value="'+esc(vMonto)+'" style="margin-bottom:12px"/>'
    +'<div style="color:var(--muted);font-size:10.5px;margin-bottom:12px">La deuda del cliente baja por ese valor y queda cargado al consumo del socio (sin tocar la caja ni el inventario: la plata no ha entrado, ahora la debe el socio).</div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarPasarFiadoASocio(\''+deudaId+'\')">🤝 Pasar al socio</button>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function confirmarPasarFiadoASocio(deudaId){
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var socio=window._pfsSocio||socDlg();
  var monto=moneyVal('pfs-monto')||0;
  var pend=(d.total||0)-(d.pagado||0);
  if(monto<=0){alert('Escribe el monto.');return;}
  if(monto>pend){alert('No puede ser mayor a lo pendiente ('+fmt(pend).replace(/\u00A0/g,' ')+').');return;}
  d.pagado=(d.pagado||0)+monto;
  d.pagos=d.pagos||[];
  d.pagos.push({ts:a52Ahora(),valor:monto,fp:'socio',socio:socio});
  var quedo=(d.total||0)-(d.pagado||0);
  if(quedo<=0){
    deudasCredito=deudasCredito.filter(function(x){return x.id!==deudaId;});
  }else{
    var i=deudasCredito.findIndex(function(x){return x.id===deudaId;});
    if(i>=0)deudasCredito[i]=d;
  }
  var ob={};deudasCredito.forEach(function(x){ob[x.id]=x;});fbSet('deudasCredito',ob);
  // Cargarlo al consumo del socio (sin caja, sin stock)
  var consumo={id:'soc_'+a52Ahora(),ts:a52Ahora(),socio:socio,
    items:[{nombre:'📒 Asumió fiado · '+(d.mesa||'')+' ('+(d.clienteNombre||'cliente')+')',emoji:'📒',qty:1,precioBase:monto,precioSocio:monto}],
    total:monto,esAsumido:true,deudaId:deudaId,stockDetalle:[],uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoSocios.push(consumo);
  var r=ref('consumoSocios');
  if(r)r.push(consumo);else fbSet('consumoSocios',consumoSocios);
  closeModal2();
  showToast('🤝 '+socio+' asumió '+fmt(monto)+' del fiado de '+esc(d.clienteNombre||'cliente')+(quedo<=0?'<br><span style="font-size:12px;opacity:.85">La deuda quedó saldada y salió de cuentas por cobrar</span>':'<br><span style="font-size:12px;opacity:.85">Pendiente del cliente: '+fmt(quedo)+'</span>'),'#22c55e');
  render();
}
function toggleDetalleFiado(deudaId){
  var box=document.getElementById('fiado-det-'+deudaId);
  var flecha=document.getElementById('fiado-flecha-'+deudaId);
  if(!box)return;
  if(box.style.display!=='none'){box.style.display='none';if(flecha)flecha.textContent='▸';return;}
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var fyh=function(ts){var x=new Date(ts);return ('0'+x.getDate()).slice(-2)+'/'+('0'+(x.getMonth()+1)).slice(-2)+'/'+x.getFullYear()+' '+('0'+x.getHours()).slice(-2)+':'+('0'+x.getMinutes()).slice(-2);};
  var its=d.items?(Array.isArray(d.items)?d.items:Object.values(d.items)):[];
  var pagos=d.pagos?(Array.isArray(d.pagos)?d.pagos:Object.values(d.pagos)):[];
  var pend=(d.total||0)-(d.pagado||0);
  var html='<div style="background:var(--bg);border-radius:8px;padding:8px 11px;margin-top:7px;font-size:11.5px">'
    +'<div style="color:var(--muted);margin-bottom:5px">🕐 Fiado el <b style="color:var(--text)">'+fyh(d.ts)+'</b>'+(d.uidNombre?' · lo fió <b style="color:var(--text)">'+esc(d.uidNombre)+'</b>':'')+'</div>';
  if(its.length){
    html+='<div style="color:var(--muted);font-size:10.5px;margin-bottom:2px">CONSUMO:</div>'
      +its.map(function(it){
        var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
        var nom=it.nombre||it.customNombre||(p?p.nombre:'ítem');
        var pu=it.precioCustom!=null?it.precioCustom:(it.precioPromo||it.variantePrecio||(p?(it.cubeta?(p.precioCubeta||p.precio*5):p.precio):0));
        return'<div style="display:flex;justify-content:space-between;padding:1.5px 0">'
          +'<span>'+(it.qty||1)+'× '+esc(nom)+(it.varianteNombre?' ('+esc(it.varianteNombre)+')':'')+(it.cubeta?' 🪣':'')+'</span>'
          +'<span style="color:var(--muted)">'+fmt(pu*(it.qty||1))+'</span>'
        +'</div>';
      }).join('');
  }
  html+='<div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);margin-top:5px;padding-top:4px;font-weight:800"><span>Total</span><span>'+fmt(d.total||0)+'</span></div>';
  if(pagos.length){
    html+='<div style="color:var(--muted);font-size:10.5px;margin:6px 0 2px">ABONOS:</div>'
      +pagos.map(function(pg){
        var f=FPAGO.find(function(x){return x.id===pg.fp;});
        var medio=pg.fp==='socio'?'🤝 Asumió '+esc(pg.socio||'socio'):(f?f.emoji+' '+f.label:esc(pg.fp||''));
        return'<div style="display:flex;justify-content:space-between;padding:1.5px 0">'
          +'<span style="color:#22c55e">✓ '+fyh(pg.ts)+' · '+medio+'</span>'
          +'<span style="color:#22c55e;font-weight:700">'+fmt(pg.valor||0)+'</span>'
        +'</div>';
      }).join('')
      +'<div style="display:flex;justify-content:space-between;padding:2px 0;color:var(--muted)"><span>Total abonado</span><span>'+fmt(d.pagado||0)+'</span></div>';
  }else if((d.pagado||0)>0){
    html+='<div style="display:flex;justify-content:space-between;margin-top:4px;color:#22c55e"><span>Abonado (sin detalle)</span><span>'+fmt(d.pagado)+'</span></div>';
  }
  html+='<div style="display:flex;justify-content:space-between;margin-top:4px;font-weight:900;color:#f5a623"><span>PENDIENTE</span><span>'+fmt(pend)+'</span></div>'
  +'</div>';
  box.innerHTML=html;
  box.style.display='block';
  if(flecha)flecha.textContent='▾';
}
function perderFiado(deudaId){
  if(!usuarioActivo||usuarioActivo.rol!=='admin'){alert('Solo el administrador puede dar por perdida una cuenta.');return;}
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var pend=(d.total||0)-(d.pagado||0);
  var its=d.items?(Array.isArray(d.items)?d.items:Object.values(d.items)):[];
  var resumenIts=its.slice(0,6).map(function(it){
    var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
    return (it.qty||1)+'× '+(it.nombre||it.customNombre||(p?p.nombre:'ítem'));
  }).join(', ')+(its.length>6?'…':'');
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:6px">💀 Dar por perdida la cuenta</div>'
    +'<div style="background:var(--bg);border-radius:9px;padding:9px 12px;margin-bottom:10px;font-size:12px">'
      +'<b>'+esc(d.clienteNombre||'Cliente')+'</b> · total '+fmt(d.total||0)
      +((d.pagado||0)>0?' · abonó '+fmt(d.pagado):'')
      +'<br><span style="color:#ef4444;font-weight:800">Pendiente: '+fmt(pend)+'</span>'
      +(resumenIts?'<br><span style="color:var(--muted);font-size:11px">'+esc(resumenIts)+'</span>':'')
    +'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">La deuda se elimina de cuentas por cobrar y queda registrada como novedad (💀 pérdida) para la revisión de caja. Elige qué pasa con el inventario:</div>'
    +'<button class="btn btn-full" onclick="confirmarPerderFiado(\''+deudaId+'\',false)" style="background:#ef4444;color:#fff;border:none;font-weight:800;margin-bottom:8px">💀 Perder SIN devolver stock<br><span style="font-size:10px;font-weight:600;opacity:.9">(se consumieron los productos — lo normal si la persona no volvió)</span></button>'
    +'<button class="btn btn-full" onclick="confirmarPerderFiado(\''+deudaId+'\',true)" style="background:#f5a62318;color:#f5a623;border:1px solid #f5a62344;font-weight:800;margin-bottom:8px">📦 Perder Y devolver al inventario<br><span style="font-size:10px;font-weight:600;opacity:.9">(los productos nunca se entregaron)</span></button>'
    +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text)">Cancelar</button>');
}
function confirmarPerderFiado(deudaId,devolverStock){
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var pend=(d.total||0)-(d.pagado||0);
  var its=d.items?(Array.isArray(d.items)?d.items:Object.values(d.items)):[];
  if(devolverStock)its.forEach(function(it){ajustarStockItem(it,+(it.qty||1));});
  // Registro auditable en novedades (visible en Caja)
  fbPush('novedades',{id:'nov_'+a52Ahora(),ts:a52Ahora(),
    mesa:'Fiado · '+(d.clienteNombre||'cliente'),
    tipo:'perdida',tipoLabel:'💀 Cuenta perdida',
    monto:pend,
    nota:'Fiado dado por perdido'+((d.pagado||0)>0?' (había abonado '+fmt(d.pagado).replace(/\u00A0/g,' ')+')':'')+(devolverStock?' · productos DEVUELTOS al inventario':' · productos consumidos (sin devolución)'),
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre});
  deudasCredito=deudasCredito.filter(function(x){return x.id!==deudaId;});
  var ob={};deudasCredito.forEach(function(x){ob[x.id]=x;});fbSet('deudasCredito',ob);
  closeModal2();
  showToast('💀 Cuenta de '+esc(d.clienteNombre||'cliente')+' dada por perdida: '+fmt(pend)+'<br><span style="font-size:12px;opacity:.85">'+(devolverStock?'📦 Productos devueltos al inventario':'Sin devolución de stock')+' · registrada en novedades</span>','#ef4444');
  render();
}
function eliminarFiado(deudaId){
  if(!usuarioActivo||usuarioActivo.rol!=='admin'){alert('Solo el administrador puede eliminar fiados.');return;}
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var pend=d.total-(d.pagado||0);
  if(!confirm('¿Eliminar este fiado de '+(d.clienteNombre||'cliente')+' por '+fmt(d.total)+'?\n\nLos productos volverán al inventario.'))return;
  // Devolver productos al inventario
  var its=d.items?(Array.isArray(d.items)?d.items:Object.values(d.items)):[];
  its.forEach(function(it){ajustarStockItem(it,+(it.qty||1));});
  // Quitar el fiado
  deudasCredito=deudasCredito.filter(function(x){return x.id!==deudaId;});
  var ob={};deudasCredito.forEach(function(x){ob[x.id]=x;});fbSet('deudasCredito',ob);
  showToast('🗑️ Fiado eliminado<br><span style="font-size:12px;opacity:.85">Productos devueltos al inventario</span>','#ef4444');
  render();
}

function renderCreditos(){
  var esAdmin=usuarioActivo&&usuarioActivo.rol==='admin';
  var puedeDevolver=usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin');

  function saldoCliente(cid){
    return deudasCredito.filter(function(d){return d.clienteId===cid;}).reduce(function(s,d){return s+(d.total-(d.pagado||0));},0);
  }

  var totalPorCobrar=deudasCredito.reduce(function(s,d){return s+(d.total-(d.pagado||0));},0);

  var clientesActivos=clientesCredito.filter(function(c){return c.activo!==false;});
  var cards=clientesActivos.map(function(c){
    var saldo=saldoCliente(c.id);
    var deudasCli=deudasCredito.filter(function(d){return d.clienteId===c.id&&(d.total-(d.pagado||0))>0;}).sort(function(a,b){return b.ts-a.ts;});
    if(saldo<=0&&deudasCli.length===0)return'';  // hide clients with no debt
    return'<div class="card" style="margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'
        +'<div><div style="font-weight:800;font-size:15px">👤 '+esc(c.nombre)+'</div>'
        +(c.telefono?'<div style="color:var(--muted);font-size:12px">'+esc(c.telefono)+'</div>':'')+'</div>'
        +'<div style="text-align:right"><div style="color:#f5a623;font-weight:900;font-size:16px">'+fmt(saldo)+'</div>'
        +'<div style="color:var(--muted);font-size:10px">por cobrar</div></div>'
      +'</div>'
      +deudasCli.map(function(d){
        var pend=d.total-(d.pagado||0);
        return'<div style="background:var(--card2);border-radius:8px;padding:8px 10px;margin-bottom:6px">'
          +'<div onclick="toggleDetalleFiado(\''+d.id+'\')" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">'
            +'<span style="font-size:12px;color:var(--muted)"><span id="fiado-flecha-'+d.id+'">▸</span> '+d.mesa+' · '+fmtFecha(d.ts)+'</span>'
            +'<span style="font-weight:700;font-size:13px;color:#f5a623">'+fmt(pend)+(d.pagado>0?' / '+fmt(d.total):'')+'</span>'
          +'</div>'
          +'<div id="fiado-det-'+d.id+'" style="display:none"></div>'
          +'<div style="display:flex;gap:6px;margin-top:6px">'
          +'<button data-act="cred-pagar" data-id="'+d.id+'" style="flex:1;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:7px;padding:7px;font-size:12px;font-weight:700;cursor:pointer">💵 Registrar pago</button>'
          +(puedeDevolver?'<button data-act="cred-volver" data-id="'+d.id+'" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer">↩️ A mesa</button>':'')
          +(((usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin')&&a52Mod('socios'))?'<button onclick="pasarFiadoASocio(\''+d.id+'\')" title="Pasar a socio" style="background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer">🤝</button>':'')
          +(esAdmin?'<button onclick="perderFiado(\''+d.id+'\')" title="Dar por perdida" style="background:#7c2d1218;color:#f97316;border:1px solid #f9731633;border-radius:7px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer">💀</button>':'')
          +(esAdmin?'<button data-act="cred-del" data-id="'+d.id+'" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer">🗑️</button>':'')
          +'</div>'
        +'</div>';
      }).join('')
    +'</div>';
  }).join('');

  return'<div>'
    +'<div class="flex-between mb12">'
      +'<div style="font-weight:800;font-size:16px">📒 Fiados / Cuentas por cobrar</div>'
      +'<button class="btn btn-green" onclick="abrirNuevoCliente()">+ Cliente</button>'
    +'</div>'
    +'<div style="background:#f5a62318;border:1px solid #f5a62333;border-radius:10px;padding:12px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">'
      +'<span style="color:#f5a623;font-weight:700;font-size:13px">💰 Total por cobrar</span>'
      +'<span style="color:#f5a623;font-weight:900;font-size:18px">'+fmt(totalPorCobrar)+'</span>'
    +'</div>'
    +(cards||'<div style="text-align:center;color:var(--muted);padding:40px 20px">Sin cuentas por cobrar.<br>Al cobrar una mesa, usa "Dejar como fiado".</div>')
  +'</div>';
}

function abrirNuevoCliente(){
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:14px">👤 Nuevo cliente a crédito</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nombre *</div>'
    +'<input class="inp" id="cli-nombre" placeholder="Ej: Pedro Gómez"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Teléfono (opcional)</div>'
    +'<input class="inp" id="cli-tel" placeholder="Ej: 3001234567"/></div>'
    +'<button class="btn btn-green btn-full" onclick="guardarCliente()">Guardar</button>');
}

function guardarCliente(){
  var nombre=((document.getElementById('cli-nombre')||{}).value||'').trim();
  var tel=((document.getElementById('cli-tel')||{}).value||'').trim();
  if(!nombre){alert('Escribe el nombre.');return;}
  var c={id:'cli'+a52Ahora(),nombre:nombre,telefono:tel,activo:true,ts:a52Ahora()};
  clientesCredito.push(c);
  var r=ref('clientesCredito');if(r)r.push(c);else fbSet('clientesCredito',clientesCredito);
  closeModal1();render();
}

function abrirPagoCredito(deudaId){
  var d=deudasCredito.find(function(x){return x.id===deudaId;});
  if(!d)return;
  var pend=d.total-(d.pagado||0);
  var fpOpts=FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  // Detalle de lo consumido
  var detalle=(d.items||[]).map(function(it){
    var nombre,pr;
    if(it.isCustom){nombre='✏️ '+esc(it.customNombre||it.nombre||'');pr=it.customPrecio||0;}
    else if(it.isCombo){nombre='🎁 '+esc(it.comboNombre||'');pr=it.comboPrecio||0;}
          else if(it.isCubetazoMix){nombre='🪣 Cubetazo mixto ('+(it.cubMixDetalle||[]).map(function(dd){return dd.cantidad+'×'+dd.emoji;}).join(' ')+')';pr=it.cubMixPrecio||0;}
    else{var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});nombre=(it.cubeta?'🪣 ':'')+esc((p&&p.nombre)||it.nombre||'?')+(it.varianteNombre?' ('+it.varianteNombre+')':'');pr=it.variantePrecio||(it.cubeta?(p&&p.cubeta||((p&&p.precio||0)*5)):((p&&p.precio)||0));}
    return'<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid var(--border)">'
      +'<span>'+nombre+' ×'+it.qty+'</span>'
      +'<span style="color:var(--gold)">'+fmt(pr*it.qty)+'</span></div>';
  }).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💵 Registrar pago</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:10px">'+esc(d.clienteNombre)+' · '+d.mesa+'<br>Pendiente: <b style="color:#f5a623">'+fmt(pend)+'</b></div>'
    +'<div style="background:var(--bg);border-radius:10px;padding:8px 12px;margin-bottom:12px;max-height:160px;overflow-y:auto">'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:4px;font-weight:700">🧾 Consumo:</div>'
      +(detalle||'<div style="color:var(--dim);font-size:12px">Sin detalle</div>')
      +'<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;padding-top:6px;margin-top:4px;border-top:1px solid var(--accent)33"><span>Total</span><span style="color:var(--accent)">'+fmt(d.total)+'</span></div>'
    +'</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Valor del pago *</div>'
    +'<input class="inp money" id="pago-valor" type="text" value="'+moneyFmt(pend)+'" inputmode="numeric"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Forma de pago</div>'
    +'<select class="inp" id="pago-fp">'+fpOpts+'</select></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarPagoCredito(\''+deudaId+'\')">💵 Confirmar pago</button>');
}


