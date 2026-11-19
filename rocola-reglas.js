/* Reglas de la rocola: las comparten la página de clientes (rocola.html) y la consola del DJ (dj.html).
   Los valores de fábrica están aquí; el DJ los cambia en «⚙️ Reglas» y quedan en Firebase (config/dj). */
var RR_DEF={
  maxMin:8,            // minutos máximos por canción (mixes y conciertos largos no entran)
  maxPorMesa:3,        // canciones en la fila por mesa al mismo tiempo
  sinRepetirHoras:8,   // horas antes de que la música automática repita una canción
  fundido:3,           // segundos de fundido entre canciones (0 = sin fundido)
  palabras:['explicit','explicito','sin censura'],   // títulos con estas palabras no se pueden pedir
  // Música automática según la hora (cuando nadie ha pedido). Fuera de estas franjas suena de todo.
  franjas:[
    {ini:16,fin:20,nombre:'Para arrancar',generos:['Pop','Crossover','Rock','Vallenato']},
    {ini:20,fin:23,nombre:'Calentando',generos:['Crossover','Reggaetón','Salsa','Vallenato','Pop']},
    {ini:23,fin:3,nombre:'Hora pico',generos:['Reggaetón','Salsa','Crossover','Electrónica','Popular']}
  ]
};
var RR=JSON.parse(JSON.stringify(RR_DEF));
function rrLista(v){if(!v)return [];return Array.isArray(v)?v.filter(function(x){return x!=null;}):Object.keys(v).map(function(k){return v[k];});}
function rrAplicar(v){
  RR=JSON.parse(JSON.stringify(RR_DEF));
  if(!v||typeof v!=='object')return RR;
  ['maxMin','maxPorMesa','sinRepetirHoras','fundido'].forEach(function(k){var n=Number(v[k]);if(v[k]!==''&&v[k]!=null&&!isNaN(n)&&n>=0)RR[k]=n;});
  if(v.palabras!=null)RR.palabras=rrLista(v.palabras).map(String).filter(Boolean);
  if(v.franjas!=null)RR.franjas=rrLista(v.franjas).map(function(f){return {ini:Number(f.ini)||0,fin:Number(f.fin)||0,nombre:String(f.nombre||''),generos:rrLista(f.generos).map(String)};});
  return RR;
}
function rrNorm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ]+/g,' ').trim();}
// Devuelve la palabra prohibida que trae el título, o '' si no trae ninguna (palabra o frase completa)
function rrPalabra(titulo){
  var t=' '+rrNorm(titulo)+' ';
  for(var i=0;i<RR.palabras.length;i++){var p=rrNorm(RR.palabras[i]);if(p&&t.indexOf(' '+p+' ')>=0)return RR.palabras[i];}
  return '';
}
// Franja de la hora indicada (o de ahora); las que pasan de medianoche (23 a 3) también sirven
function rrFranja(d){
  var h=(d||new Date()).getHours();
  for(var i=0;i<RR.franjas.length;i++){var f=RR.franjas[i];if(f.ini===f.fin)continue;
    if(f.ini<f.fin?(h>=f.ini&&h<f.fin):(h>=f.ini||h<f.fin))return f;}
  return null;
}
// "PT1H2M3S" → segundos
function rrSegundos(iso){var m=String(iso||'').match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);if(!m)return 0;return (+m[1]||0)*86400+(+m[2]||0)*3600+(+m[3]||0)*60+(+m[4]||0);}
function rrMin(seg){var m=Math.floor(seg/60),s=seg%60;return m+':'+(s<10?'0':'')+s;}
// Franjas en texto (una por línea) para editarlas: "16-20 Para arrancar: Pop, Crossover"
function rrFranjasTxt(fs){return rrLista(fs).map(function(f){return f.ini+'-'+f.fin+' '+(f.nombre||'')+': '+rrLista(f.generos).join(', ');}).join('\n');}
function rrFranjasLeer(txt){
  var out=[],err='';
  String(txt||'').split('\n').forEach(function(l,i){
    l=l.trim();if(!l)return;
    var m=l.match(/^(\d{1,2})\s*-\s*(\d{1,2})\s*([^:]*):\s*(.+)$/);
    if(!m||+m[1]>23||+m[2]>24){err=err||('Línea '+(i+1)+': escríbala así → 16-20 Para arrancar: Pop, Crossover');return;}
    out.push({ini:+m[1],fin:(+m[2])%24,nombre:m[3].trim()||('De '+m[1]+' a '+m[2]),generos:m[4].split(',').map(function(g){return g.trim();}).filter(Boolean)});
  });
  return {franjas:out,error:err};
}
