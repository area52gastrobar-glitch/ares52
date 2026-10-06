/* negocio.js — Área 52 Gastro Bar
   Es el ÚNICO archivo que cambia de un negocio a otro: nombre, contacto, logo, colores y la conexión a su base.
   Las imágenes van en esta misma carpeta, con nombres que empiezan por marca-. El resto de archivos es el programa y es igual para todos. */
window.NEGOCIO={
  "id": "area52",
  "nombre": "ÁREA 52",
  "nombreCorto": "Área 52",
  "tipo": "Gastro Bar",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "lema": "Craft beer · Coctelería · Gastronomía",
  "direccion": "Calle 53 # 85H – 10",
  "mapa": "https://maps.google.com/?q=Calle+53+%2385H-10+Bogota",
  "telefono": "3213502772",
  "whatsapp": "573213502772",
  "correo": "Area52.gastrobar@gmail.com",
  "instagram": "area52.gastrobar",
  "tiktok": "area.52.gastro.ba",
  "horario": "Martes a sábado, de 2:00 p. m. a 3:00 a. m.",
  "desde": "2023",
  "tema": "espacial",
  "logo": "marca-logo.jpg",
  "logoGrande": "marca-logo.jpg",
  "fondos": [
    "marca-fondo1.jpg",
    "marca-fondo2.jpg",
    "marca-fondo3.jpg",
    "marca-fondo4.jpg"
  ],
  "enlaces": [
    {
      "icono": "🎬",
      "titulo": "Video Publicitario",
      "desc": "Conoce todos nuestros productos",
      "url": "Area52-Video.html"
    }
  ],
  "videoPromo": "Area52-Video.html",
  "rocolaPinStaff": "5252",
  "llamadoMotivos": [
    "Que venga a la mesa",
    "Quiero pedir",
    "Otra ronda igual",
    "La cuenta, por favor"
  ],
  "modulos": {
    "rocola": true,
    "llamar": true
  },
  "pos": {
    "zonas": [
      {
        "id": "antejardín",
        "label": "Antejardín",
        "emoji": "🌿",
        "color": "#22c55e"
      },
      {
        "id": "piso1",
        "label": "Piso 1",
        "emoji": "🏠",
        "color": "#a855f7"
      },
      {
        "id": "piso2",
        "label": "Piso 2",
        "emoji": "🏠",
        "color": "#38bdf8"
      }
    ],
    "mesasIniciales": [
      4,
      10,
      8
    ],
    "socios": [
      {
        "id": "JAVIER",
        "color": "#a855f7"
      },
      {
        "id": "CARLOS",
        "color": "#38bdf8"
      }
    ],
    "socioDialogo": "CARLOS",
    "modulos": {}
  },
  "colores": {},
  "firebase": {
    "apiKey": "AIzaSyDbAU2pyYucDTBtm6TIxCfgkyzmnhYvJBU",
    "authDomain": "area52bar-a36aa.firebaseapp.com",
    "databaseURL": "https://area52bar-a36aa-default-rtdb.firebaseio.com",
    "projectId": "area52bar-a36aa",
    "storageBucket": "area52bar-a36aa.firebasestorage.app",
    "messagingSenderId": "79314921682",
    "appId": "1:79314921682:web:abfa44eefbd0df7441250b"
  }
};
