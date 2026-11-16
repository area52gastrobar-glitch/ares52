/* ═══════════ 📥 DESCARGAS DENTRO DE LA APP DE ANDROID ═══════════
   El navegador interno de la app no sabe guardar los archivos que arma la página (Excel de ventas, CSV…):
   se toca el botón y no pasa nada. Aquí se atrapan esas descargas y se entregan a la app, que las deja en
   Descargas y ofrece abrirlas o enviarlas. En el navegador o el computador no cambia nada. */
(function(){
  function enApp(){var C=window.Capacitor;return !!(C&&C.isNativePlatform&&C.isNativePlatform());}
  var blobs={},crear=URL.createObjectURL;
  URL.createObjectURL=function(b){var u=crear.apply(URL,arguments);try{if(b instanceof Blob){blobs[u]=b;var k=Object.keys(blobs);if(k.length>6)delete blobs[k[0]];}}catch(e){}return u;};
  function nativo(m,d){
    var C=window.Capacitor,o=C.Plugins&&C.Plugins.Archivos,p;
    if(o&&typeof o[m]==='function')p=o[m](d);
    else if(typeof C.nativePromise==='function')p=C.nativePromise('Archivos',m,d);
    else p=Promise.reject(new Error('sin puente'));
    return Promise.race([p,new Promise(function(_,no){setTimeout(function(){no(new Error('sin respuesta'));},15000);})]);
  }
  function aviso(nombre){
    var dir=location.origin+location.pathname;
    modal2('<div style="font-weight:800;font-size:16px;margin-bottom:8px">📥 Falta actualizar la app</div>'
      +'<div style="font-size:13.5px;line-height:1.5;margin-bottom:10px">Esta versión de la app todavía no sabe guardar archivos en el teléfono, por eso <b>'+esc(nombre)+'</b> no se descargó.</div>'
      +'<div style="font-size:13px;line-height:1.5;color:var(--muted);margin-bottom:12px">Mientras instala la app nueva, descárguelo abriendo el sistema en Chrome o en el computador:</div>'
      +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:9px;font-size:12px;word-break:break-all;margin-bottom:12px">'+esc(dir)+'</div>'
      +'<button class="btn" style="width:100%" onclick="closeModal2()">Entendido</button>');
  }
  function entregar(blob,nombre){
    var r=new FileReader();
    r.onload=function(){
      var b64=String(r.result).split(',')[1]||'';
      if(typeof showToast==='function')showToast('📥 Preparando '+nombre+'…','#38bdf8',2500);
      nativo('guardar',{nombre:nombre,base64:b64,tipo:blob.type||'application/octet-stream'}).then(function(x){
        if(typeof showToast==='function')showToast(x&&x.descargas?'✅ Guardado en Descargas: '+nombre:'✅ Listo: '+nombre,'#22c55e',4500);
      }).catch(function(){aviso(nombre);});
    };
    r.onerror=function(){aviso(nombre);};
    r.readAsDataURL(blob);
  }
  function atrapar(a){
    if(!enApp()||!a||!a.hasAttribute||!a.hasAttribute('download'))return false;
    var h=a.href||'';
    if(h.indexOf('blob:')!==0&&h.indexOf('data:')!==0)return false;
    var nombre=a.getAttribute('download')||'archivo';
    if(blobs[h]){entregar(blobs[h],nombre);return true;}
    fetch(h).then(function(x){return x.blob();}).then(function(b){entregar(b,nombre);}).catch(function(){aviso(nombre);});
    return true;
  }
  var clic=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){if(atrapar(this))return;return clic.apply(this,arguments);};
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[download]');if(a&&atrapar(a))e.preventDefault();},true);
  window._descargaEnApp=atrapar;
})();
