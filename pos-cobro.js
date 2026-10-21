/* ═══════════════ COBRO MODAL ═══════════════ */
function abrirAbonoMesa(){
  if(!mesaActiva)return;
  var total=totalPedido(mesaActiva.id);
  var desc=descuentos[mesaActiva.id];
  var totalReal=desc&&desc.pct?Math.round(total*(1-desc.pct/100)):total;
  var abs=(abonosMesa[mesaActiva.id]||[]);
  var abonado=abs.reduce(function(a,x){return a+(x.monto||0);},0);
  var falta=Math.max(0,totalReal-abonado);
  var fpOpts='<option value="" selected disabled>👆 Elige la forma de pago...</option>'+FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');
  modal2('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💵 Registrar abono</div>'
    +'<div style="color:var(--muted);font-size:13px;margin-bottom:12px">Total cuenta: '+fmt(totalReal)+' · Falta: <b style="color:#f5a623">'+fmt(falta)+'</b></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Quién abona? (opcional)</div>'
    +'<input class="inp" id="abono-nombre" placeholder="Ej: Juan, Mesa, etc."/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto del abono *</div>'
    +'<input class="inp money" id="abono-monto" type="text" value="'+moneyFmt(falta)+'" inputmode="numeric"/></div>'
    +'<div style="margin-bottom:14px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Forma de pago</div>'
    +'<select class="inp" id="abono-fp">'+fpOpts+'</select></div>'
    +'<button class="btn btn-green btn-full" onclick="guardarAbonoMesa()">💵 Registrar abono</button>');
}

function guardarAbonoMesa(){
  if(!mesaActiva)return;
  var monto=moneyVal('abono-monto')||0;
  var fp=(document.getElementById('abono-fp')||{}).value||'';
  if(!fp){alert('👆 Elige la forma de pago del abono.');return;}
  var nombre=((document.getElementById('abono-nombre')||{}).value||'').trim()||'Abono';
  if(monto<=0){alert('Escribe el monto.');return;}
  var id=mesaActiva.id;
  if(!abonosMesa[id])abonosMesa[id]=[];
  abonosMesa[id].push({monto:monto,fp:fp,nombre:nombre,ts:a52Ahora(),uid:usuarioActivo.id});
  fbSet('abonosMesa',abonosMesa);
  closeModal2();
  var f=FPAGO.find(function(x){return x.id===fp;});
  showToast('💵 Abono registrado<br><span style="font-size:12px;opacity:.85">'+esc(nombre)+' · '+fmt(monto)+(f?' · '+f.label:'')+'</span>','#22c55e');
  render();
}

function quitarAbonoMesa(idx){
  if(!mesaActiva)return;
  var id=mesaActiva.id;
  if(abonosMesa[id]&&abonosMesa[id][idx]){
    abonosMesa[id].splice(idx,1);
    if(!abonosMesa[id].length)delete abonosMesa[id];
    fbSet('abonosMesa',abonosMesa);
    render();
  }
}

/* ═══ 📝 NOVEDADES DE MESA (para que el admin revise la caja con claridad) ═══ */
var TIPOS_NOVEDAD=[
  {id:'volo',emoji:'🏃',label:'Se voló sin pagar'},
  {id:'cortesia',emoji:'🎁',label:'Cortesía / regalo'},
  {id:'descuento',emoji:'🏷️',label:'Descuento'},
  {id:'dano',emoji:'💔',label:'Daño / rotura'},
  {id:'perdida',emoji:'💀',label:'Cuenta perdida'},
  {id:'otra',emoji:'📝',label:'Otra'}
];
function abrirNovedadMesa(){
  window._novTipo='';
  renderNovedadForm();
}
function renderNovedadForm(){
  var mesaTxt=mesaActiva?(mesaActiva.nombre||('Mesa '+mesaActiva.num)):'';
  var chips=TIPOS_NOVEDAD.map(function(t){
    var sel=window._novTipo===t.id;
    return'<button onclick="window._novTipo=\''+t.id+'\';renderNovedadForm()" style="background:'+(sel?'#f5a623':'var(--bg)')+';color:'+(sel?'#1a1a22':'var(--muted)')+';border:1px solid '+(sel?'#f5a623':'var(--border)')+';border-radius:9px;padding:8px 10px;font-size:12px;font-weight:800;cursor:pointer">'+t.emoji+' '+t.label+'</button>';
  }).join('');
  var vMonto=(document.getElementById('nov-monto')||{}).value||'';
  var vNota=(document.getElementById('nov-nota')||{}).value||'';
  var totMesaNov=mesaActiva?totalPedido(mesaActiva.id):0;
  var esVolo=window._novTipo==='volo'&&mesaActiva&&(pedidos[mesaActiva.id]||[]).length>0;
  if(window._novCerrarPerdida===undefined)window._novCerrarPerdida=true;
  var voloExtra=esVolo?('<div onclick="window._novCerrarPerdida=!window._novCerrarPerdida;renderNovedadForm()" style="background:'+(window._novCerrarPerdida?'#ef444415':'var(--bg)')+';border:1px solid '+(window._novCerrarPerdida?'#ef444455':'var(--border)')+';border-radius:9px;padding:9px 11px;margin-bottom:10px;cursor:pointer;font-size:12px">'
      +'<span style="font-size:15px">'+(window._novCerrarPerdida?'☑️':'⬜')+'</span> <b>Cerrar la mesa como pérdida ('+fmt(totMesaNov).replace(/\u00A0/g,' ')+')</b>'
      +'<div style="color:var(--muted);font-size:10px;margin-top:3px">La mesa se vacía SIN devolver el inventario (lo consumido se perdió) y la caja NO espera ese dinero — así el cierre y el conteo cuadran. El admin acepta la pérdida en el cierre de caja.</div>'
    +'</div>'):'';
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">📝 Novedad · '+esc(mesaTxt)+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Queda registrada con tu nombre y la hora, para que el administrador la vea al revisar la caja.</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:4px">¿Qué pasó?</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'+chips+'</div>'
    +voloExtra
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto (si aplica: lo que se perdió, descontó o regaló)</div>'
    +'<input class="inp money" id="nov-monto" type="text" inputmode="numeric" placeholder="Opcional" value="'+esc(vMonto)+'" style="margin-bottom:10px"/>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Detalle</div>'
    +'<textarea id="nov-nota" placeholder="Ej: la mesa 4 se fue sin pagar 2 cubetazos, salieron por el patio..." style="width:100%;min-height:64px;background:var(--bg);border:1px solid var(--border);border-radius:9px;color:var(--text);padding:9px;font-size:12px;box-sizing:border-box;margin-bottom:14px">'+esc(vNota)+'</textarea>'
    +'<button class="btn btn-green btn-full" onclick="guardarNovedad()">💾 Guardar novedad</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function guardarNovedad(){
  var tipo=TIPOS_NOVEDAD.find(function(t){return t.id===window._novTipo;});
  if(!tipo){alert('Elige qué pasó.');return;}
  var nota=((document.getElementById('nov-nota')||{}).value||'').trim();
  if(!nota){alert('Escribe el detalle de la novedad.');return;}
  var monto=moneyVal('nov-monto')||0;
  var reg={id:'nov_'+a52Ahora(),ts:a52Ahora(),
    mesa:mesaActiva?(mesaActiva.nombre||('Mesa '+mesaActiva.num)):'',
    tipo:tipo.id,tipoLabel:tipo.emoji+' '+tipo.label,
    monto:monto,nota:nota,
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  // 🏃 Cerrar la mesa como pérdida: vacía sin devolver stock, sin venta (la caja no espera esa plata)
  var esVoloCierre=tipo.id==='volo'&&window._novCerrarPerdida&&mesaActiva&&(pedidos[mesaActiva.id]||[]).length>0;
  if(esVoloCierre){
    var idM=mesaActiva.id;
    var itemsDet=(pedidos[idM]||[]).map(function(it){
      return{nombre:nombreItemPed(it).replace(/<[^>]*>/g,''),qty:it.qty||1,valor:precioItem(it)*(it.qty||1)};
    });
    var totM=totalPedido(idM);
    if(!reg.monto)reg.monto=totM;
    reg.esPerdida=true;
    reg.estado='pendiente';
    reg.items=itemsDet;
    pedidos[idM]=[];
    fbSet('pedidos/'+idM,[]);
    logPedido(idM,'🏃 Mesa cerrada como PÉRDIDA ('+fmt(totM).replace(/\u00A0/g,' ')+') — inventario consumido, sin cobro',null);
  }
  fbPush('novedades',reg);
  closeModal1();
  if(esVoloCierre){
    showToast('🏃 Mesa cerrada como pérdida<br><span style="font-size:12px;opacity:.85">'+fmt(reg.monto)+' · inventario descontado · el admin la acepta en el cierre</span>','#ef4444');
    render();
  }else{
    showToast('📝 Novedad guardada<br><span style="font-size:12px;opacity:.85">'+tipo.emoji+' '+esc(reg.mesa)+(monto?' · '+fmt(monto):'')+' · el admin la verá en Caja</span>','#f5a623');
  }
}
function aceptarPerdida(nid){
  if(!usuarioActivo||usuarioActivo.rol!=='admin'){alert('Solo el administrador acepta pérdidas.');return;}
  var n=novedades.find(function(x){return x.id===nid;});
  if(!n||!n._fbkey)return;
  fbSet('novedades/'+n._fbkey+'/estado','aceptada');
  fbSet('novedades/'+n._fbkey+'/aceptadaPor',usuarioActivo.nombre);
  fbSet('novedades/'+n._fbkey+'/aceptadaTs',a52Ahora());
  n.estado='aceptada';n.aceptadaPor=usuarioActivo.nombre;
  showToast('✔️ Pérdida aceptada<br><span style="font-size:12px;opacity:.85">'+(n.tipoLabel||'')+' '+esc(n.mesa||'')+' · '+fmt(n.monto||0)+'</span>','#22c55e');
  abrirCierre();
}
function _perdidasTurno(){
  var desde=turnoInicio||0;
  return novedades.filter(function(n){return n.ts>=desde&&(n.esPerdida||n.tipo==='volo'||n.tipo==='perdida')&&(n.monto>0);});
}
function eliminarNovedad(nid){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  var n=novedades.find(function(x){return x.id===nid;});
  if(!n)return;
  if(!confirm('¿Eliminar esta novedad? ('+(n.tipoLabel||'')+' '+(n.mesa||'')+')'))return;
  if(n._fbkey)fbSet('novedades/'+n._fbkey,null);
  showToast('🗑️ Novedad eliminada','#6b7280');
}

/* ═══ 🤝 SOCIO ASUME PARTE DE LA CUENTA DE UNA MESA ═══ */
function abrirSocioAsumeMesa(){
  if(!mesaActiva)return;
  window._samSocio=window._samSocio||socDlg();
  var tot=totalPedido(mesaActiva.id);
  var chip=function(so){var sel=window._samSocio===so;var col=socColor(so);
    return'<button onclick="window._samSocio=\''+so+'\';abrirSocioAsumeMesa()" style="flex:1;background:'+(sel?col:'var(--bg)')+';color:'+(sel?socTxt(so):'var(--muted)')+';border:1px solid '+(sel?col:'var(--border)')+';border-radius:9px;padding:10px;font-weight:900;font-size:13px;cursor:pointer">'+so+'</button>';};
  var vMonto=(document.getElementById('sam-monto')||{}).value||'';
  modal1('<div style="font-weight:800;font-size:15px;margin-bottom:6px">🤝 Socio asume parte · '+esc(mesaActiva.nombre||('Mesa '+mesaActiva.num))+'</div>'
    +'<div style="background:var(--bg);border-radius:9px;padding:8px 11px;margin-bottom:10px;font-size:12px">Cuenta actual: <b style="color:var(--gold)">'+fmt(tot)+'</b></div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:4px">¿Qué socio asume?</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:10px">'+SOCIOS.map(function(x){return chip(x.id);}).join('')+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Monto que asume</div>'
    +'<input class="inp money" id="sam-monto" type="text" inputmode="numeric" placeholder="Ej: 30.000" value="'+esc(vMonto)+'" style="margin-bottom:12px"/>'
    +'<div style="color:var(--muted);font-size:10.5px;margin-bottom:12px">La cuenta de la mesa baja por ese valor (queda una línea 🤝 visible en el pedido) y el monto se carga al consumo del socio. La caja y el inventario no se tocan.</div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarSocioAsumeMesa()">🤝 Aplicar</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function confirmarSocioAsumeMesa(){
  if(!mesaActiva)return;
  var socio=window._samSocio||socDlg();
  var monto=moneyVal('sam-monto')||0;
  var tot=totalPedido(mesaActiva.id);
  if(monto<=0){alert('Escribe el monto.');return;}
  if(monto>tot){alert('No puede ser mayor a la cuenta actual ('+fmt(tot).replace(/\u00A0/g,' ')+').');return;}
  var id=mesaActiva.id;
  if(!pedidos[id])pedidos[id]=[];
  pedidos[id].push({isCustom:true,customNombre:'🤝 Asume '+socio,customPrecio:-monto,qty:1,esAsumeSocio:true,socio:socio,
    uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36)});
  fbSet('pedidos/'+id,pedidos[id]);
  var consumo={id:'soc_'+a52Ahora(),ts:a52Ahora(),socio:socio,
    items:[{nombre:'🍻 Asumió cuenta · '+(mesaActiva.nombre||('Mesa '+mesaActiva.num)),emoji:'🍻',qty:1,precioBase:monto,precioSocio:monto}],
    total:monto,esAsumido:true,stockDetalle:[],uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre};
  consumoSocios.push(consumo);
  var r=ref('consumoSocios');
  if(r)r.push(consumo);else fbSet('consumoSocios',consumoSocios);
  closeModal1();
  logPedido(id,'🤝 '+socio+' asume '+fmt(monto).replace(/\u00A0/g,' '),1);
  showToast('🤝 '+socio+' asumió '+fmt(monto)+'<br><span style="font-size:12px;opacity:.85">'+esc(mesaActiva.nombre||('Mesa '+mesaActiva.num))+' queda en '+fmt(tot-monto)+' · cargado a su consumo</span>','#38bdf8');
  renderSoloPedido();updateHeader();actualizarColorMesas();
}

/* ═══ 🐸 PELOTAS DE BOLIRRANA ═══ */
function prestarPelotas(){
  if(!mesaActiva)return;
  if(pelotasMesa[mesaActiva.id]){abrirPelotasMesa();return;}
  window._pelQty=6;
  renderPrestarPelotas();
}
function renderPrestarPelotas(){
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🐸 Prestar pelotas de la bolirrana</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:14px">'+esc(mesaActiva.nombre||('Mesa '+mesaActiva.num))+' · quedan cargadas a la mesa: no se puede cobrar la cuenta hasta que las devuelvan (o se cobren las perdidas).</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-bottom:16px">'
      +'<button onclick="window._pelQty=Math.max(1,window._pelQty-1);renderPrestarPelotas()" style="background:var(--card2);color:var(--text);border:1px solid var(--border);border-radius:10px;width:44px;height:44px;font-size:22px;cursor:pointer">−</button>'
      +'<div style="font-size:34px;font-weight:900;min-width:60px;text-align:center">'+window._pelQty+'</div>'
      +'<button onclick="window._pelQty=window._pelQty+1;renderPrestarPelotas()" style="background:var(--card2);color:var(--text);border:1px solid var(--border);border-radius:10px;width:44px;height:44px;font-size:22px;cursor:pointer">+</button>'
    +'</div>'
    +'<button class="btn btn-green btn-full" onclick="confirmarPrestarPelotas()">🐸 Entregar '+window._pelQty+' pelota'+(window._pelQty!==1?'s':'')+'</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
}
function confirmarPrestarPelotas(){
  var reg={qty:window._pelQty||6,ts:a52Ahora(),uidNombre:usuarioActivo.nombre};
  pelotasMesa[mesaActiva.id]=reg;
  fbSet('pelotasMesa/'+mesaActiva.id,reg);
  closeModal1();
  showToast('🐸 '+reg.qty+' pelotas prestadas a '+esc(mesaActiva.nombre||('Mesa '+mesaActiva.num))+'<br><span style="font-size:12px;opacity:.85">La mesa no se podrá cobrar hasta recibirlas</span>','#22c55e');
  render();
}
function abrirPelotasMesa(){
  var reg=pelotasMesa[mesaActiva.id];if(!reg)return;
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🐸 '+reg.qty+' pelota'+(reg.qty!==1?'s':'')+' prestada'+(reg.qty!==1?'s':'')+'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:14px">Entregadas por '+esc(reg.uidNombre||'')+' · '+fmtTime(reg.ts)+'</div>'
    +'<button class="btn btn-green btn-full" onclick="recibirPelotas()">✅ Recibí las '+reg.qty+' pelotas</button>'
    +'<button class="btn btn-full" onclick="abrirCobroPelotasPerdidas()" style="background:#ef444418;border:1px solid #ef444444;color:#ef4444;margin-top:8px">💸 Faltan pelotas — cobrarlas</button>'
    +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cerrar</button>');
}
function recibirPelotas(){
  if(!mesaActiva||!pelotasMesa[mesaActiva.id])return;
  delete pelotasMesa[mesaActiva.id];
  fbSet('pelotasMesa/'+mesaActiva.id,null);
  closeModal1();
  showToast('✅ Pelotas recibidas · mesa al día','#22c55e');
  render();
}
function abrirCobroPelotasPerdidas(){
  var reg=pelotasMesa[mesaActiva.id];if(!reg)return;
  window._pelPerdQty=1;window._pelPerdMax=reg.qty;
  renderCobroPelotasPerdidas();
}
function renderCobroPelotasPerdidas(){
  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">💸 Cobrar pelotas perdidas</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Se agregan al pedido de la mesa como un producto más y entran a la cuenta.</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">¿Cuántas faltan?</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-bottom:12px">'
      +'<button onclick="window._pelPerdQty=Math.max(1,window._pelPerdQty-1);renderCobroPelotasPerdidas()" style="background:var(--card2);color:var(--text);border:1px solid var(--border);border-radius:10px;width:40px;height:40px;font-size:20px;cursor:pointer">−</button>'
      +'<div style="font-size:28px;font-weight:900;min-width:50px;text-align:center">'+window._pelPerdQty+'</div>'
      +'<button onclick="window._pelPerdQty=Math.min(window._pelPerdMax,window._pelPerdQty+1);renderCobroPelotasPerdidas()" style="background:var(--card2);color:var(--text);border:1px solid var(--border);border-radius:10px;width:40px;height:40px;font-size:20px;cursor:pointer">+</button>'
    +'</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Precio por pelota</div>'
    +'<input class="inp money" id="pel-precio" type="text" inputmode="numeric" placeholder="Ej: 5.000" style="margin-bottom:14px"/>'
    +'<button class="btn btn-green btn-full" onclick="confirmarCobroPelotasPerdidas()">💸 Cargar a la cuenta</button>'
    +'<button class="btn btn-full" onclick="abrirPelotasMesa()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">← Volver</button>');
}
function confirmarCobroPelotasPerdidas(){
  var precio=moneyVal('pel-precio')||0;
  if(precio<=0){alert('Escribe el precio por pelota.');return;}
  var qty=window._pelPerdQty||1;
  var id=mesaActiva.id;
  if(!pedidos[id])pedidos[id]=[];
  pedidos[id].push({isCustom:true,customNombre:'🐸 Pelota bolirrana perdida',customPrecio:precio,qty:qty,
    uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36)});
  fbSet('pedidos/'+id,pedidos[id]);
  // Pelotas resueltas: las que faltan quedan cobradas, las demás se dan por recibidas
  delete pelotasMesa[id];
  fbSet('pelotasMesa/'+id,null);
  closeModal1();
  showToast('💸 '+qty+' pelota'+(qty!==1?'s':'')+' perdida'+(qty!==1?'s':'')+' cargada'+(qty!==1?'s':'')+' a la cuenta ('+fmt(precio*qty)+')<br><span style="font-size:12px;opacity:.85">La mesa ya puede cobrarse</span>','#f5a623');
  render();
}

function abrirCobro(){
  // 🐸 Bloqueo: si la mesa tiene pelotas prestadas, primero hay que resolverlas
  if(mesaActiva&&pelotasMesa[mesaActiva.id]){
    var _rp=pelotasMesa[mesaActiva.id];
    modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🐸 ¡Esta mesa tiene '+_rp.qty+' pelota'+(_rp.qty!==1?'s':'')+' de la bolirrana!</div>'
      +'<div style="color:var(--muted);font-size:12px;margin-bottom:14px">No se puede cobrar la cuenta hasta que las devuelvan o se cobren las perdidas.<br><span style="font-size:10px;opacity:.8">Entregadas por '+esc(_rp.uidNombre||'')+' · '+fmtTime(_rp.ts)+'</span></div>'
      +'<button class="btn btn-green btn-full" onclick="recibirPelotas();abrirCobro();">✅ Ya devolvieron las '+_rp.qty+' pelotas — cobrar</button>'
      +'<button class="btn btn-full" onclick="abrirCobroPelotasPerdidas()" style="background:#ef444418;border:1px solid #ef444444;color:#ef4444;margin-top:8px">💸 Faltan pelotas — cobrarlas</button>'
      +'<button class="btn btn-full" onclick="closeModal1()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:8px">Cancelar</button>');
    return;
  }
  if(!mesaActiva)return;
  window._compTemp=null;  // limpiar comprobante de un cobro anterior cancelado
  window._cobroVerificado=false;  // exigir verificación de forma de pago en cada cobro
  var ped=pedidos[mesaActiva.id]||[];
  var total=totalPedido(mesaActiva.id);
  var zona=ZONAS.find(function(z){return z.id===mesaActiva.zona;});

  // Estado del pago dividido
  window._pagosParciales={};  // {fpId: monto}
  // Pre-cargar abonos ya recibidos por forma de pago
  var _absMesa=(abonosMesa[mesaActiva.id]||[]);
  _absMesa.forEach(function(ab){window._pagosParciales[ab.fp]=(window._pagosParciales[ab.fp]||0)+ab.monto;});
  window._totalCobro=total;

  function renderCobroModal(){
    var pagado=Object.values(window._pagosParciales).reduce(function(a,v){return a+(v||0);},0);
    var pendiente=total-pagado;
    var completo=Math.round(pendiente)<=0;

    var resumen=ped.map(function(it){
      var nombre,pr;
      if(it.isCustom){nombre='✏️ '+esc(it.customNombre);pr=it.customPrecio||0;}
      else if(it.isCombo){nombre='🎁 '+esc(it.comboNombre);pr=it.comboPrecio||0;}
      else{var p=menu.find(function(m){return m.id===it.pid;});nombre=(it.cubeta?'🪣 ':'')+esc((p&&p.nombre)||'?');pr=it.cubeta?(p&&p.cubeta||((p&&p.precio||0)*5)):((p&&p.precio)||0);}
      return'<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0">'
        +'<span>'+nombre+' ×'+it.qty+'</span>'
        +'<span style="color:var(--gold)">'+fmt(pr*it.qty)+'</span></div>';
    }).join('');

    var fpRows=FPV().map(function(f){
      var val=window._pagosParciales[f.id]||0;
      var fid=f.id;
      return'<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)" data-fpid="'+fid+'">'
        +'<span style="font-size:20px;width:28px">'+f.emoji+'</span>'
        +'<span style="color:'+f.color+';font-weight:700;font-size:13px;flex:1">'+f.label+'</span>'
        +'<div style="display:flex;align-items:center;gap:5px">'
        +'<button data-act="minus" data-fpid="'+fid+'" style="background:var(--dim);color:var(--muted);border:none;border-radius:5px;width:26px;height:26px;cursor:pointer;font-size:13px;font-weight:700">−</button>'
        +'<input type="text" inputmode="numeric" id="fp-inp-'+fid+'" class="money" value="'+moneyFmt(val||'')+'" placeholder="0"'
        +' data-fpid="'+fid+'" data-act="input"'
        +' style="width:90px;background:var(--bg);border:1px solid '+(val>0?f.color:'var(--border)')+';border-radius:7px;padding:5px 8px;color:var(--text);font-size:13px;font-weight:700;text-align:right;outline:none"/>'
        +'<button data-act="plus" data-fpid="'+fid+'" style="background:var(--dim);color:var(--muted);border:none;border-radius:5px;width:26px;height:26px;cursor:pointer;font-size:13px;font-weight:700">+</button>'
        +'<button data-act="todo" data-fpid="'+fid+'" style="background:'+f.color+'22;color:'+f.color+';border:1px solid '+f.color+'44;border-radius:5px;padding:4px 8px;cursor:pointer;font-size:11px;font-weight:700">Todo</button>'
        +'</div></div>';
    }).join('');

    var pagosResumen=Object.entries(window._pagosParciales).filter(function(kv){return kv[1]>0;}).map(function(kv){
      var f=FPAGO.find(function(x){return x.id===kv[0];});
      return'<span style="background:'+(f?f.color:'#fff')+'22;color:'+(f?f.color:'#fff')+';border:1px solid '+(f?f.color:'#fff')+'33;border-radius:99px;padding:2px 10px;font-size:11px;font-weight:700">'+(f?f.emoji+' ':'')+fmt(kv[1])+'</span>';
    }).join(' ');

    return'<div style="text-align:center;margin-bottom:14px">'
      +'<div style="font-size:22px">'+NEGOCIO.emoji+'</div>'
      +'<div style="color:var(--muted);font-size:12px;margin-top:3px">'+(zona?zona.label:'')+' · '+esc(mesaActiva.nombre||'Mesa '+mesaActiva.num)+'</div>'
      +'<div style="font-size:26px;font-weight:900;margin-top:4px">'+fmt(total)+'</div>'
      +'<div style="color:var(--muted);font-size:12px">Total a cobrar</div></div>'
      +'<div style="background:var(--bg);border-radius:10px;padding:8px 12px;margin-bottom:12px;max-height:110px;overflow-y:auto">'+resumen+'</div>'
      // Barra de progreso
      +'<div style="background:var(--dim);border-radius:99px;height:6px;margin-bottom:6px;overflow:hidden">'
        +'<div style="height:100%;border-radius:99px;background:'+(completo?'#22c55e':'#f5a623')+';width:'+Math.min(100,Math.round(pagado/total*100))+'%;transition:width .3s"></div>'
      +'</div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:14px">'
        +'<span style="color:#22c55e;font-weight:700">Pagado: '+fmt(pagado)+'</span>'
        +'<span style="color:'+(completo?'#22c55e':'#f5a623')+';font-weight:700">'+(completo?'✓ Completo':'Pendiente: '+fmt(pendiente))+'</span>'
      +'</div>'
      +(pagosResumen?'<div style="margin-bottom:10px;display:flex;gap:5px;flex-wrap:wrap">'+pagosResumen+'</div>':'')
      +'<div class="section-title">Distribuir pago por método</div>'
      +fpRows
      +(!a52Mod('creditos')?'':'<button onclick="cobrarACredito()" style="width:100%;margin-top:12px;background:#f5a62318;color:#f5a623;border:1px solid #f5a62344;border-radius:10px;padding:11px;font-weight:700;font-size:13px;cursor:pointer">📒 Dejar como fiado (cliente a crédito)</button>')
      +'<div style="display:flex;gap:10px;margin-top:10px">'
        +'<button class="btn btn-outline btn-full" onclick="closeModal1()">Cancelar</button>'
        +'<button class="btn btn-green btn-full" id="btn-cobrar" onclick="confirmarCobro()" '+(completo?'':'disabled')+' style="font-size:15px">✓ Confirmar cobro</button>'
      +'</div>';
  }

  modal1(renderCobroModal());
  window._renderCobroModal=renderCobroModal;
  // bind events via delegation
  setTimeout(function(){
    var m=document.getElementById('modal1');
    if(!m)return;
    m.addEventListener('click',function(e){
      var btn=e.target.closest('[data-act]');if(!btn)return;
      var act=btn.getAttribute('data-act');
      var fid=btn.getAttribute('data-fpid');
      if(act==='minus')ajustarPago(fid,-1000);
      if(act==='plus') ajustarPago(fid,1000);
      if(act==='todo') llenarConPendiente(fid);
    });
    m.addEventListener('input',function(e){
      if(e.target.getAttribute('data-act')==='input'){
        setPago(e.target.getAttribute('data-fpid'),e.target.value);
      }
    });
  },50);
}

function setPago(fpId, rawVal){
  var val=parseInt(String(rawVal).replace(/[^0-9]/g,''))||0;
  if(val<0)val=0;
  window._pagosParciales[fpId]=val;
  var el=document.getElementById('fp-inp-'+fpId);
  var f=FPAGO.find(function(x){return x.id===fpId;});
  if(el&&f)el.style.borderColor=val>0?f.color:'var(--border)';
  actualizarBarraCobro();
}

function ajustarPago(fpId, delta){
  var cur=window._pagosParciales[fpId]||0;
  var nuevo=Math.max(0,cur+delta);
  window._pagosParciales[fpId]=nuevo;
  var el=document.getElementById('fp-inp-'+fpId);
  if(el){el.value=nuevo?moneyFmt(nuevo):'';var f=FPAGO.find(function(x){return x.id===fpId;});if(f)el.style.borderColor=nuevo>0?f.color:'var(--border)';}
  actualizarBarraCobro();
}

function llenarConPendiente(fpId){
  var pagado=Object.entries(window._pagosParciales).filter(function(kv){return kv[0]!==fpId;}).reduce(function(a,kv){return a+(kv[1]||0);},0);
  var pendiente=Math.max(0,window._totalCobro-pagado);
  window._pagosParciales[fpId]=pendiente;
  var el=document.getElementById('fp-inp-'+fpId);
  if(el){el.value=pendiente?moneyFmt(pendiente):'';var f=FPAGO.find(function(x){return x.id===fpId;});if(f)el.style.borderColor=pendiente>0?f.color:'var(--border)';}
  actualizarBarraCobro();
}

function actualizarBarraCobro(){
  var pagado=Object.values(window._pagosParciales).reduce(function(a,v){return a+(v||0);},0);
  var total=window._totalCobro;
  var pendiente=total-pagado;
  var completo=Math.round(pendiente)<=0;
  var pct=Math.min(100,Math.round(pagado/total*100));

  // Update progress bar
  var bar=document.querySelector('#modal1 .btn-full[onclick="confirmarCobro()"]');
  if(bar)bar.disabled=!completo;

  var barra=document.querySelector('#modal1 div[style*="height:6px"]>div');
  if(barra){barra.style.width=pct+'%';barra.style.background=completo?'#22c55e':'#f5a623';}

  // Update pagado/pendiente text
  var spans=document.querySelectorAll('#modal1 span[style*="font-weight:700"]');
  if(spans.length>=2){
    spans[0].textContent='Pagado: '+fmt(pagado);
    spans[1].style.color=completo?'#22c55e':'#f5a623';
    spans[1].textContent=completo?'✓ Completo':'Pendiente: '+fmt(pendiente);
  }
}

function abrirDividirCuenta(){
  window._compTemp=null;
  if(!mesaActiva)return;
  var ped=pedidos[mesaActiva.id]||[];
  if(!ped.length){alert('La mesa no tiene productos.');return;}
  window._divSel={};  // {indicePedido: cantidadAPagar}
  renderDividirModal();
}

function nombreItemPed(it){
  if(it.isCustom)return '✏️ '+(it.customNombre||'');
  if(it.isCombo)return '🎁 '+(it.comboNombre||'Combo');
  if(it.isCubetazoMix)return '🪣 '+(it.cubMixNombre||'Cubetazo mixto');
  var p=menu.find(function(m){return m.id==it.pid;});
  return (p?p.emoji+' '+p.nombre:(it.nombre||'?'))+(it.varianteNombre?' ('+it.varianteNombre+')':'')+(it.cubeta?' 🪣':'')+(it.es2x1Gratis?' <span style="background:#ff5ec822;color:#ff5ec8;border-radius:5px;padding:1px 6px;font-size:9px;font-weight:900">🎁 2x1 GRATIS</span>':'')+(it.recGruposTxt?' <span style="color:#38bdf8;font-size:10px;font-weight:600">['+esc(it.recGruposTxt)+']</span>':'');
}

function renderDividirModal(){
  var ped=pedidos[mesaActiva.id]||[];
  var sel=window._divSel||{};
  var subtotal=0;
  var filas=ped.map(function(it,idx){
    var pu=precioItem(it);
    var elegidos=sel[idx]||0;
    subtotal+=pu*elegidos;
    return'<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1"><div style="font-size:13px;font-weight:600">'+esc(nombreItemPed(it))+'</div>'
        +'<div style="color:var(--muted);font-size:11px">'+fmt(pu)+' c/u · '+it.qty+' en la cuenta</div></div>'
      +'<button data-act="div-minus" data-idx="'+idx+'" '+(elegidos<=0?'disabled':'')+' style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;width:30px;height:30px;cursor:pointer;font-size:18px;opacity:'+(elegidos<=0?'.3':'1')+'">−</button>'
      +'<span style="color:#fff;font-weight:800;min-width:24px;text-align:center;font-size:16px">'+elegidos+'</span>'
      +'<button data-act="div-plus" data-idx="'+idx+'" '+(elegidos>=it.qty?'disabled':'')+' style="background:#22c55e18;color:#22c55e;border:none;border-radius:6px;width:30px;height:30px;cursor:pointer;font-size:18px;opacity:'+(elegidos>=it.qty?'.3':'1')+'">+</button>'
    +'</div>';
  }).join('');

  var fpOpts='<option value="" selected disabled>👆 Elige la forma de pago...</option>'+FPV().map(function(f){return'<option value="'+f.id+'">'+f.emoji+' '+f.label+'</option>';}).join('');

  modal1('<div style="font-weight:800;font-size:16px;margin-bottom:4px">🧾 Dividir cuenta</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:12px">Elige qué productos paga esta persona. El resto queda en la mesa.</div>'
    +'<div style="max-height:46vh;overflow-y:auto">'+filas+'</div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--accent)33">'
      +'<span style="font-weight:800;font-size:14px">Subtotal a pagar</span>'
      +'<span id="div-subtotal" style="color:#38bdf8;font-weight:900;font-size:20px">'+fmt(subtotal)+'</span></div>'
    +'<div style="margin:12px 0"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Forma de pago</div>'
      +'<select class="inp" id="div-fp">'+fpOpts+'</select></div>'
    +'<button class="btn btn-green btn-full" '+(subtotal<=0?'disabled':'')+' onclick="confirmarDividir()">💳 Cobrar esta parte</button>');
}

function confirmarDividir(){
  if(!mesaActiva)return;
  var ped=pedidos[mesaActiva.id]||[];
  var sel=window._divSel||{};
  var fp=(document.getElementById('div-fp')||{}).value||'';
  if(!fp){alert('👆 Elige la forma de pago con la que pagó el cliente.');return;}
  // Construir items a cobrar
  var itemsPagar=[];var total=0;
  Object.keys(sel).forEach(function(idx){
    var q=sel[idx];if(!q)return;
    var it=ped[idx];if(!it)return;
    var copia=JSON.parse(JSON.stringify(it));copia.qty=q;
    itemsPagar.push(copia);
    total+=precioItem(it)*q;
  });
  if(!itemsPagar.length||total<=0){alert('Selecciona al menos un producto.');return;}
  var f=FPAGO.find(function(x){return x.id===fp;});
  // ── COMPROBANTE para pago digital en cuenta dividida ──
  if(fp!=='efectivo'&&fotoCompCfg.on&&total>=(fotoCompCfg.min||0)&&!window._compTemp){
    abrirCapturaComprobante((f?f.emoji+' '+f.label:fp)+' '+fmt(total),total,function(){confirmarDividir();});
    return;
  }
  // Registrar la venta de esta parte
  var venta={
    mesa:(mesaActiva.nombre||('Mesa '+mesaActiva.num))+' (dividida)',zona:mesaActiva.zona,
    ts:a52Ahora(),total:total,
    items:itemsPagar,
    fp:fp,fpLabel:(f?f.emoji+' '+f.label:fp),
    pagos:[{fp:fp,label:(f?f.label:fp),monto:total}],
    esDividida:true,
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre
  };
  if(window._compTemp){
    if(window._compTemp.sinFoto){
      venta.sinFoto=true;
      venta.sinFotoMotivo=window._compTemp.motivo||'';
      venta.refPago=window._compTemp.ref4||'';
    } else {
      var compIdD='comp_'+a52Ahora();
      venta.compId=compIdD;
      venta.refPago=window._compTemp.ref4||'';
      fbSet('comprobantes/'+compIdD,{ts:a52Ahora(),img:window._compTemp.img,mesa:venta.mesa,monto:total,fp:(f?f.emoji+' '+f.label:fp),ref4:window._compTemp.ref4||'',uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre});
    }
    window._compTemp=null;
  }
  fbPush('ventas',venta);
  // Restar las cantidades pagadas del pedido
  Object.keys(sel).sort(function(a,b){return b-a;}).forEach(function(idx){
    var q=sel[idx];if(!q)return;
    var it=ped[idx];if(!it)return;
    it.qty-=q;
    if(it.qty<=0)ped.splice(idx,1);
  });
  var quedan=ped.length;
  var r=ref('pedidos/'+mesaActiva.id);if(r)r.set(quedan?ped:null);
  closeModal1();
  showToast('🧾 Parte cobrada<br><span style="font-size:12px;opacity:.85">'+fmt(total)+(f?' · '+f.label:'')+(quedan?' · quedan items en la mesa':' · mesa saldada')+'</span>','#38bdf8');
  if(!quedan){
    // mesa quedó vacía
    if(abonosMesa[mesaActiva.id]){delete abonosMesa[mesaActiva.id];fbSet('abonosMesa',abonosMesa);}
    if(pedidoLog[mesaActiva.id]){delete pedidoLog[mesaActiva.id];fbSet('pedidoLog/'+mesaActiva.id,null);}
    limpiarCocinaMesa(mesaActiva.id);
    mesaActiva=null;
  }
  render();
}

/* ═══════════ COMPROBANTE DE PAGO DIGITAL (foto + referencia opcional) ═══════════ */
function abrirCapturaComprobante(fpDetalle,montoDig,cont){
  window._compTempImg=null;
  window._compCont=cont;
  modal2('<div style="text-align:center;margin-bottom:12px">'
      +'<div style="font-size:28px">📷</div>'
      +'<div style="font-weight:800;font-size:16px;margin-top:4px">Foto del comprobante</div>'
      +'<div style="color:var(--muted);font-size:12px;margin-top:4px">'+esc(fpDetalle)+' · <b style="color:var(--gold)">'+fmt(montoDig)+'</b></div>'
      +'<div style="color:var(--muted);font-size:11px;margin-top:6px">Pídele al cliente que muestre la confirmación del pago y tómale la foto.</div>'
    +'</div>'
    +'<input type="file" accept="image/*" capture="environment" id="comp-file" style="display:none" onchange="procesarFotoComprobante(this)"/>'
    +'<div id="comp-preview" style="margin-bottom:12px">'
      +'<button onclick="document.getElementById(\'comp-file\').click()" style="width:100%;background:#38bdf818;color:#38bdf8;border:2px dashed #38bdf855;border-radius:12px;padding:26px;font-size:14px;font-weight:800;cursor:pointer">📷 Abrir cámara</button>'
    +'</div>'
    +'<div style="margin-bottom:12px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Últimos 4 dígitos de la referencia (opcional)</div>'
      +'<input class="inp" id="comp-ref4" type="text" inputmode="numeric" maxlength="6" placeholder="Ej: 4821 — puedes dejarlo vacío" style="text-align:center;font-size:16px;letter-spacing:3px;font-weight:800"/></div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="cancelarCapturaComprobante()">Cancelar</button>'
      +'<button class="btn btn-green btn-full" id="comp-ok" onclick="confirmarCapturaComprobante()" disabled style="opacity:.4">✓ Continuar con el cobro</button>'
    +'</div>'
    +(fotoCompCfg.permitirSinFoto!==false?'<button onclick="continuarSinFoto()" style="width:100%;background:none;border:none;color:var(--muted);font-size:11px;font-weight:700;cursor:pointer;margin-top:10px;text-decoration:underline">🚫 Este equipo no tiene cámara — continuar sin foto</button>':''));
}
// Salida para equipos sin cámara (ej. el PC de la caja): exige motivo y queda marcado en la venta
function continuarSinFoto(){
  var motivo=(prompt('¿Por qué no se puede tomar la foto? (obligatorio)\nEj: "Cobro desde el PC de la caja"')||'').trim();
  if(!motivo){return;}
  var ref4=((document.getElementById('comp-ref4')||{}).value||'').trim();
  if(ref4){
    var hace3d=a52Ahora()-3*24*3600*1000;
    var dup=ventas.find(function(v){return v.refPago&&v.refPago===ref4&&v.ts>=hace3d;});
    if(dup){
      if(!confirm('⚠️ ATENCIÓN: esta referencia ('+ref4+') ya se usó el '+fmtFechaCorta(dup.ts)+' en '+(dup.mesa||'otra venta')+' por '+fmt(dup.total)+'.\n\nPuede ser un comprobante REPETIDO. ¿Seguro que es un pago distinto?'))return;
    }
  }
  window._compTemp={img:null,ref4:ref4,sinFoto:true,motivo:motivo};
  window._compTempImg=null;
  var cont=window._compCont;window._compCont=null;
  closeModal2();
  if(cont)cont();
}
function procesarFotoComprobante(input){
  var file=input.files&&input.files[0];
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    var img=new Image();
    img.onload=function(){
      // Comprimir: máx 900px de lado, JPEG calidad 0.55 (~60-150 KB)
      var maxDim=900;var w=img.width,h=img.height;
      if(w>maxDim||h>maxDim){var esc2=maxDim/Math.max(w,h);w=Math.round(w*esc2);h=Math.round(h*esc2);}
      var cv=document.createElement('canvas');cv.width=w;cv.height=h;
      cv.getContext('2d').drawImage(img,0,0,w,h);
      window._compTempImg=cv.toDataURL('image/jpeg',0.55);
      var prev=document.getElementById('comp-preview');
      if(prev)prev.innerHTML='<div style="position:relative">'
        +'<img src="'+window._compTempImg+'" style="width:100%;max-height:38vh;object-fit:contain;border-radius:12px;border:2px solid #22c55e66;background:#000"/>'
        +'<button onclick="document.getElementById(\'comp-file\').click()" style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.7);color:#fff;border:1px solid #fff3;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer">🔄 Repetir</button>'
        +'</div>';
      var ok=document.getElementById('comp-ok');
      if(ok){ok.disabled=false;ok.style.opacity='1';}
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}
function cancelarCapturaComprobante(){
  window._compTempImg=null;window._compTemp=null;window._compCont=null;
  window._cobroVerificado=false;
  closeModal2();
}
function confirmarCapturaComprobante(){
  if(!window._compTempImg){alert('Toma la foto del comprobante primero.');return;}
  var ref4=((document.getElementById('comp-ref4')||{}).value||'').trim();
  // Detector de comprobantes repetidos (últimos 3 días)
  if(ref4){
    var hace3d=a52Ahora()-3*24*3600*1000;
    var dup=ventas.find(function(v){return v.refPago&&v.refPago===ref4&&v.ts>=hace3d;});
    if(dup){
      if(!confirm('⚠️ ATENCIÓN: esta referencia ('+ref4+') ya se usó el '+fmtFechaCorta(dup.ts)+' en '+(dup.mesa||'otra venta')+' por '+fmt(dup.total)+'.\n\nPuede ser un comprobante REPETIDO. ¿Seguro que es un pago distinto?'))return;
    }
  }
  window._compTemp={img:window._compTempImg,ref4:ref4};
  window._compTempImg=null;
  var cont=window._compCont;window._compCont=null;
  closeModal2();
  if(cont)cont();
}
// Ver un comprobante guardado
function verComprobante(compId){
  var d=getDb();
  if(!d){alert('Se necesita conexión para ver el comprobante.');return;}
  modal2('<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Cargando comprobante...</div>');
  d.ref('comprobantes/'+compId).once('value',function(s){
    var c=s.val();
    if(!c){modal2('<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">Este comprobante ya no existe (pudo ser purgado por antigüedad).</div><button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text)">Cerrar</button>');return;}
    modal2('<div style="font-weight:800;font-size:15px;margin-bottom:4px">📷 Comprobante de pago</div>'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:10px">'+fmtFechaCorta(c.ts)+' · '+esc(c.mesa||'')+' · '+esc(c.fp||'')+' · <b style="color:var(--gold)">'+fmt(c.monto||0)+'</b>'+(c.ref4?' · Ref: <b>'+esc(c.ref4)+'</b>':'')+(c.uidNombre?' · ✍️ '+esc(c.uidNombre):'')+'</div>'
      +'<img src="'+c.img+'" style="width:100%;max-height:60vh;object-fit:contain;border-radius:12px;background:#000;border:1px solid var(--border)"/>'
      +'<button class="btn btn-full" onclick="closeModal2()" style="background:var(--card2);border:1px solid var(--border);color:var(--text);margin-top:12px">Cerrar</button>');
  });
}
// Purga comprobantes con más de 45 días (se ejecuta en el cierre del día)
function purgarComprobantes(){
  var d=getDb();if(!d)return;
  var limite=a52Ahora()-45*24*3600*1000;
  d.ref('comprobantes').once('value',function(s){
    var v=s.val();if(!v)return;
    Object.keys(v).forEach(function(k){
      if((v[k].ts||0)<limite)d.ref('comprobantes/'+k).remove();
    });
  });
}

// Pantalla de verificación: confirma la forma de pago antes de registrar el cobro.
// Evita el error de tocar "Todo" en la primera opción por costumbre.
function abrirVerificacionCobro(pagos,total){
  var pagosList=Object.keys(pagos).filter(function(fp){return pagos[fp]>0;});
  var chips=pagosList.map(function(fp){
    var f=FPAGO.find(function(x){return x.id===fp;});
    return'<div style="display:flex;justify-content:space-between;align-items:center;background:'+(f?f.color:'#fff')+'15;border:2px solid '+(f?f.color:'#fff')+'66;border-radius:12px;padding:14px 16px;margin-bottom:8px">'
      +'<span style="font-size:15px;font-weight:800;color:'+(f?f.color:'var(--text)')+'">'+(f?f.emoji+' '+f.label:fp)+'</span>'
      +'<span style="font-size:19px;font-weight:900;color:'+(f?f.color:'var(--text)')+'">'+fmt(pagos[fp])+'</span>'
    +'</div>';
  }).join('');
  var unSolo=pagosList.length===1?FPAGO.find(function(x){return x.id===pagosList[0];}):null;
  modal2('<div style="text-align:center;margin-bottom:12px">'
      +'<div style="font-size:26px">🤔</div>'
      +'<div style="font-weight:900;font-size:17px;margin-top:4px">Verifica la forma de pago</div>'
      +(unSolo?'<div style="color:var(--muted);font-size:13px;margin-top:6px">¿El cliente pagó <b style="color:'+unSolo.color+'">TODO con '+unSolo.emoji+' '+unSolo.label.toUpperCase()+'</b>?</div>'
        :'<div style="color:var(--muted);font-size:13px;margin-top:6px">¿El cliente pagó así?</div>')
    +'</div>'
    +chips
    +'<div style="text-align:center;color:var(--muted);font-size:11px;margin:8px 0 12px">Total: <b style="color:var(--gold);font-size:14px">'+fmt(total)+'</b></div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-full" onclick="closeModal2()" style="background:#ef444418;color:#ef4444;border:1px solid #ef444444;font-weight:800">← No, corregir</button>'
      +'<button class="btn btn-green btn-full" onclick="window._cobroVerificado=true;closeModal2();confirmarCobro();" style="font-weight:800">✓ Sí, cobrar</button>'
    +'</div>');
}

function eliminarVentaDuplicada(fbkey){
  if(!usuarioActivo||usuarioActivo.rol!=='admin')return;
  var v=ventas.find(function(x){return x._fbkey===fbkey;});
  if(!v)return;
  var hh=new Date(v.ts);
  if(!confirm('🗑️ ¿Eliminar esta venta?\n\n'+(v.mesa||'')+' · '+fmt(v.total||0).replace(/\u00A0/g,' ')+' · '+('0'+hh.getHours()).slice(-2)+':'+('0'+hh.getMinutes()).slice(-2)+'\n\nÚsalo para cobros DUPLICADOS o registrados por error. El dinero sale de las ventas del día; el inventario NO se toca (los productos solo se descontaron una vez al servirlos). Queda registrada una novedad.'))return;
  fbSet('ventas/'+fbkey,null);
  fbPush('novedades',{id:'nov_'+a52Ahora(),ts:a52Ahora(),
    mesa:v.mesa||'',tipo:'otra',tipoLabel:'🗑️ Venta eliminada (duplicado/error)',
    monto:v.total||0,
    nota:'Venta de las '+('0'+hh.getHours()).slice(-2)+':'+('0'+hh.getMinutes()).slice(-2)+' eliminada por el admin ('+((v.pagos&&v.pagos.length?v.pagos:[{fp:v.fp,monto:v.total}]).map(function(p){return (p.fp||'')+' '+fmt(p.monto||0).replace(/\u00A0/g,' ');}).join(' + '))+'). Inventario sin cambios.',
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre});
  showToast('🗑️ Venta eliminada: '+esc(v.mesa||'')+' · '+fmt(v.total||0)+'<br><span style="font-size:12px;opacity:.85">Inventario intacto · quedó en novedades</span>','#ef4444');
  render();
}
function confirmarCobro(){
  if(!mesaActiva)return;
  var pagos=window._pagosParciales||{};
  var pagado=Object.values(pagos).reduce(function(a,v){return a+(v||0);},0);
  var total=totalPedido(mesaActiva.id);
  // Apply discount if exists
  var descMesa=descuentos[mesaActiva.id];
  if(descMesa&&descMesa.pct) total=Math.round(total*(1-descMesa.pct/100));
  if(Math.round(pagado)<Math.round(total)){alert('El total pagado ($'+total.toLocaleString('es-CO')+') no cubre el valor. Verifica los montos.');return;}

  // ── VERIFICACIÓN: confirmar la forma de pago antes de seguir ──
  if(!window._cobroVerificado){
    abrirVerificacionCobro(pagos,total);
    return;
  }

  // ── COMPROBANTE: si hay pagos digitales, exigir foto antes de registrar ──
  var totalDig=0;var fpDigLabels=[];
  Object.keys(pagos).forEach(function(fp){
    if(fp!=='efectivo'&&pagos[fp]>0){
      totalDig+=pagos[fp];
      var fD=FPAGO.find(function(x){return x.id===fp;});
      fpDigLabels.push((fD?fD.emoji+' '+fD.label:fp)+' '+fmt(pagos[fp]));
    }
  });
  if(fotoCompCfg.on&&totalDig>0&&totalDig>=(fotoCompCfg.min||0)&&!window._compTemp){
    abrirCapturaComprobante(fpDigLabels.join(' + '),totalDig,function(){confirmarCobro();});
    return;
  }

  var mesa=mesaActiva;
  var ped=pedidos[mesa.id]||[];

  // ── 🛡️ CANDADOS ANTI-COBRO-DOBLE ──
  // (a) Cerrojo mientras se procesa: un segundo toque al botón no hace nada
  if(window._cobrandoMesa===mesa.id){return;}
  // (b) Si el pedido ya está vacío, otro equipo (u otro toque) ya cobró esta mesa
  if(!ped.length){
    alert('⚠️ Esta mesa ya no tiene pedido: parece que YA fue cobrada (quizás desde otro equipo). No se registró nada.');
    window._cobroVerificado=false;window._compTemp=null;
    closeModal1();render();
    return;
  }
  // (c) Cobro idéntico muy reciente: misma mesa y mismo valor en los últimos 3 minutos
  var _mesaNom=mesa.nombre||('Mesa '+mesa.num);
  var _dup=ventas.find(function(v){return v.mesa===_mesaNom&&Math.round(v.total)===Math.round(total)&&(a52Ahora()-v.ts)<180000;});
  if(_dup&&!window._cobroDobleOk){
    var _hhd=new Date(_dup.ts);
    if(!confirm('🛑 COBRO DUPLICADO?\n\n'+_mesaNom+' ya se cobró por '+fmt(total).replace(/\u00A0/g,' ')+' a las '+('0'+_hhd.getHours()).slice(-2)+':'+('0'+_hhd.getMinutes()).slice(-2)+' (hace '+Math.round((a52Ahora()-_dup.ts)/1000)+' seg).\n\n¿Seguro que quieres cobrarla OTRA VEZ?')){
      window._cobroVerificado=false;window._compTemp=null;
      return;
    }
    window._cobroDobleOk=true;
  }
  window._cobrandoMesa=mesa.id;
  setTimeout(function(){window._cobrandoMesa=null;window._cobroDobleOk=false;},8000);

  // Build venta with multiple payments
  var pagosList=Object.entries(pagos).filter(function(kv){return kv[1]>0;}).map(function(kv){
    var f=FPAGO.find(function(x){return x.id===kv[0];});
    return{fp:kv[0],label:(f?f.label:''),monto:kv[1]};
  });
  var fpPrincipal=pagosList.length===1?pagosList[0].fp:'mixto';
  var fpLabel=pagosList.length===1?pagosList[0].label:pagosList.map(function(p){return p.label+' '+fmt(p.monto);}).join(' + ');

  // Detectar si algún producto se vendió sin stock (quedó en negativo)
  var sinStock=ped.some(function(it){
    if(it.isCustom||it.isCombo||it.isCubetazoMix)return false;
    var p=menu.find(function(m){return m.id===it.pid;});
    return p&&(parseInt(p.stock)||0)<0;
  });
  var venta={
    mesa:mesa.nombre||('Mesa '+mesa.num),zona:mesa.zona,
    ts:a52Ahora(),total:total,
    items:JSON.parse(JSON.stringify(ped)),
    fp:fpPrincipal,fpLabel:fpLabel,
    pagos:pagosList,
    sinStock:sinStock,
    uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre
  };
  // Amarrar el comprobante fotográfico si se capturó (o marcar venta sin foto con motivo)
  if(window._compTemp){
    if(window._compTemp.sinFoto){
      venta.sinFoto=true;
      venta.sinFotoMotivo=window._compTemp.motivo||'';
      venta.refPago=window._compTemp.ref4||'';
    } else {
      var compId='comp_'+a52Ahora();
      venta.compId=compId;
      venta.refPago=window._compTemp.ref4||'';
      fbSet('comprobantes/'+compId,{ts:a52Ahora(),img:window._compTemp.img,mesa:venta.mesa,monto:totalDig,fp:fpDigLabels.join(' + '),ref4:window._compTemp.ref4||'',uid:usuarioActivo.id,uidNombre:usuarioActivo.nombre});
    }
    window._compTemp=null;
  }
  // Capturar los abonos de la mesa ANTES de borrarlos (para el recibo y el historial)
  var absCobro=(abonosMesa[mesa.id]||[]).map(function(ab){return {nombre:ab.nombre||'Abono',monto:ab.monto||0,fp:ab.fp||'',ts:ab.ts||0};});
  if(absCobro.length)venta.abonos=absCobro;
  fbPush('ventas',venta);
  // Stock ya fue descontado al agregar a la mesa (con escritura atómica) — no se toca aquí
  // Guardar el último ticket por si el cliente quiere imprimirlo
  window._ultimoTicket={mesa:mesa,ped:JSON.parse(JSON.stringify(ped)),total:total,pagos:pagosList,abonos:absCobro,ts:a52Ahora()};

  var r=ref('pedidos/'+mesa.id);if(r)r.set(null);
  // Limpiar abonos de la mesa
  if(abonosMesa[mesa.id]){delete abonosMesa[mesa.id];fbSet('abonosMesa',abonosMesa);}
  // Limpiar historial de pedido de la mesa (arranca limpio para el próximo cliente)
  if(pedidoLog[mesa.id]){delete pedidoLog[mesa.id];fbSet('pedidoLog/'+mesa.id,null);}
  // Limpiar marcas de cocina de esta mesa
  limpiarCocinaMesa(mesa.id);
  window._cobroVerificado=false;
  mesaActiva=null;closeModal1();render();
  // Aviso con opción de imprimir recibo
  var nombreMesa=mesa.nombre||('Mesa '+mesa.num);
  showToast('✅ Cobro registrado · '+fmt(total)+'<br><button onclick="reimprimirUltimoTicket()" style="margin-top:6px;background:#fff;color:#1a1a22;border:none;border-radius:7px;padding:6px 14px;font-weight:800;font-size:12px;cursor:pointer">🖨️ Imprimir recibo</button>','#22c55e',5000);
}

var MODO_IMPRESION=(localStorage.getItem('a52_modo_impresion')||'estacion');  // por dispositivo: 'estacion' = envía a la estación · 'local' = imprime directo en ESTE equipo
function setModoImpresion(m){MODO_IMPRESION=m;localStorage.setItem('a52_modo_impresion',m);if(tabActual==='admin')render();showToast(m==='local'?'🖨️ Este equipo imprime DIRECTO':'📡 Este equipo ENVÍA a la estación','#38bdf8');}

function _promoNotaTicket(it){
  // Para ítems con promo congelada: devuelve ' PROMO (antes $X)' con el precio normal
  if(!it||!it.precioPromo)return'';
  var p=menu.find(function(m){return m.id==it.pid;});
  if(!p)return' PROMO';
  var normal=it.cubeta?(p.cubeta||((p.precio||0)*5)):(it.variantePrecio||p.precio||0);
  if(normal<=it.precioPromo)return' PROMO';
  return' PROMO (antes '+fmt(normal).replace(/\u00A0/g,' ')+')';
}
function enviarAImpresora(mesa,ped,total,pagosList,abonos){
  // Construir items en formato simple para la estación
  var items=(ped||[]).map(function(it){
    var nombre,pr;
    if(it.isCustom){nombre=it.customNombre||'Personalizado';pr=it.customPrecio||0;}
    else if(it.isCombo){nombre=(it.comboNombre||'Combo');pr=it.comboPrecio||0;}
    else if(it.isCubetazoMix){nombre=(it.cubMixNombre||'Cubetazo mixto');pr=it.cubMixPrecio||0;}
    else{
      var p=menu.find(function(m){return m.id==it.pid;});
      nombre=(it.cubeta?'[Cubetazo] ':'')+((p&&p.nombre)||it.nombre||'?')+(it.varianteNombre?' ('+it.varianteNombre+')':'')+(it.cubeta?' x5':'')+(it.es2x1Gratis?' [2x1 GRATIS]':'')+_promoNotaTicket(it);
      pr=precioItem(it);
    }
    return {nombre:nombre,qty:it.qty||1,total:pr*(it.qty||1)};
  });
  var pagos=Array.isArray(pagosList)?pagosList:(function(){
    var f=FPAGO.find(function(x){return x.id===pagosList;});
    return [{label:(f?f.label:pagosList),monto:total}];
  })();
  var trabajo={
    mesa:(mesa.nombre||('Mesa '+(mesa.num||''))),
    items:items,total:total,pagos:pagos,
    abonos:(abonos||[]).map(function(ab){var f=FPAGO.find(function(x){return x.id===ab.fp;});return {nombre:ab.nombre||'Abono',monto:ab.monto||0,fp:(f?f.label:ab.fp)};}),
    ts:a52Ahora()
  };
  var r=ref('impresion');
  if(r){r.push(trabajo);showToast('🖨️ Recibo enviado a la impresora','#38bdf8');}
  else{alert('No hay conexión para enviar a la impresora.');}
}

function imprimirRecibo(mesa,ped,total,pagosList,abonos){
  // Punto único: según el modo, manda a la estación o abre ventana local
  if(MODO_IMPRESION==='estacion'){enviarAImpresora(mesa,ped,total,pagosList,abonos);}
  else{imprimirTicket(mesa,ped,total,pagosList,abonos);}
}

function reimprimirVenta(fbkey){
  var v=ventas.find(function(x){return x._fbkey===fbkey;});
  if(!v){alert('Venta no encontrada.');return;}
  var its=v.items?(Array.isArray(v.items)?v.items:Object.values(v.items)):[];
  imprimirRecibo({nombre:v.mesa,num:''},its,v.total,v.pagos||v.fp,v.abonos||[]);
}

function reimprimirUltimoTicket(){
  var t=window._ultimoTicket;
  if(!t){alert('No hay un recibo reciente para imprimir.');return;}
  imprimirRecibo(t.mesa,t.ped,t.total,t.pagos,t.abonos||[]);
}


