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
    "tarjetasMesas": [
      6,
      10,
      10
    ],
    "serviciosSemilla": {
      "agua": {
        "diaRecibo": 2,
        "diaSuspension": 22,
        "frecuencia": "bimestral",
        "cuenta": "11686180 · pago: 12559293910",
        "recibos": {
          "r1": {
            "id": "r1",
            "ts": 1771131600000,
            "periodo": "ENE-FEB 2026",
            "valor": 235892,
            "consumo": 17
          },
          "r2": {
            "id": "r2",
            "ts": 1776229200000,
            "periodo": "FEB-ABR 2026",
            "valor": 259979,
            "consumo": 19
          },
          "r3": {
            "id": "r3",
            "ts": 1781499600000,
            "periodo": "ABR-JUN 2026",
            "valor": 407369,
            "consumo": 31
          },
          "r4": {
            "id": "r4",
            "ts": 1788325200000,
            "periodo": "JUN-AGO 2026",
            "valor": 302920,
            "consumo": 21,
            "limite": "2026-09-17",
            "suspension": "2026-09-22"
          }
        }
      },
      "gas": {
        "diaRecibo": 11,
        "diaSuspension": 25,
        "frecuencia": "mensual",
        "factor": 0.90529,
        "cuenta": "62219304",
        "recibos": {
          "g1": {
            "id": "g1",
            "ts": 1786424400000,
            "periodo": "JUL-AGO 2026",
            "valor": 1149540,
            "consumo": 417,
            "limite": "2026-08-24",
            "suspension": "2026-08-25",
            "lecturaIni": 15320,
            "lecturaFin": 15781
          }
        },
        "lecturas": {
          "l1": {
            "id": "l1",
            "ts": 1783400400000,
            "fecha": "2026-07-07",
            "valor": 15320,
            "uidNombre": "Vanti (factura)"
          },
          "l2": {
            "id": "l2",
            "ts": 1786078800000,
            "fecha": "2026-08-07",
            "valor": 15781,
            "uidNombre": "Vanti (factura)"
          }
        }
      },
      "luz": {
        "diaRecibo": 8,
        "diaSuspension": 21,
        "frecuencia": "mensual",
        "factor": 1,
        "cuenta": "2692722-8",
        "recibos": {
          "e1": {
            "id": "e1",
            "ts": 1762578000000,
            "periodo": "OCT-NOV 2025",
            "valor": 460070,
            "consumo": 467,
            "limite": "2025-11-19",
            "suspension": "2025-11-21",
            "lecturaIni": 41335,
            "lecturaFin": 41802
          }
        },
        "lecturas": {
          "k1": {
            "id": "k1",
            "ts": 1759554000000,
            "fecha": "2025-10-04",
            "valor": 41335,
            "uidNombre": "Enel (factura)"
          },
          "k2": {
            "id": "k2",
            "ts": 1762232400000,
            "fecha": "2025-11-04",
            "valor": 41802,
            "uidNombre": "Enel (factura)"
          }
        }
      }
    },
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
