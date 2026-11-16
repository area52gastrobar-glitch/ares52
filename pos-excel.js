/* ═══════════════ EXCEL ═══════════════ */
// Plegar/desplegar el detalle de un cobro del turno
function toggleCobroDet(k){
  if(!window._cobroDet)window._cobroDet={};
  window._cobroDet[k]=!window._cobroDet[k];
  render();
}
function expandirCobros(abrir){
  window._cobroDet={};
  if(abrir){
    ventasTurno().forEach(function(v){window._cobroDet[String(v.ts)]=true;});
  }
  render();
}

function exportarExcel(){
  if(!window.XLSX){alert('La librería Excel no está disponible. Verifica tu conexión a internet e intenta de nuevo.');return;}
  var X=window.XLSX,wb=X.utils.book_new();
  // Detalle ventas
  var det=[];
  ventas.forEach(function(v){
    var fp=FPAGO.find(function(f){return f.id===v.fp;});
    var z=ZONAS.find(function(x){return x.id===v.zona;});
    var ts=new Date(v.ts);
    var itsV=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
    var base={Fecha:ts.toLocaleDateString('es-CO'),Hora:ts.toLocaleTimeString('es-CO'),Zona:z?z.label:'',Mesa:v.mesa||'',Usuario:v.uidNombre||v.uid||''};
    var sumaV=0;
    function fila(prod,tipo,cant,pr){det.push(Object.assign({},base,{Producto:prod,Tipo:tipo,Cantidad:cant,'Precio unit':pr,Subtotal:pr*cant,'Forma pago':fp?fp.label:v.fp,'Total mesa':v.total}));sumaV+=pr*cant;}
    itsV.forEach(function(it){
      if(!it)return;
      var p=menu.find(function(m){return m.id==it.pid;});
      var pr=precioItem(it),q=it.qty||1,nom,tipo='Detal';
      if(it.isCombo){nom='Combo '+(it.comboNombre||'');tipo='Combo';}
      else if(it.isCubetazoMix){nom=(it.cubMixNombre||'Cubetazo mixto')+' ('+(it.cubMixDetalle||[]).map(function(d){return d.cantidad+'× '+d.nombre;}).join(', ')+')';tipo='Cubetazo mixto';}
      else if(it.isCustom){nom=it.customNombre||'Otro';tipo=it.esAsumeSocio?'Asume socio':'Otro (a mano)';}
      else{
        nom=it.nombreVenta||((p?p.nombre:(it.nombre||'Producto borrado del menú'))+(it.varianteNombre?' ('+it.varianteNombre+')':''));
        tipo=it.es2x1Gratis?'2x1 gratis':it.cubeta?'Cubetazo x5':it.precioPromo?'Promoción':it.varianteNombre?'Tamaño / variante':'Detal';
      }
      fila(nom,tipo,q,pr);
    });
    // Que cada cobro cuadre: descuento, abonos previos o un precio que cambió después de la venta
    var difV=(v.total||0)-sumaV;
    if(itsV.length&&Math.abs(difV)>=1)fila(v.descuento&&v.descuento.pct?('Descuento '+v.descuento.pct+'%'):(difV<0?'Ajuste: abono previo o descuento':'Ajuste: precio distinto al de hoy'),'Ajuste',1,difV);
  });
  var ws1=X.utils.json_to_sheet(det);ws1['!cols']=[10,8,13,14,14,22,11,9,12,12,15,12].map(function(w){return{wch:w};});X.utils.book_append_sheet(wb,ws1,'Ventas detalle');
  // Unidades por producto y día de negocio (combos y cubetazos desarmados)
  if(typeof expUnidades==='function'){
    var porDiaU={},ordenU=[];
    ventas.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(v){var d=diaNegocioStr(v.ts);if(!porDiaU[d]){porDiaU[d]=[];ordenU.push(d);}porDiaU[d].push(v);});
    var undDet=[];
    ordenU.forEach(function(d){expUnidades(porDiaU[d]).forEach(function(f){undDet.push({'Día de negocio':d,Categoria:f.cat||'',Producto:f.nombre,Unidades:f.und,'De ellas en combos':f.enCombos,'Valor':Math.round(f.total)});});});
    var wsU=X.utils.json_to_sheet(undDet);wsU['!cols']=[13,18,30,10,16,12].map(function(w){return{wch:w};});X.utils.book_append_sheet(wb,wsU,'Unidades por producto');
  }
  // Gastos
  var gastDet=gastos.map(function(g){return{Fecha:fmtDate(g.ts),Hora:fmtTime(g.ts),Concepto:g.concepto,Categoria:g.categoria,Valor:g.valor,Usuario:g.uidNombre||g.uid||'',Notas:g.notas||''};});
  var ws2=X.utils.json_to_sheet(gastDet);X.utils.book_append_sheet(wb,ws2,'Gastos');
  // Por día
  var pd={};ventas.forEach(function(v){var d=diaNegocioStr(v.ts);if(!pd[d])pd[d]={Fecha:d,Ventas:0,Cobros:0};pd[d].Ventas+=v.total;pd[d].Cobros++;});
  X.utils.book_append_sheet(wb,X.utils.json_to_sheet(Object.values(pd)),'Por día');
  // Por forma pago
  var pp={};ventas.forEach(function(v){var l=(FPAGO.find(function(f){return f.id===v.fp;})||{label:v.fp}).label;if(!pp[l])pp[l]={'Forma de pago':l,Cobros:0,'Total COP':0};pp[l].Cobros++;pp[l]['Total COP']+=v.total;});
  X.utils.book_append_sheet(wb,X.utils.json_to_sheet(Object.values(pp)),'Por forma de pago');
  // Por usuario
  var pu={};ventas.forEach(function(v){var u=v.uidNombre||v.uid||'?';if(!pu[u])pu[u]={Usuario:u,Cobros:0,'Total COP':0};pu[u].Cobros++;pu[u]['Total COP']+=v.total;});
  X.utils.book_append_sheet(wb,X.utils.json_to_sheet(Object.values(pu)),'Por usuario');
  // Consumo de socios - detalle
  var socDet=[];
  (consumoSocios||[]).forEach(function(c){
    var ts=new Date(c.ts);
    (c.items||[]).forEach(function(it){
      socDet.push({Fecha:ts.toLocaleDateString('es-CO'),Hora:ts.toLocaleTimeString('es-CO'),Socio:c.socio||'',Producto:it.nombre||'',Tipo:it.cubeta?'Cubetazo x5':'Detal',Cantidad:it.qty,'Precio base':it.precioBase||0,'Precio socio':it.precioSocio||0,Subtotal:(it.precioSocio||0)*(it.qty||1)});
    });
  });
  if(socDet.length){
    var wsS=X.utils.json_to_sheet(socDet);wsS['!cols']=[10,8,10,22,11,9,12,12,12].map(function(w){return{wch:w};});
    X.utils.book_append_sheet(wb,wsS,'Consumo socios');
  } else {
    X.utils.book_append_sheet(wb,X.utils.json_to_sheet([{Aviso:'Sin consumos de socios registrados'}]),'Consumo socios');
  }
  // Consumo de socios - resumen por socio
  var resS={};
  (consumoSocios||[]).forEach(function(c){
    var s=c.socio||'?';if(!resS[s])resS[s]={Socio:s,'Items totales':0,'Total COP':0,'Num registros':0};
    resS[s]['Num registros']++;resS[s]['Total COP']+=(c.total||0);
    (c.items||[]).forEach(function(it){resS[s]['Items totales']+=(it.qty||0);});
  });
  X.utils.book_append_sheet(wb,X.utils.json_to_sheet(Object.values(resS).length?Object.values(resS):[{Aviso:'Sin consumos'}]),'Socios resumen');
  // Cierres
  var cDet=cierres.map(function(c){return{Fecha:fmtDate(c.ts),Hora:fmtTime(c.ts),'Caja inicial':c.cajaInicial,'Total ventas':c.ventas,'Total gastos':c.gastos,'Utilidad bruta':c.utilidad,'Num ventas':c.numVentas,'Num gastos':c.numGastos,Usuario:c.uid||''};});
  X.utils.book_append_sheet(wb,X.utils.json_to_sheet(cDet),'Cierres');
  X.writeFile(wb,NEGOCIO.archivo+'_'+new Date().toLocaleDateString('es-CO').replace(/\//g,'-')+'.xlsx');
}

function exportarCierre(id){
  if(!window.XLSX){alert('Espera un momento.');return;}
  var c=cierres.find(function(x){return x.id===id;});if(!c)return;
  var X=window.XLSX,wb=X.utils.book_new();
  var resumen=[
    {Concepto:'Fecha',Valor:fmtDate(c.ts)},
    {Concepto:'Caja inicial',Valor:c.cajaInicial},
    {Concepto:'Total ventas',Valor:c.ventas},
    {Concepto:'Total gastos',Valor:c.gastos},
    {Concepto:'Utilidad bruta',Valor:c.utilidad},
  ];
  FPAGO.forEach(function(f){resumen.push({Concepto:f.label,Valor:(c.porFP&&c.porFP[f.id])||0});});
  var ws=X.utils.json_to_sheet(resumen);X.utils.book_append_sheet(wb,ws,'Cierre');
  X.writeFile(wb,NEGOCIO.archivo+'_Cierre_'+fmtDate(c.ts).replace(/\//g,'-')+'.xlsx');
}


