/* ═══════════════ CAJA ═══════════════ */
/* ═══════════ ARQUEO DE EFECTIVO (conteo por denominaciones) ═══════════ */
// Efectivo que DEBERÍA haber en caja en este momento del turno
function efectivoEsperadoTurno(){
  var ini=cajaHoy.ini_efectivo||0;
  var vEf=ventasTurno().reduce(function(a,v){
    var pl=(v.pagos&&v.pagos.length)?v.pagos:[{fp:v.fp,monto:v.total}];
    return a+pl.filter(function(p){return p.fp==='efectivo';}).reduce(function(s,p){return s+(p.monto||0);},0);
  },0);
  var gEf=gastosTurno().filter(function(g){return (g.fp||'efectivo')==='efectivo';}).reduce(function(a,g){return a+(g.valor||0);},0);
  // Abonos en efectivo de mesas AÚN abiertas (plata que ya está en la caja pero sin venta registrada)
  var abEf=0;
  Object.keys(abonosMesa).forEach(function(mid){
    (abonosMesa[mid]||[]).forEach(function(ab){if((ab.fp||'efectivo')==='efectivo')abEf+=(ab.monto||0);});
  });
  return {esperado:ini+vEf+abEf-gEf,ini:ini,ventas:vEf,abonos:abEf,gastos:gEf};
}
function verArqueosNuevos(){
  var nuevos=arqueos.filter(function(a){return _arqNoVistos.indexOf(a.id)>=0;}).sort(function(a,b){return b.ts-a.ts;});
  _arqNoVistos=[];
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:10px">🧮 Conteos de caja recientes</div>'
    +(nuevos.length?nuevos.map(function(a){
      var dif=a.dif||0;
      var c=dif===0?'#22c55e':(dif<0?'#ef4444':'#f5a623');
      return'<div style="background:var(--bg);border:1px solid '+c+'44;border-radius:11px;padding:10px 12px;margin-bottom:8px">'
        +'<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800"><span>👤 '+esc(a.uidNombre||'')+'</span><span style="color:var(--muted);font-size:10px">'+fmtTime(a.ts)+'</span></div>'
        +'<div style="font-size:12px;margin-top:4px">Contado <b>'+fmt(a.total||0)+'</b> · esperado '+fmt(a.esperado||0)+'</div>'
        +'<div style="font-weight:900;color:'+c+';font-size:13px;margin-top:2px">'+(dif===0?'✅ Caja cuadrada':(dif<0?'🔴 Faltan '+fmt(Math.abs(dif)):'🟡 Sobran '+fmt(dif)))+'</div>'
      +'</div>';
    }).join(''):'<div style="color:var(--dim);text-align:center;padding:12px;font-size:12px">Nada nuevo</div>')
    +'<div style="color:var(--muted);font-size:10px;margin-top:4px">El detalle completo de denominaciones está en Caja → arqueos del turno.</div>'
    +'<button class="btn btn-full" onclick="closeModal1();render()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:10px">Cerrar</button>');
  render();
}
function abrirArqueo(){
  var rows=DENOMS.map(function(d){
    return'<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px">'
      +'<span style="min-width:92px;font-size:13px;font-weight:700">'+d.l+'</span>'
      +'<input class="inp" id="arq-'+d.k+'" type="number" inputmode="numeric" min="0" placeholder="0" oninput="calcArqueo()" style="flex:1;text-align:center;font-size:15px;font-weight:800;padding:9px"/>'
      +'<span id="arqs-'+d.k+'" style="min-width:86px;text-align:right;color:var(--muted);font-size:12px;font-weight:700">$0</span>'
    +'</div>';
  }).join('');
  modal1('<div style="text-align:center;margin-bottom:12px">'
      +'<div style="font-size:26px">🧮</div>'
      +'<div style="font-weight:900;font-size:17px">Arqueo de efectivo</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:4px">Cuenta el dinero físico de la caja y escribe CUÁNTOS billetes y monedas hay de cada uno.</div>'
    +'</div>'
    +'<div style="max-height:46vh;overflow-y:auto;padding-right:4px">'+rows+'</div>'
    +'<div style="background:var(--bg);border:1px solid var(--gold)55;border-radius:10px;padding:10px;margin:12px 0;display:flex;justify-content:space-between;align-items:center">'
      +'<span style="font-weight:800;font-size:14px">TOTAL CONTADO</span>'
      +'<span id="arq-total" style="color:var(--gold);font-weight:900;font-size:20px">$0</span>'
    +'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal1()">Cancelar</button>'
      +'<button class="btn btn-gold btn-full" onclick="confirmarArqueo()">✓ Guardar arqueo</button>'
    +'</div>');
}
function calcArqueo(){
  var total=0;
  DENOMS.forEach(function(d){
    var q=parseInt((document.getElementById('arq-'+d.k)||{}).value)||0;
    var sub=q*d.v;total+=sub;
    var el=document.getElementById('arqs-'+d.k);
    if(el)el.textContent=sub?fmt(sub):'$0';
  });
  var t=document.getElementById('arq-total');
  if(t)t.textContent=fmt(total);
  return total;
}
function confirmarArqueo(){
  var denoms={};var total=0;var alguno=false;
  DENOMS.forEach(function(d){
    var q=parseInt((document.getElementById('arq-'+d.k)||{}).value)||0;
    denoms[d.k]=q;total+=q*d.v;if(q>0)alguno=true;
  });
  if(!alguno&&!confirm('No registraste ningún billete ni moneda (caja en $0). ¿Guardar así?'))return;
  var esp=efectivoEsperadoTurno();
  var dif=total-esp.esperado;
  var arq={id:'arq_'+a52Ahora(),ts:a52Ahora(),uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,
    denoms:denoms,total:total,esperado:esp.esperado,dif:dif,
    detalleEsperado:{ini:esp.ini,ventas:esp.ventas,abonos:esp.abonos,gastos:esp.gastos},
    turnoTs:turnoInicio||0};
  fbPush('arqueos',arq);
  closeModal1();
  // El cajero solo ve su total (conteo ciego); el admin ve la diferencia
  if(usuarioActivo.rol==='admin'){
    var difTxt=dif===0?'✅ Caja cuadrada':(dif<0?'🔴 Falta '+fmt(Math.abs(dif)):'🟡 Sobra '+fmt(dif));
    showToast('🧮 Arqueo guardado · contado '+fmt(total)+'<br><span style="font-size:12px;opacity:.9">Esperado '+fmt(esp.esperado)+' · '+difTxt+'</span>',dif===0?'#22c55e':(dif<0?'#ef4444':'#f5a623'),6000);
  } else {
    showToast('🧮 Arqueo guardado<br><span style="font-size:12px;opacity:.85">Total contado: '+fmt(total)+' · quedó registrado con tu nombre</span>','#22c55e',5000);
  }
  render();
}
function verArqueo(aid){
  var a=arqueos.find(function(x){return x.id===aid;});
  if(!a)return;
  var esAdm=usuarioActivo&&usuarioActivo.rol==='admin';
  var rows=DENOMS.map(function(d){
    var q=(a.denoms||{})[d.k]||0;
    if(!q)return'';
    return'<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border)"><span>'+d.l+' × <b>'+q+'</b></span><span style="font-weight:700">'+fmt(q*d.v)+'</span></div>';
  }).join('');
  var de=a.detalleEsperado||{};
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:2px">🧮 Arqueo de efectivo</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">'+fmtFechaCorta(a.ts)+' · ✍️ '+esc(a.uidNombre||'')+'</div>'
    +'<div style="max-height:34vh;overflow-y:auto;margin-bottom:10px">'+(rows||'<div style="color:var(--muted);font-size:12px;padding:8px 0">Caja contada en $0.</div>')+'</div>'
    +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px">'
      +'<div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0"><span style="font-weight:800">CONTADO</span><span style="color:var(--gold);font-weight:900;font-size:15px">'+fmt(a.total)+'</span></div>'
      +(esAdm?('<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0;color:var(--muted)"><span>Esperado</span><span>'+fmt(a.esperado)+'</span></div>'
        +'<div style="color:var(--muted);font-size:10px;padding:2px 0">Inicial '+fmt(de.ini||0)+' + ventas efvo. '+fmt(de.ventas||0)+(de.abonos?' + abonos '+fmt(de.abonos):'')+' − gastos efvo. '+fmt(de.gastos||0)+'</div>'
        +'<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-top:1px solid var(--border);margin-top:4px"><span style="font-weight:800">'+(a.dif===0?'✅ CUADRADA':(a.dif<0?'🔴 FALTANTE':'🟡 SOBRANTE'))+'</span><span style="color:'+(a.dif===0?'#22c55e':(a.dif<0?'#ef4444':'#f5a623'))+';font-weight:900;font-size:15px">'+fmt(Math.abs(a.dif))+'</span></div>'):'')
    +'</div>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:12px">Cerrar</button>');
}


