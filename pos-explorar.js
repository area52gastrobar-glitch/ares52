/* ═══════════ 🔎 BUSCADOR DE VENTAS ═══════════
   Filtra los cobros por fecha, zona, mesa, producto, quién atendió y medio de pago.
   Cada cobro se abre y muestra: qué se pidió y a qué hora, cuándo se cobró, cómo se pagó
   y con qué mensaje del banco se cruzó. Los filtros no se redibujan al escribir.          */
var _exp={d1:'',d2:'',zona:'',mesa:'',prod:'',uid:'',fp:'',abierta:'',tope:60,verUnd:true};
function _expDiaISO(ts){var d=fechaNegocio(ts);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function _expItems(v){return v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];}
function _expNombre(it){
  if(it.isCombo)return '🎁 Combo '+(it.comboNombre||'');
  if(it.isCubetazoMix)return '🪣 '+(it.cubMixNombre||'Cubetazo mixto')+' ('+(it.cubMixDetalle||[]).map(function(d){return d.cantidad+'× '+d.nombre;}).join(', ')+')';
  if(it.isCustom)return '✏️ '+(it.customNombre||'Otro');
  var p=menu.find(function(m){return m.id==it.pid;});
  return (it.nombreVenta||((p?p.nombre:(it.nombre||'Producto borrado del menú'))+(it.varianteNombre?' ('+it.varianteNombre+')':'')))+(it.cubeta&&!it.nombreVenta?' 🪣 cubetazo':'')+(it.es2x1Gratis&&!it.nombreVenta?' (2x1 gratis)':'');
}
/* Texto donde se busca el producto: incluye lo que va dentro de combos y cubetazos mixtos */
function _expTextoItem(it){
  var t=_expNombre(it);
  if(it.isCombo)t+=' '+(it.comboIngredientes||[]).map(function(g){var p=g.prodId!=null?menu.find(function(m){return m.id==g.prodId;}):null;return p?p.nombre:'';}).join(' ');
  return _normTxt(t);
}
/* 📦 Unidades reales por producto: los combos se desarman en sus botellas y cervezas, el cubetazo cuenta 5,
   el cubetazo mixto cuenta cada cerveza y los tamaños (alitas x12) cuentan sus unidades. */
function expUnidades(vs){
  var m={};
  function add(p,nombre,und,plata,enCombo){
    var k=_normTxt(nombre);
    if(!m[k])m[k]={nombre:nombre,emoji:p?p.emoji||'':'',cat:p?(p.cat||''):'Otros',und:0,enCombos:0,total:0};
    m[k].und+=und;m[k].total+=plata;if(enCombo)m[k].enCombos+=und;
  }
  vs.forEach(function(v){
    _expItems(v).forEach(function(it){
      var q=it.qty||1;
      if(it.isCustom){if(!it.esAsumeSocio)add(null,'Otro: '+(it.customNombre||''),q,(it.customPrecio||0)*q);return;}
      if(it.isCombo){
        var comps=_comboComponentes(it).map(function(g){var p=menu.find(function(x){return Number(x.id)===Number(g.prodId);});return{g:g,p:p,lista:p?(p.precio||0)*(g.cantidad||1):0};}).filter(function(c){return c.p;});
        var base=comps.reduce(function(a,c){return a+c.lista;},0);
        if(!comps.length){add(null,'Combo '+(it.comboNombre||'')+' (sin productos del menú)',q,(it.comboPrecio||0)*q);return;}
        comps.forEach(function(c){add(c.p,c.p.nombre,(c.g.cantidad||1)*(parseInt(c.g.varianteUnd)||1)*q,(it.comboPrecio||0)*q*(base>0?c.lista/base:1/comps.length),true);});
        return;
      }
      if(it.isCubetazoMix){
        var det=it.cubMixDetalle?(Array.isArray(it.cubMixDetalle)?it.cubMixDetalle:Object.values(it.cubMixDetalle)):[];
        var tot=det.reduce(function(a,d){return a+(d.cantidad||0);},0)||1;
        det.forEach(function(d){var p=menu.find(function(x){return Number(x.id)===Number(d.prodId!=null?d.prodId:d.pid);});add(p,p?p.nombre:(d.nombre||'?'),(d.cantidad||0)*q,(it.cubMixPrecio||0)*q*((d.cantidad||0)/tot),true);});
        return;
      }
      var p=menu.find(function(x){return x.id==it.pid;}),vu=parseInt(it.varianteUnd)||1;
      var nom=(p?p.nombre:(it.nombre||it.nombreVenta||'Producto borrado del menú'))+((it.varianteNombre&&vu<=1&&!it.cubeta)?' ('+it.varianteNombre+')':'');
      add(p,nom,q*(it.cubeta?5:vu),precioItem(it)*q);
    });
  });
  return Object.keys(m).map(function(k){return m[k];}).sort(function(x,y){return (x.cat||'').localeCompare(y.cat||'')||y.und-x.und;});
}
function _expUnidadesHTML(lista,q){
  var filas=expUnidades(lista);if(q)filas=filas.filter(function(f){return _normTxt(f.nombre).indexOf(q)>=0;});
  if(!filas.length)return '';
  var cat='',h='<div style="background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:8px">'
    +'<div onclick="_exp.verUnd=!_exp.verUnd;expPintar()" style="cursor:pointer;font-weight:800;font-size:13px">'+(_exp.verUnd?'▼':'▶')+' 📦 Unidades vendidas por producto <span style="color:var(--muted);font-weight:600;font-size:11px">· combos y cubetazos desarmados</span></div>';
  if(_exp.verUnd){
    h+='<div style="display:grid;grid-template-columns:1fr auto auto;gap:2px 12px;font-size:12px;margin-top:6px;font-variant-numeric:tabular-nums">'
      +'<b style="color:var(--muted)">Producto</b><b style="color:var(--muted);text-align:right">Unidades</b><b style="color:var(--muted);text-align:right">Valor</b>';
    filas.forEach(function(f){
      if(f.cat!==cat){cat=f.cat;h+='<div style="grid-column:1/-1;color:var(--accent);font-weight:800;margin-top:6px">'+esc(cat||'Sin categoría')+'</div>';}
      h+='<span>'+(f.emoji?f.emoji+' ':'')+esc(f.nombre)+(f.enCombos?' <span style="color:var(--muted);font-size:10.5px">('+f.enCombos+' en combos o cubetazos mixtos)</span>':'')+'</span><b style="text-align:right">'+f.und+'</b><span style="text-align:right;color:var(--muted)">'+fmt(f.total)+'</span>';
    });
    h+='</div><div style="color:var(--muted);font-size:10.5px;margin-top:6px">El valor de un combo se reparte entre sus productos según el precio de lista de cada uno.</div>';
  }
  return h+'</div>';
}
function _expFiltradas(){
  var q=_normTxt(_exp.prod||''),qm=_normTxt(_exp.mesa||'');
  return ventas.filter(function(v){
    var dia=_expDiaISO(v.ts);
    if(_exp.d1&&dia<_exp.d1)return false;
    if(_exp.d2&&dia>_exp.d2)return false;
    if(_exp.zona&&v.zona!==_exp.zona)return false;
    if(qm&&_normTxt(v.mesa||'').indexOf(qm)<0)return false;
    if(_exp.uid&&(v.uidNombre||v.uid||'')!==_exp.uid)return false;
    if(_exp.fp){var ps=(v.pagos&&v.pagos.length)?v.pagos.map(function(p){return p.fp;}):[v.fp];if(ps.indexOf(_exp.fp)<0)return false;}
    if(q&&!_expItems(v).some(function(it){return _expTextoItem(it).indexOf(q)>=0;}))return false;
    return true;
  }).sort(function(a,b){return b.ts-a.ts;});
}
function _expHora(ts){return new Date(ts).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'});}
function _expDur(ms){var m=Math.round(ms/60000);return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min';}
/* Mensaje del banco que coincide con un pago digital: mismo valor y hasta 15 minutos de diferencia */
function _expMensajeBanco(monto,ts){
  var mejor=null,dif=Infinity;
  (smsBanco||[]).forEach(function(m){
    parsearSmsBanco(m.texto||'').forEach(function(p){
      if(p.monto!==monto)return;var d=Math.abs(p.ts-ts);
      if(d<=15*60000&&d<dif){mejor={p:p,origen:m.origen||'sms'};dif=d;}
    });
  });
  return mejor?{p:mejor.p,origen:mejor.origen,difMin:Math.round(dif/60000)}:null;
}
function _expDetalle(v){
  var its=_expItems(v),q=_normTxt(_exp.prod||'');
  var h='<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-size:12px">';
  // 1) Línea de tiempo
  var log=v.log?(Array.isArray(v.log)?v.log:Object.values(v.log)):[];
  log=log.filter(function(l){return l&&l.ts;}).sort(function(a,b){return a.ts-b.ts;});
  h+='<div style="font-weight:800;color:var(--accent);margin-bottom:4px">🕒 Lo que pasó en la mesa</div>';
  if(log.length){
    h+='<div style="color:var(--muted);margin-bottom:4px">Primer pedido '+_expHora(log[0].ts)+' · cobrada '+_expHora(v.ts)+' · estuvo abierta '+_expDur(v.ts-log[0].ts)+'</div>';
    h+=log.map(function(l){
      return '<div style="display:flex;gap:8px;padding:2px 0"><span style="color:var(--muted);min-width:64px;font-variant-numeric:tabular-nums">'+_expHora(l.ts)+'</span><span style="flex:1;color:'+((l.delta||0)<0?'#f5a623':'var(--text)')+'">'+esc(l.texto||'')+'</span><span style="color:var(--muted)">'+esc(l.uidNombre||'')+'</span></div>';
    }).join('');
    h+='<div style="display:flex;gap:8px;padding:2px 0;font-weight:700"><span style="color:var(--gold);min-width:64px">'+_expHora(v.ts)+'</span><span style="flex:1">💵 Cobro por '+fmt(v.total)+'</span><span style="color:var(--muted)">'+esc(v.uidNombre||'')+'</span></div>';
  }else{
    h+='<div style="color:var(--muted)">Cobrada a las '+_expHora(v.ts)+' por '+esc(v.uidNombre||v.uid||'')+'. Este cobro es anterior a la versión que guarda la hora de cada pedido; los cobros nuevos sí la traen.</div>';
  }
  // 2) Productos
  var suma=0;
  h+='<div style="font-weight:800;color:var(--accent);margin:10px 0 4px">🧾 Productos cobrados</div>';
  h+=its.map(function(it){
    var pr=precioItem(it),c=it.qty||1;suma+=pr*c;
    var hit=q&&_expTextoItem(it).indexOf(q)>=0;
    return '<div style="display:flex;justify-content:space-between;gap:8px;padding:2px 0;'+(hit?'background:#f5a62318;border-radius:5px;padding:2px 5px;':'')+'"><span>'+c+' × '+esc(_expNombre(it))+(it.recGruposTxt?' <span style="color:#38bdf8">['+esc(it.recGruposTxt)+']</span>':'')+'</span><span style="white-space:nowrap">'+fmt(pr*c)+'</span></div>';
  }).join('');
  if(its.length&&Math.abs((v.total||0)-suma)>=1){
    h+='<div style="display:flex;justify-content:space-between;color:var(--muted);padding:2px 0"><span>'+(v.descuento&&v.descuento.pct?'Descuento '+v.descuento.pct+'%'+(v.descuento.auth?' (autorizó '+esc(v.descuento.auth)+')':''):'Diferencia con los precios de hoy')+'</span><span>'+fmt((v.total||0)-suma)+'</span></div>';
  }
  // 3) Pagos y mensaje del banco
  var pagos=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
  h+='<div style="font-weight:800;color:var(--accent);margin:10px 0 4px">💳 Cómo se pagó</div>';
  h+=pagos.map(function(p){
    var f=FPAGO.find(function(x){return x.id===p.fp;}),linea='<div style="padding:2px 0"><b>'+(f?f.emoji+' '+f.label:esc(p.fp||''))+'</b> '+fmt(p.monto||0);
    if(p.fp&&p.fp!=='efectivo'){
      var m=_expMensajeBanco(p.monto||0,v.ts);
      linea+=m?'<div style="color:#22c55e;margin-left:6px">✓ Mensaje del banco a las '+_expHora(m.p.ts)+(m.p.de?' de '+esc(m.p.de):'')+' ('+(m.difMin?m.difMin+' min de diferencia':'misma hora')+')<div style="color:var(--muted);font-size:11px">«'+esc(m.p.txt)+'»</div></div>'
              :'<div style="color:var(--muted);margin-left:6px">Sin mensaje del banco guardado por ese valor a esa hora.</div>';
    }
    return linea+'</div>';
  }).join('');
  if(v.abonos&&v.abonos.length)h+='<div style="color:var(--muted)">Abonos previos: '+v.abonos.map(function(a){return fmt(a.monto||0)+(a.ts?' a las '+_expHora(a.ts):'');}).join(' · ')+'</div>';
  if(v.refPago)h+='<div style="color:var(--muted)">Referencia del comprobante: '+esc(v.refPago)+'</div>';
  if(v.sinFoto)h+='<div style="color:var(--muted)">Sin foto del comprobante'+(v.sinFotoMotivo?': '+esc(v.sinFotoMotivo):'')+'</div>';
  if(v.editadoFP)h+='<div style="color:#f5a623">✏️ La forma de pago fue corregida después del cobro'+(v.editadoDetalle?': '+esc(v.editadoDetalle):'')+'</div>';
  // 4) Acciones
  if(v._fbkey){
    var b='flex:1;min-width:120px;border-radius:7px;padding:7px;font-size:11px;font-weight:700;cursor:pointer;';
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">'
      +'<button onclick="reimprimirVenta(\''+v._fbkey+'\')" style="'+b+'background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833">🖨️ Recibo</button>'
      +(usuarioActivo&&usuarioActivo.rol==='admin'
        ?'<button data-act="venta-editfp" data-key="'+v._fbkey+'" style="'+b+'background:#f5a62318;color:#f5a623;border:1px solid #f5a62333">✏️ Forma de pago</button>'
         +(!v.esPagoCredito?'<button data-act="venta-devolver" data-key="'+v._fbkey+'" style="'+b+'background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833">↩️ Devolver a mesa</button>':'')
         +'<button onclick="eliminarVentaDuplicada(\''+v._fbkey+'\')" style="'+b+'background:#ef444418;color:#ef4444;border:1px solid #ef444433">🗑️ Eliminar</button>'
        :'')
      +'</div>';
  }
  return h+'</div>';
}
function _expListaHTML(){
  var lista=_expFiltradas(),q=_normTxt(_exp.prod||'');
  if(!lista.length)return '<div style="color:var(--muted);text-align:center;padding:16px;font-size:13px">No hay cobros con esos filtros. Amplía las fechas o borra algún filtro.</div>';
  var total=lista.reduce(function(a,v){return a+(v.total||0);},0);
  var porFp={};lista.forEach(function(v){((v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}]).forEach(function(p){porFp[p.fp]=(porFp[p.fp]||0)+(p.monto||0);});});
  var h='<div style="background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px">'
    +'<div style="display:flex;justify-content:space-between;align-items:baseline"><b>'+lista.length+' cobro'+(lista.length!==1?'s':'')+'</b><span style="color:var(--gold);font-weight:900;font-size:17px">'+fmt(total)+'</span></div>'
    +'<div style="color:var(--muted);font-size:11px;margin-top:3px">'+Object.keys(porFp).map(function(k){var f=FPAGO.find(function(x){return x.id===k;});return (f?f.label:k)+' '+fmt(porFp[k]);}).join(' · ')+'</div>';
  if(q){
    var fu=expUnidades(lista).filter(function(f){return _normTxt(f.nombre).indexOf(q)>=0;});
    var und=fu.reduce(function(x,f){return x+f.und;},0),val=fu.reduce(function(x,f){return x+f.total;},0),enC=fu.reduce(function(x,f){return x+f.enCombos;},0);
    h+='<div style="color:#f5a623;font-size:12px;font-weight:700;margin-top:5px">«'+esc(_exp.prod)+'»: '+und+' unidad'+(und!==1?'es':'')+' por '+fmt(val)+(enC?' ('+enC+' dentro de combos o cubetazos mixtos)':'')+'</div>';
  }
  h+='</div>'+_expUnidadesHTML(lista,q);
  var diaAnt='';
  h+=lista.slice(0,_exp.tope).map(function(v){
    var z=ZONAS.find(function(x){return x.id===v.zona;}),its=_expItems(v),n=its.reduce(function(a,it){return a+(it.qty||1);},0);
    var pagos=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp}];
    var fpTxt=pagos.map(function(p){var f=FPAGO.find(function(x){return x.id===p.fp;});return f?f.label:(p.fp||'');}).join(' + ');
    var llave=v._fbkey||String(v.ts),ab=_exp.abierta===llave,dia=diaNegocioStr(v.ts),cab='';
    if(dia!==diaAnt){diaAnt=dia;cab='<div style="color:var(--muted);font-size:11px;font-weight:800;margin:10px 0 4px">📅 '+dia+'</div>';}
    return cab+'<div style="background:var(--bg);border:1px solid '+(ab?'var(--accent)':'var(--border)')+';border-radius:9px;padding:8px 12px;margin-bottom:5px">'
      +'<div data-exp="'+llave+'" style="display:flex;align-items:center;gap:10px;cursor:pointer">'
        +'<span style="color:var(--muted);font-size:12px;min-width:62px;font-variant-numeric:tabular-nums">'+_expHora(v.ts)+'</span>'
        +'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">'+(ab?'▼':'▶')+' '+(z?z.label+' · ':'')+esc(v.mesa||'?')+'</div>'
        +'<div style="color:var(--muted);font-size:11px">'+esc(v.uidNombre||v.uid||'')+' · '+esc(fpTxt)+' · '+n+' ítem'+(n!==1?'s':'')+'</div></div>'
        +'<span style="color:var(--gold);font-weight:900;font-size:15px;white-space:nowrap">'+fmt(v.total)+'</span>'
      +'</div>'+(ab?_expDetalle(v):'')+'</div>';
  }).join('');
  if(lista.length>_exp.tope)h+='<button onclick="_exp.tope+=100;expPintar()" style="width:100%;background:var(--card2);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:10px;font-weight:700;cursor:pointer">Ver más ('+(lista.length-_exp.tope)+' cobros más)</button>';
  return h;
}
function expPintar(){var el=document.getElementById('exp-lista');if(el)el.innerHTML=_expListaHTML();}
function expCambio(campo,valor){_exp[campo]=valor;_exp.tope=60;_exp.abierta='';expPintar();}
function expRango(cual){
  var hoy=_expDiaISO(a52Ahora()),d=fechaNegocio(a52Ahora());
  if(cual==='hoy'){_exp.d1=_exp.d2=hoy;}
  else if(cual==='ayer'){d.setDate(d.getDate()-1);_exp.d1=_exp.d2=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  else if(cual==='semana'){d.setDate(d.getDate()-6);_exp.d1=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);_exp.d2=hoy;}
  else if(cual==='mes'){_exp.d1=hoy.slice(0,8)+'01';_exp.d2=hoy;}
  else{_exp.d1=_exp.d2='';}
  var a=document.getElementById('exp-d1'),b=document.getElementById('exp-d2');if(a)a.value=_exp.d1;if(b)b.value=_exp.d2;
  _exp.tope=60;_exp.abierta='';expPintar();
}
function expLimpiar(){_exp={d1:'',d2:'',zona:'',mesa:'',prod:'',uid:'',fp:'',abierta:'',tope:60,verUnd:true};render();}
function buscadorVentasHTML(){
  if(!_exp.d1&&!_exp.d2&&!_exp._ini){_exp._ini=true;_exp.d1=_exp.d2=_expDiaISO(a52Ahora());}
  var usuariosV={};ventas.forEach(function(v){var u=v.uidNombre||v.uid;if(u)usuariosV[u]=true;});
  var inp='background:var(--bg);border:1px solid var(--border);border-radius:9px;color:var(--text);padding:9px 10px;font-size:13px;width:100%';
  var chip='background:var(--card2);border:1px solid var(--border);color:var(--text);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer';
  return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'
      +['hoy:Hoy','ayer:Ayer','semana:7 días','mes:Este mes','todo:Todo'].map(function(x){var p=x.split(':');return '<button onclick="expRango(\''+p[0]+'\')" style="'+chip+'">'+p[1]+'</button>';}).join('')
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:10px">'
      +'<label style="font-size:11px;color:var(--muted)">Desde<input id="exp-d1" type="date" value="'+_exp.d1+'" onchange="expCambio(\'d1\',this.value)" style="'+inp+'"/></label>'
      +'<label style="font-size:11px;color:var(--muted)">Hasta<input id="exp-d2" type="date" value="'+_exp.d2+'" onchange="expCambio(\'d2\',this.value)" style="'+inp+'"/></label>'
      +'<label style="font-size:11px;color:var(--muted)">Zona<select id="exp-zona" onchange="expCambio(\'zona\',this.value)" style="'+inp+'"><option value="">Todas</option>'+ZONAS.map(function(z){return '<option value="'+z.id+'"'+(_exp.zona===z.id?' selected':'')+'>'+esc(z.label)+'</option>';}).join('')+'</select></label>'
      +'<label style="font-size:11px;color:var(--muted)">Mesa<input id="exp-mesa" type="search" value="'+esc(_exp.mesa)+'" placeholder="Mesa 5, venta rápida…" oninput="expCambio(\'mesa\',this.value)" style="'+inp+'"/></label>'
      +'<label style="font-size:11px;color:var(--muted)">Producto<input id="exp-prod" type="search" value="'+esc(_exp.prod)+'" placeholder="corona, alitas, combo…" oninput="expCambio(\'prod\',this.value)" style="'+inp+'"/></label>'
      +'<label style="font-size:11px;color:var(--muted)">Atendió<select id="exp-uid" onchange="expCambio(\'uid\',this.value)" style="'+inp+'"><option value="">Todos</option>'+Object.keys(usuariosV).sort().map(function(u){return '<option'+(_exp.uid===u?' selected':'')+'>'+esc(u)+'</option>';}).join('')+'</select></label>'
      +'<label style="font-size:11px;color:var(--muted)">Medio de pago<select id="exp-fp" onchange="expCambio(\'fp\',this.value)" style="'+inp+'"><option value="">Todos</option>'+FPAGO.map(function(f){return '<option value="'+f.id+'"'+(_exp.fp===f.id?' selected':'')+'>'+esc(f.label)+'</option>';}).join('')+'</select></label>'
      +'<div style="display:flex;align-items:flex-end"><button onclick="expLimpiar()" style="'+chip+';width:100%;border-radius:9px;padding:9px">Borrar filtros</button></div>'
    +'</div>'
    +'<div id="exp-lista">'+_expListaHTML()+'</div>';
}
document.addEventListener('click',function(e){
  var f=e.target.closest&&e.target.closest('[data-exp]');if(!f)return;
  _exp.abierta=(_exp.abierta===f.dataset.exp)?'':f.dataset.exp;expPintar();
});
