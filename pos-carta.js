/* ═══════════════ CARTA ═══════════════ */
function _clasificarProducto(nombre,catActual){
  var n=(nombre||'').toLowerCase();
  var ca=(catActual||'').toLowerCase();
  function has(){for(var i=0;i<arguments.length;i++){if(n.indexOf(arguments[i])>=0)return true;}return false;}
  function word(){for(var i=0;i<arguments.length;i++){if(new RegExp('(^|[^a-zñáéíóú])'+arguments[i]+'([^a-zñáéíóú]|$)').test(n))return true;}return false;}
  function tamLicor(){if(has('media','1/2','mitad','375','355'))return'Media';return'Litro';}

  // ── COMIDA (va a cocina) ──
  if(has('hamburgues','burger'))         return{cat:'🍽️ Cocina',subcat:'Hamburguesas',comida:true};
  if(has('perro','hot dog','hotdog'))    return{cat:'🍽️ Cocina',subcat:'Perros',comida:true};
  if(has('alita','alas','wings','bbq'))  return{cat:'🍽️ Cocina',subcat:'Alitas',comida:true};
  if(has('salchipapa'))                  return{cat:'🍽️ Cocina',subcat:'Salchipapas',comida:true};
  if(has('papa','french','francesa'))    return{cat:'🍽️ Cocina',subcat:'Papas',comida:true};
  if(has('picada'))                      return{cat:'🍽️ Cocina',subcat:'Picadas',comida:true};
  if(has('nacho'))                       return{cat:'🍽️ Cocina',subcat:'Nachos',comida:true};
  if(has('choripan','chorizo'))          return{cat:'🍽️ Cocina',subcat:'Choripán',comida:true};
  if(has('sandwich','sánduche','sanduche'))return{cat:'🍽️ Cocina',subcat:'Sándwiches',comida:true};
  if(has('empanada','dedito','pastel'))  return{cat:'🍽️ Cocina',subcat:'Pasabocas',comida:true};
  if(has('carne','churrasco','pincho','costilla','lomo','pechuga','pollo'))return{cat:'🍽️ Cocina',subcat:'Carnes',comida:true};
  if(has('taco','burrito','quesadilla')) return{cat:'🍽️ Cocina',subcat:'Mexicana',comida:true};
  if(has('pizza'))                       return{cat:'🍽️ Cocina',subcat:'Pizza',comida:true};
  if(has('lasagna','lasaña','lasana'))   return{cat:'🍽️ Cocina',subcat:'Lasaña',comida:true};
  if(has('pasta','spaghetti','espagueti','ravioli'))return{cat:'🍽️ Cocina',subcat:'Pastas',comida:true};
  if(has('ensalada'))                    return{cat:'🍽️ Cocina',subcat:'Ensaladas',comida:true};
  if(has('postre','helado','torta','brownie'))return{cat:'🍽️ Cocina',subcat:'Postres',comida:true};

  // ── CERVEZAS ── (por tipo y por precio en importadas)
  if(has('cordillera'))                  return{cat:'🍺 Cervezas',subcat:'Cordillera',comida:false};
  if(has('club colombia'))               return{cat:'🍺 Cervezas',subcat:'Club Colombia',comida:false};
  if(has('aguila','águila','poker','costeña','costena','pilsen','andina','bbc'))return{cat:'🍺 Cervezas',subcat:'Cerveza Nacional',comida:false};
  if(has('coronita','corona','heineken','stella','budweiser','miller','coors','peroni','modelo','importada','importado')||word('sol'))return{cat:'🍺 Cervezas',subcat:'__IMPORTADA_PRECIO__',comida:false};
  if(has('cerveza'))                     return{cat:'🍺 Cervezas',subcat:'Cerveza Nacional',comida:false};

  // ── LICORES / DESTILADOS ──
  if(has('aguardiente','antioqueño','antioqueno','nectar','néctar','cristal','amarillo','tapa roja'))return{cat:'🥃 Licores',subcat:tamLicor(),comida:false};
  if(word('ron')||has('medellin','medellín','viejo de caldas','bacardi','havana'))return{cat:'🥃 Licores',subcat:tamLicor(),comida:false};
  if(has('whisky','whiskey','buchanan','old parr','johnnie','johnny','chivas','sello','something','grants','ballantine'))return{cat:'🥃 Licores',subcat:'Whisky',comida:false};
  if(has('vodka','absolut','smirnoff','stolichnaya'))return{cat:'🥃 Licores',subcat:'Vodka',comida:false};
  if(has('tequila','cuervo','patron','patrón'))return{cat:'🥃 Licores',subcat:'Tequila',comida:false};
  if(word('gin')||has('ginebra','tanqueray','bombay','beefeater'))return{cat:'🥃 Licores',subcat:'Ginebra',comida:false};
  if(has('vino','champa','champán','champagne','prosecco','espumante','sangria','sangría','moscato'))return{cat:'🥃 Licores',subcat:'Vinos y espumantes',comida:false};
  if(has('baileys','crema','amarula','licor','sambuca','jagermeister','jager'))return{cat:'🥃 Licores',subcat:'Cremas y aperitivos',comida:false};

  // ── CÓCTELES / SHOTS ──
  if(has('coctel','cóctel','mojito','margarita','cuba libre','piña colada','pina colada','daiquiri','gin tonic','michelada','caipiri','tequila sunrise','sex on','blue'))return{cat:'🍸 Cócteles',subcat:'Cócteles',comida:false};
  if(has('shot','chupito','trago corto'))return{cat:'🍸 Cócteles',subcat:'Shots',comida:false};

  // ── BEBIDAS SIN ALCOHOL ──
  if(has('gaseosa','coca','pepsi','sprite','quatro','colombiana','manzana','postobon','postobón','uva','naranja'))return{cat:'🥤 Bebidas',subcat:'Gaseosas',comida:false};
  if(has('red bull','vive100','vive 100','speed','energiz','monster'))return{cat:'🥤 Bebidas',subcat:'Energizantes',comida:false};
  if(has('agua','soda','tónica','tonica'))return{cat:'🥤 Bebidas',subcat:'Aguas',comida:false};
  if(has('jugo','hit','néctar de fruta','limonada'))return{cat:'🥤 Bebidas',subcat:'Jugos',comida:false};
  if(has('gatorade','hidratante','powerade','suero'))return{cat:'🥤 Bebidas',subcat:'Hidratantes',comida:false};

  // ── CIGARRILLOS ──
  if(has('cigarrillo','marlboro','lucky','malboro','rothmans','cigarr','tabaco','l&m','belmont','kool')||ca.indexOf('cigarr')>=0)return{cat:'🚬 Cigarrillos',subcat:'',comida:false};

  return null; // sin clasificar
}

function organizarCartaAuto(){
  if(!(usuarioActivo&&usuarioActivo.rol==='admin')){alert('Solo el administrador.');return;}
  var sinClasificar=[];
  var cambios=0;
  menu.forEach(function(p){
    var r=_clasificarProducto(p.nombre,p.cat);
    if(r){
      p.cat=r.cat;
      // Importadas: subcategoría por precio (7.000 vs 9.000+)
      if(r.subcat==='__IMPORTADA_PRECIO__'){
        var pr=parseInt(p.precio)||0;
        p.subcat=(pr>=9000)?'Importadas 9.000+':'Importadas 7.000';
      } else {
        p.subcat=r.subcat;
      }
      if(r.comida)p.esComida=true;
      cambios++;
    } else {
      sinClasificar.push(p.nombre);
    }
  });
  var msg='Se organizarán '+cambios+' productos en categorías y subcategorías';
  if(sinClasificar.length)msg+='.\n\n'+sinClasificar.length+' no se pudieron clasificar (los organizas manual):\n- '+sinClasificar.slice(0,15).join('\n- ')+(sinClasificar.length>15?'\n...':'');
  msg+='\n\n¿Aplicar?';
  if(!confirm(msg))return;
  var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  showToast('🗂️ Carta organizada<br><span style="font-size:12px;opacity:.85">'+cambios+' productos · '+sinClasificar.length+' sin clasificar</span>','#22c55e');
  render();
}

function renderCarta(){
  var cats=menu.reduce(function(a,m){if(a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
  var formHtml='';
  if(editandoProd!==null){
    var isNuevo=editandoProd==='nuevo';
    var p=isNuevo?{nombre:'',precio:'',cubeta:'',esCerveza:false,cat:'',emoji:'🍺',stock:'',und:'und'}:(menu.find(function(m){return m.id===editandoProd;})||{});
    var curEmoji=emojiSel||p.emoji||'🍺';
  var _receta=(p&&p.receta)?p.receta:[];
  var recetaRows=_receta.length
    ?_receta.map(function(ri,rIdx){
        if(ri.grupo){
          return'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">'
            +'<span style="font-size:16px">🎛</span>'
            +'<span style="flex:1;font-size:12px;font-weight:600">Grupo: '+esc(ri.grupo)+' <span style="color:#38bdf8;font-size:10px;font-weight:700">(el mesero elige los tipos al servir)</span></span>'
            +'<span style="color:var(--muted);font-size:11px">×'+ri.cantidad+'</span>'
            +'<button data-act="del-rec" data-ridx="'+rIdx+'" style="background:#ef444418;color:#ef4444;border:none;border-radius:5px;padding:2px 8px;cursor:pointer;font-size:12px">✕</button>'
          +'</div>';
        }
        var ing=menu.find(function(m){return m.id==ri.pid;});
        var insumo=!ing?ingredientes.find(function(i){return String(i.id)===String(ri.pid);}):null;
        var emj=ing?ing.emoji:(insumo?'🧂':'?');
        var nom=ing?ing.nombre:(insumo?insumo.nombre:'Eliminado');
        return'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">'          +'<span style="font-size:16px">'+emj+'</span>'          +'<span style="flex:1;font-size:12px;font-weight:600">'+esc(nom)+(insumo?' <span style="color:var(--muted);font-size:10px;font-weight:500">(insumo · '+esc(insumo.und||'und')+')</span>':'')+'</span>'          +'<span style="color:var(--muted);font-size:11px">×'+ri.cantidad+(ri.porCada?' <b style="color:#38bdf8">por cada '+ri.porCada+' und</b>':'')+'</span>'          +'<button data-act="del-rec" data-ridx="'+rIdx+'" style="background:#ef444418;color:#ef4444;border:none;border-radius:5px;padding:2px 8px;cursor:pointer;font-size:12px">✕</button>'          +'</div>';
      }).join('')
    :'<div style="color:var(--muted);font-size:11px;text-align:center;padding:6px">Sin ingredientes — producto simple</div>';
    var emojiButtons=EMOJIS.map(function(e,i){
      var sel=curEmoji===e;
      return'<button class="emj-btn" data-ei="'+i+'" style="font-size:22px;padding:4px;border:2px solid '+(sel?'#a855f7':'transparent')+';background:'+(sel?'#a855f722':'transparent')+';border-radius:8px;cursor:pointer;transition:all .15s">'+e+'</button>';
    }).join('');
    var catOpts=cats.map(function(c){return'<option value="'+esc(c)+'"'+(p.cat===c?' selected':'')+'>'+esc(c)+'</option>';}).join('');
    var curCat=p.cat||'';
    var catSelOpts='<option value="">— Elige categoría —</option>'
      +cats.map(function(c){return'<option value="'+esc(c)+'"'+(curCat===c?' selected':'')+'>'+esc(c)+'</option>';}).join('')
      +'<option value="__new__"'+((curCat&&cats.indexOf(curCat)<0)?' selected':'')+'>➕ Nueva categoría...</option>';
    var subcats=menu.reduce(function(a,m){if(m.subcat&&a.indexOf(m.subcat)<0)a.push(m.subcat);return a;},[]).sort();
    var curSub=p.subcat||'';
    var subSelOpts='<option value="">— Sin subcategoría —</option>'
      +subcats.map(function(c){return'<option value="'+esc(c)+'"'+(curSub===c?' selected':'')+'>'+esc(c)+'</option>';}).join('')
      +'<option value="__new__"'+((curSub&&subcats.indexOf(curSub)<0)?' selected':'')+'>➕ Nueva subcategoría...</option>';
    formHtml='<div class="card2" style="border-color:var(--accent)44;margin-bottom:16px">'
      +'<div style="color:var(--accent);font-weight:800;font-size:14px;margin-bottom:14px">'+(isNuevo?'➕ Nuevo producto':'✏️ Editar: '+esc(p.nombre||''))+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nombre del producto *</div>'
          +'<input class="inp" id="f-nombre" value="'+esc(p.nombre||'')+'" placeholder="Ej: Cerveza Águila"/></div>'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Categoría *</div>'
          +'<select class="inp" id="f-cat-sel" onchange="toggleCatNueva()">'+catSelOpts+'</select>'
          +'<input class="inp" id="f-cat-new" value="'+((curCat&&cats.indexOf(curCat)<0)?esc(curCat):'')+'" placeholder="Escribe la nueva categoría" style="margin-top:6px;display:'+((curCat&&cats.indexOf(curCat)<0)?'block':'none')+'"/></div>'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Subcategoría</div>'
          +'<select class="inp" id="f-subcat-sel" onchange="toggleSubcatNueva()">'+subSelOpts+'</select>'
          +'<input class="inp" id="f-subcat-new" value="'+((curSub&&subcats.indexOf(curSub)<0)?esc(curSub):'')+'" placeholder="Escribe la nueva subcategoría" style="margin-top:6px;display:'+((curSub&&subcats.indexOf(curSub)<0)?'block':'none')+'"/></div>'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Precio detal (COP) *</div>'
          +'<input class="inp money" id="f-precio" type="text" value="'+moneyFmt(p.precio||'')+'" placeholder="0" inputmode="numeric"/></div>'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">🛵 Precio en APPS — Rappi/Didi/Uber (opcional)</div>'
          +'<input class="inp money" id="f-precio-rappi" type="text" value="'+moneyFmt(p.precioRappi||'')+'" placeholder="Si es distinto al detal" inputmode="numeric"/></div>'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">💵 Precio de COMPRA por unidad (costo, opcional)</div>'
          +'<input class="inp money" id="f-costo" type="text" value="'+moneyFmt(p.costo||'')+'" placeholder="Para calcular utilidad" inputmode="numeric"/></div>'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Stock inicial</div>'
          +'<div style="display:flex;gap:5px">'
          +'<input class="inp" id="f-stock" type="number" value="'+(p.stock||'')+'" placeholder="0" style="flex:1"/>'
          +'<select class="inp" id="f-und" style="width:70px">'
          +'<option'+(p.und==='und'?' selected':'')+' value="und">und</option>'
          +'<option'+(p.und==='bot'?' selected':'')+' value="bot">bot</option>'
          +'<option'+(p.und==='lts'?' selected':'')+' value="lts">lts</option>'
          +'</select></div></div>'
      +'</div>'
      +'<label style="display:'+(a52Mod('cubetazos')?'flex':'none')+';align-items:center;gap:8px;cursor:pointer;font-size:13px;margin-bottom:10px">'
        +'<input type="checkbox" id="f-cerveza" '+(p.esCerveza?'checked':'')+' onchange="toggleCubF()"/> '
        +'🍺 Es cerveza — habilitar precio cubetazo</label>'
      +'<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;margin-bottom:10px">'
        +'<input type="checkbox" id="f-comida" '+(p.esComida?'checked':'')+'/> '
        +'👨‍🍳 Va a pantalla de cocina</label>'
      +'<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;margin-bottom:10px">'
        +'<input type="checkbox" id="f-sinstock" '+(p.sinStock?'checked':'')+'/> '
        +'✨ Sin control de cantidad — solo Disponible / Agotado <span style="color:var(--muted);font-size:11px">(cócteles, preparados...)</span></label>'
      +a52FotoCampo(p)
      +'<div style="margin-bottom:10px">'        +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Descripción (opcional — aparece en la carta)</div>'        +'<textarea class="inp" id="f-desc" rows="2" placeholder="Ej: Acompañada de papas fritas y ensalada. Proteína a elección..." style="resize:vertical;font-size:12px">'+esc(p.descripcion||'')+'</textarea>'      +'</div>'      +'<div style="margin-bottom:10px">'        +'<div style="color:var(--muted);font-size:11px;margin-bottom:6px">📐 Variantes de tamaño / medida <span style="color:#555">(opcional — ej: Alitas x8 · x16 · x24. "Und" = cuántas descuenta del stock)</span></div>'        +'<div id="variantes-list">'          +(p.variantes&&p.variantes.length?p.variantes.map(function(v,vi){            return'<div style="display:flex;gap:6px;margin-bottom:6px" id="vrow-'+vi+'">'              +'<input class="inp inp-sm" placeholder="Nombre (ej: x8)" value="'+esc(v.nombre||'')+'" style="flex:2" data-vnom="'+vi+'"/>'              +'<input class="inp inp-sm money" type="text" inputmode="numeric" placeholder="Precio" value="'+moneyFmt(v.precio||'')+'" style="flex:1" data-vpre="'+vi+'"/>'              +'<input class="inp inp-sm" type="number" inputmode="numeric" min="1" placeholder="Und" title="Unidades que descuenta del stock" value="'+(v.und||1)+'" style="width:52px;text-align:center" data-vund="'+vi+'"/>'              +'<button onclick="quitarVariante('+vi+')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:4px 8px;cursor:pointer;font-size:12px">✕</button>'              +'</div>'              +'<div style="display:flex;gap:6px;margin:-2px 0 8px">'
                +'<input class="inp inp-sm" placeholder="Especificación (opcional) — sale en la carta" value="'+esc(v.desc||'')+'" style="flex:1;font-size:11px" data-vdesc="'+vi+'"/>'
                +'<input class="inp inp-sm money" type="text" inputmode="numeric" placeholder="🛵 apps" title="Precio en apps (Rappi/Didi/Uber)" value="'+moneyFmt(v.precioRappi||'')+'" style="width:92px;font-size:11px" data-vrap="'+vi+'"/>'
              +'</div>';          }).join(''):'<div style="color:var(--muted);font-size:11px;margin-bottom:6px">Sin variantes — precio único</div>')        +'</div>'        +'<button onclick="agregarVariante()" style="background:var(--card);color:var(--accent);border:1px solid var(--accent)33;border-radius:7px;padding:5px 12px;font-size:11px;cursor:pointer;font-weight:700">+ Agregar variante</button>'      +'</div>'      +'<div id="cubf" style="'+(p.esCerveza?'':'display:none;')+'margin-bottom:12px">'
        +'<div style="color:#22c55e;font-size:11px;font-weight:700;margin-bottom:3px">🪣 Precio CUBETAZO ×5 (COP)</div>'
        +'<input class="inp money" id="f-cubeta" type="text" value="'+moneyFmt(p.cubeta||'')+'" placeholder="Ej: 20.000" inputmode="numeric"/>'
      +'</div>'
      +'<div style="margin-bottom:14px">'
        +'<div style="color:var(--muted);font-size:11px;margin-bottom:7px">Icono del producto</div>'
        +'<div class="emoji-grid" id="emoji-picker">'+emojiButtons+'</div>'
        +'<input type="hidden" id="f-emoji" value="'+esc(curEmoji)+'"/>'
      +'</div>'
      // ── Recipe section ──
      +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:10px">'        +'<div style="color:var(--accent);font-weight:700;font-size:13px;margin-bottom:8px">🧾 Receta (ingredientes que descuenta al vender)</div>'        +'<div id="receta-rows">'+recetaRows+'</div>'        +'<div style="display:flex;gap:8px;margin-top:8px;align-items:flex-end">'          +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Ingrediente</div>'            +'<select class="inp inp-sm" id="rec-ing-sel"><option value="">— Selecciona —</option>'            +(ingredientes.length?(function(){
              var gm={};ingredientes.forEach(function(i){var g=(i.grupo||'').trim()||'Insumos';if(!gm[g])gm[g]=[];gm[g].push(i);});
              var conGrupo=Object.keys(gm).filter(function(g){return g!=='Insumos';}).sort();
              var grpOpts=conGrupo.length?'<optgroup label="🎛 GRUPOS (el mesero reparte al servir)">'+conGrupo.map(function(g){return'<option value="grp:'+esc(g)+'">🎛 Grupo: '+esc(g)+' — elegir tipos al servir</option>';}).join('')+'</optgroup>':'';
              return grpOpts+Object.keys(gm).sort().map(function(g){
                return'<optgroup label="🧂 '+esc(g)+'">'+gm[g].map(function(i){return'<option value="ing:'+i.id+'">🧂 '+esc(i.nombre)+' ('+i.und+')</option>';}).join('')+'</optgroup>';
              }).join('');
            })():'')            +'<optgroup label="🍽️ Productos de la carta">'+menu.filter(function(m){return m.id!==editandoProd;}).map(function(m){return'<option value="'+m.id+'">'+m.emoji+' '+esc(m.nombre)+'</option>';}).join('')+'</optgroup>'            +'</select></div>'          +'<div style="width:62px"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Cant.</div>'            +'<input class="inp inp-sm" id="rec-ing-cant" type="number" min="0.1" step="0.1" value="1"/></div>'          +'<div style="width:78px"><div style="color:var(--muted);font-size:10px;margin-bottom:3px">por cada</div>'            +'<input class="inp inp-sm" id="rec-ing-porcada" type="number" min="1" step="1" placeholder="— und"/></div>'          +'<button class="btn btn-sm btn-blue" onclick="agregarIngReceta()">+ Agregar</button>'        +'</div>'        +'<div style="color:var(--muted);font-size:10px;margin-top:6px">💡 Al vender se descuentan automáticamente. <b>"Por cada"</b> hace que escale con la variante: 1 porción de papa <b>por cada 8</b> alitas → x8 descuenta 1, x16 descuenta 2, x24 descuenta 3.</div>'      +'</div>'      +'<div style="display:flex;gap:8px">'        +'<button class="btn btn-green btn-full" onclick="guardarProd()">💾 Guardar producto</button>'
        +'<button class="btn btn-outline btn-full" onclick="cancelarProd()">Cancelar</button>'
      +'</div></div>';
  } else {
    formHtml='<div class="mb12" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm btn-green" onclick="nuevoProd()">➕ Nuevo producto</button>'+((usuarioActivo&&usuarioActivo.rol==='admin')?'<button class="btn btn-sm" onclick="organizarCartaAuto()" style="background:#a855f722;color:#a855f7;border:1px solid #a855f744">🗂️ Auto-organizar</button><button class="btn btn-sm" onclick="abrirGestionCategorias()" style="background:#38bdf822;color:#38bdf8;border:1px solid #38bdf844">📁 Categorías/Subcat.</button>':'')+'</div>';
  }
  function _cardProd(p){
    return'<div class="prod-card" style="border-color:'+(editandoProd===p.id?'var(--accent)':'var(--border)')+'">'
      +'<span style="font-size:26px">'+p.emoji+'</span>'
      +'<div style="flex:1">'
        +'<div style="font-weight:700;font-size:13px">'+esc(p.nombre)+'</div>'
        +'<div style="color:var(--accent);font-size:12px;font-weight:700">'+fmt(p.precio)+'</div>'+(p.receta&&p.receta.length?'<div style="color:#38bdf8;font-size:10px;font-weight:700">🧾 Receta: '+p.receta.length+' ing.</div>':'')+(p.esComida?'<div style="color:#f5a623;font-size:10px;font-weight:700">👨‍🍳 Cocina</div>':'')
        +(p.esCerveza&&p.cubeta?'<div style="color:#22c55e;font-size:11px">🪣 '+fmt(p.cubeta)+'</div>':'')
        +'<div style="color:var(--muted);font-size:11px">Stock: '+p.stock+' '+p.und+'</div>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;gap:4px">'
        +'<button onclick="editarProd('+p.id+')" style="background:#38bdf818;color:#38bdf8;border:none;border-radius:6px;padding:4px 9px;cursor:pointer;font-size:11px;font-weight:700">✏️</button>'
        +'<button onclick="borrarProd('+p.id+')" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;padding:4px 9px;cursor:pointer;font-size:11px;font-weight:700">🗑</button>'
      +'</div></div>';
  }
  var secs=cats.map(function(cat){
    var enCat=menu.filter(function(m){return m.cat===cat;});
    // Agrupar por subcategoría
    var subs=enCat.reduce(function(a,m){var s=m.subcat||'';if(a.indexOf(s)<0)a.push(s);return a;},[]).sort();
    var prods;
    if(subs.length===1&&subs[0]===''){
      prods=enCat.map(_cardProd).join('');
    } else {
      prods=subs.map(function(s){
        var lista=enCat.filter(function(m){return (m.subcat||'')===s;});
        return (s?'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin:8px 0 4px;padding-left:2px">'+esc(s)+' ('+lista.length+')</div>':'<div style="color:#666;font-size:10px;margin:8px 0 4px">Sin subcategoría</div>')
          +'<div class="prod-grid">'+lista.map(_cardProd).join('')+'</div>';
      }).join('');
    }
    var catKey='carta_'+cat;
    var abierto=(catKey in _mesesOpen)?_mesesOpen[catKey]:false;
    var nProds=menu.filter(function(m){return m.cat===cat;}).length;
    return'<div style="margin-bottom:8px">'
      +'<button data-act="toggle-mes" data-mes="'+catKey+'" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:9px 14px;cursor:pointer;color:var(--text)">'
        +'<span style="font-weight:800;font-size:13px">'+(abierto?'▼':'▶')+' '+esc(cat)+'</span>'
        +'<span style="color:var(--muted);font-size:11px">'+nProds+' productos</span>'
      +'</button>'
      +(abierto?'<div style="margin-top:6px">'+prods+'</div>':'')
      +'</div>';
  }).join('');
  return formHtml+secs;
}
function nuevoProd(){editandoProd='nuevo';emojiSel='🍺';render();}
function cancelarProd(){editandoProd=null;render();}
function toggleSubcatNueva(){var s=document.getElementById('f-subcat-sel');var i=document.getElementById('f-subcat-new');if(s&&i){i.style.display=(s.value==='__new__')?'block':'none';if(s.value==='__new__')i.focus();}}
function toggleCatNueva(){var s=document.getElementById('f-cat-sel');var i=document.getElementById('f-cat-new');if(s&&i){i.style.display=(s.value==='__new__')?'block':'none';if(s.value==='__new__')i.focus();}}
function editarProd(id){editandoProd=id;var p=menu.find(function(m){return m.id===id;});emojiSel=p?p.emoji:'🍺';render();}
function borrarProd(id){
  if(!confirm('¿Eliminar este producto?'))return;
  menu=menu.filter(function(m){return m.id!==id;});
  delete a52Fotos['p'+id];var _rf=ref('config/fotos/p'+id);if(_rf)_rf.remove().catch(function(){});
  editandoProd=null;var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);render();
}
function selEmoji(e){
  emojiSel=e;
  var hid=document.getElementById('f-emoji');if(hid)hid.value=e;
  document.querySelectorAll('#emoji-picker .emj-btn').forEach(function(b,i){
    var isSel=EMOJIS[parseInt(b.getAttribute('data-ei'))]===e;
    b.style.background=isSel?'#a855f722':'transparent';
    b.style.border=isSel?'2px solid #a855f7':'2px solid transparent';
  });
}

// Event delegation for admin config buttons
function bindAdminEvents(){
  var c=document.getElementById('content');
  if(!c||c._adminBound)return;
  c._adminBound=true;
  c.addEventListener('click',function(e){
    var btn=e.target.closest('[data-act]');if(!btn)return;
    var act=btn.getAttribute('data-act');
    var uid=btn.getAttribute('data-uid');
    if(act==='edituser'&&uid){editarUsuario(uid);return;}
    if(act==='deluser'&&uid){borrarUsuario(uid);return;}
    if(act==='toggleturno'&&uid){toggleTurnoUsuario(uid);return;}
    if(act==='del-rec'){
      var rIdx=parseInt(btn.getAttribute('data-ridx'));
      var prod=editandoProd&&editandoProd!=='nuevo'?menu.find(function(m){return m.id===editandoProd;}):null;
      if(prod&&prod.receta){
        prod.receta.splice(rIdx,1);
        var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
        render();
      }
      return;
    }
    var iid2=btn.getAttribute('data-iid');
    if(act==='rename-cat'){
      abrirRenombrarCategoria(btn.getAttribute('data-cat'));return;
    }
    if(act==='set-cat-emoji'){
      abrirEmojiCategoria(btn.getAttribute('data-cat'));return;
    }
    if(act==='del-ing'&&iid2){
      if(!confirm('¿Eliminar este ingrediente?'))return;
      ingredientes=ingredientes.filter(function(x){return x.id!==iid2;});
      guardarIngredientes();
      closeModal2();render();return;
    }
    var sid=btn.getAttribute('data-sid');
    if(act==='delsocio'&&sid){
      if(!confirm('¿Eliminar este consumo? El stock se devolverá al inventario.'))return;
      eliminarConsumoSocio(sid);
      return;
    }
    if(act==='setfont'){
      ticketConfig.fontSize=parseInt(btn.getAttribute('data-fs'));
      render();
    }
    if(act==='setpaper'){
      ticketConfig.paperWidth=parseInt(btn.getAttribute('data-pw'));
      render();
    }
  });
}

function abrirItemPersonalizado(){
  if(!mesaActiva)return;
  if(!puedeUsarOtro()){alert('El administrador desactivó el botón «Otro». Pida que agreguen el producto a la carta.');return;}
  modal2(
    '<div style="color:var(--gold);font-weight:900;font-size:16px;margin-bottom:16px">✏️ Agregar producto personalizado</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-bottom:14px">Úsalo para cobrar servicios, productos no listados o cualquier valor a tu criterio.</div>'
    +'<div style="margin-bottom:12px">'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:4px">Nombre / descripción *</div>'
      +'<input class="inp" id="ci-nombre" placeholder="Ej: Servicio a domicilio, Descuento, Copa especial..." autofocus/>'
    +'</div>'
    +'<div style="margin-bottom:16px">'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:4px">Valor (COP) *</div>'
      +'<input class="inp money" id="ci-valor" type="text" placeholder="0" inputmode="numeric"/>'
      +'<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
      +[5000,10000,15000,20000,25000,30000,50000].map(function(v){
        '<button data-qv="'+v+'" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:7px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer">'+fmt(v)+'</button>';
      }).join('')
      +'</div>'
    +'</div>'
    +'<div style="display:flex;gap:10px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button class="btn btn-gold btn-full" onclick="confirmarItemPersonalizado()">Agregar al pedido</button>'
    +'</div>'
  );
  setTimeout(function(){var el=document.getElementById('ci-nombre');if(el)el.focus();},100);
}

function confirmarItemPersonalizado(){
  var nombre=((document.getElementById('ci-nombre')||{}).value||'').trim();
  var valor=moneyVal('ci-valor')||0;
  if(!nombre){alert('Escribe el nombre o descripción.');return;}
  if(valor<=0){alert('Escribe un valor mayor a cero.');return;}
  var id=mesaActiva.id;
  if(!pedidos[id])pedidos[id]=[];
  pedidos[id].push({
    pid:'custom_'+a52Ahora(),
    uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36),
    cubeta:false,qty:1,
    isCustom:true,
    customNombre:nombre,
    customPrecio:valor
  });
  var r=ref('pedidos/'+id);if(r)r.set(pedidos[id]);
  logPedido(id,'✏️ '+nombre+' · '+fmt(valor),1);
  closeModal2();
  renderSoloPedido();updateHeader();actualizarColorMesas();
}

function abrirDescuento(){
  if(!mesaActiva)return;
  modal2('<div style="text-align:center;margin-bottom:16px">'
    +'<div style="font-size:28px">🏷️</div>'
    +'<div style="font-weight:800;font-size:16px">Descuento 10%</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:4px">Mesa: '+(mesaActiva.nombre||'Mesa '+mesaActiva.num)+'</div></div>'
    +'<div style="margin-bottom:16px">'
      +'<div style="color:var(--muted);font-size:12px;margin-bottom:6px">¿Quién autoriza el descuento?</div>'
      +'<input class="inp" id="desc-auth" placeholder="Nombre de quien autoriza..." autofocus/>'
    +'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button class="btn btn-green btn-full" onclick="confirmarDescuento()">✅ Aplicar 10%</button>'
    +'</div>');
  setTimeout(function(){var el=document.getElementById('desc-auth');if(el)el.focus();},100);
}

function confirmarDescuento(){
  var auth=((document.getElementById('desc-auth')||{}).value||'').trim();
  if(!auth){alert('Escribe quién autoriza el descuento.');return;}
  descuentos[mesaActiva.id]={pct:10,auth:auth};
  closeModal2();
  renderSoloPedido();updateHeader();
}

function quitarDescuento(){
  if(!mesaActiva)return;
  delete descuentos[mesaActiva.id];
  renderSoloPedido();updateHeader();
}

function abrirEditStockModal(id, esIng){
  if(!puedeAjustarInv()){alert('🔒 Los ajustes de inventario están bloqueados. Solo el administrador puede modificar cantidades.');return;}
  var item=esIng?ingredientes.find(function(x){return x.id===id;}):menu.find(function(m){return m.id===parseInt(id);});
  if(!item)return;
  modal2('<div style="text-align:center;margin-bottom:16px">'
    +'<div style="font-size:24px">'+(esIng?'🧂':(item.emoji||'📦'))+'</div>'
    +'<div style="font-weight:800;font-size:15px">'+esc(item.nombre)+'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">Stock actual: <strong>'+item.stock+' '+item.und+'</strong></div></div>'
    +'<div style="margin-bottom:14px">'
      +'<div style="color:var(--muted);font-size:12px;margin-bottom:6px">Nuevo stock (corrección manual)</div>'
      +'<input class="inp" id="edit-stock-val" type="number" value="'+item.stock+'" autofocus/>'
    +'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button class="btn btn-green btn-full" data-act="confirm-edit-stock" data-id="'+id+'" data-esing="'+esIng+'">💾 Guardar</button>'
    +'</div>');
  setTimeout(function(){var el=document.getElementById('edit-stock-val');if(el){el.focus();el.select();}},100);
}

function confirmarEditStock(id, esIng){
  var val=parseInt((document.getElementById('edit-stock-val')||{}).value);
  if(isNaN(val)){alert('Ingresa un valor válido.');return;}
  if(esIng){
    var ing=ingredientes.find(function(x){return x.id===id;});
    if(ing){var dI=val-(parseInt(ing.stock)||0);if(dI)cambiarStock('i',ing.id,dI,'✏️ Ajuste manual de stock (fijado en '+val+')');}
  } else {
    var p=menu.find(function(m){return m.id===parseInt(id);});
    if(p){var dP=val-(parseInt(p.stock)||0);if(dP)cambiarStock('p',p.id,dP,'✏️ Ajuste manual de stock (fijado en '+val+')');}
  }
  closeModal2();render();
}

function abrirMercanciaModal(id, esIng){
  window._mercModo='unidad';
  var item=esIng?ingredientes.find(function(x){return x.id===id;}):menu.find(function(m){return m.id===parseInt(id);});
  if(!item)return;
  modal2('<div style="text-align:center;margin-bottom:16px">'
    +'<div style="font-size:24px">'+(esIng?'🧂':(item.emoji||'📦'))+'</div>'
    +'<div style="font-weight:800;font-size:15px">'+esc(item.nombre)+'</div>'
    +'<div style="color:var(--muted);font-size:12px;margin-top:2px">Stock actual: <strong>'+item.stock+' '+item.und+'</strong></div></div>'
    +'<div style="margin-bottom:14px">'
      +'<div style="color:var(--muted);font-size:12px;margin-bottom:6px">¿Cuánto llegó? (se suma al stock actual)</div>'
      +'<input class="inp" id="merc-cant" type="number" min="1" value="1" autofocus/>'
      +'<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
        +[6,12,24,48].map(function(v){return'<button data-qv="'+v+'" style="background:var(--card);color:var(--muted);border:1px solid var(--border);border-radius:7px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer">+'+v+'</button>';}).join('')
      +'</div>'
    +'</div>'
    +(!esIng?'<div style="margin-bottom:14px">'
      +'<div style="color:var(--muted);font-size:12px;margin-bottom:6px">💵 Precio de compra <span style="font-size:10px">(opcional — actualiza el costo)</span></div>'
      +'<div style="display:flex;gap:6px;margin-bottom:6px">'
        +'<button id="merc-modo-und" onclick="window._mercModo=\'unidad\';this.style.background=\'#22c55e\';this.style.color=\'#fff\';var t=document.getElementById(\'merc-modo-tot\');t.style.background=\'var(--bg)\';t.style.color=\'var(--muted)\'" style="flex:1;background:#22c55e;color:#fff;border:1px solid #22c55e;border-radius:8px;padding:7px;font-size:11px;font-weight:800;cursor:pointer">Por '+esc(item.und||'unidad')+'</button>'
        +'<button id="merc-modo-tot" onclick="window._mercModo=\'total\';this.style.background=\'#22c55e\';this.style.color=\'#fff\';var u=document.getElementById(\'merc-modo-und\');u.style.background=\'var(--bg)\';u.style.color=\'var(--muted)\'" style="flex:1;background:var(--bg);color:var(--muted);border:1px solid var(--border);border-radius:8px;padding:7px;font-size:11px;font-weight:800;cursor:pointer">TOTAL de la compra</button>'
      +'</div>'
      +'<input class="inp money" id="merc-costo" type="text" inputmode="numeric" placeholder="'+(item.costo?'Último costo: '+moneyFmt(item.costo)+' por '+esc(item.und||'und'):'Ej: lo que pagaste')+'"/>'
      +'<div style="color:var(--muted);font-size:10px;margin-top:3px">💡 Si la canasta trae <b>regalos (ñapa)</b>: usa "TOTAL de la compra", pon lo que pagaste y arriba la cantidad COMPLETA que llegó (compradas + regaladas) — el costo por unidad sale solo.'+(item.costo?' Con costo previo se promedia con lo del stock.':'')+'</div>'
    +'</div>':'')
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button class="btn btn-green btn-full" data-act="confirm-mercancia" data-id="'+id+'" data-esing="'+esIng+'">📦 Agregar al stock</button>'
    +'</div>');
  setTimeout(function(){var el=document.getElementById('merc-cant');if(el){el.focus();el.select();}},100);
}

function confirmarMercancia(id, esIng){
  var cant=parseInt((document.getElementById('merc-cant')||{}).value)||0;
  if(cant<=0){alert('Ingresa una cantidad mayor a cero.');return;}
  if(esIng){
    var ing=ingredientes.find(function(x){return x.id===id;});
    if(ing)cambiarStock('i',ing.id,cant,'📦 Llegó mercancía');
  } else {
    var p=menu.find(function(m){return m.id===parseInt(id);});
    if(p){
      var valorDigitado=moneyVal('merc-costo')||0;
      var esTotal=(window._mercModo==='total');
      window._mercModo='unidad';
      var costoCompra=esTotal?Math.round(valorDigitado/cant):valorDigitado;
      var motivo='📦 Llegó mercancía';
      if(costoCompra>0){
        var stAnt=Math.max(0,parseInt(p.stock)||0);
        var costoAnt=p.costo||0;
        var nuevoCosto;
        if(costoAnt>0&&stAnt>0){
          // Promedio ponderado: lo que había a su costo + lo que llega a su precio
          nuevoCosto=Math.round((stAnt*costoAnt+cant*costoCompra)/(stAnt+cant));
        }else{
          // Sin costo previo: el stock viejo sin precio se irá acabando; desde ya rige el nuevo
          nuevoCosto=costoCompra;
        }
        p.costo=nuevoCosto;
        motivo+=' ('+(esTotal?fmt(valorDigitado).replace(/\u00A0/g,' ')+' total por '+cant+' → ':'a ')+fmt(costoCompra).replace(/\u00A0/g,' ')+' c/u'+(nuevoCosto!==costoCompra?' · costo promedio: '+fmt(nuevoCosto).replace(/\u00A0/g,' '):'')+')';
        var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
      }
      cambiarStock('p',p.id,cant,motivo);
      if(costoCompra>0)showToast('📦 +'+cant+' '+esc(p.und||'und')+' de '+esc(p.nombre)+'<br><span style="font-size:12px;opacity:.85">💵 Compra a '+fmt(costoCompra)+' c/u · costo del producto: '+fmt(p.costo)+'</span>','#22c55e');
    }
  }
  closeModal2();render();
}

function recuperarIngrediente(iid){
  var ing=ingredientes.find(function(x){return String(x.id)===String(iid);});
  if(!ing)return;
  var nombre=prompt('¿Cómo se llama este insumo? (Ej: Papa a la francesa)');
  if(!nombre||!nombre.trim())return;
  nombre=nombre.trim();
  var stockTxt=prompt('Stock real actual de "'+nombre+'" (tiene '+(ing.stock||0)+' en el sistema):',String(Math.max(0,ing.stock||0)));
  var stock=parseInt(stockTxt);
  if(isNaN(stock))stock=ing.stock||0;
  ing.nombre=nombre;ing.und=ing.und||'und';ing.grupo=ing.grupo||'';ing.stock=stock;
  fbSet('ingredientes/'+iid,ing);
  logKardex('i',iid,nombre,0,'♻️ Insumo recuperado (tenía '+(ing.stock||0)+', ajustado a '+stock+')',stock);
  showToast('♻️ Recuperado: '+esc(nombre)+' · stock '+stock,'#22c55e');
  render();
}
function guardarIngredientes(){
  var obj={};ingredientes.forEach(function(i){obj[i.id]=i;});
  fbSet('ingredientes',obj);
}

function toggleIngGrp(g){
  var k='ingGrp_'+g;
  _secOpen[k]=(_secOpen[k]===false);
  render();
}
function _gruposIng(){
  var g={};ingredientes.forEach(function(i){var x=(i.grupo||'').trim();if(x)g[x]=1;});
  return Object.keys(g).sort();
}
function abrirNuevoIngrediente(){
  modal2('<div style="color:var(--accent);font-weight:800;font-size:16px;margin-bottom:14px">🧂 Nuevo ingrediente</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Nombre</div>'
      +'<input class="inp" id="ing-nombre" placeholder="Ej: Empanada de pollo, Carne, Pan..." autofocus/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Grupo (opcional — agrupa en la lista: Empanadas, Carnes, Panes...)</div>'
      +'<input class="inp" id="ing-grupo" list="ing-grupos-list" placeholder="Ej: Empanadas"/>'
      +'<datalist id="ing-grupos-list">'+_gruposIng().map(function(g){return'<option value="'+esc(g)+'">';}).join('')+'</datalist></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Stock inicial</div>'
        +'<input class="inp" id="ing-stock" type="number" min="0" value="0"/></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Unidad</div>'
        +'<select class="inp" id="ing-und"><option>und</option><option>kg</option><option>g</option><option>L</option><option>ml</option><option>porciones</option></select></div>'
    +'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button class="btn btn-green btn-full" onclick="confirmarNuevoIngrediente()">+ Agregar</button>'
    +'</div>');
  setTimeout(function(){var el=document.getElementById('ing-nombre');if(el)el.focus();},100);
}

function confirmarNuevoIngrediente(){
  var nombre=((document.getElementById('ing-nombre')||{}).value||'').trim();
  var stock=parseInt((document.getElementById('ing-stock')||{}).value)||0;
  var und=(document.getElementById('ing-und')||{}).value||'und';
  if(!nombre){alert('Escribe el nombre del ingrediente.');return;}
  var grupo=((document.getElementById('ing-grupo')||{}).value||'').trim();
  ingredientes.push({id:'ing_'+a52Ahora(),nombre:nombre,stock:stock,und:und,grupo:grupo});
  guardarIngredientes();
  closeModal2();render();
}

function abrirEditIngrediente(iid){
  var ing=ingredientes.find(function(x){return x.id===iid;});
  if(!ing)return;
  modal2('<div style="color:var(--accent);font-weight:800;font-size:16px;margin-bottom:14px">✏️ Editar ingrediente</div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Nombre</div>'
      +'<input class="inp" id="ing-nombre" value="'+esc(ing.nombre)+'" autofocus/></div>'
    +'<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Grupo (opcional)</div>'
      +'<input class="inp" id="ing-grupo" list="ing-grupos-list" value="'+esc(ing.grupo||'')+'" placeholder="Ej: Empanadas"/>'
      +'<datalist id="ing-grupos-list">'+_gruposIng().map(function(g){return'<option value="'+esc(g)+'">';}).join('')+'</datalist></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Stock</div>'
        +'<input class="inp" id="ing-stock" type="number" min="0" value="'+ing.stock+'"/></div>'
      +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:4px">Unidad</div>'
        +'<select class="inp" id="ing-und">'
        +'<option '+(ing.und==="und"?"selected":"")+'>und</option>'
        +'<option '+(ing.und==="kg"?"selected":"")+'>kg</option>'
        +'<option '+(ing.und==="g"?"selected":"")+'>g</option>'
        +'<option '+(ing.und==="L"?"selected":"")+'>L</option>'
        +'<option '+(ing.und==="ml"?"selected":"")+'>ml</option>'
        +'<option '+(ing.und==="porciones"?"selected":"")+'>porciones</option>'
        +'</select></div>'
    +'</div>'
    +'<input type="hidden" id="ing-id" value="'+iid+'"/>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button onclick="eliminarIngrediente(\''+iid+'\')" style="flex:1;background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">🗑 Eliminar</button>'
      +'<button class="btn btn-green btn-full" onclick="guardarEditIngrediente()">💾 Guardar</button>'
    +'</div>');
}

function eliminarIngrediente(iid){
  var ing=ingredientes.find(function(x){return String(x.id)===String(iid);});
  if(!ing){alert('No encontré ese insumo (id '+iid+'). Recarga la página e intenta de nuevo.');return;}
  var usanReceta=menu.filter(function(m){return m.receta&&m.receta.some(function(r){return String(r.pid)===String(iid);});});
  var aviso=usanReceta.length?'\n\n⚠️ OJO: lo usan las recetas de: '+usanReceta.map(function(m){return m.nombre;}).join(', ')+'. Esas recetas quedarán con un ingrediente roto.':'';
  if(!confirm('¿Eliminar el ingrediente "'+(ing.nombre||'(sin nombre · dañado)')+'"?'+aviso))return;
  ingredientes=ingredientes.filter(function(x){return String(x.id)!==String(iid);});
  var obj={};ingredientes.forEach(function(i){obj[i.id]=i;});
  fbSet('ingredientes',ingredientes.length?obj:null);
  closeModal2();
  showToast('🗑 Ingrediente "'+esc(ing.nombre)+'" eliminado','#ef4444');
  render();
}
function guardarEditIngrediente(){
  var iid=(document.getElementById('ing-id')||{}).value;
  var nombre=((document.getElementById('ing-nombre')||{}).value||'').trim();
  var stock=parseInt((document.getElementById('ing-stock')||{}).value)||0;
  var und=(document.getElementById('ing-und')||{}).value||'und';
  if(!nombre||!iid)return;
  var ing=ingredientes.find(function(x){return x.id===iid;});
  if(!ing)return;
  var grupo=((document.getElementById('ing-grupo')||{}).value||'').trim();
  Object.assign(ing,{nombre:nombre,stock:stock,und:und,grupo:grupo});
  guardarIngredientes();
  closeModal2();render();
}

function abrirEmojiCategoria(cat){
  var btns='<button data-pick="🍺" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍺</button><button data-pick="🍻" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍻</button><button data-pick="🥃" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🥃</button><button data-pick="🍷" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍷</button><button data-pick="🥂" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🥂</button><button data-pick="🍹" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍹</button><button data-pick="🥤" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🥤</button><button data-pick="💧" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">💧</button><button data-pick="🧃" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🧃</button><button data-pick="☕" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">☕</button><button data-pick="🍗" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍗</button><button data-pick="🍕" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍕</button><button data-pick="🍔" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍔</button><button data-pick="🌯" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🌯</button><button data-pick="🍝" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍝</button><button data-pick="🥩" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🥩</button><button data-pick="🍟" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍟</button><button data-pick="🥗" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🥗</button><button data-pick="🍽️" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍽️</button><button data-pick="🎂" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🎂</button><button data-pick="⚡" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">⚡</button><button data-pick="🔥" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🔥</button><button data-pick="🍸" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍸</button><button data-pick="🚬" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🚬</button><button data-pick="🌶️" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🌶️</button><button data-pick="🌮" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🌮</button><button data-pick="🍣" style="font-size:22px;background:none;border:none;cursor:pointer;padding:3px">🍣</button>';
  modal2('<div style="font-weight:800;font-size:15px;margin-bottom:12px">Emoji para: '+esc(cat)+'</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:12px">'+btns+'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<input class="inp" id="emoji-custom" placeholder="O escribe un emoji personalizado..." style="flex:1"/>'
      +'<button class="btn btn-green" data-act="confirm-cat-emoji" data-cat="'+esc(cat)+'">✅</button>'
    +'</div>');
  setTimeout(function(){
    document.querySelectorAll('[data-pick]').forEach(function(b){
      b.onclick=function(){
        catEmojis[cat]=b.getAttribute('data-pick');
        fbSet('catEmojis',catEmojis);
        closeModal2();render();
      };
    });
  },50);
}

function abrirGestionCategorias(){
  var cats=menu.reduce(function(a,m){if(m.cat&&a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
  var catOptsSel=cats.map(function(c){return'<option value="'+esc(c)+'">'+esc(c)+'</option>';}).join('');
  // Subcategorías con su categoría padre
  var subMap={};
  menu.forEach(function(m){if(m.subcat){subMap[m.subcat]=subMap[m.subcat]||{padre:m.cat,n:0};subMap[m.subcat].n++;}});
  var subNames=Object.keys(subMap).sort();

  var catsRows=cats.map(function(c){
    var n=menu.filter(function(m){return m.cat===c;}).length;
    return'<div style="background:var(--card2);border-radius:9px;padding:9px 11px;margin-bottom:7px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:700;font-size:13px">'+esc(c)+'</span><span style="color:var(--muted);font-size:11px">'+n+' prod.</span></div>'
      +'<div style="display:flex;gap:6px;align-items:center">'
        +'<span style="color:var(--muted);font-size:11px">→ dentro de:</span>'
        +'<input class="inp inp-sm" list="gc-cats-dl" id="gc-parent-'+esc(c).replace(/[^a-zA-Z0-9]/g,"_")+'" placeholder="Categoría padre" style="flex:1;font-size:12px"/>'
        +'<button onclick="convertirCatEnSubcat(\''+esc(c).replace(/'/g,"\\'")+'\')" style="background:#a855f7;color:#fff;border:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">Convertir</button>'
      +'</div>'
    +'</div>';
  }).join('');

  var subsRows=subNames.length?subNames.map(function(s){
    var info=subMap[s];
    return'<div style="background:var(--card2);border-radius:9px;padding:9px 11px;margin-bottom:7px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:700;font-size:13px">'+esc(s)+'</span><span style="color:var(--muted);font-size:11px">en '+esc(info.padre)+' · '+info.n+'</span></div>'
      +'<div style="display:flex;gap:6px;align-items:center">'
        +'<button onclick="promoverSubcat(\''+esc(s).replace(/'/g,"\\'")+'\')" style="flex:1;background:#22c55e18;color:#22c55e;border:1px solid #22c55e33;border-radius:7px;padding:7px;font-size:11px;font-weight:700;cursor:pointer">↑ Hacer categoría</button>'
        +'<select class="inp inp-sm" id="gc-move-'+esc(s).replace(/[^a-zA-Z0-9]/g,"_")+'" style="flex:1;font-size:12px"><option value="">Mover a...</option>'+catOptsSel+'</select>'
        +'<button onclick="moverSubcat(\''+esc(s).replace(/'/g,"\\'")+'\')" style="background:#38bdf8;color:#fff;border:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer">OK</button>'
      +'</div>'
    +'</div>';
  }).join(''):'<div style="color:var(--muted);font-size:12px;text-align:center;padding:10px">Aún no hay subcategorías.</div>';

  var _dlCats=cats.slice();
  ['🍽️ Cocina','🍺 Cervezas','🥃 Licores','🍸 Cócteles','🥤 Bebidas','🚬 Otros'].forEach(function(x){if(_dlCats.indexOf(x)<0)_dlCats.push(x);});
  var dlHtml='<datalist id="gc-cats-dl">'+_dlCats.map(function(x){return'<option value="'+esc(x)+'"></option>';}).join('')+'</datalist>';
  modal2(dlHtml+'<div style="font-weight:800;font-size:16px;margin-bottom:4px">🗂️ Organizar categorías</div>'
    +'<div style="color:var(--muted);font-size:11px;margin-bottom:12px">Convierte categorías en subcategorías y al revés.</div>'
    +'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin-bottom:6px">CATEGORÍAS</div>'
    +'<div style="max-height:32vh;overflow-y:auto;margin-bottom:14px">'+catsRows+'</div>'
    +'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;margin-bottom:6px">SUBCATEGORÍAS</div>'
    +'<div style="max-height:32vh;overflow-y:auto">'+subsRows+'</div>');
}
function convertirCatEnSubcat(cat){
  var sel=document.getElementById('gc-parent-'+cat.replace(/[^a-zA-Z0-9]/g,"_"));
  var padre=sel?sel.value:'';
  if(!padre){alert('Elige la categoría padre.');return;}
  var n=0;
  menu.forEach(function(m){if(m.cat===cat){m.cat=padre;m.subcat=cat;n++;}});
  var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  showToast('🗂️ "'+esc(cat)+'" ahora es subcategoría de "'+esc(padre)+'"<br><span style="font-size:12px;opacity:.85">'+n+' productos</span>','#a855f7');
  closeModal2();render();
  setTimeout(abrirGestionCategorias,300);
}
function promoverSubcat(sub){
  if(!confirm('¿Convertir "'+sub+'" en una categoría independiente?'))return;
  var n=0;
  menu.forEach(function(m){if(m.subcat===sub){m.cat=sub;m.subcat='';n++;}});
  var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  showToast('↑ "'+esc(sub)+'" ahora es categoría<br><span style="font-size:12px;opacity:.85">'+n+' productos</span>','#22c55e');
  closeModal2();render();
  setTimeout(abrirGestionCategorias,300);
}
function moverSubcat(sub){
  var sel=document.getElementById('gc-move-'+sub.replace(/[^a-zA-Z0-9]/g,"_"));
  var nuevo=sel?sel.value:'';
  if(!nuevo){alert('Elige la categoría destino.');return;}
  var n=0;
  menu.forEach(function(m){if(m.subcat===sub){m.cat=nuevo;n++;}});
  var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  showToast('➡️ "'+esc(sub)+'" movida a "'+esc(nuevo)+'"','#38bdf8');
  closeModal2();render();
  setTimeout(abrirGestionCategorias,300);
}

function abrirRenombrarCategoria(catActual){
  modal2('<div style="text-align:center;margin-bottom:16px">'
    +'<div style="font-size:24px">🏷️</div>'
    +'<div style="font-weight:800;font-size:15px">Renombrar categoría</div></div>'
    +'<div style="margin-bottom:6px;color:var(--muted);font-size:12px">Nombre actual: <strong style="color:var(--text)">'+esc(catActual)+'</strong></div>'
    +'<div style="margin-bottom:14px">'
      +'<div style="color:var(--muted);font-size:11px;margin-bottom:4px">Nuevo nombre</div>'
      +'<input class="inp" id="cat-nuevo" value="'+esc(catActual)+'" autofocus/>'
    +'</div>'
    +'<div style="color:#f5a62318;background:#f5a62318;border:1px solid #f5a62333;border-radius:8px;padding:8px 12px;font-size:11px;color:#f5a623;margin-bottom:14px">'
      +'⚠️ Esto renombrará la categoría en todos los productos que la usen.'
    +'</div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="btn btn-outline btn-full" onclick="closeModal2()">Cancelar</button>'
      +'<button class="btn btn-green btn-full" data-act="confirm-rename-cat" data-cat="'+esc(catActual)+'">✅ Renombrar</button>'
    +'</div>');
  setTimeout(function(){
    var el=document.getElementById('cat-nuevo');
    if(el){el.focus();el.select();}
  },100);
}

function confirmarRenombrarCategoria(catActual){
  var nuevo=((document.getElementById('cat-nuevo')||{}).value||'').trim();
  if(!nuevo){alert('Escribe el nuevo nombre.');return;}
  if(nuevo===catActual){closeModal2();return;}
  // Rename in all products
  var changed=0;
  menu.forEach(function(m){
    if(m.cat===catActual){m.cat=nuevo;changed++;}
  });
  if(changed>0){
    var mo={};menu.forEach(function(m){mo[m.id]=m;});
    fbSet('menu',mo);
  }
  closeModal2();render();
}

var CAT_EMOJI_MAP={"Agua": "💧", "Alitas": "🍗", "Burritos": "🌯", "COCTELES": "🍹", "Cafe": "☕", "Carnes": "🥩", "Cerveza 3 cordilleras": "🍺", "Cerveza Importada": "🍻", "Cerveza Nacional": "🍺", "Comida": "🍽️", "Energizantes": "⚡", "Entradas": "🍟", "Gaseosas": "🥤", "JUGOS": "🧃", "Lasagna": "🍝", "Licores 1/2": "🥃", "Licores Litro": "🍾", "PIZZA": "🍕", "Smirnoff": "🍸", "Whisky": "🥃", "cigarrillo": "🚬", "otros": "🍹", "tequila": "🥃"};

function getCatEmoji(cat){
  if(CAT_EMOJI_MAP[cat]) return CAT_EMOJI_MAP[cat];
  // case-insensitive fallback
  var cl=cat.toLowerCase();
  for(var k in CAT_EMOJI_MAP){if(k.toLowerCase()===cl)return CAT_EMOJI_MAP[k];}
  return '';
}

function autoAsignarEmojis(){
  // Show what categories exist vs what we have mapped
  var cats=menu.reduce(function(a,p){if(a.indexOf(p.cat)<0)a.push(p.cat);return a;},[]).sort();
  var mapped=cats.filter(function(c){return getCatEmoji(c);});
  var unmapped=cats.filter(function(c){return !getCatEmoji(c);});
  var msg='Categorías encontradas: '+cats.length;
  msg+='\nCon emoji asignado: '+mapped.length;
  if(unmapped.length) msg+='\nSin mapear: '+unmapped.join(', ');
  msg+='\n\n¿Continuar y actualizar TODOS los productos?';
  if(!confirm(msg))return;
  var count=0;
  menu.forEach(function(p){
    var ce=getCatEmoji(p.cat);
    if(ce){p.emoji=ce;count++;}
  });
  Object.keys(CAT_EMOJI_MAP).forEach(function(cat){catEmojis[cat]=CAT_EMOJI_MAP[cat];});
  var mo={};menu.forEach(function(m){mo[m.id]=m;});
  fbSet('menu',mo);
  fbSet('catEmojis',catEmojis);
  render();
  alert('✅ '+count+' productos actualizados de '+cats.length+' categorías.');
}

function agregarVariante(){
  var list=document.getElementById('variantes-list');
  if(!list)return;
  // Remove "sin variantes" message if present
  var msg=list.querySelector('div:not([id])');
  if(msg&&msg.textContent.indexOf('Sin variantes')>=0)msg.remove();
  var vi=list.children.length;
  var row=document.createElement('div');
  row.style.cssText='display:flex;gap:6px;margin-bottom:6px';
  row.id='vrow-'+vi;
  row.innerHTML='<input class="inp inp-sm" placeholder="Nombre (ej: x16)" style="flex:2" data-vnom="'+vi+'"/>'
    +'<input class="inp inp-sm money" type="text" inputmode="numeric" placeholder="Precio" style="flex:1" data-vpre="'+vi+'"/>'
    +'<input class="inp inp-sm" type="number" inputmode="numeric" min="1" placeholder="Und" title="Unidades que descuenta del stock" value="1" style="width:52px;text-align:center" data-vund="'+vi+'"/>'
    +'<button onclick="this.parentElement.parentElement.remove()" style="background:#ef444418;color:#ef4444;border:1px solid #ef444433;border-radius:7px;padding:4px 8px;cursor:pointer;font-size:12px">✕</button>';
  var wrap=document.createElement('div');
  wrap.appendChild(row);
  var linea2=document.createElement('div');
  linea2.style.cssText='display:flex;gap:6px;margin:-2px 0 8px';
  var descInp=document.createElement('input');
  descInp.className='inp inp-sm';
  descInp.placeholder='Especificación (opcional) — sale en la carta';
  descInp.style.cssText='flex:1;font-size:11px';
  descInp.setAttribute('data-vdesc',vi);
  var rapInp=document.createElement('input');
  rapInp.className='inp inp-sm money';
  rapInp.type='text';rapInp.inputMode='numeric';
  rapInp.placeholder='🛵 apps';rapInp.title='Precio en apps (Rappi/Didi/Uber)';
  rapInp.style.cssText='width:92px;font-size:11px';
  rapInp.setAttribute('data-vrap',vi);
  linea2.appendChild(descInp);linea2.appendChild(rapInp);
  wrap.appendChild(linea2);
  list.appendChild(wrap);
  row.querySelector('[data-vnom]').focus();
}

function quitarVariante(vi){
  var row=document.getElementById('vrow-'+vi);
  if(row)row.remove();
  var list=document.getElementById('variantes-list');
  if(list&&list.children.length===0){
    list.innerHTML='<div style="color:var(--muted);font-size:11px;margin-bottom:6px">Sin variantes — precio único</div>';
  }
}

function exportarInventarioExcel(){
  // Build CSV with BOM for Excel UTF-8 compatibility
  var rows = [['Categoría','Nombre','Emoji','Precio','Stock','Unidad','Es Cerveza','Cubetazo','Descripción']];
  
  // Sort by category then name
  var sorted = menu.slice().sort(function(a,b){
    return (a.cat||'').localeCompare(b.cat||'') || (a.nombre||'').localeCompare(b.nombre||'');
  });
  
  sorted.forEach(function(p){
    rows.push([
      p.cat||'',
      p.nombre||'',
      p.emoji||'',
      p.precio||0,
      p.stock||0,
      p.und||'und',
      p.esCerveza?'Sí':'No',
      p.cubeta||0,
      p.descripcion||''
    ]);
  });

  // Ingredientes section
  if(ingredientes.length){
    rows.push([]);
    rows.push(['── INGREDIENTES DE COCINA ──','','','','','','','','']);
    rows.push(['Nombre','','','','Stock','Unidad','','','']);
    ingredientes.forEach(function(i){
      rows.push([i.nombre||'','','','',i.stock||0,i.und||'und','','','']);
    });
  }

  var csv = '﻿'; // BOM
  rows.forEach(function(r){
    csv += r.map(function(v){
      var s = String(v).replace(/"/g,'""');
      return (s.indexOf(',')>=0||s.indexOf('"')>=0)?'"'+s+'"':s;
    }).join(',') + '\r\n';
  });

  var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = NEGOCIO.archivo+'-Inventario-' + _fechaKey(new Date()) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toggleVentaSinStock(){
  ventaSinStock=!ventaSinStock;
  var r=ref('configBar/ventaSinStock');
  if(r)r.set(ventaSinStock);
  else fbSet('configBar',{ventaSinStock:ventaSinStock});
  showToast(ventaSinStock?'📦 Se puede vender sin stock (el inventario queda en negativo)':'📦 Ya no se vende sin stock',ventaSinStock?'#22c55e':'#ef4444');
  render();
}
function toggleOtroHabilitado(){
  otroHabilitado=!otroHabilitado;
  var r=ref('configBar/otroHabilitado');
  if(r)r.set(otroHabilitado);
  else fbSet('configBar',{otroHabilitado:otroHabilitado});
  showToast(otroHabilitado?'✏️ Botón «Otro» habilitado para todos':'🔒 Botón «Otro» solo para administradores',otroHabilitado?'#22c55e':'#ef4444');
  render();
}
function puedeUsarOtro(){return otroHabilitado||!!(usuarioActivo&&usuarioActivo.rol==='admin');}

function guardarPreciosCubetazo(){
  var mix=moneyVal('cfg-cubemix')||0;
  var nac=moneyVal('cfg-cubenac')||0;
  var promo=moneyVal('cfg-promo')||0;
  var tam=parseInt((document.getElementById('cfg-tam')||{}).value)||CUBE_MIX_TAM;
  var mixSub=(document.getElementById('cfg-cubemix-sub')||{}).value||'';
  var nacSub=(document.getElementById('cfg-cubenac-sub')||{}).value||'';
  if(mix<=0||nac<=0||promo<=0||tam<=0){alert('Todos los precios y la cantidad deben ser mayores a 0.');return;}
  CUBE_MIX_PRECIO=mix;CUBE_NAC_PRECIO=nac;PROMO_NACIONAL_PRECIO=promo;CUBE_MIX_TAM=tam;
  CUBE_MIX_SUBCAT=mixSub;CUBE_NAC_SUBCAT=nacSub;
  // Guardar en Firebase sin borrar las otras llaves de configBar
  var r1=ref('configBar/cubeMixPrecio');if(r1)r1.set(mix);
  var r2=ref('configBar/cubeNacPrecio');if(r2)r2.set(nac);
  var r3=ref('configBar/promoNacPrecio');if(r3)r3.set(promo);
  var r4=ref('configBar/cubeTam');if(r4)r4.set(tam);
  var r5=ref('configBar/cubeMixSubcat');if(r5)r5.set(mixSub);
  var r6=ref('configBar/cubeNacSubcat');if(r6)r6.set(nacSub);
  if(!r1)fbSet('configBar',{descuentoHabilitado:descuentoHabilitado,cubeMixPrecio:mix,cubeNacPrecio:nac,promoNacPrecio:promo,cubeTam:tam});
  showToast('💾 Precios actualizados<br><span style="font-size:12px;opacity:.85">Mixto '+fmt(mix)+' · Nacional '+fmt(nac)+' · Promo '+fmt(promo)+'</span>','#22c55e');
  render();
}
function toggleDescuento10(){
  descuentoHabilitado=!descuentoHabilitado;
  var r=ref('configBar/descuentoHabilitado');
  if(r)r.set(descuentoHabilitado);
  else fbSet('configBar',{descuentoHabilitado:descuentoHabilitado});
  showToast(descuentoHabilitado?'🏷️ Descuento del 10% habilitado':'🚫 Descuento del 10% deshabilitado',descuentoHabilitado?'#22c55e':'#ef4444');
  render();
}

function imprimirTicketPrueba(){
  var mesaMock={nombre:'Mesa 1',zona:ZONAS[0].id,num:1};
  var pedMock=[
    {pid:1,cubeta:false,qty:2},
    {pid:1,cubeta:true,qty:1},
    {pid:9,cubeta:false,qty:1}
  ];
  var total=menu[0]?menu[0].precio*2+(menu[0].cubeta||menu[0].precio*5)+4000:0;
  imprimirRecibo(mesaMock,pedMock,total,[{fp:'efectivo',label:'Efectivo',monto:total}]);
}

// Event delegation for combos
function bindComboEvents(){}  // handled by document listener

function comboDisponible(cb){
  return (cb.ingredientes||[]).every(function(ing){
    if(ing.tipo==='categoria'){
      // Basta que ALGÚN producto de la categoría alcance
      return menu.filter(function(m){return m.cat===ing.cat||m.subcat===ing.cat;})
        .some(function(p){return p.sinStock?(p.disponible!==false):((parseInt(p.stock)||0)>=ing.cantidad);});
    }
    if(ing.ingId!=null){
      var ii=ingredientes.find(function(x){return String(x.id)===String(ing.ingId);});
      return !ii||((parseInt(ii.stock)||0)>=ing.cantidad);
    }
    if(ing.prodId==null)return true;
    var p=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});
    if(!p)return false;
    if(p.sinStock)return p.disponible!==false;  // productos por receta (alitas, empanadas): solo Disponible/Agotado
    var necesita=ing.cantidad*(parseInt(ing.varianteUnd)||1);
    return (parseInt(p.stock)||0)>=necesita;
  });
}
function agregarComboAPedido(cbId){
  if(!mesaActiva)return;
  var cb=combos.find(function(c){return c.id===cbId;});
  if(!cb)return;

  // Check if any ingredient is "categoria" type - need to ask customer choice
  var catIngs=cb.ingredientes.filter(function(i){return i.tipo==='categoria';});
  var varIngs=cb.ingredientes.filter(function(i){return i.varElegir;});
  if(catIngs.length>0||varIngs.length>0){
    abrirSelectorCombo(cb, catIngs, 0, [], varIngs, {});
    return;
  }

  // All specific products - check stock and add directly
  if(!ventaSinStock&&!comboDisponible(cb)){alert('Stock insuficiente para este combo.');return;}
  confirmarComboEnPedido(cb, []);
}
// 🎚 Elegir tamaño (variante) de un producto dentro del combo
function _comboVarStep(cb, selecciones, varIngs, stepV, varSel){
  if(stepV>=varIngs.length){
    confirmarComboEnPedido(cb, selecciones, varSel);
    return;
  }
  var ing=varIngs[stepV];
  var p=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});
  var vars=(p&&p.variantes)?p.variantes:[];
  if(!vars.length){varSel[stepV]=null;_comboVarStep(cb,selecciones,varIngs,stepV+1,varSel);return;}
  var btns=vars.map(function(v,vi){
    return'<button data-act="combo-var-pick" data-vi="'+vi+'" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:var(--bg);border:1px solid #a855f755;border-radius:11px;padding:13px 15px;margin-bottom:8px;cursor:pointer;color:var(--text)">'
      +'<span style="font-weight:800;font-size:14px">'+(p.emoji||'🍽')+' '+esc(v.nombre)+'</span>'
      +'<span style="color:var(--muted);font-size:11px">'+(v.und||1)+' und'+(v.desc?' · '+esc(v.desc):'')+'</span>'
    +'</button>';
  }).join('');
  window._comboVarCtx={cb:cb,selecciones:selecciones,varIngs:varIngs,stepV:stepV,varSel:varSel,vars:vars};
  modal2('<div style="text-align:center;margin-bottom:10px">'
      +'<div style="font-size:24px">'+(cb.emoji||'🎁')+'</div>'
      +'<div style="font-weight:800;font-size:15px">'+esc(cb.nombre)+'</div>'
      +'<div style="color:#a855f7;font-size:12px;font-weight:700;margin-top:3px">🎚 ¿De qué tamaño va "'+esc(ing.nombre)+'"?'+(ing.cantidad>1?' (×'+ing.cantidad+')':'')+'</div>'
    +'</div>'+btns);
  setTimeout(function(){
    document.querySelectorAll('[data-act="combo-var-pick"]').forEach(function(b){
      b.onclick=function(){
        var c=window._comboVarCtx;if(!c)return;
        c.varSel[c.stepV]=c.vars[parseInt(this.getAttribute('data-vi'))];
        _comboVarStep(c.cb,c.selecciones,c.varIngs,c.stepV+1,c.varSel);
      };
    });
  },50);
}

// Opens a modal to select specific products for each "categoria" ingredient
function abrirSelectorCombo(cb, catIngs, step, selecciones, varIngs, varSel){
  varIngs=varIngs||[];varSel=varSel||{};
  if(step>=catIngs.length){
    if(varIngs.length){_comboVarStep(cb, selecciones, varIngs, 0, varSel);}
    else confirmarComboEnPedido(cb, selecciones);
    return;
  }
  var ing=catIngs[step];
  var disponibles=menu.filter(function(p){return (p.cat===ing.cat||p.subcat===ing.cat)&&(ventaSinStock||p.stock>0);});
  if(disponibles.length===0){
    closeModal2();
    alert('No hay stock de '+ing.cat+' para este combo.');
    return;
  }
  // Selector de distribución: reparte la cantidad entre los productos de la categoría
  abrirDistribucion({
    titulo:cb.nombre+' · elige '+ing.cantidad+' '+ing.cat,
    emoji:cb.emoji||'🎁',
    total:ing.cantidad,
    productos:disponibles.map(function(p){return {id:p.id,nombre:p.nombre,emoji:p.emoji,precio:p.precio,stock:p.stock};}),
    onConfirm:function(cantidades){
      selecciones.push({catIng:ing, distribucion:cantidades});
      abrirSelectorCombo(cb, catIngs, step+1, selecciones, varIngs, varSel);
    }
  });
}

function confirmarComboEnPedido(cb, selecciones, varSel){
  varSel=varSel||{};
  // Build final ingredient list (expandiendo distribución de categorías y variantes elegidas)
  var finalIngs=[];
  var selIdx=0;
  var varIdx=0;
  cb.ingredientes.forEach(function(ing){
    if(ing.varElegir){
      var vSel=varSel[varIdx++];
      var pV=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});
      if(vSel){
        finalIngs.push({tipo:'producto',prodId:ing.prodId,cantidad:ing.cantidad,
          varianteNombre:vSel.nombre,varianteUnd:parseInt(vSel.und)||1,
          nombre:(pV?pV.nombre:'?')+' ('+vSel.nombre+')',emoji:pV?pV.emoji:'?',und:pV?pV.und:'und'});
      }else{
        finalIngs.push({tipo:'producto',prodId:ing.prodId,cantidad:ing.cantidad,
          nombre:pV?pV.nombre:'?',emoji:pV?pV.emoji:'?',und:pV?pV.und:'und'});
      }
      return;
    }
    if(ing.tipo==='categoria'){
      var sel=selecciones[selIdx++];
      if(sel&&sel.distribucion){
        // Expandir cada producto elegido en su propio ingrediente
        Object.keys(sel.distribucion).forEach(function(pid){
          var q=sel.distribucion[pid];if(!q)return;
          var p=menu.find(function(m){return Number(m.id)===Number(pid);});
          finalIngs.push({tipo:'producto',prodId:Number(pid),cantidad:q,
            nombre:p?p.nombre:'?',emoji:p?p.emoji:'?',und:p?p.und:'und'});
        });
      } else if(sel&&sel.prodId){
        var p2=menu.find(function(m){return m.id===sel.prodId;});
        finalIngs.push({tipo:'producto',prodId:sel.prodId,cantidad:ing.cantidad,
          nombre:p2?p2.nombre:'?',emoji:p2?p2.emoji:'?',und:p2?p2.und:'und'});
      }
    } else {
      finalIngs.push(ing);
    }
  });

  // Check stock
  var ok=finalIngs.every(function(ing){
    if(ing.prodId==null)return true;
    var p=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});
    var necesita=ing.cantidad*(parseInt(ing.varianteUnd)||1);
    return p&&(p.sinStock||ventaSinStock||(parseInt(p.stock)||0)>=necesita);
  });
  if(!ok){alert('Stock insuficiente para alguno de los productos elegidos.');return;}

  var id=mesaActiva.id;
  if(!pedidos[id])pedidos[id]=[];
  // Each combo addition is unique (different product choices) — always push new
  var newItem={
    pid:'combo_'+cb.id+'_'+a52Ahora(),
    uidItem:'it'+a52Ahora().toString(36)+Math.floor(Math.random()*1e6).toString(36),
    cubeta:false,qty:1,isCombo:true,
    comboId:cb.id,comboNombre:cb.nombre,comboEmoji:cb.emoji,
    comboPrecio:cb.precio,comboIngredientes:finalIngs
  };
  pedidos[id].push(newItem);
  var r=ref('pedidos/'+id);if(r)r.set(pedidos[id]);
  logPedido(id,(cb.emoji||'🎁')+' '+cb.nombre+' · '+fmt(cb.precio),1);
  // Descontar stock de los ingredientes (atómico + kardex)
  finalIngs.forEach(function(ing){
    var cant=ing.cantidad||1;
    if(ing.prodId!=null)cambiarStock('p',ing.prodId,-cant,'Mesa: combo '+cb.nombre);
    if(ing.ingId!=null)cambiarStock('i',ing.ingId,-cant,'Mesa: combo '+cb.nombre);
  });
  renderSoloPedido();updateHeader();actualizarColorMesas();
}

// Event delegation for emoji picker - called after render
function bindEmojiPicker(){
  var picker=document.getElementById('emoji-picker');
  if(!picker||picker._bound)return;
  picker._bound=true;
  picker.addEventListener('click',function(e){
    var btn=e.target.closest('[data-ei]');
    if(!btn)return;
    var idx=parseInt(btn.getAttribute('data-ei'));
    selEmoji(EMOJIS[idx]);
  });
}
function toggleCubF(){var cf=document.getElementById('cubf');if(cf)cf.style.display=document.getElementById('f-cerveza').checked?'':'none';}
var _recetaTemp=[];  // temp recipe while editing

function agregarIngReceta(){
  var sel=document.getElementById('rec-ing-sel');
  var cant=parseFloat((document.getElementById('rec-ing-cant')||{}).value)||1;
  if(!sel||!sel.value){alert('Selecciona un ingrediente.');return;}
  var selVal=sel.value;
  if(selVal.startsWith('grp:')){
    var gNom=selVal.slice(4);
    var prodG=editandoProd&&editandoProd!=='nuevo'?menu.find(function(m){return m.id===editandoProd;}):null;
    var recG=prodG?((prodG.receta||[]).slice()):(_recetaTemp||[]).slice();
    var exG=recG.findIndex(function(r){return r.grupo===gNom;});
    if(exG>=0)recG[exG].cantidad+=cant;else recG.push({grupo:gNom,cantidad:cant});
    if(prodG){prodG.receta=recG;var moG={};menu.forEach(function(m){moG[m.id]=m;});fbSet('menu',moG);}
    else _recetaTemp=recG;
    render();return;
  }
  var pid=selVal.startsWith('ing:')?selVal.slice(4):parseInt(selVal.replace('menu:',''));
  // Get current product receta
  var prod=editandoProd&&editandoProd!=='nuevo'?menu.find(function(m){return m.id===editandoProd;}):null;
  if(!prod&&editandoProd!=='nuevo'){alert('Guarda el producto primero.');return;}
  var receta=prod?((prod.receta||[]).slice()):[_recetaTemp.slice()][0]||[];
  var porCada=parseInt((document.getElementById('rec-ing-porcada')||{}).value)||0;
  var exist=receta.findIndex(function(r){return r.pid===pid;});
  if(exist>=0){receta[exist].cantidad+=cant;if(porCada)receta[exist].porCada=porCada;}
  else{var linR={pid:pid,cantidad:cant};if(porCada)linR.porCada=porCada;receta.push(linR);}
  if(prod){
    prod.receta=receta;
    var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);
  } else {
    _recetaTemp=receta;
  }
  sel.value='';
  document.getElementById('rec-ing-cant').value=1;
  render();
}

function guardarProd(){
  var nombre=(document.getElementById('f-nombre')||{}).value;nombre=nombre?nombre.trim():'';
  var precio=moneyVal('f-precio')||0;
  var costo=moneyVal('f-costo')||0;
  var _catSel=(document.getElementById('f-cat-sel')||{}).value||'';
  var cat=(_catSel==='__new__')?(((document.getElementById('f-cat-new')||{}).value||'').trim()):_catSel;
  var _subSel=(document.getElementById('f-subcat-sel')||{}).value||'';
  var subcat=(_subSel==='__new__')?(((document.getElementById('f-subcat-new')||{}).value||'').trim()):_subSel;
  var stock=parseInt((document.getElementById('f-stock')||{}).value)||0;
  var _sinStockF=!!((document.getElementById('f-sinstock')||{}).checked);
  var und=(document.getElementById('f-und')||{}).value||'und';
  var cerv=!!((document.getElementById('f-cerveza')||{}).checked);
  var esComida=!!((document.getElementById('f-comida')||{}).checked);
  var descripcion=((document.getElementById('f-desc')||{}).value||'').trim();
  // Read variantes from dynamic rows
  var variantes=[];
  document.querySelectorAll('[data-vnom]').forEach(function(el){
    var vi=el.getAttribute('data-vnom');
    var nom=el.value.trim();
    var preEl=document.querySelector('[data-vpre="'+vi+'"]');
    var pre=preEl?parseInt(String(preEl.value).replace(/[^0-9]/g,''))||0:0;
    var undEl=document.querySelector('[data-vund="'+vi+'"]');
    var vund=undEl?Math.max(1,parseInt(undEl.value)||1):1;
    var descEl=document.querySelector('[data-vdesc="'+vi+'"]');
    var vdesc=descEl?String(descEl.value||'').trim():'';
    var rapEl=document.querySelector('[data-vrap="'+vi+'"]');
    var vrap=rapEl?parseInt(String(rapEl.value).replace(/[^0-9]/g,''))||0:0;
    if(nom&&pre>0){var vv={nombre:nom,precio:pre,und:vund,desc:vdesc};if(vrap>0)vv.precioRappi=vrap;variantes.push(vv);}
  });
  var precioRappi=moneyVal('f-precio-rappi')||null;
  var cubeta=cerv?(moneyVal('f-cubeta')||null):null;
  var emoji=(document.getElementById('f-emoji')||{}).value||'🍺';
  if(!nombre){alert('Escribe el nombre.');return;}
  if(!precio){alert('Escribe el precio.');return;}
  if(!cat){alert('Escribe la categoría.');return;}
  if(editandoProd==='nuevo'){
    var maxId=0;menu.forEach(function(m){if(m.id>maxId)maxId=m.id;});
    menu.push({id:maxId+1,nombre:nombre,precio:precio,precioRappi:precioRappi,costo:costo,cubeta:cubeta,esCerveza:cerv,esComida:esComida,descripcion:descripcion,variantes:variantes,cat:cat,subcat:subcat,emoji:emoji,stock:stock,und:und,receta:_recetaTemp||[],sinStock:_sinStockF,disponible:true});
    _recetaTemp=[];
  } else {
    for(var i=0;i<menu.length;i++){if(menu[i].id===editandoProd){menu[i]=Object.assign({},menu[i],{nombre:nombre,precio:precio,precioRappi:precioRappi,costo:costo,cubeta:cubeta,esCerveza:cerv,esComida:esComida,descripcion:descripcion,variantes:variantes,cat:cat,subcat:subcat,emoji:emoji,stock:stock,und:und,sinStock:_sinStockF,disponible:menu[i].disponible!==false});break;}}
  }
  a52FotoGuardar(editandoProd==='nuevo'?menu[menu.length-1].id:editandoProd);
  editandoProd=null;var mo={};menu.forEach(function(m){mo[m.id]=m;});fbSet('menu',mo);render();
}

/* ═══════════════ COMBOS ═══════════════ */
function renderCombos(){
  var esAdmin=usuarioActivo&&usuarioActivo.rol==='admin';

  // ── Form ──────────────────────────────
  var formHtml='';
  if(editandoCombo!==null){
    var isNuevo=editandoCombo==='nuevo';
    var c=isNuevo
      ?{nombre:'',precio:'',emoji:'🎁',ingredientes:[]}
      :(combos.find(function(x){return x.id===editandoCombo;})||{nombre:'',precio:'',emoji:'🎁',ingredientes:[]});
    var curEmoji=_comboTemp.emoji||c.emoji||'🎁';

    // Emoji buttons for combos (same EMOJIS list plus 🎁)
    var COMBO_EMOJIS=['🎁','🎉','🍻','🥃','🍺','🍷','🍹','🎊','⭐','🔥','💫','🎯'];
    var emjBtns=COMBO_EMOJIS.map(function(e,i){
      var sel=curEmoji===e;
      return'<button class="emj-btn" data-cei="'+i+'" style="font-size:22px;padding:4px;border:2px solid '+(sel?'#a855f7':'transparent')+';background:'+(sel?'#a855f722':'transparent')+';border-radius:8px;cursor:pointer;transition:all .15s">'+e+'</button>';
    }).join('');

    // Ingredientes actuales del combo (desde _comboTemp = ediciones en vivo)
    var ingRows=(_comboTemp.ingredientes||[]).map(function(ing,idx){
      var esCat=ing.tipo==='categoria';
      var p=esCat?null:menu.find(function(m){return m.id===ing.prodId;});
      var emoji=esCat?'🗂️':(p?p.emoji:'?');
      var label=esCat?('Cualquier '+ing.cat+' (a elección)'):(p?esc(p.nombre):'Producto eliminado');
      var und=esCat?'und':(p?p.und:'und');
      var tagColor=esCat?'#38bdf8':'#a855f7';
      return'<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
        +'<span style="font-size:18px">'+emoji+'</span>'
        +'<div style="flex:1">'
          +'<div style="font-size:13px;font-weight:600">'+label+'</div>'
          +'<span style="background:'+tagColor+'20;color:'+tagColor+';border:1px solid '+tagColor+'33;border-radius:99px;padding:1px 8px;font-size:10px;font-weight:700">'+(esCat?'A elección':(typeof ing!=='undefined'&&ing&&ing.varElegir?'🎚 Tamaño a elección':'Específico'))+'</span>'
        +'</div>'
        +'<div style="display:flex;align-items:center;gap:5px">'
        +'<span style="color:var(--muted);font-size:11px">×</span>'
        +'<input type="number" min="1" value="'+ing.cantidad+'" data-cidx="'+idx+'"'
        +' onchange="cambiarCantIngCombo('+idx+',this.value)"'
        +' style="width:55px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 8px;color:var(--text);font-size:13px;text-align:center;outline:none"/>'
        +'<span style="color:var(--muted);font-size:11px">'+und+'</span>'
        +'<button onclick="quitarIngCombo('+idx+')" style="background:#ef444418;color:#ef4444;border:none;border-radius:5px;padding:3px 8px;cursor:pointer;font-size:12px;font-weight:700">✕</button>'
        +'</div></div>';
    }).join('');

    // Selector para agregar ingrediente
    var cats=menu.reduce(function(a,m){if(a.indexOf(m.cat)<0)a.push(m.cat);return a;},[]).sort();
    var prodOpts='<option value="">— Producto específico —</option>'
      +cats.map(function(cat){
        var prods=menu.filter(function(m){return m.cat===cat;});
        return'<optgroup label="'+esc(cat)+'">'+prods.map(function(p){
          return'<option value="prod:'+p.id+'">'+p.emoji+' '+esc(p.nombre)+(p.sinStock?'':' (stock: '+p.stock+')')+'</option>';
        }).join('')+'</optgroup>';
      }).join('')
      +(ingredientes.length?'<optgroup label="🧂 Ingredientes cocina">'+ingredientes.map(function(i){
        return'<option value="ing:'+i.id+'">🧂 '+esc(i.nombre)+' (stock: '+i.stock+')</option>';
      }).join('')+'</optgroup>':'');
    var _subcatsCombo=menu.reduce(function(a,m){if(m.subcat&&a.indexOf(m.subcat)<0)a.push(m.subcat);return a;},[]).sort();
    var catOpts2='<option value="">— Categoría / subcategoría a elección —</option>'
      +'<optgroup label="Categorías">'
      +cats.map(function(cat){
        return'<option value="cat:'+esc(cat)+'">'+cat+' (cualquiera)</option>';
      }).join('')
      +'</optgroup>'
      +(_subcatsCombo.length?'<optgroup label="Subcategorías">'
        +_subcatsCombo.map(function(sc){return'<option value="cat:'+esc(sc)+'">'+esc(sc)+' (cualquiera)</option>';}).join('')
        +'</optgroup>':'');

    // Costo aproximado
    var costoAprox=(_comboTemp.ingredientes||[]).reduce(function(a,ing){return a+_precioIngCombo(ing);},0);
    var precio=parseInt(c.precio)||0;

    formHtml='<div class="card2" style="border-color:var(--accent)44;margin-bottom:16px">'
      +'<div style="color:var(--accent);font-weight:800;font-size:14px;margin-bottom:14px">'+(isNuevo?'🎁 Nuevo combo':'✏️ Editar: '+esc(c.nombre||''))+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Nombre del combo *</div>'
          +'<input class="inp" id="cb-nombre" value="'+esc(_comboTemp.nombre!=null?_comboTemp.nombre:(c.nombre||''))+'" placeholder="Ej: Combo Rumba, Happy Hour..."/></div>'
        +'<div><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Precio de venta (COP) *</div>'
          +'<input class="inp money" id="cb-precio" type="text" value="'+moneyFmt(_comboTemp.precio!=null&&_comboTemp.precio!==''?_comboTemp.precio:(c.precio||''))+'" placeholder="0" inputmode="numeric" oninput="actualizarInfoCombo()"/></div>'
      +'</div>'
      // Info de ahorro
      +(costoAprox>0?'<div style="display:flex;gap:10px;margin-bottom:12px">'
        +'<div style="flex:1;background:var(--bg);border-radius:9px;padding:8px 12px;text-align:center">'
          +'<div style="color:var(--muted);font-size:10px">Costo aprox. (suma precios)</div>'
          +'<div style="color:#38bdf8;font-weight:800;font-size:14px" id="cb-costo">'+fmt(costoAprox)+'</div>'
        +'</div>'
        +(precio>0?'<div style="flex:1;background:var(--bg);border-radius:9px;padding:8px 12px;text-align:center">'
          +'<div style="color:var(--muted);font-size:10px">Ahorro para el cliente</div>'
          +'<div style="color:#22c55e;font-weight:800;font-size:14px" id="cb-ahorro">'+fmt(Math.max(0,costoAprox-precio))+'</div>'
        +'</div>':'')
      +'</div>':''+'<div id="cb-info-row" style="margin-bottom:12px"></div>')
      // Emoji
      +'<div style="margin-bottom:12px">'
        +'<div style="color:var(--muted);font-size:11px;margin-bottom:6px">Icono del combo</div>'
        +'<div class="emoji-grid" id="combo-emoji-picker">'+emjBtns+'</div>'
        +'<input type="hidden" id="cb-emoji" value="'+esc(curEmoji)+'"/>'
      +'</div>'
      // Ingredientes
      +'<div style="margin-bottom:12px">'
        +'<div style="color:var(--muted);font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Ingredientes (qué descuenta del inventario)</div>'
        +(ingRows?ingRows:'<div style="color:var(--dim);font-size:12px;text-align:center;padding:12px;background:var(--bg);border-radius:8px">Sin ingredientes — agrega productos abajo</div>')
        +'<div style="background:var(--bg);border-radius:10px;padding:10px;margin-top:10px;border:1px solid var(--border)">'
          +'<div style="color:var(--muted);font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Agregar ingrediente al combo</div>'
          // Tab-like selector: producto específico vs categoría
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
            +'<div>'
              +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">Producto específico</div>'
              +'<select class="inp inp-sm" id="cb-prod-sel" onchange="limpiarCatSel()">'+prodOpts+'</select>'
            +'</div>'
            +'<div>'
              +'<div style="color:var(--muted);font-size:11px;margin-bottom:3px">O categoría a elección</div>'
              +'<select class="inp inp-sm" id="cb-cat-sel" onchange="limpiarProdSel()">'+catOpts2+'</select>'
            +'</div>'
          +'</div>'
          +'<div style="display:flex;gap:8px;align-items:flex-end">'
            +'<div style="flex:1"><div style="color:var(--muted);font-size:11px;margin-bottom:3px">Cantidad que descuenta</div>'
              +'<input class="inp inp-sm" id="cb-prod-cant" type="number" min="1" value="1" placeholder="1"/></div>'
            +'<button class="btn btn-sm btn-blue" onclick="agregarIngCombo()">+ Agregar al combo</button>'
          +'</div>'
          +'<div style="color:var(--muted);font-size:10px;margin-top:6px">💡 "Categoría a elección" = el cliente elige qué producto específico quiere (ej: 5 cervezas de cualquier marca)</div>'
        +'</div>'
      +'</div>'
      +'<div style="display:flex;gap:8px">'
        +'<button class="btn btn-green btn-full" onclick="guardarCombo()">💾 Guardar combo</button>'
        +'<button class="btn btn-outline btn-full" onclick="cancelarCombo()">Cancelar</button>'
      +'</div></div>';
  } else {
    formHtml='<div class="mb12"><button class="btn btn-sm btn-green" onclick="nuevoCombo()">🎁 Nuevo combo</button></div>';
  }

  // ── Lista de combos ───────────────────
  var lista=combos.length===0
    ?'<div style="color:var(--dim);text-align:center;padding:24px;font-size:13px;background:var(--card);border-radius:12px;border:1px solid var(--border)">Sin combos creados aún</div>'
    :'<div class="prod-grid">'+combos.map(function(cb){
      // Check stock availability
      var disponible=comboDisponible(cb);
      var ingList=cb.ingredientes.map(function(ing){
        if(ing.tipo==='categoria'){
          return'<div style="font-size:11px;color:#38bdf8">🗂️ '+esc(ing.cat)+' ×'+ing.cantidad+' (a elección)</div>';
        }
        var p=menu.find(function(m){return m.id===ing.prodId;});
        return'<div style="font-size:11px;color:var(--muted)">'+(p?p.emoji+' ':'')+esc((p&&p.nombre)||'?')+' ×'+ing.cantidad+'</div>';
      }).join('');
      return'<div class="prod-card" style="border-color:'+(editandoCombo===cb.id?'var(--accent)':'var(--border)')+(disponible?'':';opacity:.5')+'">'
        +'<span style="font-size:28px">'+cb.emoji+'</span>'
        +'<div style="flex:1">'
          +'<div style="font-weight:800;font-size:13px">'+esc(cb.nombre)+'</div>'
          +'<div style="color:var(--gold);font-size:15px;font-weight:900;margin:2px 0">'+fmt(cb.precio)+'</div>'
          +ingList
          +(disponible
            ?'<div style="color:#22c55e;font-size:10px;margin-top:3px;font-weight:700">✓ Disponible</div>'
            :'<div style="color:#ef4444;font-size:10px;margin-top:3px;font-weight:700">✗ Stock insuficiente</div>')
        +'</div>'
        +(esAdmin?'<div style="display:flex;flex-direction:column;gap:4px">'
          +'<button data-act="editcombo" data-cbid="'+cb.id+'" style="background:#38bdf818;color:#38bdf8;border:none;border-radius:6px;padding:4px 9px;cursor:pointer;font-size:11px;font-weight:700">✏️</button>'
          +'<button data-act="delcombo" data-cbid="'+cb.id+'" style="background:#ef444418;color:#ef4444;border:none;border-radius:6px;padding:4px 9px;cursor:pointer;font-size:11px;font-weight:700">🗑</button>'
          +'</div>':'')
        +'</div>';
    }).join('')+'</div>';

  return formHtml
    +(combos.length?'<div class="section-title" style="margin-bottom:10px">Combos disponibles ('+combos.length+')</div>':'')
    +lista;
}

// Temp storage while editing a combo
var _comboTemp={ingredientes:[]};

function nuevoCombo(){
  editandoCombo='nuevo';
  _comboTemp={ingredientes:[],nombre:'',precio:'',emoji:'🎁'};
  render();setTimeout(bindComboEmojiPicker,50);
}
function cancelarCombo(){editandoCombo=null;render();}
function editarCombo(id){
  editandoCombo=id;
  var c=combos.find(function(x){return x.id===id;});
  _comboTemp={ingredientes:c?JSON.parse(JSON.stringify(c.ingredientes)):[],nombre:c?c.nombre:'',precio:c?c.precio:'',emoji:c?c.emoji:'🎁'};
  render();setTimeout(bindComboEmojiPicker,50);
}
function borrarCombo(id){
  if(!confirm('¿Eliminar este combo?'))return;
  combos=combos.filter(function(c){return c.id!==id;});
  var co={};combos.forEach(function(c){co[c.id]=c;});fbSet('combos',co);render();
}

function bindComboEmojiPicker(){
  var picker=document.getElementById('combo-emoji-picker');
  if(!picker||picker._bound)return;
  picker._bound=true;
  picker.addEventListener('click',function(e){
    var btn=e.target.closest('[data-cei]');if(!btn)return;
    var COMBO_EMOJIS=['🎁','🎉','🍻','🥃','🍺','🍷','🍹','🎊','⭐','🔥','💫','🎯'];
    var e2=COMBO_EMOJIS[parseInt(btn.getAttribute('data-cei'))];
    if(!e2)return;
    var hid=document.getElementById('cb-emoji');if(hid)hid.value=e2;
    picker.querySelectorAll('[data-cei]').forEach(function(b){
      var sel=b===btn;
      b.style.background=sel?'#a855f722':'transparent';
      b.style.border=sel?'2px solid #a855f7':'2px solid transparent';
    });
  });
}

function limpiarCatSel(){var s=document.getElementById('cb-cat-sel');if(s)s.value='';}
function limpiarProdSel(){var s=document.getElementById('cb-prod-sel');if(s)s.value='';}

function _capturarCombo(){
  var n=document.getElementById('cb-nombre');if(n)_comboTemp.nombre=n.value;
  var p=document.getElementById('cb-precio');if(p)_comboTemp.precio=p.value;
  var e=document.getElementById('cb-emoji');if(e)_comboTemp.emoji=e.value;
}

function _precioIngCombo(ing){
  // Precio de lista real de una línea del combo (para el costo aproximado)
  if(ing.ingId!=null)return 0;   // insumos de cocina no tienen precio de venta
  var p=menu.find(function(m){return Number(m.id)===Number(ing.prodId);});
  if(ing.tipo==='categoria'){
    // Promedio de la categoría como aproximación
    var cat=menu.filter(function(m){return m.cat===ing.cat||m.subcat===ing.cat;});
    if(!cat.length)return 0;
    var prom=cat.reduce(function(a,m){return a+(m.precio||0);},0)/cat.length;
    return Math.round(prom)*ing.cantidad;
  }
  if(!p)return 0;
  if(ing.varianteNombre){
    var v=(p.variantes||[]).find(function(x){return x.nombre===ing.varianteNombre;});
    if(v&&v.precio)return v.precio*ing.cantidad;      // 🎯 precio de la variante fijada (Alitas x16 = 40.000)
  }
  if(ing.varElegir){
    var precios=(p.variantes||[]).map(function(x){return x.precio||0;}).filter(Boolean);
    if(precios.length)return Math.min.apply(null,precios)*ing.cantidad;  // el menor, como piso
  }
  return (p.precio||0)*ing.cantidad;
}
function abrirVarianteIngCombo(prodId,cant){
  var p=menu.find(function(m){return m.id===prodId;});if(!p)return;
  var btns=(p.variantes||[]).map(function(v,vi){
    return'<button onclick="elegirVarianteIngCombo('+prodId+','+vi+','+cant+')" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:var(--bg);border:1px solid var(--border);border-radius:11px;padding:12px 15px;margin-bottom:8px;cursor:pointer;color:var(--text)">'
      +'<span style="font-weight:800;font-size:14px">'+(p.emoji||'🍽')+' '+esc(v.nombre)+'</span>'
      +'<span style="color:var(--muted);font-size:11px">'+(v.und||1)+' und'+(v.precio?' · '+fmt(v.precio).replace(/\u00A0/g,' '):'')+'</span>'
    +'</button>';
  }).join('');
  modal2('<div style="text-align:center;margin-bottom:10px">'
      +'<div style="font-size:24px">'+(p.emoji||'🍽')+'</div>'
      +'<div style="font-weight:800;font-size:15px">'+esc(p.nombre)+' al combo'+(cant>1?' (×'+cant+')':'')+'</div>'
      +'<div style="color:var(--muted);font-size:11.5px;margin-top:3px">¿De qué tamaño va en este combo?</div>'
    +'</div>'
    +btns
    +'<button onclick="elegirVarianteIngCombo('+prodId+',-1,'+cant+')" style="width:100%;background:#a855f715;border:1px dashed #a855f766;border-radius:11px;padding:11px;margin-top:4px;cursor:pointer;color:#a855f7;font-weight:800;font-size:12.5px">🎚 Que el cliente elija el tamaño al pedirlo</button>');
}
function elegirVarianteIngCombo(prodId,vi,cant){
  var p=menu.find(function(m){return m.id==prodId;});if(!p)return;
  if(vi<0){
    _comboTemp.ingredientes.push({tipo:'producto',prodId:Number(prodId),cantidad:cant,varElegir:true,
      nombre:p.nombre,emoji:p.emoji,und:p.und||'und'});
  }else{
    var v=(p.variantes||[])[vi];if(!v)return;
    _comboTemp.ingredientes.push({tipo:'producto',prodId:Number(prodId),cantidad:cant,
      varianteNombre:v.nombre,varianteUnd:parseInt(v.und)||1,variantePrecio:v.precio||0,
      nombre:p.nombre+' ('+v.nombre+')',emoji:p.emoji,und:p.und||'und'});
  }
  closeModal2();
  render();
}
function agregarIngCombo(){
  _capturarCombo();
  var prodSel=document.getElementById('cb-prod-sel');
  var catSel=document.getElementById('cb-cat-sel');
  var cantEl=document.getElementById('cb-prod-cant');
  if(!cantEl)return;
  var cant=parseInt(cantEl.value)||1;
  if(cant<1){alert('La cantidad debe ser al menos 1.');return;}

  var prodVal=prodSel?prodSel.value:'';
  var catVal=catSel?catSel.value:'';

  if(!prodVal&&!catVal){alert('Selecciona un producto específico o una categoría.');return;}

  if(prodVal){
    if(prodVal.startsWith('ing:')){
      // Ingrediente cocina
      var ingId=prodVal.replace('ing:','');
      var ingItem=ingredientes.find(function(i){return i.id===ingId;});
      if(!ingItem){alert('Ingrediente no encontrado.');return;}
      var existeI=_comboTemp.ingredientes.findIndex(function(i){return i.tipo==='ingrediente'&&i.ingId===ingId;});
      if(existeI>=0){_comboTemp.ingredientes[existeI].cantidad+=cant;}
      else{_comboTemp.ingredientes.push({tipo:'ingrediente',ingId:ingId,cantidad:cant,
        nombre:ingItem.nombre,emoji:'🧂',und:ingItem.und});}
    } else {
      // Specific product: value = "prod:ID"
      var prodId=parseInt(prodVal.replace('prod:',''));
      if(!prodId){alert('Selecciona un producto válido.');return;}
      var p=menu.find(function(m){return m.id===prodId;});
      if(p&&p.variantes&&p.variantes.length){
        // 🎚 El producto tiene tamaños: TÚ eliges cuál va en el combo (o lo dejas a elección del cliente)
        abrirVarianteIngCombo(prodId,cant);
        return;
      }
      var existe=_comboTemp.ingredientes.findIndex(function(i){return i.tipo==='producto'&&i.prodId===prodId&&!i.varElegir&&!i.varianteNombre;});
      if(existe>=0){_comboTemp.ingredientes[existe].cantidad+=cant;}
      else{
        _comboTemp.ingredientes.push({tipo:'producto',prodId:prodId,cantidad:cant,
          nombre:p?p.nombre:'?',emoji:p?p.emoji:'?',und:p?p.und:'und'});
      }
    }
  } else {
    // Category: value = "cat:Cervezas"
    var cat=catVal.replace('cat:','');
    var existe2=_comboTemp.ingredientes.findIndex(function(i){return i.tipo==='categoria'&&i.cat===cat;});
    if(existe2>=0){_comboTemp.ingredientes[existe2].cantidad+=cant;}
    else{_comboTemp.ingredientes.push({tipo:'categoria',cat:cat,cantidad:cant});}
  }

  if(prodSel)prodSel.value='';
  if(catSel)catSel.value='';
  cantEl.value=1;
  showToast('✓ Ingrediente agregado al combo','#22c55e');
  render();setTimeout(bindComboEmojiPicker,50);
}

function quitarIngCombo(idx){
  _capturarCombo();
  _comboTemp.ingredientes.splice(idx,1);
  render();setTimeout(bindComboEmojiPicker,50);
}

function cambiarCantIngCombo(idx,val){
  var cant=parseInt(val)||1;
  if(cant<1)cant=1;
  _comboTemp.ingredientes[idx].cantidad=cant;
}

function actualizarInfoCombo(){
  var precio=moneyVal('cb-precio')||0;
  var costoEl=document.getElementById('cb-costo');
  var ahorroEl=document.getElementById('cb-ahorro');
  if(costoEl){
    var costoAprox=_comboTemp.ingredientes.reduce(function(a,ing){return a+_precioIngCombo(ing);},0);
    costoEl.textContent=fmt(costoAprox);
    if(ahorroEl)ahorroEl.textContent=fmt(Math.max(0,costoAprox-precio));
  }
}

function guardarCombo(){
  var nombre=((document.getElementById('cb-nombre')||{}).value||'').trim();
  var precio=moneyVal('cb-precio')||0;
  var emoji=(document.getElementById('cb-emoji')||{}).value||'🎁';
  if(!nombre){alert('Escribe el nombre del combo.');return;}
  if(!precio||precio<=0){alert('Escribe el precio de venta.');return;}
  if(!_comboTemp.ingredientes.length){alert('Agrega al menos un ingrediente al combo.');return;}
  var obj={
    id:editandoCombo==='nuevo'?'cb'+a52Ahora():editandoCombo,
    nombre:nombre,precio:precio,emoji:emoji,
    ingredientes:JSON.parse(JSON.stringify(_comboTemp.ingredientes))
  };
  if(editandoCombo==='nuevo'){combos.push(obj);}
  else{var idx=combos.findIndex(function(c){return c.id===editandoCombo;});if(idx>=0)combos[idx]=obj;}
  var co={};combos.forEach(function(c){co[c.id]=c;});fbSet('combos',co);
  editandoCombo=null;render();
}


