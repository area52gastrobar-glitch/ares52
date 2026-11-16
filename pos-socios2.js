/* ═══════════ 🤝 CUENTA DEL SOCIO, ORDENADA ═══════════
   En vez de una lista corrida de pedidos: cuatro temas (consumo, retiros de dinero, cuentas que asumió, otros),
   cada uno con su total, y el detalle agrupado por día y plegado. Todo cabe en una pantalla. */
var _sv={vista:'dia',tema:'',abiertos:null,tope:10};
var SOC_TEMAS=[{id:'consumo',t:'Consumo',e:'🍺',c:'#38bdf8'},{id:'retiro',t:'Retiros de dinero',e:'💵',c:'#22c55e'},{id:'asumido',t:'Cuentas que asumió',e:'📒',c:'#f5a623'},{id:'otro',t:'Otros',e:'📝',c:'#a855f7'}];
function socTemaDe(c){
  if(c.esRetiro)return 'retiro';
  if(c.esAsumido)return 'asumido';
  var n=_socItems(c).map(function(i){return i.nombre||'';}).join(' ');
  if(/Asumió (fiado|cuenta)/.test(n))return 'asumido';
  if(/Retiro en /.test(n))return 'retiro';
  if(c.esOtro)return 'otro';
  return 'consumo';
}
function _socItems(c){return c.items?(Array.isArray(c.items)?c.items:Object.values(c.items)):[];}
function _socLimpio(n){return String(n||'?').replace(/^(\p{Extended_Pictographic}️?\s*)+/u,'').trim();}
function _socDiaISO(ts){var d=fechaNegocio(ts);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function _socDiaTxt(iso){var p=iso.split('-');return ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][new Date(+p[0],+p[1]-1,+p[2]).getDay()]+' '+(+p[2])+'/'+p[1];}
function socHistorialHTML(socio,esAdmin){
  var todos=consumoSocios.filter(function(c){return c.socio===socio;}).map(function(c){return {c:c,tema:socTemaDe(c)};});
  var col=socColor(socio),tot={},n={};
  SOC_TEMAS.forEach(function(t){tot[t.id]=0;n[t.id]=0;});
  todos.forEach(function(x){tot[x.tema]+=x.c.total||0;n[x.tema]++;});
  var total=todos.reduce(function(a,x){return a+(x.c.total||0);},0);
  if(!todos.length)return '<div style="color:var(--muted);text-align:center;padding:20px">'+esc(socNom(socio))+' no tiene nada anotado.</div>';
  // 1) Los cuatro temas con su total: se toca uno para ver solo ese
  var h='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px">'
    +SOC_TEMAS.map(function(t){var on=_sv.tema===t.id;
      return '<button data-sv-tema="'+t.id+'" style="text-align:left;background:'+(on?t.c+'22':'var(--card)')+';border:2px solid '+(on?t.c:'var(--border)')+';border-radius:12px;padding:9px 11px;cursor:pointer;color:var(--text);opacity:'+(n[t.id]||on?1:.45)+'">'
        +'<div style="font-size:11px;font-weight:700;color:'+t.c+'">'+t.e+' '+t.t+'</div><div style="font-weight:900;font-size:17px">'+fmt(tot[t.id])+'</div><div style="color:var(--muted);font-size:10.5px">'+n[t.id]+' registro'+(n[t.id]!==1?'s':'')+'</div></button>';}).join('')+'</div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border:1px solid '+col+'55;border-radius:10px;padding:9px 12px;margin-bottom:10px"><b style="color:'+col+'">Debe '+esc(socNom(socio))+(_sv.tema?' <span style="color:var(--muted);font-weight:600;font-size:11px">(todo)</span>':'')+'</b><b style="color:var(--gold);font-size:18px">'+fmt(total)+'</b></div>';
  var lista=todos.filter(function(x){return !_sv.tema||x.tema===_sv.tema;});
  var chip=function(v,t){var on=_sv.vista===v;return '<button data-sv-vista="'+v+'" style="flex:1;background:'+(on?'var(--accent)':'var(--card2)')+';color:'+(on?'#fff':'var(--text)')+';border:1px solid '+(on?'var(--accent)':'var(--border)')+';border-radius:99px;padding:8px;font-size:12.5px;font-weight:700;cursor:pointer">'+t+'</button>';};
  h+='<div style="display:flex;gap:6px;margin-bottom:10px">'+chip('dia','📅 Por día')+chip('prod','📦 Por producto')+(_sv.tema?'<button data-sv-tema="" style="background:none;border:1px solid var(--border);color:var(--muted);border-radius:99px;padding:8px 12px;font-size:12px;cursor:pointer">Ver todo</button>':'')+'</div>';
  if(!lista.length)return h+'<div style="color:var(--muted);text-align:center;padding:16px;font-size:13px">No hay registros de este tema.</div>';
  if(_sv.vista==='prod'){
    // 2a) Agrupado por producto, dentro de cada tema
    SOC_TEMAS.forEach(function(t){
      var ag={};
      lista.filter(function(x){return x.tema===t.id;}).forEach(function(x){_socItems(x.c).forEach(function(it){var k=_socLimpio(it.nombre);if(!ag[k])ag[k]={nombre:k,qty:0,total:0};ag[k].qty+=(it.qty||0);ag[k].total+=(it.precioSocio||0)*(it.qty||0);});});
      var arr=Object.keys(ag).map(function(k){return ag[k];}).sort(function(a,b){return b.total-a.total;});
      if(!arr.length)return;
      h+='<div style="color:'+t.c+';font-weight:800;font-size:12.5px;margin:10px 0 4px">'+t.e+' '+t.t+' · '+fmt(tot[t.id])+'</div>'
        +arr.map(function(a){return '<div style="display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:13px"><span>'+(t.id==='consumo'?'<b style="color:'+t.c+'">'+a.qty+' ×</b> ':'')+esc(a.nombre)+(t.id!=='consumo'&&a.qty>1?' <span style="color:var(--muted)">('+a.qty+' veces)</span>':'')+'</span><b style="white-space:nowrap">'+fmt(a.total)+'</b></div>';}).join('');
    });
    return h;
  }
  // 2b) Agrupado por día (día de negocio), plegado; el más reciente abierto
  var dias={},orden=[];
  lista.slice().sort(function(a,b){return b.c.ts-a.c.ts;}).forEach(function(x){var d=_socDiaISO(x.c.ts);if(!dias[d]){dias[d]=[];orden.push(d);}dias[d].push(x);});
  if(!_sv.abiertos){_sv.abiertos={};_sv.abiertos[orden[0]]=true;}
  orden.slice(0,_sv.tope).forEach(function(d){
    var l=dias[d],td=l.reduce(function(a,x){return a+(x.c.total||0);},0),ab=!!_sv.abiertos[d],pt={};
    l.forEach(function(x){pt[x.tema]=(pt[x.tema]||0)+(x.c.total||0);});
    h+='<div style="background:var(--bg);border:1px solid '+(ab?col+'77':'var(--border)')+';border-radius:11px;margin-bottom:7px;overflow:hidden">'
      +'<div data-sv-dia="'+d+'" style="display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer">'
        +'<div style="flex:1;min-width:0"><div style="font-weight:800;font-size:13.5px">'+(ab?'▼':'▶')+' '+_socDiaTxt(d)+'</div>'
        +'<div style="color:var(--muted);font-size:11px">'+SOC_TEMAS.filter(function(t){return pt[t.id];}).map(function(t){return t.e+' '+fmt(pt[t.id]);}).join(' · ')+'</div></div>'
        +'<b style="color:var(--gold);font-size:15px;white-space:nowrap">'+fmt(td)+'</b></div>';
    if(ab)h+='<div style="padding:0 12px 8px">'+l.map(function(x){
        var c=x.c,t=SOC_TEMAS.filter(function(y){return y.id===x.tema;})[0],its=_socItems(c);
        return '<div style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--border);font-size:12.5px">'
          +'<span style="color:var(--muted);min-width:60px;font-variant-numeric:tabular-nums">'+new Date(c.ts).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'})+'</span>'
          +'<div style="flex:1;min-width:0"><span style="color:'+t.c+'">'+t.e+'</span> '+its.map(function(it){return (x.tema==='consumo'||it.qty>1?it.qty+' × ':'')+esc(_socLimpio(it.nombre));}).join(', ')
          +(c.uidNombre?'<div style="color:var(--muted);font-size:11px">lo anotó '+esc(c.uidNombre)+'</div>':'')+'</div>'
          +'<b style="white-space:nowrap">'+fmt(c.total||0)+'</b>'
          +(esAdmin?'<button data-act="delsocio" data-sid="'+c.id+'" aria-label="Eliminar" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:2px 8px;font-size:12px;cursor:pointer">✕</button>':'')+'</div>';
      }).join('')+'</div>';
    h+='</div>';
  });
  if(orden.length>_sv.tope)h+='<button data-sv-mas style="width:100%;background:var(--card2);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:10px;font-weight:700;cursor:pointer">Ver días anteriores ('+(orden.length-_sv.tope)+' más)</button>';
  return h;
}
document.addEventListener('click',function(e){
  if(!e.target.closest||tabActual!=='socios')return;
  var a=e.target.closest('[data-sv-tema]'),b=e.target.closest('[data-sv-vista]'),c=e.target.closest('[data-sv-dia]'),d=e.target.closest('[data-sv-mas]');
  if(!a&&!b&&!c&&!d)return;
  if(a){_sv.tema=_sv.tema===a.dataset.svTema?'':a.dataset.svTema;_sv.abiertos=null;}
  if(b)_sv.vista=b.dataset.svVista;
  if(c){if(!_sv.abiertos)_sv.abiertos={};_sv.abiertos[c.dataset.svDia]=!_sv.abiertos[c.dataset.svDia];}
  if(d)_sv.tope+=20;
  var y=window.scrollY;render();window.scrollTo(0,y);
});
