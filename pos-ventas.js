/* ═══════════════ VENTAS ═══════════════ */
function _desgloseProductosVentas(vs){
  // Unidades y plata por producto de un conjunto de ventas — con combos, cubetazos y 2x1 explotados
  var porProd={};
  var add=function(key,nombre,emoji,qty,total){
    if(!porProd[key])porProd[key]={nombre:nombre,emoji:emoji,qty:0,total:0};
    porProd[key].qty+=qty;porProd[key].total+=total;
  };
  vs.forEach(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    its.forEach(function(it){
      var q=it.qty||1;
      if(it.isCustom){if(it.esAsumeSocio)return;add('cu_'+(it.customNombre||''),it.customNombre||'Personalizado','✏️',q,(it.customPrecio||0)*q);return;}
      if(it.isCombo){
        _comboReparto(it).forEach(function(cp){add('p_'+cp.p.nombre,cp.p.nombre,cp.p.emoji,cp.cant*q,cp.rev*q);});
        return;
      }
      if(it.isCubetazoMix){
        var det=it.cubMixDetalle?(Array.isArray(it.cubMixDetalle)?it.cubMixDetalle:Object.values(it.cubMixDetalle)):[];
        var tot=det.reduce(function(a,dd){return a+(dd.cantidad||0);},0)||1;
        det.forEach(function(dd){
          var pp=menu.find(function(m){return Number(m.id)===Number(dd.pid);});
          add('p_'+(pp?pp.nombre:dd.nombre||'?'),pp?pp.nombre:(dd.nombre||'?'),pp?pp.emoji:'🍺',(dd.cantidad||0)*q,(it.cubMixPrecio||0)*q*((dd.cantidad||0)/tot));
        });
        return;
      }
      var p=menu.find(function(m){return m.id==it.pid;});
      var nom=(p?p.nombre:(it.nombre||'?'))+(it.varianteNombre?' ('+it.varianteNombre+')':'');
      var und=(it.varianteUnd||1)*q;
      add('p_'+nom+(it.es2x1Gratis?'':''),nom,p?p.emoji:'📦',und,precioItem(it)*q);
    });
  });
  return Object.values(porProd).sort(function(a,b){return b.total-a.total||b.qty-a.qty;});
}
function toggleDesgloseDia(fecha){
  window._diaAbierto=(window._diaAbierto===fecha)?null:fecha;
  render();
}
function ventasDiariasHTML(){
  if(!ventas.length)return '<div style="color:var(--dim);text-align:center;padding:16px;font-size:13px">Sin ventas registradas</div>';
  // Agrupar por día de negocio
  var dias={};
  ventas.forEach(function(v){
    var k=diaNegocioStr(v.ts);
    if(!dias[k])dias[k]={fecha:k,ts:fechaNegocio(v.ts).getTime(),total:0,n:0,porPago:{},ventas:[]};
    dias[k].total+=v.total;dias[k].n++;
    dias[k].ventas.push(v);
    if(v.pagos&&v.pagos.length){v.pagos.forEach(function(p){dias[k].porPago[p.fp]=(dias[k].porPago[p.fp]||0)+p.monto;});}
    else{dias[k].porPago[v.fp]=(dias[k].porPago[v.fp]||0)+v.total;}
  });
  // Ordenar por fecha desc (más reciente primero)
  var lista=Object.values(dias).sort(function(a,b){return b.ts-a.ts;});
  var hoyNeg=hoyNegocioStr();
  return lista.map(function(d){
    var esHoy=(d.fecha===hoyNeg);
    var abierto=window._diaAbierto===d.fecha;
    var pagosTxt=FPAGO.filter(function(f){return d.porPago[f.id];}).map(function(f){
      return '<span style="display:inline-flex;align-items:center;gap:3px;margin-right:10px;font-size:11px;color:var(--muted)">'+f.emoji+' '+fmt(d.porPago[f.id])+'</span>';
    }).join('');
    var desglose='';
    if(abierto){
      var prods=_desgloseProductosVentas(d.ventas);
      var totUnd=prods.reduce(function(a,p){return a+p.qty;},0);
      desglose='<div style="margin-top:9px;padding-top:8px;border-top:1px solid var(--border)">'
        +'<div style="font-size:11px;font-weight:800;color:#22c55e;margin-bottom:4px">🍽 Qué se vendió · '+totUnd+' unidades</div>'
        +prods.map(function(p){
          return'<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid var(--border)">'
            +'<span style="font-size:11.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+p.emoji+' '+esc(p.nombre)+'</span>'
            +'<span style="font-size:11px;font-weight:900;color:#22c55e;margin:0 8px;white-space:nowrap">'+p.qty+' und</span>'
            +'<span style="font-size:11px;font-weight:700;color:var(--gold);white-space:nowrap">'+fmt(p.total)+'</span>'
          +'</div>';
        }).join('')
        +'<div style="color:var(--muted);font-size:9.5px;margin-top:4px">Combos, cubetazos y 2x1 aparecen explotados en sus productos reales; la plata del combo se reparte proporcional.</div>'
      +'</div>';
    }
    return '<div onclick="toggleDesgloseDia(\''+d.fecha+'\')" style="background:'+(esHoy?'#f5a62312':'var(--bg)')+';border:1px solid '+(esHoy?'#f5a62344':'var(--border)')+';border-radius:11px;padding:12px 14px;margin-bottom:8px;cursor:pointer">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
        +'<div style="font-weight:800;font-size:14px">'+(abierto?'▼ ':'')+(esHoy?'🟢 Hoy · ':'📅 ')+d.fecha+'</div>'
        +'<div style="color:var(--gold);font-weight:900;font-size:17px">'+fmt(d.total)+'</div>'
      +'</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:6px">'+d.n+' cobros · <span style="color:#38bdf8;font-weight:700">'+(abierto?'ocultar detalle':'toca para ver qué se vendió')+'</span></div>'
      +'<div style="display:flex;flex-wrap:wrap">'+pagosTxt+'</div>'
      +desglose
    +'</div>';
  }).join('');
}

/* ═══════════ CALENDARIO PROPIO (selector de fecha en cuadrícula) ═══════════ */
var MESES_CAL=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function abrirCalendario(target){
  window._calTarget=target;
  var actual=(target==='d1'?window._vcD1:window._vcD2);
  window._calMes=actual?new Date(actual+'T12:00:00'):new Date();
  renderCalendario();
}
function moverCalMes(delta){
  window._calMes.setMonth(window._calMes.getMonth()+delta);
  renderCalendario();
}
function renderCalendario(){
  var base=window._calMes;
  var y=base.getFullYear(),mo=base.getMonth();
  var sel=(window._calTarget==='d1'?window._vcD1:window._vcD2)||'';
  var hoyKey=(function(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);})();
  var primerDia=new Date(y,mo,1).getDay(); // 0=domingo
  var diasMes=new Date(y,mo+1,0).getDate();
  var celdas='';
  ['D','L','M','M','J','V','S'].forEach(function(d){
    celdas+='<div style="text-align:center;color:var(--muted);font-size:10px;font-weight:800;padding:4px 0">'+d+'</div>';
  });
  for(var i=0;i<primerDia;i++)celdas+='<div></div>';
  for(var dia=1;dia<=diasMes;dia++){
    var key=y+'-'+('0'+(mo+1)).slice(-2)+'-'+('0'+dia).slice(-2);
    var esSel=key===sel;var esHoy=key===hoyKey;
    celdas+='<button onclick="elegirDiaCal(\''+key+'\')" style="aspect-ratio:1;background:'+(esSel?'var(--accent)':(esHoy?'var(--accent)22':'var(--bg)'))+';color:'+(esSel?'#fff':'var(--text)')+';border:1px solid '+(esSel?'var(--accent)':(esHoy?'var(--accent)66':'var(--border)'))+';border-radius:9px;font-size:13px;font-weight:'+(esSel||esHoy?'900':'600')+';cursor:pointer">'+dia+'</button>';
  }
  // Selector rápido de año
  var anios='';for(var a=y-3;a<=y+1;a++){anios+='<option value="'+a+'"'+(a===y?' selected':'')+'>'+a+'</option>';}
  modal2('<div style="text-align:center;margin-bottom:8px"><div style="font-weight:900;font-size:15px">📅 '+(window._calTarget==='d1'?'Fecha DESDE':'Fecha HASTA')+'</div></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:6px">'
      +'<button onclick="moverCalMes(-1)" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:8px 14px;font-weight:900;font-size:15px;cursor:pointer">‹</button>'
      +'<span style="font-weight:800;font-size:14px">'+MESES_CAL[mo]+'</span>'
      +'<select class="inp" onchange="window._calMes.setFullYear(parseInt(this.value));renderCalendario();" style="width:auto;padding:6px 8px;font-weight:800">'+anios+'</select>'
      +'<button onclick="moverCalMes(1)" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:8px 14px;font-weight:900;font-size:15px;cursor:pointer">›</button>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">'+celdas+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:12px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +((window._calTarget==='d1'?window._vcD1:window._vcD2)?'<button class="btn btn-full" onclick="elegirDiaCal(\'\')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444444">Limpiar</button>':'')
    +'</div>');
}
function elegirDiaCal(key){
  if(window._calTarget==='d1')window._vcD1=key||'';else window._vcD2=key||'';
  closeModal2();
  render();
}
function _fmtDiaCal(key){
  if(!key)return null;
  var p=key.split('-');
  return p[2]+'/'+p[1]+'/'+p[0];
}

/* ═══════════ VENTAS POR CATEGORÍA (comida, cerveza, etc.) ═══════════ */
function ventasPorCategoria(desde,hasta){
  var cats={};
  ventas.forEach(function(v){
    if(v.ts<desde)return;
    if(hasta&&v.ts>hasta)return;
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    its.forEach(function(it){
      var cat,nombre,emoji;
      if(it.isCustom){cat='Personalizados';nombre=it.customNombre||'Personalizado';emoji='✏️';}
      else if(it.isCombo){
        // 🎁 Cada componente del combo cuenta en su categoría real (cervezas, licores...)
        _comboReparto(it).forEach(function(cp){
          var catC=cp.p.cat||'Sin categoría';
          if(!cats[catC])cats[catC]={qty:0,total:0,prods:{}};
          cats[catC].qty+=cp.cant*(it.qty||1);
          cats[catC].total+=cp.rev*(it.qty||1);
          if(!cats[catC].prods[cp.p.nombre])cats[catC].prods[cp.p.nombre]={qty:0,total:0,emoji:cp.p.emoji};
          cats[catC].prods[cp.p.nombre].qty+=cp.cant*(it.qty||1);
          cats[catC].prods[cp.p.nombre].total+=cp.rev*(it.qty||1);
        });
        return;
      }
      else if(it.isCubetazoMix){
        var d0=(it.cubMixDetalle||[])[0];
        var p0=d0?menu.find(function(m){return Number(m.id)===Number(d0.prodId);}):null;
        cat=(p0&&p0.cat)||'Cerveza';nombre=it.cubMixNombre||'Cubetazo mixto';emoji='🪣';
      } else {
        var p=menu.find(function(m){return m.id===it.pid;});
        cat=(p&&p.cat)||'Sin categoría';
        nombre=((p&&p.nombre)||it.nombre||'?')+(it.varianteNombre?' ('+it.varianteNombre+')':'')+(it.cubeta?' (cubetazo)':'');
        emoji=(p&&p.emoji)||'📦';
      }
      var rev=precioItem(it)*(it.qty||1);
      var qty=(it.qty||1)*(it.cubeta?5:1);
      if(!cats[cat])cats[cat]={qty:0,total:0,prods:{}};
      cats[cat].qty+=qty;cats[cat].total+=rev;
      if(!cats[cat].prods[nombre])cats[cat].prods[nombre]={qty:0,total:0,emoji:emoji};
      cats[cat].prods[nombre].qty+=qty;cats[cat].prods[nombre].total+=rev;
    });
  });
  // 🔴 Lo servido en mesas abiertas (ya salió del inventario, falta cobrarlo)
  // Solo si el periodo llega hasta hoy (no aplica a rangos históricos cerrados)
  if(!hasta||hasta>=a52Ahora()-60000){
    Object.keys(pedidos||{}).forEach(function(mid){
      (pedidos[mid]||[]).forEach(function(it){
        if(it.isCustom)return;
        var cat,nombre,emoji;
        if(it.isCombo){
          _comboReparto(it).forEach(function(cp){
            var catC=cp.p.cat||'Sin categoría';
            if(!cats[catC])cats[catC]={qty:0,total:0,prods:{}};
            cats[catC].enMesa=(cats[catC].enMesa||0)+cp.cant*(it.qty||1);
            cats[catC].enMesaTotal=(cats[catC].enMesaTotal||0)+cp.rev*(it.qty||1);
            if(!cats[catC].prods[cp.p.nombre])cats[catC].prods[cp.p.nombre]={qty:0,total:0,emoji:cp.p.emoji};
            cats[catC].prods[cp.p.nombre].enMesa=(cats[catC].prods[cp.p.nombre].enMesa||0)+cp.cant*(it.qty||1);
            cats[catC].prods[cp.p.nombre].enMesaTotal=(cats[catC].prods[cp.p.nombre].enMesaTotal||0)+cp.rev*(it.qty||1);
          });
          return;
        }
        else if(it.isCubetazoMix){
          var d0=(it.cubMixDetalle||[])[0];
          var p0=d0?menu.find(function(m){return Number(m.id)===Number(d0.prodId);}):null;
          cat=(p0&&p0.cat)||'Cerveza';nombre=it.cubMixNombre||'Cubetazo mixto';emoji='🪣';
        } else {
          var p=menu.find(function(m){return m.id===it.pid;});
          cat=(p&&p.cat)||'Sin categoría';
          nombre=((p&&p.nombre)||it.nombre||'?')+(it.varianteNombre?' ('+it.varianteNombre+')':'')+(it.cubeta?' (cubetazo)':'');
          emoji=(p&&p.emoji)||'📦';
        }
        var rev=precioItem(it)*(it.qty||1);
        var qty=(it.qty||1)*(it.cubeta?5:1);
        if(!cats[cat])cats[cat]={qty:0,total:0,prods:{}};
        cats[cat].enMesa=(cats[cat].enMesa||0)+qty;
        cats[cat].enMesaTotal=(cats[cat].enMesaTotal||0)+rev;
        if(!cats[cat].prods[nombre])cats[cat].prods[nombre]={qty:0,total:0,emoji:emoji};
        cats[cat].prods[nombre].enMesa=(cats[cat].prods[nombre].enMesa||0)+qty;
        cats[cat].prods[nombre].enMesaTotal=(cats[cat].prods[nombre].enMesaTotal||0)+rev;
      });
    });
  }
  return cats;
}
function _vcRango(){
  var m=window._vcModo||'turno';
  if(m==='rango'){
    var d1=window._vcD1?new Date(window._vcD1+'T00:00:00').getTime():0;
    var d2=window._vcD2?new Date(window._vcD2+'T23:59:59').getTime():a52Ahora();
    return {desde:d1,hasta:d2};
  }
  return {desde:m==='turno'?(turnoInicio||0):(m==='7d'?a52Ahora()-7*24*3600*1000:0),hasta:null};
}
function toggleVcCat(c){
  if(!window._vcOpen)window._vcOpen={};
  window._vcOpen[c]=!window._vcOpen[c];
  render();
}
function setVcModo(m){window._vcModo=m;window._vcOpen={};render();}
function exportarVentasCatExcel(){
  if(typeof XLSX==='undefined'||!window._xlsxReady){alert('La librería de Excel aún no carga.');return;}
  var m=window._vcModo||'turno';
  var etiqueta=m==='turno'?'Turno actual':(m==='7d'?'Últimos 7 días':(m==='rango'?('Del '+(window._vcD1||'inicio')+' al '+(window._vcD2||'hoy')):'Todo el histórico'));
  var rg=_vcRango();
  var cats=ventasPorCategoria(rg.desde,rg.hasta);
  var wb=XLSX.utils.book_new();
  var h1=[['Resumen de ventas por categoría · '+NEGOCIO.nombre],['Periodo',etiqueta],['Generado',new Date().toLocaleString('es-CO')],[],['Categoría','Unidades','Total vendido']];
  var claves=Object.keys(cats).sort(function(a,b){return cats[b].total-cats[a].total;});
  claves.forEach(function(c){h1.push([c,cats[c].qty,cats[c].total]);});
  h1.push(['TOTAL',claves.reduce(function(a,c){return a+cats[c].qty;},0),claves.reduce(function(a,c){return a+cats[c].total;},0)]);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(h1),'Por categoría');
  var h2=[['Categoría','Producto','Unidades','Total vendido']];
  claves.forEach(function(c){
    Object.keys(cats[c].prods).sort(function(a,b){return cats[c].prods[b].total-cats[c].prods[a].total;}).forEach(function(n){
      h2.push([c,n,cats[c].prods[n].qty,cats[c].prods[n].total]);
    });
  });
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(h2),'Por producto');
  XLSX.writeFile(wb,NEGOCIO.archivo+'-Ventas-por-categoria-'+_fechaKey(new Date())+'.xlsx');
  showToast('📥 Resumen por categoría exportado ('+etiqueta+')','#22c55e');
}

function _comboComponentes(it){
  var ings=it.comboIngredientes?(Array.isArray(it.comboIngredientes)?it.comboIngredientes:Object.values(it.comboIngredientes)):[];
  if(!ings.length){
    var cc=combos.find(function(x){return String(x.id)===String(it.comboId||it.pid);});
    if(cc)ings=cc.ingredientes||[];
  }
  return ings.filter(function(g){return g&&g.prodId!=null;});
}
function _comboReparto(it){
  // [{p,cant,rev}]: el precio del combo repartido según el valor de lista de cada componente
  var comps=_comboComponentes(it);
  if(!comps.length)return[];
  var conP=comps.map(function(g){
    var p=menu.find(function(m){return Number(m.id)===Number(g.prodId);});
    return{p:p,cant:(g.cantidad||1),lista:p?(p.precio||0)*(g.cantidad||1):0};
  }).filter(function(x){return x.p;});
  if(!conP.length)return[];
  var base=conP.reduce(function(a,x){return a+x.lista;},0);
  var precioCombo=it.comboPrecio||0;
  return conP.map(function(x){
    return{p:x.p,cant:x.cant,rev:base>0?precioCombo*(x.lista/base):(precioCombo/conP.length)};
  });
}
function renderVentas(){
  var puedeExcel=usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='cajero');
  var hoyV=ventasTurno();
  var totV=hoyV.reduce(function(a,v){return a+v.total;},0);
  var cubetazos=hoyV.reduce(function(a,v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    return a+its.reduce(function(b,i){return b+((i.cubeta||i.isCubetazoMix)?(i.qty||1):0);},0);
  },0);
  var porPago={};hoyV.forEach(function(v){
    if(v.pagos&&v.pagos.length){v.pagos.forEach(function(p){porPago[p.fp]=(porPago[p.fp]||0)+p.monto;});}
    else{porPago[v.fp]=(porPago[v.fp]||0)+v.total;}
  });
  var porProd={};
  hoyV.forEach(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    its.forEach(function(it){
      if(it.isCustom)return;
      if(it.isCombo){
        // 🎁 Explotar el combo: cada cerveza y licor cuenta en su producto real
        _comboReparto(it).forEach(function(cp){
          var kc='p_'+cp.p.nombre;
          if(!porProd[kc])porProd[kc]={nombre:cp.p.nombre,emoji:cp.p.emoji,qty:0,total:0};
          porProd[kc].qty+=cp.cant*(it.qty||1);
          porProd[kc].total+=cp.rev*(it.qty||1);
          if(cp.p.costo>0)porProd[kc].utl=(porProd[kc].utl||0)+(cp.rev-cp.p.costo*cp.cant)*(it.qty||1);
        });
        return;
      }
      if(it.isCubetazoMix){
        (it.cubMixDetalle||[]).forEach(function(dd){
          var km='p_'+dd.nombre;
          if(!porProd[km])porProd[km]={nombre:dd.nombre,emoji:dd.emoji||'🍺',qty:0,total:0};
          porProd[km].qty+=dd.cantidad*(it.qty||1);
          porProd[km].total+=(dd.precioUnidad||0)*dd.cantidad*(it.qty||1);
        });
        return;
      }
      var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
      var nombre=(p?p.nombre:(it.nombre||'?'))+(it.varianteNombre?' ('+it.varianteNombre+')':'');
      var emoji=p?p.emoji:'📦';
      var qty=it.cubeta?(it.qty||1)*5:(it.qty||1);  // cubetazo = 5 unidades
      var k='p_'+nombre;
      if(!porProd[k])porProd[k]={nombre:nombre,emoji:emoji,qty:0,total:0};
      porProd[k].qty+=qty;porProd[k].total+=precioItem(it)*(it.qty||1);
      if(p&&p.costo>0){
        var undM=it.cubeta?5:(parseInt(it.varianteUnd)||1);
        porProd[k].utl=(porProd[k].utl||0)+(precioItem(it)*(it.qty||1)-p.costo*undM*(it.qty||1));
      }
    });
  });
  // 🔴 Lo que está EN MESAS ahora: ya salió del inventario (se descuenta al servir), solo falta cobrarlo
  var enMesasTot=0;var enMesasItems=0;
  Object.keys(pedidos||{}).forEach(function(mid){
    var its=pedidos[mid]||[];
    its.forEach(function(it){
      enMesasTot+=precioItem(it)*(it.qty||1);
      if(it.isCustom)return;
      enMesasItems+=(it.qty||1);
      if(it.isCombo){
        _comboReparto(it).forEach(function(cp){
          var kc2='p_'+cp.p.nombre;
          if(!porProd[kc2])porProd[kc2]={nombre:cp.p.nombre,emoji:cp.p.emoji,qty:0,total:0};
          porProd[kc2].enMesa=(porProd[kc2].enMesa||0)+cp.cant*(it.qty||1);
          porProd[kc2].enMesaTotal=(porProd[kc2].enMesaTotal||0)+cp.rev*(it.qty||1);
          if(cp.p.costo>0)porProd[kc2].utl=(porProd[kc2].utl||0)+(cp.rev-cp.p.costo*cp.cant)*(it.qty||1);
        });
        return;
      }
      if(it.isCubetazoMix){
        (it.cubMixDetalle||[]).forEach(function(dd){
          var km='p_'+dd.nombre;
          if(!porProd[km])porProd[km]={nombre:dd.nombre,emoji:dd.emoji||'🍺',qty:0,total:0};
          porProd[km].enMesa=(porProd[km].enMesa||0)+dd.cantidad*(it.qty||1);
          porProd[km].enMesaTotal=(porProd[km].enMesaTotal||0)+(dd.precioUnidad||0)*dd.cantidad*(it.qty||1);
        });
        return;
      }
      var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
      var nombre=(p?p.nombre:(it.nombre||'?'))+(it.varianteNombre?' ('+it.varianteNombre+')':'');
      var emoji=p?p.emoji:'📦';
      var qty=it.cubeta?(it.qty||1)*5:(it.qty||1);
      var k='p_'+nombre;
      if(!porProd[k])porProd[k]={nombre:nombre,emoji:emoji,qty:0,total:0};
      porProd[k].enMesa=(porProd[k].enMesa||0)+qty;
      porProd[k].enMesaTotal=(porProd[k].enMesaTotal||0)+precioItem(it)*(it.qty||1);
      if(p&&p.costo>0){
        var undM2=it.cubeta?5:(parseInt(it.varianteUnd)||1);
        porProd[k].utl=(porProd[k].utl||0)+(precioItem(it)*(it.qty||1)-p.costo*undM2*(it.qty||1));
      }
    });
  });
  var ranking=Object.values(porProd).sort(function(a,b){return (b.qty+(b.enMesa||0))-(a.qty+(a.enMesa||0));});

  var kpis='<div class="kpi-grid">'
    +(function(){
      // 📈 Utilidad estimada del turno (solo si hay costos cargados)
      var utl=0,ventaConCosto=0,sinCostoQty=0;
      var addU=function(it){
        if(it.isCombo){
          _comboReparto(it).forEach(function(cp){
            if(cp.p.costo>0){utl+=(cp.rev-cp.p.costo*cp.cant)*(it.qty||1);ventaConCosto+=cp.rev*(it.qty||1);}
            else sinCostoQty+=cp.cant*(it.qty||1);
          });
          return;
        }
        if(it.isCustom||it.isCubetazoMix){sinCostoQty+=(it.qty||1);return;}
        var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
        if(!p||!(p.costo>0)){sinCostoQty+=(it.qty||1);return;}
        var undM=it.cubeta?5:(parseInt(it.varianteUnd)||1);
        var rev=precioItem(it)*(it.qty||1);
        var cst=p.costo*undM*(it.qty||1);
        utl+=rev-cst;ventaConCosto+=rev;
      };
      hoyV.forEach(function(v){(v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[]).forEach(addU);});
      Object.keys(pedidos||{}).forEach(function(mid){(pedidos[mid]||[]).forEach(addU);});
      window._utilidadTurno=(ventaConCosto>0)?{utl:utl,margen:Math.round(utl/ventaConCosto*100),sinCosto:sinCostoQty}:null;
      return'';
    })()
    +[['💰','Ventas turno',fmt(totV),'#f5a623'],['🔴','En mesas ahora',fmt(enMesasTot),'#ef4444']].concat(window._utilidadTurno?[['📈','Utilidad (con costos)',fmt(window._utilidadTurno.utl)+' · '+window._utilidadTurno.margen+'%','#22c55e']]:[]).concat([['🍽️','Cobros turno',hoyV.length,'#22c55e'],].concat(a52Mod('cubetazos')?[['🪣','Cubetazos',cubetazos,'#22c55e']]:[]).concat([['📦','Productos distintos',ranking.length,'#38bdf8']])).map(function(x){
      return'<div class="kpi"><div style="font-size:20px">'+x[0]+'</div><div style="color:var(--muted);font-size:10px;margin-top:2px">'+x[1]+'</div><div style="color:'+x[3]+';font-weight:900;font-size:16px;margin-top:2px">'+x[2]+'</div></div>';
    }).join('')+'</div>';

  var pagoRows=FPAGO.filter(function(f){return porPago[f.id];}).map(function(f){
    return'<div class="res-row"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:17px">'+f.emoji+'</span><span style="color:'+f.color+';font-weight:700;font-size:13px">'+f.label+'</span></div><span style="color:var(--gold);font-weight:800">'+fmt(porPago[f.id])+'</span></div>';
  }).join('')||'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin cobros</div>';

  var prodRows=ranking.slice(0,10).map(function(p){
    var em=p.enMesa||0;
    var totP=p.total+(p.enMesaTotal||0);
    return'<div class="res-row"><div><div style="font-size:12px;font-weight:600">'+p.emoji+' '+esc(p.nombre)+'</div>'
      +'<div style="color:var(--muted);font-size:11px">'+(p.qty+em)+' und'+(em?' <span style="color:#ef4444;font-weight:700">('+p.qty+' cobradas + '+em+' en mesas)</span>':'')
      +(p.utl!=null?' · <span style="color:#22c55e;font-weight:700">📈 '+fmt(p.utl)+(totP>0?' ('+Math.round(p.utl/totP*100)+'%)':'')+'</span>':'')+'</div></div>'
      +'<span style="color:var(--gold);font-weight:800">'+fmt(totP)+'</span></div>';
  }).join('')||'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin consumo todavía</div>';

    var histRows=hoyV.slice().reverse().map(function(v){
    var f=FPAGO.find(function(x){return x.id===v.fp;});
    // Mixed payment: show breakdown by method
    var fpDisplay;
    if(v.pagos&&v.pagos.length>1){
      fpDisplay=v.pagos.map(function(p){var ff=FPAGO.find(function(x){return x.id===p.fp;});return (ff?ff.emoji:'')+' '+(ff?ff.label:p.fp)+': '+fmt(p.monto);}).join(' + ');
    } else {
      fpDisplay=v.fpLabel||(f?f.emoji+' '+f.label:'');
    }
    var z=ZONAS.find(function(x){return x.id===v.zona;});
    // Items detail (plegado por defecto: se toca el cobro para ver el detalle)
    var itemsHtml='';
    var vKey=String(v.ts);
    var abierto=!!(window._cobroDet&&window._cobroDet[vKey]);
    var vItems=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    var nItems=vItems.reduce(function(a,it){return a+(it.qty||1);},0);
    if(vItems.length&&abierto){
      itemsHtml='<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border)">'
        +vItems.map(function(it){
          var nombre,pr;
          if(it.isCustom){nombre='✏️ '+esc(it.customNombre||'');pr=it.customPrecio||0;}
          else if(it.isCombo){nombre='🎁 '+esc(it.comboNombre||'');pr=it.comboPrecio||0;}
          else if(it.isCubetazoMix){nombre='🪣 Cubetazo mixto ('+(it.cubMixDetalle||[]).map(function(dd){return dd.cantidad+'×'+dd.emoji;}).join(' ')+')';pr=it.cubMixPrecio||0;}
          else{
            var p=menu.find(function(m){return m.id==it.pid;});  // == to handle string/int mismatch
            var pNombre=p?p.nombre:(it.nombre||it.prodNombre||('Producto #'+it.pid));
            var pEmoji=p?p.emoji:(it.emoji||'🍺');
            nombre=pEmoji+' '+esc(pNombre);
            pr=it.cubeta?(p&&p.cubeta||(p&&p.precio||0)*5):(p?p.precio:(it.precio||0));
          }
          return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:1px 0">'
            +'<span>'+nombre+' ×'+it.qty+'</span>'
            +'<span>'+fmt(pr*it.qty)+'</span></div>';
        }).join('')
        +'</div>';
    }
    var botonesAdmin='';
    if(abierto&&usuarioActivo&&usuarioActivo.rol==='admin'&&v._fbkey){
      botonesAdmin='<div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">'
        +'<button data-act="venta-editfp" data-key="'+v._fbkey+'" style="flex:1;background:#f5a62318;color:#f5a623;border:1px solid #f5a62333;border-radius:7px;padding:6px;font-size:10.5px;font-weight:700;cursor:pointer">✏️ Forma de pago</button>'
        +(!v.esPagoCredito?'<button data-act="venta-devolver" data-key="'+v._fbkey+'" style="flex:1;background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:6px;font-size:10.5px;font-weight:700;cursor:pointer">↩️ Devolver a mesa</button>':'')
        +'<button onclick="eliminarVentaDuplicada(\''+v._fbkey+'\')" style="flex:1;background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:6px;font-size:10.5px;font-weight:700;cursor:pointer">🗑️ Eliminar (duplicado/error)</button>'
      +'</div>';
    }
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:8px 12px;margin-bottom:6px">'
      +'<div onclick="toggleCobroDet(\''+vKey+'\')" style="display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer">'
        +'<div><div style="font-size:12px;font-weight:700">'+(abierto?'▼':'▶')+' '+(z?z.label:'')+' · '+esc(v.mesa||'?')
          +(vItems.length?' <span style="color:var(--muted);font-weight:600;font-size:10px">· '+nItems+' ítem'+(nItems!==1?'s':'')+'</span>':'')+'</div>'
        +'<div style="color:var(--muted);font-size:11px">'+fpDisplay+'</div>'
        +'<div style="color:var(--muted);font-size:10px">'+fmtTime(v.ts)+' · '+esc(v.uidNombre||v.uid||'')+'</div></div>'
        +'<span style="color:var(--gold);font-weight:900;font-size:15px">'+fmt(v.total)+'</span>'
      +'</div>'
      +itemsHtml
      +botonesAdmin
      +'</div>';
  }).join('');

  var rolCards=Object.entries(ROLES).map(function(kv){
    var r=kv[0],info=kv[1];
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px">'
      +'<div style="font-weight:700;font-size:13px;color:'+info.color+'">'+info.label+'</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:3px">'+info.tabs.map(function(t){return TAB_LABELS[t]||t;}).join(' · ')+'</div>'
      +(r==='mesero'?'<div style="color:var(--muted);font-size:10px;margin-top:2px">Sin acceso a cobro ni Excel</div>':'')
      +'</div>';
  }).join('');

  // ── Return ventas layout ──────────────────────────────────────────────────
  return(puedeExcel
    ?'<div style="display:flex;justify-content:flex-end;margin-bottom:12px">'
      +'<button class="btn btn-green" onclick="exportarExcel()" style="background:linear-gradient(135deg,#1d6f42,#21a55c)">📊 Descargar Excel</button>'
      +'</div>'
    :'<div class="alert-box alert-blue mb12">📊 Solo administradores y cajeros pueden descargar el reporte Excel.</div>')
    +'<div style="background:var(--accent)18;border:1px solid var(--accent)33;border-radius:10px;padding:8px 14px;margin-bottom:12px;font-size:12px;color:var(--accent);font-weight:700">🕐 Turno actual'+(turnoInicio?' · desde '+fmtDT(turnoInicio):'')+'</div>'
    +kpis
    +'<div class="res-grid">'
    +'<div class="res-card"><div class="section-title">Por forma de pago — turno</div>'+pagoRows+'</div>'
    +(function(){
      var per=_perdidasTurno();
      if(!per.length)return'';
      var pend=per.filter(function(n){return n.estado==='pendiente';}).length;
      var totPer=per.reduce(function(a,n){return a+(n.monto||0);},0);
      return'<div class="res-card" style="border-color:#ef444440">'
        +'<div class="section-title" style="color:#ef4444">💀 Pérdidas del turno · '+fmt(totPer)+(pend?' <span style="background:#f5a62322;color:#f5a623;border-radius:5px;padding:1px 7px;font-size:10px;font-weight:900">'+pend+' por aceptar en el cierre</span>':'')+'</div>'
        +per.map(function(n){
          return'<div style="padding:5px 0;border-bottom:1px solid var(--border)">'
            +'<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700"><span>'+(n.tipoLabel||'💀')+' '+esc(n.mesa||'')+'</span><span style="color:#ef4444">'+fmt(n.monto||0)+'</span></div>'
            +'<div style="color:var(--muted);font-size:10px">'+fmtTime(n.ts)+' · '+esc(n.uidNombre||'')+(n.items?' · '+n.items.map(function(x){return x.qty+'× '+esc(x.nombre);}).join(', '):'')+(n.nota?' · '+esc(n.nota):'')+' · '+(n.estado==='aceptada'?'<span style="color:#22c55e;font-weight:800">✔ aceptada</span>':n.estado==='pendiente'?'<span style="color:#f5a623;font-weight:800">⏳ pendiente</span>':'')+'</div>'
          +'</div>';
        }).join('')
      +'</div>';
    })()
    +'<div class="res-card"><div class="section-title">🔥 Consumo del turno — cobrado + 🔴 en mesas</div>'+prodRows+'</div>'
    +(function(){
      var abiertoVC=!!_secOpen.ventasCat;
      var modoVC=window._vcModo||'turno';
      var rgVC=abiertoVC?_vcRango():{desde:0,hasta:null};
      var cats=abiertoVC?ventasPorCategoria(rgVC.desde,rgVC.hasta):{};
      var claves=Object.keys(cats).sort(function(a,b){return cats[b].total-cats[a].total;});
      var totalVC=claves.reduce(function(a,c){return a+cats[c].total;},0);
      function pillVC(id,lbl){
        var sel=modoVC===id;
        return'<button onclick="setVcModo(\''+id+'\')" style="flex:1;background:'+(sel?'var(--accent)':'var(--bg)')+';color:'+(sel?'#fff':'var(--muted)')+';border:1px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:99px;padding:6px 0;font-size:11px;font-weight:800;cursor:pointer">'+lbl+'</button>';
      }
      var filas=claves.map(function(c){
        var abiertaCat=!!(window._vcOpen&&window._vcOpen[c]);
        var prods=abiertaCat?Object.keys(cats[c].prods).sort(function(a,b){var A=cats[c].prods[a],B=cats[c].prods[b];return (B.total+(B.enMesaTotal||0))-(A.total+(A.enMesaTotal||0));}).map(function(n){
          var pr=cats[c].prods[n];
          var em=pr.enMesa||0;
          return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:3px 0 3px 16px;border-bottom:1px solid var(--border)"><span>'+pr.emoji+' '+esc(n)+' × '+(pr.qty+em)+(em?' <span style="color:#ef4444;font-weight:700">('+em+' en mesa sin cobrar)</span>':'')+'</span><span style="font-weight:700">'+fmt(pr.total+(pr.enMesaTotal||0))+'</span></div>';
        }).join(''):'';
        var emC=cats[c].enMesa||0;
        return'<div onclick="toggleVcCat(\''+esc(c).replace(/\'/g,"\\'")+'\')" style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border-radius:8px;padding:8px 10px;margin-bottom:6px;cursor:pointer">'
          +'<span style="font-size:13px;font-weight:800">'+(abiertaCat?'▼':'▶')+' '+esc(c)+' <span style="color:var(--muted);font-weight:600;font-size:11px">· '+(cats[c].qty+emC)+' und'+(emC?' <span style="color:#ef4444;font-weight:800">(🔴'+emC+' en mesas)</span>':'')+'</span></span>'
          +'<span style="color:var(--gold);font-weight:900;font-size:14px">'+fmt(cats[c].total+(cats[c].enMesaTotal||0))+'</span>'
        +'</div>'+prods;
      }).join('');
      return'<div class="res-card full-col">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">'
          +'<button data-act="toggle-sec" data-sec="ventasCat" style="background:none;border:none;color:var(--text);cursor:pointer;font-weight:700;font-size:14px;padding:0;text-align:left">'+(abiertoVC?'▼':'▶')+' 🍽️ Ventas por categoría'+(abiertoVC?' <span style="color:var(--muted);font-weight:600;font-size:11px">· '+fmt(totalVC)+'</span>':'')+'</button>'
          +(abiertoVC?'<button onclick="exportarVentasCatExcel()" style="background:#22c55e;color:#fff;border:none;border-radius:7px;padding:5px 12px;font-size:11px;font-weight:800;cursor:pointer">📥 Excel</button>':'')
        +'</div>'
        +(abiertoVC?'<div style="display:flex;gap:6px;margin:10px 0;flex-wrap:wrap">'+pillVC('turno','Turno')+pillVC('7d','7 días')+pillVC('todo','Todo')+pillVC('rango','📅 Fechas')+'</div>'
          +(modoVC==='rango'?'<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">'
            +'<div style="flex:1;min-width:130px"><div style="color:var(--muted);font-size:10px;margin-bottom:2px">Desde</div><button onclick="abrirCalendario(\'d1\')" style="width:100%;background:var(--bg);border:1px solid '+(window._vcD1?'var(--accent)66':'var(--border)')+';color:'+(window._vcD1?'var(--text)':'var(--muted)')+';border-radius:9px;padding:10px;font-weight:800;font-size:13px;cursor:pointer">📅 '+(_fmtDiaCal(window._vcD1)||'Elegir fecha...')+'</button></div>'
            +'<div style="flex:1;min-width:130px"><div style="color:var(--muted);font-size:10px;margin-bottom:2px">Hasta</div><button onclick="abrirCalendario(\'d2\')" style="width:100%;background:var(--bg);border:1px solid '+(window._vcD2?'var(--accent)66':'var(--border)')+';color:'+(window._vcD2?'var(--text)':'var(--muted)')+';border-radius:9px;padding:10px;font-weight:800;font-size:13px;cursor:pointer">📅 '+(_fmtDiaCal(window._vcD2)||'Hoy')+'</button></div>'
          +'</div>':'')
          +(filas||'<div style="color:var(--dim);text-align:center;padding:12px;font-size:12px">Sin ventas en el periodo</div>')
          +'<div style="color:var(--muted);font-size:10px;margin-top:6px">Toca una categoría para ver el detalle por producto. El Excel exporta el periodo elegido.</div>':'')
      +'</div>';
    })()
    +'<div class="res-card full-col"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">'
      +'<button data-act="toggle-sec" data-sec="cobrosTurno" style="background:none;border:none;color:var(--text);cursor:pointer;font-weight:700;font-size:14px;padding:0;text-align:left">'+(_secOpen.cobrosTurno?'▼':'▶')+' Cobros del turno actual <span style="color:var(--muted);font-weight:600;font-size:11px">· '+hoyV.length+' cobro'+(hoyV.length!==1?'s':'')+' · '+fmt(totV)+'</span></button>'
      +(_secOpen.cobrosTurno?'<div style="display:flex;gap:6px">'
        +'<button onclick="expandirCobros(true)" style="background:var(--card2);border:1px solid var(--border);color:var(--muted);border-radius:7px;padding:4px 10px;font-size:10px;font-weight:700;cursor:pointer">▼ Abrir todo</button>'
        +'<button onclick="expandirCobros(false)" style="background:var(--card2);border:1px solid var(--border);color:var(--muted);border-radius:7px;padding:4px 10px;font-size:10px;font-weight:700;cursor:pointer">▲ Cerrar todo</button>'
      +'</div>':'')
      +'</div>'
      +(_secOpen.cobrosTurno?'<div style="margin-top:8px"></div>'+histRows:'')
    +'</div>'
    +'</div>'
    +'<div style="background:#38bdf818;border:1px solid #38bdf833;border-radius:10px;padding:8px 14px;margin:14px 0 8px;font-size:12px;color:#38bdf8;font-weight:700">📊 Histórico total — todos los turnos</div>'
    +'<div class="res-grid">'
    +'<div class="res-card"><div class="section-title">Acumulado total</div>'
      +'<div class="res-row"><span>Total ventas</span><span style="color:var(--gold);font-weight:900">'+fmt(ventas.reduce(function(a,v){return a+v.total;},0))+'</span></div>'
      +'<div class="res-row"><span>Número de cobros</span><span style="color:#22c55e;font-weight:700">'+ventas.length+'</span></div>'
      +'<div class="res-row"><span>Total gastos</span><span style="color:#ef4444;font-weight:700">'+fmt(gastos.reduce(function(a,g){return a+g.valor;},0))+'</span></div>'
    +'</div>'
    +'<div class="res-card"><div class="section-title">Por forma de pago — histórico</div>'
      +FPAGO.filter(function(f){return ventas.some(function(v){return v.fp===f.id||( v.pagos&&v.pagos.some(function(p){return p.fp===f.id;}));});}).map(function(f){
        var t=ventas.reduce(function(a,v){
          if(v.pagos&&v.pagos.length) return a+v.pagos.filter(function(p){return p.fp===f.id;}).reduce(function(b,p){return b+p.monto;},0);
          return a+(v.fp===f.id?v.total:0);
        },0);
        return'<div class="res-row"><div style="display:flex;align-items:center;gap:8px"><span>'+f.emoji+'</span><span style="color:'+f.color+';font-weight:700">'+f.label+'</span></div><span style="color:var(--gold);font-weight:800">'+fmt(t)+'</span></div>';
      }).join('')
    +'</div>'
    +'</div>'
    // ── VENTAS DIARIAS (por día de negocio 11am-5am) ──
    +'<button data-act="toggle-sec" data-sec="ventasDiarias" style="width:100%;text-align:left;background:#f5a62318;border:1px solid #f5a62333;border-radius:10px;padding:10px 14px;margin:14px 0 8px;font-size:12px;color:#f5a623;font-weight:700;cursor:pointer">'+(_secOpen.ventasDiarias?'▼':'▶')+' 📅 Ventas por día (11am–5am)</button>'
    +(_secOpen.ventasDiarias?'<div class="res-card full-col">'+ventasDiariasHTML()+'</div>':'')
    // ── HISTORIAL COMPLETO DE TODAS LAS VENTAS ──
    +'<button data-act="toggle-sec" data-sec="ranking" style="width:100%;text-align:left;background:#22c55e18;border:1px solid #22c55e33;border-radius:10px;padding:10px 14px;margin:14px 0 8px;font-size:12px;color:#22c55e;font-weight:700;cursor:pointer">'+(_secOpen.ranking?'▼':'▶')+' 📦 Unidades vendidas por producto (histórico)</button>'
    +(_secOpen.ranking?'<div class="res-card full-col">'+rankingTotalProductos()+'</div>':'')
    +'<button data-act="toggle-sec" data-sec="historial" style="width:100%;text-align:left;background:#a855f718;border:1px solid #a855f733;border-radius:10px;padding:10px 14px;margin:14px 0 8px;font-size:12px;color:#a855f7;font-weight:700;cursor:pointer">'+(_secOpen.historial?'▼':'▶')+' 🧾 Historial completo de ventas ('+ventas.length+')</button>'
    +(_secOpen.historial?'<div class="res-card full-col">'+histTodasVentas()+'</div>':'')
    +'<button data-act="toggle-sec" data-sec="socios" style="width:100%;text-align:left;background:#38bdf818;border:1px solid #38bdf833;border-radius:10px;padding:10px 14px;margin:14px 0 8px;font-size:12px;color:#38bdf8;font-weight:700;cursor:pointer">'+(_secOpen.socios?'▼':'▶')+' 🤝 Consumo de socios (por producto)</button>'
    +(_secOpen.socios?'<div class="res-card full-col">'+rankingConsumoSocios()+'</div>':'');
}

/* ═══ Devolver una venta a la mesa (anular el cobro para corregir o agregar) ═══ */
function abrirDevolverVenta(fbkey){
  var v=ventas.find(function(x){return x._fbkey===fbkey;});
  if(!v){alert('Venta no encontrada.');return;}
  if(v.esPagoCredito){alert('Los pagos de fiados no se devuelven a mesa. Usa "↩️ A mesa" en la pestaña Fiados.');return;}
  var vItems=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
  if(!vItems.length){alert('Esta venta no tiene productos para devolver (es un registro sin ítems).');return;}
  var libres=mesas.filter(function(m){return !(pedidos[m.id]&&pedidos[m.id].length);});
  if(!libres.length){alert('No hay mesas libres.');return;}
  var opts=libres.map(function(m){
    var z=ZONAS.find(function(x){return x.id===m.zona;});
    return'<option value="'+m.id+'">'+(z?z.label+' · ':'')+esc(m.nombre||('Mesa '+m.num))+'</option>';
  }).join('');
  var esTurno=v.ts>=turnoInicio;
  var absV=v.abonos?(Array.isArray(v.abonos)?v.abonos:Object.values(v.abonos)):[];
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">↩️ Devolver cobro a la mesa</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:10px">'+esc(v.mesa||'')+' · '+fmt(v.total)+' · '+fmtFechaCorta(v.ts)+'</div>'
    +'<div style="background:#f5a62318;border:1px solid #f5a62333;border-radius:9px;padding:9px 11px;margin-bottom:10px;color:#f5a623;font-size:12px">⚠️ El cobro se ANULA: sale de ventas y de los saldos de caja. Los productos vuelven a la mesa para corregir el pago o agregar más, y ahí la cobras de nuevo.</div>'
    +(esTurno?'':'<div style="background:#ef444418;border:1px solid #ef444433;border-radius:9px;padding:9px 11px;margin-bottom:10px;color:#ef4444;font-size:12px">🚨 Esta venta NO es del turno actual: anularla cambia los números de un día ya cerrado.</div>')
    +(absV.length?'<div style="background:var(--bg);border:1px solid #22c55e44;border-radius:9px;padding:8px 11px;margin-bottom:10px;font-size:11px;color:#22c55e;font-weight:700">✓ Sus '+absV.length+' abono(s) volverán a la mesa como abonos.</div>':'')
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿A qué mesa vuelve?</div>'
    +'<select class="inp" id="devventa-mesa" style="margin-bottom:14px">'+opts+'</select>'
    +'<button class="btn btn-green btn-full" onclick="confirmarDevolverVenta(\''+fbkey+'\')">↩️ Devolver a la mesa</button>');
}
function confirmarDevolverVenta(fbkey){
  var v=ventas.find(function(x){return x._fbkey===fbkey;});
  if(!v)return;
  var mesaId=(document.getElementById('devventa-mesa')||{}).value;
  var mesa=mesas.find(function(m){return String(m.id)===String(mesaId);});
  if(!mesa){alert('Elige la mesa.');return;}
  if(pedidos[mesa.id]&&pedidos[mesa.id].length){alert('Esa mesa ya está ocupada.');return;}
  // 1. Productos de vuelta (el stock no se toca: se descontó al agregarlos y siguen "servidos")
  var vItems=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
  pedidos[mesa.id]=JSON.parse(JSON.stringify(vItems));
  var rp=ref('pedidos/'+mesa.id);if(rp)rp.set(pedidos[mesa.id]);
  // 2. Abonos de la venta vuelven como abonos de mesa
  var absV=v.abonos?(Array.isArray(v.abonos)?v.abonos:Object.values(v.abonos)):[];
  if(absV.length){
    abonosMesa[mesa.id]=absV.map(function(ab){return {monto:ab.monto||0,fp:ab.fp||'efectivo',nombre:ab.nombre||'Abono',ts:ab.ts||a52Ahora()};});
    fbSet('abonosMesa',abonosMesa);
  }
  // 3. Registrar la anulación (auditoría) y borrar la venta
  fbPush('anulaciones',{ts:a52Ahora(),ventaTs:v.ts,mesa:v.mesa||'',total:v.total||0,fp:v.fp||'',motivo:'Devuelta a '+(mesa.nombre||('Mesa '+mesa.num)),uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre});
  var rv=ref('ventas/'+fbkey);if(rv)rv.set(null);
  ventas=ventas.filter(function(x){return x._fbkey!==fbkey;});
  closeModal1();
  showToast('↩️ Cobro devuelto a '+esc(mesa.nombre||('Mesa '+mesa.num))+'<br><span style="font-size:12px;opacity:.85">'+fmt(v.total)+' anulado de ventas · corrige y cobra de nuevo</span>','#38bdf8');
  render();
}

function abrirEditarFP(fbkey){
  var v=ventas.find(function(x){return x._fbkey===fbkey;});
  if(!v){alert('Venta no encontrada.');return;}
  // Cada línea de pago se corrige por separado: en un cobro mixto (Nequi + efectivo) solo cambia la que se elija
  var pagos=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
  var opts=function(sel){return FPV().concat(FPAGO.filter(function(f){return f.off&&f.id===sel;})).map(function(f){return'<option value="'+f.id+'"'+(f.id===sel?' selected':'')+'>'+f.emoji+' '+f.label+'</option>';}).join('');};
  var filas=pagos.map(function(p,i){
    var ff=FPAGO.find(function(x){return x.id===p.fp;});
    return'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      +'<div style="flex:0 0 96px;text-align:right;font-weight:800;color:var(--gold)">'+fmt(p.monto||0)+'</div>'
      +'<select class="inp" id="editfp-sel-'+i+'" style="flex:1">'+opts(p.fp)+'</select>'
    +'</div><div style="color:var(--muted);font-size:10.5px;margin:-4px 0 8px 104px">Era: '+(ff?ff.emoji+' '+ff.label:esc(p.fp||'?'))+'</div>';
  }).join('');
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">✏️ Corregir forma de pago</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:12px">'+esc(v.mesa||'')+' · '+fmt(v.total)+(pagos.length>1?' · cobro mixto ('+pagos.length+' pagos)':'')+'</div>'
    +(pagos.length>1?'<div style="background:#38bdf818;border:1px solid #38bdf833;border-radius:8px;padding:8px 12px;margin-bottom:12px;color:#38bdf8;font-size:12px">Cambie solo la línea equivocada; los valores se conservan.</div>':'')
    +filas
    +'<button class="btn btn-green btn-full" onclick="guardarEditarFP(\''+fbkey+'\')" style="margin-top:6px">Guardar cambio</button>');
}

function guardarEditarFP(fbkey){
  var v=ventas.find(function(x){return x._fbkey===fbkey;});
  if(!v)return;
  var pagos=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
  var cambios=[],nuevos=pagos.map(function(p,i){
    var sel=document.getElementById('editfp-sel-'+i),fp=(sel&&sel.value)||p.fp;
    var f=FPAGO.find(function(x){return x.id===fp;});
    if(fp!==p.fp)cambios.push(fmt(p.monto||0).replace(/ /g,' ')+': '+(p.fp||'?')+' → '+(f?f.label:fp));
    return {fp:fp,label:(f?f.label:fp),monto:p.monto||0};
  });
  if(!cambios.length){closeModal1();return;}
  // Si dos líneas quedaron con el mismo medio, se juntan
  var porFp={},orden=[];nuevos.forEach(function(p){if(!porFp[p.fp]){porFp[p.fp]={fp:p.fp,label:p.label,monto:0};orden.push(p.fp);}porFp[p.fp].monto+=p.monto;});
  nuevos=orden.map(function(k){return porFp[k];});
  v.pagos=nuevos;
  v.fp=nuevos.length===1?nuevos[0].fp:'mixto';
  var f1=FPAGO.find(function(x){return x.id===v.fp;});
  v.fpLabel=nuevos.length===1?(f1?f1.emoji+' '+f1.label:v.fp):nuevos.map(function(p){var ff=FPAGO.find(function(x){return x.id===p.fp;});return (ff?ff.emoji+' ':'')+p.label;}).join(' + ');
  v.editadoFP=true;
  v.editadoPor=usuarioActivo.nombre;
  v.editadoTs=a52Ahora();
  v.editadoDetalle=cambios.join(' · ');
  // Guardar en Firebase (sin el _fbkey interno)
  var copia={};Object.keys(v).forEach(function(k){if(k!=='_fbkey')copia[k]=v[k];});
  var r=ref('ventas/'+fbkey);
  if(r)r.set(copia);
  closeModal1();
  showToast('✅ Forma de pago corregida<br><span style="font-size:12px;opacity:.85">'+esc(v.mesa||'')+' · '+esc(cambios.join(' · '))+'</span>','#22c55e');
  render();
}

function rankingConsumoSocios(){
  if(!consumoSocios.length)return'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin consumo de socios registrado</div>';
  // Agrupar por socio y producto
  var porSocio={};
  consumoSocios.forEach(function(c){
    var soc=c.socio||'?';
    if(!porSocio[soc])porSocio[soc]={total:0,prods:{}};
    (c.items||[]).forEach(function(it){
      var nombre=it.nombre||'?';
      var key=nombre+(it.cubeta?'_cub':'');
      var qty=it.cubeta?(it.qty||1)*5:(it.qty||1);
      if(!porSocio[soc].prods[key])porSocio[soc].prods[key]={nombre:nombre+(it.cubeta?' 🪣':''),emoji:it.emoji||'📦',qty:0,total:0};
      porSocio[soc].prods[key].qty+=qty;
      porSocio[soc].prods[key].total+=(it.precioSocio||0)*(it.qty||1);
    });
    porSocio[soc].total+=c.total||0;
  });

  return Object.keys(porSocio).map(function(soc){
    var data=porSocio[soc];
    var color=socColor(soc,'#f5a623');
    var ranking=Object.values(data.prods).sort(function(a,b){return b.qty-a.qty;});
    var totalUnid=ranking.reduce(function(a,p){return a+p.qty;},0);
    return'<div style="margin-bottom:16px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;background:'+color+'18;border:1px solid '+color+'33;border-radius:8px;padding:8px 12px;margin-bottom:8px">'
        +'<span style="color:'+color+';font-weight:800;font-size:14px">👤 '+esc(soc)+'</span>'
        +'<span style="color:'+color+';font-weight:700;font-size:12px">'+totalUnid+' und · '+fmt(data.total)+'</span>'
      +'</div>'
      +ranking.map(function(p){
        return'<div class="res-row"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">'+p.emoji+'</span>'
          +'<div style="font-size:13px;font-weight:600">'+esc(p.nombre)+'</div></div>'
          +'<div style="text-align:right"><span style="color:'+color+';font-weight:900;font-size:15px">'+p.qty+'</span> <span style="color:var(--muted);font-size:10px">und</span></div>'
        +'</div>';
      }).join('')
    +'</div>';
  }).join('');
}

function rankingTotalProductos(){
  var porProd={};
  ventas.forEach(function(v){
    var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    its.forEach(function(it){
      var nombre,emoji,key,cat,qty=it.qty||1;
      if(it.isCustom){return;}
      if(it.isCombo){
        // 🎁 El combo cuenta por sus productos reales: 10 cervezas del combo = 10 unidades de esa cerveza
        _comboReparto(it).forEach(function(cp){
          var kc='p_'+cp.p.nombre;
          if(!porProd[kc])porProd[kc]={nombre:cp.p.nombre,emoji:cp.p.emoji,cat:cp.p.cat||'Otros',qty:0,total:0};
          porProd[kc].qty+=cp.cant*qty;
          porProd[kc].total+=cp.rev*qty;
        });
        return;
      }
      else if(it.isCubetazoMix){
        var detCM=it.cubMixDetalle?(Array.isArray(it.cubMixDetalle)?it.cubMixDetalle:Object.values(it.cubMixDetalle)):[];
        var totCM=detCM.reduce(function(a,dd){return a+(dd.cantidad||0);},0)||1;
        detCM.forEach(function(dd){
          var pp=menu.find(function(m){return Number(m.id)===Number(dd.prodId!=null?dd.prodId:dd.pid);});
          var cat2=pp?pp.cat:'Cervezas';
          var nomCM=pp?pp.nombre:(dd.nombre||'?');
          var k='p_'+nomCM;
          if(!porProd[k])porProd[k]={nombre:nomCM,emoji:(pp?pp.emoji:dd.emoji)||'🍺',cat:cat2,qty:0,total:0};
          porProd[k].qty+=(dd.cantidad||0)*qty;
          porProd[k].total+=(it.cubMixPrecio||0)*qty*((dd.cantidad||0)/totCM);
        });
        return;
      }
      else{
        var p=menu.find(function(m){return Number(m.id)===Number(it.pid);});
        nombre=(p?p.nombre:(it.nombre||'?'))+(it.varianteNombre?' ('+it.varianteNombre+')':'');
        emoji=p?p.emoji:'📦';
        cat=p?p.cat:'Otros';
        if(it.cubeta){qty=(it.qty||1)*5;}
        key='p_'+nombre;
      }
      if(!porProd[key])porProd[key]={nombre:nombre,emoji:emoji,cat:cat||'Otros',qty:0,total:0};
      porProd[key].qty+=qty;
      porProd[key].total+=precioItem(it)*(it.qty||1);
    });
  });
  var lista=Object.values(porProd);
  if(!lista.length)return'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin ventas registradas</div>';
  var totalUnidades=lista.reduce(function(a,p){return a+p.qty;},0);

  // Agrupar por categoría
  var porCat={};
  lista.forEach(function(p){
    var c=p.cat||'Otros';
    if(!porCat[c])porCat[c]={cat:c,prods:[],qty:0,total:0};
    porCat[c].prods.push(p);
    porCat[c].qty+=p.qty;
    porCat[c].total+=p.total;
  });
  // Ordenar categorías por unidades, y productos dentro de cada una
  var cats=Object.values(porCat).sort(function(a,b){return b.qty-a.qty;});
  var emojiCat=(typeof catEmojis!=='undefined')?catEmojis:{};

  return'<input id="busca-prod" oninput="filtrarRankingProd(this.value)" placeholder="🔍 Buscar producto..." class="inp" style="margin-bottom:10px"/>'
    +'<div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--card2);border-radius:8px;margin-bottom:8px"><span style="color:var(--muted);font-size:11px">'+lista.length+' productos · '+totalUnidades+' unidades vendidas</span></div>'
    +'<div id="ranking-prod-list">'
    +cats.map(function(c){
      var prods=c.prods.sort(function(a,b){return b.qty-a.qty;});
      return'<div class="rank-cat-group" data-cat="'+esc((c.cat||'').toLowerCase())+'">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--accent)18;border-radius:7px;padding:7px 12px;margin:10px 0 6px">'
          +'<span style="color:var(--accent);font-weight:800;font-size:13px">'+(emojiCat[c.cat]?emojiCat[c.cat]+' ':'')+esc(c.cat)+'</span>'
          +'<span style="color:var(--accent);font-weight:700;font-size:12px">'+c.qty+' und</span>'
        +'</div>'
        +prods.map(function(p){
          return'<div class="res-row rank-prod-item" data-nombre="'+esc(p.nombre.toLowerCase())+'" data-cat="'+esc((c.cat||'').toLowerCase())+'">'
            +'<div style="display:flex;align-items:center;gap:8px;padding-left:6px"><span style="font-size:16px">'+p.emoji+'</span>'
            +'<div><div style="font-size:13px;font-weight:600">'+esc(p.nombre)+'</div>'
            +'<div style="color:var(--muted);font-size:11px">'+(p.total>0?fmt(p.total):'')+'</div></div></div>'
            +'<div style="text-align:right"><div style="color:var(--text);font-weight:900;font-size:16px">'+p.qty+'</div><div style="color:var(--muted);font-size:9px">und</div></div>'
          +'</div>';
        }).join('')
      +'</div>';
    }).join('')
    +'</div>';
}
function filtrarRankingProd(q){
  q=(q||'').toLowerCase();
  var items=document.querySelectorAll('.rank-prod-item');
  items.forEach(function(el){
    var n=el.getAttribute('data-nombre')||'';
    el.style.display=n.indexOf(q)>=0?'':'none';
  });
  // Ocultar grupos de categoría sin resultados visibles
  document.querySelectorAll('.rank-cat-group').forEach(function(g){
    var visibles=Array.prototype.filter.call(g.querySelectorAll('.rank-prod-item'),function(el){return el.style.display!=='none';});
    g.style.display=visibles.length?'':'none';
  });
}

function histTodasVentas(){
  var todas=ventas.slice().sort(function(a,b){return b.ts-a.ts;});
  if(!todas.length)return'<div style="color:var(--dim);text-align:center;padding:14px;font-size:13px">Sin ventas registradas</div>';
  var MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  // Agrupar por mes
  var grupos={};var orden=[];
  todas.forEach(function(v){
    var d=new Date(v.ts);
    var key=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);
    if(!grupos[key]){grupos[key]={label:MESES[d.getMonth()]+' '+d.getFullYear(),ventas:[],total:0};orden.push(key);}
    grupos[key].ventas.push(v);
    grupos[key].total+=v.total||0;
  });

  function ventaRow(v){
    var f=FPAGO.find(function(x){return x.id===v.fp;});
    var fpDisplay;
    if(v.pagos&&v.pagos.length>1){
      fpDisplay=v.pagos.map(function(p){var ff=FPAGO.find(function(x){return x.id===p.fp;});return (ff?ff.emoji:'')+' '+(ff?ff.label:p.fp)+': '+fmt(p.monto);}).join(' + ');
    } else { fpDisplay=v.fpLabel||(f?f.emoji+' '+f.label:''); }
    var z=ZONAS.find(function(x){return x.id===v.zona;});
    var vItems=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    var itemsHtml=vItems.length?('<div style="margin-top:5px;padding-top:5px;border-top:1px solid var(--border)">'
      +vItems.map(function(it){
        var nombre,pr;
        if(it.isCustom){nombre='✏️ '+esc(it.customNombre||'');pr=it.customPrecio||0;}
        else if(it.isCombo){nombre='🎁 '+esc(it.comboNombre||'');pr=it.comboPrecio||0;}
        else if(it.isCubetazoMix){nombre='🪣 Cubetazo mixto ('+(it.cubMixDetalle||[]).map(function(dd){return dd.cantidad+'×'+dd.emoji;}).join(' ')+')';pr=it.cubMixPrecio||0;}
        else{var p=menu.find(function(m){return m.id==it.pid;});nombre=(p?p.emoji+' '+esc(p.nombre):(it.nombre||'?'))+(it.varianteNombre?' ('+it.varianteNombre+')':'')+(it.cubeta?' 🪣':'');pr=it.variantePrecio||(it.cubeta?(p&&p.cubeta||(p&&p.precio||0)*5):(p?p.precio:0));}
        return'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);padding:1px 0"><span>'+nombre+' ×'+it.qty+'</span><span>'+fmt(pr*it.qty)+'</span></div>';
      }).join('')+'</div>'):'';
    return'<div style="background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:8px 12px;margin-bottom:6px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start">'
        +'<div style="flex:1"><div style="font-size:12px;font-weight:700">'+(z?z.label+' · ':'')+esc(v.mesa||'?')+(v.sinStock?' <span style="background:#38bdf822;color:#38bdf8;border:1px solid #38bdf844;border-radius:99px;padding:1px 7px;font-size:9px;font-weight:700">⚠️ sin stock</span>':'')+'</div>'
        +'<div style="color:var(--accent);font-size:11px;font-weight:600">'+fpDisplay+(v.editadoFP?' <span style="color:#f5a623;font-size:9px">✏️ corregido</span>':'')+'</div>'
        +'<div style="color:var(--muted);font-size:10px">'+fmtDT(v.ts)+' · '+esc(v.uidNombre||v.uid||'')+'</div></div>'
        +'<span style="color:var(--gold);font-weight:900;font-size:15px">'+fmt(v.total)+'</span>'
      +'</div>'+itemsHtml
      +(v._fbkey?'<button onclick="reimprimirVenta(\''+v._fbkey+'\')" style="width:100%;margin-top:6px;background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:6px;font-size:11px;font-weight:700;cursor:pointer">🖨️ Imprimir recibo</button>':'')
      +((usuarioActivo&&usuarioActivo.rol==='admin'&&v._fbkey)?'<button data-act="venta-editfp" data-key="'+v._fbkey+'" style="width:100%;margin-top:6px;background:#f5a62318;color:#f5a623;border:1px solid #f5a62333;border-radius:7px;padding:6px;font-size:11px;font-weight:700;cursor:pointer">✏️ Corregir forma de pago</button>':'')
      +((usuarioActivo&&usuarioActivo.rol==='admin'&&v._fbkey&&!v.esPagoCredito)?'<button data-act="venta-devolver" data-key="'+v._fbkey+'" style="width:100%;margin-top:6px;background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;border-radius:7px;padding:6px;font-size:11px;font-weight:700;cursor:pointer">↩️ Devolver a mesa (anular cobro)</button>':'')
      +((usuarioActivo&&usuarioActivo.rol==='admin'&&v._fbkey)?'<button onclick="eliminarVentaDuplicada(\''+v._fbkey+'\')" style="width:100%;margin-top:6px;background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:6px;font-size:11px;font-weight:700;cursor:pointer">🗑️ Eliminar venta (cobro duplicado/error) — sin tocar inventario</button>':'')
    +'</div>';
  }

  return orden.map(function(key,i){
    var g=grupos[key];
    var abierto=(key in _mesesOpen)?_mesesOpen[key]:(i===0);  // primer mes abierto por defecto
    return'<div style="margin-bottom:8px">'
      +'<button data-act="toggle-mes" data-mes="'+key+'" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:10px 14px;cursor:pointer;color:var(--text)">'
        +'<span style="font-weight:800;font-size:13px">'+(abierto?'▼':'▶')+' '+g.label+' <span style="color:var(--muted);font-weight:400;font-size:11px">('+g.ventas.length+')</span></span>'
        +'<span style="color:var(--gold);font-weight:800;font-size:13px">'+fmt(g.total)+'</span>'
      +'</button>'
      +(abierto?'<div style="margin-top:6px">'+g.ventas.map(ventaRow).join('')+'</div>':'')
    +'</div>';
  }).join('');
}
function agregarCompraCocina(){
  if(!usuarioActivo||['admin','subadmin','cajero','cocinero'].indexOf(usuarioActivo.rol)<0)return;
  var i=document.getElementById('cc-item');
  var txt=(i&&i.value||'').trim();
  if(!txt)return;
  fbPush('comprasCocina',{ts:a52Ahora(),texto:txt,uidNombre:usuarioActivo.nombre,comprado:false});
  if(i)i.value='';
  showToast('🛒 Anotado: '+esc(txt),'#f97316');
}
function toggleCompraCocina(k){
  if(!usuarioActivo||['admin','subadmin','cajero','cocinero'].indexOf(usuarioActivo.rol)<0)return;
  var c=comprasCocina.find(function(x){return x._fbkey===k;});
  if(!c)return;
  var nuevo=!c.comprado;
  fbSet('comprasCocina/'+k+'/comprado',nuevo);
  fbSet('comprasCocina/'+k+'/compradoPor',nuevo?usuarioActivo.nombre:null);
  c.comprado=nuevo;c.compradoPor=nuevo?usuarioActivo.nombre:null;
  render();
}
function eliminarCompraCocina(k){
  if(!usuarioActivo||(usuarioActivo.rol!=='admin'&&usuarioActivo.rol!=='subadmin'))return;
  fbSet('comprasCocina/'+k,null);
  comprasCocina=comprasCocina.filter(function(x){return x._fbkey!==k;});
  render();
}
function limpiarComprasListas(){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  if(!confirm('¿Borrar todos los ítems ya comprados de la lista?'))return;
  comprasCocina.filter(function(c){return c.comprado;}).forEach(function(c){fbSet('comprasCocina/'+c._fbkey,null);});
  comprasCocina=comprasCocina.filter(function(c){return !c.comprado;});
  render();
}
function renderCocina(){
  // Collect all pending comida items across all mesas
  var pendientes=[];
  var _mesasCocina=mesas.slice();
  Object.keys(pedidos).forEach(function(k){
    if(String(k).indexOf('vr_')===0&&(pedidos[k]||[]).length){
      var u=usuarios.find(function(x){return 'vr_'+x.id===k;});
      _mesasCocina.push({id:k,num:'',nombre:'⚡ Rápida'+(u?' · '+u.nombre:''),zona:''});
    }
  });
  _mesasCocina.forEach(function(m){
    var rawP=pedidos[m.id]||pedidos[String(m.id)]||[];
    var ped=Array.isArray(rawP)?rawP:Object.values(rawP);
    ped.forEach(function(it,idx){
      var p=it.isCustom||it.isCombo?null:menu.find(function(x){return x.id==it.pid;});
      if(p&&p.esComida){
        var zona=ZONAS.find(function(z){return z.id===m.zona;});
        pendientes.push({
          mesa:m, item:it, itemIdx:idx, prod:p,
          zonaLabel:zona?zona.label:m.zona,
          key:m.id+'_'+(it.uidItem||idx)
        });
      }
    });
  });

  var rows=pendientes.map(function(r){
    var m=r.mesa; var it=r.item; var p=r.prod;
    var entregados=cocinaEntregados[r.key]||0;
    var pendQty=it.qty-entregados;
    return'<div style="background:var(--card);border:2px solid '+(pendQty>0?'#f5a623':'#22c55e')+';border-radius:14px;padding:12px 14px;margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'
        +'<div>'
          +'<div style="color:'+(pendQty>0?'#f5a623':'#22c55e')+';font-weight:900;font-size:13px">'+(pendQty>0?'⏳ PENDIENTE':'✅ ENTREGADO')+'</div>'
          +'<div style="font-weight:800;font-size:15px;margin-top:2px">'+(p?p.emoji:'')+' '+esc(p?p.nombre:'?')+'</div>'
        +'</div>'
        +'<div style="text-align:right">'
          +'<div style="color:var(--accent);font-weight:800;font-size:13px">'+r.zonaLabel+'</div>'
          +'<div style="font-weight:700;font-size:13px">'+esc(m.nombre||'Mesa '+m.num)+'</div>'
        +'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;justify-content:space-between">'
        +'<div style="color:var(--muted);font-size:12px">Pedido: '+it.qty+' · Entregado: '+entregados+' · Pendiente: <strong style="color:'+(pendQty>0?'#f5a623':'#22c55e')+'">'+pendQty+'</strong></div>'
        +(pendQty>0
          ?'<button data-act="entregar" data-key="'+r.key+'" data-mesaid="'+m.id+'" data-itemidx="'+r.itemIdx+'" style="background:#22c55e;color:#fff;border:none;border-radius:8px;padding:6px 14px;font-weight:700;font-size:13px;cursor:pointer">✅ Entregar</button>'
          :'<span style="color:#22c55e;font-size:12px;font-weight:700">Completo</span>')
      +'</div>'
      +'</div>';
  }).join('');

  var totalPend=pendientes.filter(function(r){
    return(r.item.qty-(cocinaEntregados[r.key]||0))>0;
  }).length;

  var puedeCompras=usuarioActivo&&['admin','subadmin','cajero','cocinero'].indexOf(usuarioActivo.rol)>=0;
  var comprasCard=(function(){
    var pend=comprasCocina.filter(function(c){return !c.comprado;});
    var listas=comprasCocina.filter(function(c){return c.comprado;});
    var fila=function(c){
      return'<div style="display:flex;align-items:center;gap:9px;padding:6px 0;border-bottom:1px solid var(--border)">'
        +(puedeCompras?'<span onclick="toggleCompraCocina(\''+c._fbkey+'\')" style="font-size:19px;cursor:pointer">'+(c.comprado?'☑️':'⬜')+'</span>':'<span style="font-size:19px">'+(c.comprado?'☑️':'⬜')+'</span>')
        +'<div style="flex:1;min-width:0">'
          +'<div style="font-size:13px;font-weight:700;'+(c.comprado?'text-decoration:line-through;color:var(--muted)':'')+'">'+esc(c.texto)+'</div>'
          +'<div style="color:var(--muted);font-size:9.5px">'+esc(c.uidNombre||'')+' · '+fmtTime(c.ts)+(c.comprado&&c.compradoPor?' · ✔ compró '+esc(c.compradoPor):'')+'</div>'
        +'</div>'
        +(usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin')?'<span onclick="eliminarCompraCocina(\''+c._fbkey+'\')" style="color:#ef4444;cursor:pointer;font-size:14px">✕</span>':'')
      +'</div>';
    };
    return'<div class="card" style="margin-bottom:14px;border-color:#f9731644">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
        +'<div style="font-weight:900;font-size:14px;color:#f97316">🛒 Falta por comprar</div>'
        +(pend.length?'<span style="background:#f9731622;color:#f97316;border-radius:99px;padding:2px 10px;font-size:11px;font-weight:900">'+pend.length+' pendiente'+(pend.length!==1?'s':'')+'</span>':'<span style="color:#22c55e;font-size:11px;font-weight:800">✔ al día</span>')
      +'</div>'
      +(puedeCompras
        ?'<div style="display:flex;gap:7px;margin-bottom:8px">'
          +'<input class="inp" id="cc-item" placeholder="Ej: 5 kg de carne, aceite, servilletas..." style="flex:1" onkeydown="if(event.key===\'Enter\')agregarCompraCocina()"/>'
          +'<button onclick="agregarCompraCocina()" style="background:#f97316;color:#fff;border:none;border-radius:9px;padding:0 16px;font-weight:900;font-size:13px;cursor:pointer">＋</button>'
        +'</div>'
        :'<div style="color:var(--muted);font-size:10.5px;margin-bottom:6px">Solo cocinero, cajero y administración pueden anotar.</div>')
      +(comprasCocina.length?pend.map(fila).join('')+listas.map(fila).join(''):'<div style="color:var(--dim);text-align:center;padding:8px;font-size:12px">Nada anotado — la cocina está completa 👌</div>')
      +(listas.length&&usuarioActivo&&usuarioActivo.rol==='admin'?'<div onclick="limpiarComprasListas()" style="color:var(--muted);font-size:10.5px;text-align:center;padding-top:7px;cursor:pointer">🧹 Borrar los '+listas.length+' ya comprados</div>':'')
    +'</div>';
  })();
  return'<div>'
    +comprasCard
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
      +'<div><div style="color:var(--gold);font-weight:900;font-size:16px">👨‍🍳 Cocina</div>'
      +'<div style="color:var(--muted);font-size:11px">Platos de la categoría Comidas</div></div>'
      +'<div style="background:'+(totalPend>0?'#f5a623':'#22c55e')+';color:#000;border-radius:99px;padding:4px 14px;font-weight:800;font-size:13px">'
        +totalPend+' pendiente'+(totalPend!==1?'s':'')
      +'</div>'
    +'</div>'
    +(pendientes.length===0
      ?'<div style="text-align:center;padding:40px;color:var(--muted)"><div style="font-size:48px">✅</div><div style="font-weight:700;margin-top:8px">Sin pedidos de cocina</div></div>'
      :rows)
    +'</div>';
}

var cocinaEntregados={};  // {mesaId_itemIdx: cantidadEntregada}

function bindCocinaEvents(){}  // handled by document listener

function cobrarACredito(){
  if(!mesaActiva)return;
  var mesa=mesaActiva;
  var ped=pedidos[mesa.id]||[];
  if(!ped.length){alert('No hay productos en esta mesa.');return;}
  var total=totalPedido(mesa.id);
  var descMesa=descuentos[mesa.id];
  if(descMesa&&descMesa.pct) total=Math.round(total*(1-descMesa.pct/100));
  // Abonos ya recibidos en la mesa: se respetan — solo se fía el SALDO
  var absMesa=(abonosMesa[mesa.id]||[]);
  var abonado=absMesa.reduce(function(a,x){return a+(x.monto||0);},0);
  var saldoFiar=Math.max(0,total-abonado);
  if(saldoFiar<=0){alert('Los abonos ya cubren el total de la mesa. Usa el cobro normal.');return;}

  // Build client selector
  var clientesActivos=clientesCredito.filter(function(c){return c.activo!==false;});
  var opts=clientesActivos.map(function(c){return'<option value="'+c.id+'">'+esc(c.nombre)+'</option>';}).join('');
  modal2('<div style="font-weight:800;font-size:16px;margin-bottom:4px">📒 Dejar como fiado</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:6px">'+esc(mesa.nombre||'Mesa '+mesa.num)+'</div>'
    +(abonado>0
      ?'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:14px">'
        +'<div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--muted)">Total de la mesa</span><span style="font-weight:800">'+fmt(total)+'</span></div>'
        +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:3px"><span style="color:#22c55e">Ya abonado ('+absMesa.length+')</span><span style="font-weight:800;color:#22c55e">− '+fmt(abonado)+'</span></div>'
        +'<div style="display:flex;justify-content:space-between;font-size:14px;margin-top:6px;padding-top:6px;border-top:1px dashed var(--border)"><span style="font-weight:800;color:#f5a623">Queda FIADO solo</span><span style="font-weight:900;color:#f5a623">'+fmt(saldoFiar)+'</span></div>'
        +'<div style="color:var(--muted);font-size:10px;margin-top:5px">Los abonos entran a caja hoy y quedan en el historial del fiado.</div>'
      +'</div>'
      :'<div style="color:var(--muted);font-size:13px;margin-bottom:14px">'+fmt(total)+'</div>')
    +(clientesActivos.length?'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Cliente existente</div>'
      +'<select class="inp" id="cred-cliente"><option value="">— Selecciona —</option>'+opts+'</select></div>'
      +'<div style="text-align:center;color:var(--muted);font-size:11px;margin:8px 0">— o —</div>':'')
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nuevo cliente</div>'
    +'<input class="inp" id="cred-nuevo" placeholder="Nombre del cliente"/></div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarCredito('+total+')">📒 Registrar fiado</button>');
}

function confirmarCredito(total){
  var mesa=mesaActiva;
  if(!mesa)return;
  var ped=pedidos[mesa.id]||[];
  var clienteSel=(document.getElementById('cred-cliente')||{}).value||'';
  var nuevoNombre=((document.getElementById('cred-nuevo')||{}).value||'').trim();
  var clienteId, clienteNombre;

  if(nuevoNombre){
    clienteId='cli'+a52Ahora();
    clienteNombre=nuevoNombre;
    var nc={id:clienteId,nombre:nuevoNombre,activo:true,ts:a52Ahora()};
    clientesCredito.push(nc);
    var rc=ref('clientesCredito');if(rc)rc.push(nc);else fbSet('clientesCredito',clientesCredito);
  } else if(clienteSel){
    clienteId=clienteSel;
    var c=clientesCredito.find(function(x){return x.id===clienteSel;});
    clienteNombre=c?c.nombre:'Cliente';
  } else {
    alert('Selecciona o crea un cliente.');return;
  }

  // Abonos ya recibidos: NO se pierden — quedan como pagos del fiado y entran a caja HOY
  var absMesa=(abonosMesa[mesa.id]||[]);
  var abonado=absMesa.reduce(function(a,x){return a+(x.monto||0);},0);
  var deudaId='deu'+a52Ahora();
  var deuda={
    id:deudaId,ts:a52Ahora(),
    clienteId:clienteId,clienteNombre:clienteNombre,
    mesa:mesa.nombre||('Mesa '+mesa.num),
    items:JSON.parse(JSON.stringify(ped)),
    total:total,pagado:abonado,
    pagos:absMesa.map(function(ab){return {ts:ab.ts||a52Ahora(),valor:ab.monto||0,fp:ab.fp||'efectivo',nota:'Abono en mesa'+(ab.nombre?' · '+ab.nombre:'')};}),
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre
  };
  deudasCredito.push(deuda);
  var rd=ref('deudasCredito');if(rd)rd.push(deuda);else fbSet('deudasCredito',deudasCredito);
  // Cada abono entra a caja como pago de fiado (misma contabilidad que un abono normal de fiado)
  absMesa.forEach(function(ab){
    var f=FPAGO.find(function(x){return x.id===ab.fp;});
    fbPush('ventas',{
      mesa:'Fiado: '+clienteNombre,zona:'credito',ts:a52Ahora(),
      total:ab.monto||0,
      items:[{isCustom:true,customNombre:'Abono en mesa'+(ab.nombre?' ('+ab.nombre+')':'')+' fiado '+clienteNombre,customPrecio:ab.monto||0,qty:1}],
      fp:ab.fp||'efectivo',fpLabel:(f?f.label:ab.fp),
      pagos:[{fp:ab.fp||'efectivo',label:(f?f.label:ab.fp),monto:ab.monto||0}],
      esPagoCredito:true,deudaId:deudaId,
      uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre
    });
  });

  // El inventario YA se descontó al agregar a la mesa, así que NO se toca aquí.
  // NO se registra venta (no afecta caja/cierre) hasta que el cliente pague.

  // Liberar mesa
  var r=ref('pedidos/'+mesa.id);if(r)r.set(null);
  delete pedidos[mesa.id];
  if(descuentos[mesa.id])delete descuentos[mesa.id];
  if(abonosMesa[mesa.id]){delete abonosMesa[mesa.id];fbSet('abonosMesa',abonosMesa);}
  if(pelotasMesa[mesa.id]){delete pelotasMesa[mesa.id];fbSet('pelotasMesa/'+mesa.id,null);}
  mesaActiva=null;
  closeModal2();closeModal1();
  showToast('📒 Fiado registrado<br><span style="font-size:12px;opacity:.85">'+esc(clienteNombre)+' · debe '+fmt(total-abonado)+(abonado>0?' (abonó '+fmt(abonado)+')':'')+'</span>','#f5a623');
  render();
}


