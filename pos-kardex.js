/* ═══════════ 📒 KARDEX POR PRODUCTO ═══════════
   Para un rango de fechas responde, producto por producto: cuántas había, cuántas entraron
   (y cómo: factura, compra en Gastos o a mano), cuántas se vendieron y qué día, qué salió
   por consumo o ajuste, y cuántas quedan. Reemplaza la lista corrida de movimientos.        */
var _kx={mov:[],prod:'',d1:'',d2:'',busca:'',dia:'',cargado:0,tope:6000};
function _kxISO(ts){var d=fechaNegocio(ts);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function _kxHoy(){return _kxISO(a52Ahora());}
function _kxFechaLarga(iso){var p=iso.split('-');return ['dom','lun','mar','mié','jue','vie','sáb'][new Date(+p[0],+p[1]-1,+p[2]).getDay()]+' '+p[2]+'/'+p[1];}
function _kxHora(ts){return new Date(ts).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'});}
/* Qué fue cada movimiento, leyendo el motivo con que quedó guardado */
function kxClasificar(e){
  var m=String(e.motivo||''),d=e.delta||0,x;
  if(/IGNORADO|NO DESCONTADO/.test(m))return{g:'aviso',t:'Aviso del sistema'};
  if(/^Ingreso inventario/.test(m)){
    x=m.replace(/^Ingreso inventario\s*·\s*/,'').split(' · Fact ');
    return{g:'entrada',t:x[1]?'Compra con factura':'Compra a proveedor, sin número de factura',det:(x[0]?'Proveedor '+x[0]:'')+(x[1]?' · factura '+x[1]:'')};
  }
  if(/^🗑 Baja:/.test(m))return{g:'merma',t:'Baja: '+m.replace(/^🗑 Baja:\s*/,'')};
  if(/Compra eliminada/.test(m))return{g:'ajuste',t:'Compra anulada en Gastos',det:m.replace(/^.*Compra eliminada:\s*/,'')};
  if(/Compra:/.test(m)){x=m.replace(/^.*Compra:\s*/,'');
    if(/ · Fact /.test(x)){var pf=x.split(' · Fact ');return{g:'entrada',t:'Compra con factura',det:'Proveedor '+pf[0]+' · factura '+pf[1]};}
    return{g:'entrada',t:'Compra registrada en Gastos',det:x};}
  if(/Llegó mercancía/.test(m))return{g:'entrada',t:'Ingreso a mano (llegó mercancía)'};
  if(/Cuadre físico/.test(m))return{g:'ajuste',t:d<0?'Cuadre físico: faltante':'Cuadre físico: sobrante'};
  if(/Ajuste manual/.test(m))return{g:d>0?'entrada':'ajuste',t:d>0?'Ajuste a mano (suma)':'Ajuste a mano (resta)',det:m.replace(/^[^A-Za-z]*/,'')};
  if(/Consumo empleado|consumo de personal/i.test(m))return{g:d<0?'consumo':'devuelto',t:d<0?'Consumo de personal':'Consumo de personal anulado',det:m.replace(/^.*?:\s*/,'')};
  if(/socio/i.test(m))return{g:d<0?'consumo':'devuelto',t:d<0?'Consumo de socio':'Devolución de socio'};
  if(/Rappi|Didi|app/i.test(m)&&d<0)return{g:'venta',t:'Venta por aplicación',det:m};
  if(d<0&&/^Mesa|Venta|Fiado|pedido/i.test(m))return{g:'venta',t:/combo/i.test(m)?'Venta dentro de un combo':/cubetazo/i.test(m)?'Venta en cubetazo':/receta/i.test(m)?'Usado en una receta':'Venta en mesa',det:m.replace(/^Mesa:\s*/,'')};
  if(d>0&&/devuel|Devoluci|cancel|quitad/i.test(m))return{g:'devuelto',t:'Devuelto de una mesa',det:m.replace(/^Mesa:\s*/,'')};
  return{g:d>0?'entrada':'ajuste',t:d>0?'Otra entrada':'Otra salida',det:m};
}
function kxItems(){
  var l=[];
  menu.forEach(function(p){if(!p.sinStock)l.push({k:'p|'+p.id,t:'p',id:p.id,nombre:p.nombre,emoji:p.emoji||'📦',cat:p.cat||'',stock:parseInt(p.stock)||0,und:p.und||'und'});});
  ingredientes.forEach(function(i){l.push({k:'i|'+i.id,t:'i',id:i.id,nombre:i.nombre,emoji:'🧂',cat:'Insumos',stock:parseInt(i.stock)||0,und:i.und||'und'});});
  return l;
}
/* Resumen de un producto en el rango: saldo inicial y final caminando hacia atrás desde la existencia de hoy */
function kxResumen(it){
  var movs=_kx.mov.filter(function(e){return e.t===it.t&&String(e.id)===String(it.id);});   // del más nuevo al más viejo
  var saldo=it.stock,r={it:it,ini:0,fin:0,entrada:0,venta:0,devuelto:0,consumo:0,ajuste:0,merma:0,dias:{},movs:[],entradas:[],completo:true};
  var visto=false;
  movs.forEach(function(e){
    var dia=_kxISO(e.ts),queda=saldo;saldo-=(e.delta||0);
    if(_kx.d2&&dia>_kx.d2)return;                       // posterior al rango: solo corre el saldo
    if(!visto){r.fin=queda;visto=true;}
    if(_kx.d1&&dia<_kx.d1)return;
    var c=kxClasificar(e),d=e.delta||0;
    if(c.g==='entrada')r.entrada+=d;else if(c.g==='venta')r.venta+=-d;else if(c.g==='devuelto')r.devuelto+=d;else if(c.g==='consumo')r.consumo+=-d;else if(c.g==='ajuste')r.ajuste+=d;else if(c.g==='merma')r.merma+=-d;
    if(!r.dias[dia])r.dias[dia]={dia:dia,entrada:0,venta:0,devuelto:0,consumo:0,ajuste:0,merma:0,cierre:queda,movs:[]};
    var D=r.dias[dia];
    if(c.g==='entrada')D.entrada+=d;else if(c.g==='venta')D.venta+=-d;else if(c.g==='devuelto')D.devuelto+=d;else if(c.g==='consumo')D.consumo+=-d;else if(c.g==='ajuste')D.ajuste+=d;else if(c.g==='merma')D.merma+=-d;
    D.movs.push({e:e,c:c,queda:queda});
    r.movs.push({e:e,c:c,queda:queda});
    if(c.g==='entrada')r.entradas.push({e:e,c:c});
  });
  if(!visto){
    // sin movimientos dentro del rango: el saldo es el que traía
    var post=movs.filter(function(e){return _kx.d2&&_kxISO(e.ts)>_kx.d2;}).reduce(function(a,e){return a+(e.delta||0);},0);
    r.fin=it.stock-post;
  }
  r.ini=r.fin-(r.entrada-r.venta+r.devuelto-r.consumo-r.merma+r.ajuste);
  r.vendidas=r.venta-r.devuelto;
  // ¿el historial cargado alcanza a cubrir el inicio del rango?
  var masViejo=_kx.mov.length?_kx.mov[_kx.mov.length-1].ts:0;
  if(_kx.d1&&_kx.mov.length>=_kx.tope&&_kxISO(masViejo)>_kx.d1)r.completo=false;
  return r;
}
function _kxNum(n,color){return '<b style="text-align:right;font-variant-numeric:tabular-nums;color:'+(color||'var(--text)')+'">'+n+'</b>';}
function _kxTablaGeneral(){
  var q=_normTxt(_kx.busca||''),its=kxItems().filter(function(i){return !q||_normTxt(i.nombre+' '+i.cat).indexOf(q)>=0;});
  var filas=its.map(kxResumen).filter(function(r){return q||r.movs.length||r.fin!==0;});
  if(!filas.length)return '<div style="color:var(--muted);text-align:center;padding:18px;font-size:13px">No hay productos con movimiento en esas fechas.</div>';
  filas.sort(function(a,b){return (a.it.cat||'').localeCompare(b.it.cat||'')||a.it.nombre.localeCompare(b.it.nombre);});
  var cat='',h='<div style="display:grid;grid-template-columns:minmax(0,1fr) repeat(5,auto);gap:5px 10px;font-size:12px;align-items:center">'
    +['Producto','Había','Entró','Vendió','Otros','Queda'].map(function(t,i){return '<b style="color:var(--muted);font-size:10.5px;'+(i?'text-align:right':'')+'">'+t+'</b>';}).join('');
  filas.forEach(function(r){
    if(r.it.cat!==cat){cat=r.it.cat;h+='<div style="grid-column:1/-1;color:var(--accent);font-weight:800;margin-top:6px">'+esc(cat||'Sin categoría')+'</div>';}
    var otros=r.ajuste-r.consumo-r.merma;
    h+='<span data-kx-prod="'+esc(r.it.k)+'" style="cursor:pointer;text-decoration:underline;text-decoration-color:var(--border);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+r.it.emoji+' '+esc(r.it.nombre)+'</span>'
      +_kxNum(r.ini,'var(--muted)')+_kxNum(r.entrada?'+'+r.entrada:'·','#22c55e')+_kxNum(r.vendidas?'−'+r.vendidas:'·','#38bdf8')+_kxNum(otros?(otros>0?'+':'−')+Math.abs(otros):'·','#f5a623')+_kxNum(r.fin,r.fin<=0?'#ef4444':'var(--gold)');
  });
  return h+'</div><div style="color:var(--muted);font-size:10.5px;margin-top:8px">Toca un producto para ver su ficha día por día. «Otros» junta consumo de personal y socios, bajas, ajustes a mano y cuadre físico.</div>';
}
function _kxFicha(){
  var it=kxItems().filter(function(i){return i.k===_kx.prod;})[0];
  if(!it)return '<div style="color:var(--muted);padding:16px;text-align:center">Ese producto ya no existe en el inventario.</div>';
  var r=kxResumen(it),caja='background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px 6px;text-align:center';
  var h='<button data-kx-prod="" style="background:var(--card2);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:8px 12px;font-weight:700;cursor:pointer;margin-bottom:8px">← Todos los productos</button>'
    +'<div style="font-weight:800;font-size:16px;margin-bottom:8px">'+it.emoji+' '+esc(it.nombre)+' <span style="color:var(--muted);font-size:12px;font-weight:600">· hoy hay '+it.stock+' '+esc(it.und)+'</span></div>'
    +'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:10px">'
      +[['Había',r.ini,'var(--muted)'],['Entraron','+'+r.entrada,'#22c55e'],['Se vendieron','−'+r.vendidas,'#38bdf8'],['Otros',((r.ajuste-r.consumo-r.merma)>0?'+':'−')+Math.abs(r.ajuste-r.consumo-r.merma),'#f5a623'],['Quedan',r.fin,r.fin<=0?'#ef4444':'var(--gold)']]
        .map(function(c){return '<div style="'+caja+'"><div style="color:var(--muted);font-size:10px">'+c[0]+'</div><div style="font-weight:900;font-size:18px;color:'+c[2]+';font-variant-numeric:tabular-nums">'+c[1]+'</div></div>';}).join('')
    +'</div>';
  if(!r.completo)h+='<div style="background:#f5a62318;border:1px solid #f5a62344;color:#f5a623;border-radius:9px;padding:8px 10px;font-size:11.5px;margin-bottom:10px">El historial cargado no alcanza hasta el inicio de estas fechas: «Había» puede no ser exacto. Acorta el rango.</div>';
  if(r.consumo||r.ajuste||r.merma)h+='<div style="color:var(--muted);font-size:11.5px;margin-bottom:10px">Otros: '+[r.consumo?'consumo de personal y socios −'+r.consumo:'',r.merma?'bajas (rotura, vencido, cortesía) −'+r.merma:'',r.ajuste?'ajustes y cuadres '+(r.ajuste>0?'+':'−')+Math.abs(r.ajuste):''].filter(Boolean).join(' · ')+'</div>';
  // Entradas: cómo y cuándo
  h+='<div style="font-weight:800;color:#22c55e;margin:4px 0">📥 Lo que entró y cómo</div>';
  h+=r.entradas.length?r.entradas.map(function(x){
      return '<div style="display:flex;gap:8px;align-items:flex-start;font-size:12px;padding:5px 0;border-bottom:1px solid var(--border)"><b style="color:#22c55e;min-width:36px;text-align:right">+'+x.e.delta+'</b>'
        +'<div style="flex:1"><b>'+esc(x.c.t)+'</b>'+(x.c.det?'<div style="color:var(--muted)">'+esc(x.c.det)+'</div>':'')
        +'<div style="color:var(--muted);font-size:11px">'+_kxFechaLarga(_kxISO(x.e.ts))+' · '+_kxHora(x.e.ts)+(x.e.uidNombre?' · lo registró '+esc(x.e.uidNombre):'')+'</div></div></div>';
    }).join(''):'<div style="color:var(--muted);font-size:12px;padding:4px 0">No entró mercancía en estas fechas.</div>';
  // Día por día
  var dias=Object.keys(r.dias).sort().reverse();
  h+='<div style="font-weight:800;color:#38bdf8;margin:12px 0 4px">📅 Día por día</div>';
  if(!dias.length)h+='<div style="color:var(--muted);font-size:12px">Sin movimientos en estas fechas.</div>';
  else{
    h+='<div style="display:grid;grid-template-columns:minmax(0,1fr) repeat(4,auto);gap:4px 12px;font-size:12px;align-items:center">'
      +['Día','Entró','Vendió','Otros','Cerró en'].map(function(t,i){return '<b style="color:var(--muted);font-size:10.5px;'+(i?'text-align:right':'')+'">'+t+'</b>';}).join('');
    dias.forEach(function(k){
      var D=r.dias[k],vend=D.venta-D.devuelto,otros=D.ajuste-D.consumo-D.merma,ab=_kx.dia===k;
      h+='<span data-kx-dia="'+k+'" style="cursor:pointer;font-weight:700">'+(ab?'▼':'▶')+' '+_kxFechaLarga(k)+'</span>'
        +_kxNum(D.entrada?'+'+D.entrada:'·','#22c55e')+_kxNum(vend?'−'+vend:'·','#38bdf8')+_kxNum(otros?(otros>0?'+':'−')+Math.abs(otros):'·','#f5a623')+_kxNum(D.cierre,D.cierre<=0?'#ef4444':'var(--gold)');
      if(ab)h+='<div style="grid-column:1/-1;background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:6px 10px;margin-bottom:4px">'
        +D.movs.map(function(x){var d=x.e.delta||0;
          return '<div style="display:flex;gap:8px;font-size:11.5px;padding:3px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);min-width:58px">'+_kxHora(x.e.ts)+'</span>'
            +'<span style="flex:1"><b>'+esc(x.c.t)+'</b>'+(x.c.det?' <span style="color:var(--muted)">· '+esc(x.c.det)+'</span>':'')+(x.e.uidNombre?' <span style="color:var(--muted)">· '+esc(x.e.uidNombre)+'</span>':'')+'</span>'
            +'<b style="color:'+(d>0?'#22c55e':'#ef4444')+'">'+(d>0?'+':'')+d+'</b><span style="color:var(--gold);min-width:30px;text-align:right">'+x.queda+'</span></div>';
        }).join('')+'</div>';
    });
    h+='</div>';
  }
  return h;
}
function kxPintar(){var el=document.getElementById('kx-cuerpo');if(el)el.innerHTML=_kx.prod?_kxFicha():_kxTablaGeneral();}
function kxRango(c){
  var hoy=_kxHoy(),d=fechaNegocio(a52Ahora()),f=function(x){return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2);};
  if(c==='hoy'){_kx.d1=_kx.d2=hoy;}
  else if(c==='ayer'){d.setDate(d.getDate()-1);_kx.d1=_kx.d2=f(d);}
  else if(c==='7'){d.setDate(d.getDate()-6);_kx.d1=f(d);_kx.d2=hoy;}
  else if(c==='mes'){_kx.d1=hoy.slice(0,8)+'01';_kx.d2=hoy;}
  var a=document.getElementById('kx-d1'),b=document.getElementById('kx-d2');if(a)a.value=_kx.d1;if(b)b.value=_kx.d2;
  _kx.dia='';kxPintar();
}
function renderKardexModal(){
  var inp='background:var(--bg);border:1px solid var(--border);border-radius:9px;color:var(--text);padding:8px 9px;font-size:13px;width:100%';
  var chip='background:var(--card2);border:1px solid var(--border);color:var(--text);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:2px">📒 Kardex de inventario</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:8px">Cuántas había, cuántas entraron y cómo, cuántas se vendieron y cuántas quedan. '+_kx.mov.length+' movimientos cargados.</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+[['hoy','Hoy'],['ayer','Ayer'],['7','7 días'],['mes','Este mes']].map(function(x){return '<button onclick="kxRango(\''+x[0]+'\')" style="'+chip+'">'+x[1]+'</button>';}).join('')+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
      +'<label style="font-size:11px;color:var(--muted)">Desde<input id="kx-d1" type="date" value="'+_kx.d1+'" onchange="_kx.d1=this.value;_kx.dia=\'\';kxPintar()" style="'+inp+'"/></label>'
      +'<label style="font-size:11px;color:var(--muted)">Hasta<input id="kx-d2" type="date" value="'+_kx.d2+'" onchange="_kx.d2=this.value;_kx.dia=\'\';kxPintar()" style="'+inp+'"/></label>'
    +'</div>'
    +'<input id="kx-busca" type="search" placeholder="🔍 Buscar producto o categoría…" value="'+esc(_kx.busca)+'" oninput="_kx.busca=this.value;_kx.prod=\'\';kxPintar()" style="'+inp+';margin-bottom:10px"/>'
    +'<div id="kx-cuerpo" style="max-height:56vh;overflow-y:auto">'+(_kx.prod?_kxFicha():_kxTablaGeneral())+'</div>');
}
function abrirKardex(){
  var d=getDb();
  if(!d){alert('El kardex necesita conexión a internet.');return;}
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:8px">📒 Kardex de inventario</div><div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Cargando movimientos…</div>');
  d.ref('kardex').limitToLast(_kx.tope).once('value',function(s){
    var v=s.val();
    _kx.mov=v?Object.values(v).filter(function(e){return e&&e.ts;}).sort(function(a,b){return b.ts-a.ts;}):[];
    _kardexCache=_kx.mov;
    if(!_kx.d1&&!_kx.d2){var x=fechaNegocio(a52Ahora());x.setDate(x.getDate()-6);_kx.d1=x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2);_kx.d2=_kxHoy();}
    _kx.prod='';_kx.busca='';_kx.dia='';
    renderKardexModal();
  });
}
document.addEventListener('click',function(e){
  if(!e.target.closest)return;
  var p=e.target.closest('[data-kx-prod]');if(p){_kx.prod=p.dataset.kxProd;_kx.dia='';kxPintar();var c=document.getElementById('kx-cuerpo');if(c)c.scrollTop=0;return;}
  var d=e.target.closest('[data-kx-dia]');if(d){_kx.dia=_kx.dia===d.dataset.kxDia?'':d.dataset.kxDia;kxPintar();}
});
