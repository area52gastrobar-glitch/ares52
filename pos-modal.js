/* ═══════════════ HELPERS MODAL ═══════════════ */
function modal1(content){var m=document.getElementById('modal1');m.innerHTML='<div class="modal-box">'+content+'</div>';m.style.display='flex';}
function modal2(content){var m=document.getElementById('modal2');m.innerHTML='<div class="modal-box">'+content+'</div>';m.style.display='flex';}
function closeModal1(){document.getElementById('modal1').style.display='none';}
function closeModal2(){document.getElementById('modal2').style.display='none';}
document.addEventListener('click',function(e){
  var m1=document.getElementById('modal1'),m2=document.getElementById('modal2');
  if(e.target===m1)closeModal1();
  if(e.target===m2)closeModal2();
  // Inventario tab switch
  var it=e.target.closest('[data-act="inv-tab"]');
  if(it){_invTab=it.getAttribute('data-tab');render();return;}
  // Inventario cart product +/-/merc
  var ip=e.target.closest('[data-act="inv-plus"],[data-act="inv-minus"],[data-act="inv-merc"],[data-act="inv-edit-stock"]');
  if(ip){
    if(!puedeAjustarInv()){alert('🔒 Los ajustes de inventario están bloqueados. Solo el administrador puede modificar cantidades.');return;}
    var act=ip.getAttribute('data-act');
    var pid=parseInt(ip.getAttribute('data-pid'));
    var p=menu.find(function(m){return m.id===pid;});
    if(!p)return;
    if(act==='inv-plus'){cambiarStock('p',p.id,1,'✏️ Ajuste manual (+1)');render();}
    else if(act==='inv-minus'){cambiarStock('p',p.id,-1,'✏️ Ajuste manual (−1)');render();}
    else if(act==='inv-merc'){abrirMercanciaModal(pid,false);}
    else if(act==='inv-edit-stock'){abrirEditStockModal(pid,false);}
    return;
  }
  // Ingredientes actions
  var ii2=e.target.closest('[data-act="ing-merc"],[data-act="ing-edit-stock"]');
  if(ii2&&!puedeAjustarInv()){alert('🔒 Los ajustes de inventario están bloqueados. Solo el administrador puede modificar cantidades.');return;}
  if(ii2){
    var act2=ii2.getAttribute('data-act');
    var iid2=ii2.getAttribute('data-iid');
    if(act2==='ing-merc') abrirMercanciaModal(iid2,true);
    else if(act2==='ing-edit-stock') abrirEditStockModal(iid2,true);
    return;
  }
  // Ingredientes +/-/edit
  var ii=e.target.closest('[data-act="ing-plus"],[data-act="ing-minus"],[data-act="ing-edit"]');
  if(ii&&!puedeAjustarInv()){alert('🔒 Los ajustes de inventario están bloqueados. Solo el administrador puede modificar cantidades.');return;}
  if(ii){
    var act2=ii.getAttribute('data-act');
    var iid=ii.getAttribute('data-iid');
    var ing=ingredientes.find(function(x){return x.id===iid;});
    if(!ing)return;
    if(act2==='ing-plus'){cambiarStock('i',ing.id,1,'✏️ Ajuste manual (+1)');}
    else if(act2==='ing-minus'){cambiarStock('i',ing.id,-1,'✏️ Ajuste manual (−1)');}
    else if(act2==='ing-edit'){abrirEditIngrediente(iid);}

    render();return;
  }
  // Quick value buttons in item personalizado
  var qvBtn=e.target.closest('[data-qv]');
  if(qvBtn){
    var qval=qvBtn.getAttribute('data-qv');
    var elcv=document.getElementById('ci-valor');
    if(elcv)elcv.value=qval;
    var elmc=document.getElementById('merc-cant');
    if(elmc)elmc.value=qval;
  }
  // Category pill clicks
  var cp=e.target.closest('[data-setcat]');
  if(cp){setCatPed(cp.getAttribute('data-setcat'));return;}
  var pst=e.target.closest('[data-act="ped-subtoggle"]');
  if(pst){var sk=pst.getAttribute('data-sub');_pedSubAbierta[sk]=!_pedSubAbierta[sk];renderSoloPedido();return;}

  // Socios controls
  var ss=e.target.closest('[data-act="sel-socio"]');
  if(ss){_socioActivo=ss.getAttribute('data-socio');render();return;}
  var sc=e.target.closest('[data-act="soc-cat"]');
  if(sc){var cc=sc.getAttribute('data-cat');_socCatFiltro=(_socCatFiltro===cc)?'':cc;render();return;}
  var crc=e.target.closest('[data-act="confirm-rename-cat"]');
  if(crc){confirmarRenombrarCategoria(crc.getAttribute('data-cat'));return;}
  var cce=e.target.closest('[data-act="confirm-cat-emoji"]');
  if(cce){
    var cat2=cce.getAttribute('data-cat');
    var val=((document.getElementById('emoji-custom')||{}).value||'').trim();
    if(val){catEmojis[cat2]=val;fbSet('catEmojis',catEmojis);closeModal2();render();}
    return;
  }
  var divp=e.target.closest('[data-act="div-plus"]');
  if(divp){
    var di=divp.getAttribute('data-idx');var ped=pedidos[mesaActiva.id]||[];
    if(!window._divSel)window._divSel={};
    var cur=window._divSel[di]||0;
    if(ped[di]&&cur<ped[di].qty){window._divSel[di]=cur+1;renderDividirModal();}
    return;
  }
  var divm=e.target.closest('[data-act="div-minus"]');
  if(divm){
    var di2=divm.getAttribute('data-idx');
    if(!window._divSel)window._divSel={};
    window._divSel[di2]=Math.max(0,(window._divSel[di2]||0)-1);renderDividirModal();
    return;
  }
  var dpl=e.target.closest('[data-act="distrib-plus"]');
  if(dpl){
    var dpid=parseInt(dpl.getAttribute('data-pid'));
    var dd=window._distrib;
    if(dd){dd.cantidades[dpid]=(dd.cantidades[dpid]||0)+1;renderDistribModal();}
    return;
  }
  var dmi=e.target.closest('[data-act="distrib-minus"]');
  if(dmi){
    var dpid2=parseInt(dmi.getAttribute('data-pid'));
    var dd2=window._distrib;
    if(dd2){dd2.cantidades[dpid2]=Math.max(0,(dd2.cantidades[dpid2]||0)-1);renderDistribModal();}
    return;
  }
  var mqv=e.target.closest('[data-act="mesa-qty-var"]');
  if(mqv){
    var pidV=parseInt(mqv.getAttribute('data-pid'));
    var nomV=mqv.getAttribute('data-nom');
    var preV=parseInt(mqv.getAttribute('data-pre'));
    var qtyV=parseInt(mqv.getAttribute('data-qty'));
    closeModal2();
    agregarItemQty(pidV,false,qtyV,nomV,preV);
    return;
  }
  var mqp=e.target.closest('[data-act="mesa-qty-promo"]');
  if(mqp){
    var pidP=parseInt(mqp.getAttribute('data-pid'));
    var qtyP=parseInt(mqp.getAttribute('data-qty'));
    closeModal2();
    agregarItemQty(pidP,false,qtyP,'Promo '+fmt(PROMO_NACIONAL_PRECIO),PROMO_NACIONAL_PRECIO);
    return;
  }
  var mq=e.target.closest('[data-act="mesa-qty"]');
  if(mq){
    var pidM=parseInt(mq.getAttribute('data-pid'));
    var cubM=mq.getAttribute('data-cub')==='true';
    var qtyM=parseInt(mq.getAttribute('data-qty'));
    closeModal2();
    agregarItemQty(pidM,cubM,qtyM);
    return;
  }
  var pv=e.target.closest('[data-act="pick-variante"]');
  if(pv){
    var pid=parseInt(pv.getAttribute('data-pid'));
    var nom=pv.getAttribute('data-nom');
    var pre=parseInt(pv.getAttribute('data-pre'));
    closeModal2();
    abrirCantidadVariante(pid,nom,pre);
    return;
  }
  var ces=e.target.closest('[data-act="confirm-edit-stock"]');
  if(ces){confirmarEditStock(ces.getAttribute('data-id'),ces.getAttribute('data-esing')==='true');return;}
  var cm=e.target.closest('[data-act="confirm-mercancia"]');
  if(cm){confirmarMercancia(cm.getAttribute('data-id'),cm.getAttribute('data-esing')==='true');return;}
  var td=e.target.closest('[data-act="toggle-desc"]');
  if(td){
    if(mesaActiva&&descuentos[mesaActiva.id]) quitarDescuento();
    else abrirDescuento();
    return;
  }
  var smx=e.target.closest('[data-act="soc-mix"]');
  if(smx){abrirMixtoSocio(smx.getAttribute('data-tipo'));return;}
  var sa=e.target.closest('[data-act="soc-add"]');
  if(sa){
    var pid=parseInt(sa.getAttribute('data-pid'));
    var esCub=sa.getAttribute('data-cub')==='true';
    abrirCantidadSocio(pid,esCub);return;
  }
  var sq=e.target.closest('[data-act="soc-qty"]');
  if(sq){
    var pidQ=parseInt(sq.getAttribute('data-pid'));
    var esCubQ=sq.getAttribute('data-cub')==='true';
    var qtyQ=parseInt(sq.getAttribute('data-qty'));
    closeModal2();
    agregarConsumoSocio(pidQ,esCubQ,qtyQ);return;
  }
  // Empleados
  var em=e.target.closest('[data-act="emp-mov"]');
  if(em){
    abrirMovEmpleado(em.getAttribute('data-emp'),em.getAttribute('data-tipo'));return;
  }
  var edia=e.target.closest('[data-act="emp-dia"]');
  if(edia){
    var k=edia.getAttribute('data-key');
    var empDia=empleados.find(function(x){return x.id===edia.getAttribute('data-emp');});
    if(asistenciaEmp[k]){
      // Ya estaba marcado -> desmarcar
      delete asistenciaEmp[k];
      fbSet('asistenciaEmp',asistenciaEmp);render();
    } else if(empDia&&empDia.pagoVariable){
      // Pago variable -> preguntar cuánto se paga ese día
      abrirPagoDiaVariable(k,empDia);
    } else {
      // Pago fijo
      asistenciaEmp[k]=true;
      fbSet('asistenciaEmp',asistenciaEmp);render();
    }
    return;
  }
  var eed=e.target.closest('[data-act="emp-edit"]');
  if(eed){abrirEditarEmpleado(eed.getAttribute('data-emp'));return;}
  var epr=e.target.closest('[data-act="emp-prestamo"]');
  if(epr){abrirPrestamoEmpleado(epr.getAttribute('data-emp'));return;}
  var epg=e.target.closest('[data-act="emp-pagar"]');
  if(epg){pagarSaldoEmpleado(epg.getAttribute('data-emp'),epg.getAttribute('data-monto'),epg.getAttribute('data-sem'));return;}
  var epa=e.target.closest('[data-act="emp-pasar"]');
  if(epa){pasarSaldoSemana(epa.getAttribute('data-emp'),epa.getAttribute('data-sem'));return;}
  var evm=e.target.closest('[data-act="emp-vermov"]');
  if(evm && !e.target.closest('[data-act="emp-delmov"]')){
    verMovEmpleado(evm.getAttribute('data-id'));return;
  }
  var edm=e.target.closest('[data-act="emp-delmov"]');
  if(edm){
    borrarMovEmpleado(edm.getAttribute('data-id'));return;
  }
  var cp=e.target.closest('[data-act="cred-pagar"]');
  if(cp){
    abrirPagoCredito(cp.getAttribute('data-id'));return;
  }
  var cdel=e.target.closest('[data-act="cred-del"]');
  if(cdel){
    eliminarFiado(cdel.getAttribute('data-id'));return;
  }
  var cvol=e.target.closest('[data-act="cred-volver"]');
  if(cvol){
    abrirDevolverFiado(cvol.getAttribute('data-id'));return;
  }
  var sec=e.target.closest('[data-act="toggle-sec"]');
  if(sec){
    var sid=sec.getAttribute('data-sec');
    _secOpen[sid]=!_secOpen[sid];
    render();
    return;
  }
  var mes=e.target.closest('[data-act="toggle-mes"]');
  if(mes){
    var mid=mes.getAttribute('data-mes');
    _mesesOpen[mid]=!_mesesOpen[mid];
    render();
    return;
  }
  var qab=e.target.closest('[data-act="quitar-abono"]');
  if(qab){
    quitarAbonoMesa(parseInt(qab.getAttribute('data-idx')));
    return;
  }
  var sc=e.target.closest('[data-act="san-check"]');
  if(sc){
    var k=sc.getAttribute('data-key');
    var ex=saneamientoChecks[k];
    if(ex&&ex.check){ delete saneamientoChecks[k]; }
    else{
      var ahora=new Date();
      saneamientoChecks[k]={check:true,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,hora:('0'+ahora.getHours()).slice(-2)+':'+('0'+ahora.getMinutes()).slice(-2),ts:a52Ahora()};
    }
    fbSet('saneamientoChecks',saneamientoChecks);
    render();
    return;
  }
  var ssc=e.target.closest('[data-act="san-sem-check"]');
  if(ssc){
    var k2=ssc.getAttribute('data-key');
    var ex2=saneamientoSemanal[k2];
    if(ex2&&ex2.check){ delete saneamientoSemanal[k2]; }
    else{
      var ahora2=new Date();
      saneamientoSemanal[k2]={check:true,uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre,hora:('0'+ahora2.getHours()).slice(-2)+':'+('0'+ahora2.getMinutes()).slice(-2),ts:a52Ahora()};
    }
    fbSet('saneamientoSemanal',saneamientoSemanal);
    render();
    return;
  }
  var vef=e.target.closest('[data-act="venta-editfp"]');
  if(vef){
    if(usuarioActivo&&usuarioActivo.rol==='admin')abrirEditarFP(vef.getAttribute('data-key'));
    else alert('Solo el administrador puede corregir la forma de pago.');
    return;
  }
  var vdev=e.target.closest('[data-act="venta-devolver"]');
  if(vdev){
    if(usuarioActivo&&usuarioActivo.rol==='admin')abrirDevolverVenta(vdev.getAttribute('data-key'));
    else alert('Solo el administrador puede devolver un cobro a la mesa.');
    return;
  }
  var scb=e.target.closest('[data-act="soc-add-combo"]');
  if(scb){agregarConsumoSocioCombo(scb.getAttribute('data-cbid'));return;}

  // Combo and pedido actions (moved from bindComboEvents to avoid duplicate listeners)
  var btn2=e.target.closest('[data-act]');
  if(btn2){
    var act2=btn2.getAttribute('data-act');
    var cbid2=btn2.getAttribute('data-cbid');
    if(act2==='addcombo'&&cbid2){agregarComboAPedido(cbid2);return;}
    if(act2==='editcombo'&&cbid2){editarCombo(cbid2);return;}
    if(act2==='delcombo'&&cbid2){borrarCombo(cbid2);return;}
    if(act2==='entregar'){
      var key=btn2.getAttribute('data-key');
      var mesaId2=parseInt(btn2.getAttribute('data-mesaid'));
      var itemIdx2=parseInt(btn2.getAttribute('data-itemidx'));
      var rawPed=pedidos[mesaId2]||pedidos[String(mesaId2)]||[];
      // Firebase may return object instead of array - normalize
      var ped2=Array.isArray(rawPed)?rawPed:Object.values(rawPed);
      // Localizar el item por su ID único (estable aunque se borren otros items); índice como respaldo
      var uidKey=key.slice(String(mesaId2).length+1);
      var it2=ped2.find(function(x){return x.uidItem&&x.uidItem===uidKey;})||ped2[itemIdx2];
      var maxQty=it2?it2.qty:1;
      var nuevo=(cocinaEntregados[key]||0)+1;
      // Cap at maxQty, keep the value (don't delete - that would reset to pending)
      cocinaEntregados[key]=Math.min(nuevo,maxQty);
      // Persist to Firebase so it survives across devices and re-renders
      fbSet('cocinaEntregados',cocinaEntregados);
      render();
      return;
    }
    if(act2==='ped-minus-bloq'){
      showToast('🔒 Solo el administrador o subadministrador pueden restar productos de una mesa.','#ef4444',3500);
      return;
    }
    if(act2==='ped-editqty'){
      var eidx=parseInt(btn2.getAttribute('data-idx'));
      if(isNaN(eidx)||!mesaActiva)return;
      // Admin/subadmin: editor completo (sumar, fijar exacto, quitar).
      // Los demás: picker que SOLO permite sumar más (elegir de una lista de números).
      if(usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin')){
        editarCantidadPedido(eidx);
      } else {
        abrirSumarCantidad(eidx);
      }
      return;
    }
    if(act2==='ped-minus'||act2==='ped-plus'){
      var pidx=parseInt(btn2.getAttribute('data-idx'));
      if(isNaN(pidx)||!mesaActiva)return;
      // El botón + abre el selector de cantidad (no suma de a uno).
      if(act2==='ped-plus'){
        if(usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin')){
          editarCantidadPedido(pidx);
        } else {
          abrirSumarCantidad(pidx);
        }
        return;
      }
      // Restar productos solo admin o subadmin
      if(!(usuarioActivo&&(usuarioActivo.rol==='admin'||usuarioActivo.rol==='subadmin'))){
        showToast('🔒 No tienes permiso para restar productos. Pide al administrador o subadministrador.','#ef4444',3500);
        return;
      }
      var pped=pedidos[mesaActiva.id]||[];
      var pit=pped[pidx];if(!pit)return;
      var nomLogPM=pit.isCustom?pit.customNombre:(pit.isCombo?pit.comboNombre:(pit.cubMixNombre||((menu.find(function(m){return m.id===pit.pid;})||{}).nombre)||'Producto'))+(pit.varianteNombre?' ('+pit.varianteNombre+')':'')+(pit.cubeta?' 🪣':'');
      ajustarStockItem(pit,+1);  // devolver al inventario
      logPedido(mesaActiva.id,'-1 '+nomLogPM,-1);
      if(pit.qty===1)pped.splice(pidx,1);
      else pit.qty--;
      var pr=ref('pedidos/'+mesaActiva.id);
      if(pr)pr.set(pped.length?pped:null);
      renderSoloPedido();updateHeader();actualizarColorMesas();
      return;
    }
  }

  // Paredes UI controls - always active regardless of cloneNode
  var pc=e.target.closest('[data-pcolor]');
  if(pc){selColorP(pc.getAttribute('data-pcolor'));return;}
  var pg=e.target.closest('[data-pgrosor]');
  if(pg){selGrosorP(parseInt(pg.getAttribute('data-pgrosor')));return;}
  var pa=e.target.closest('[data-pact]');
  if(pa){
    var act=pa.getAttribute('data-pact');
    if(act==='deshacer')deshacerPared();
    if(act==='limpiar')borrarParedes();
    return;
  }
});


