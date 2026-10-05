## Área 52 — Cerrar la base de datos con aprobación de equipos

## Qué pasa hoy

Las reglas de la base están así: `".read": true, ".write": true`. Cualquier persona que conozca la dirección de la base (está escrita dentro de la carta pública) puede leer todo —ventas, gastos, consumos de socios, avisos de pago del banco y los PIN— y también cambiarlo o borrarlo, sin abrir el POS y sin PIN. El PIN solo protege la pantalla, no los datos.

## Cómo queda

Nadie escribe correos ni contraseñas. La base solo atiende a los **equipos que un administrador aprobó**. Cuando un equipo nuevo abre el POS, pide un nombre («Celular de Laura») y queda en «Esperando aprobación» mostrando un código de cuatro letras. Al administrador le aparece un aviso en su pantalla con ese nombre y ese código: un toque en **Aprobar** y el equipo entra solo. De ahí en adelante se usa el PIN de siempre.

Hay dos clases de equipo. El **normal** (celulares de meseros, cocina, impresora, DJ) trabaja pero no puede aprobar a otros. El de **administración** (la caja, el celular de un socio) es el único que puede aprobar, quitar equipos y dar administración. Esto lo controla la base, no la pantalla.

La carta, la página de enlaces y la rocola de los clientes siguen abiertas al público. Un cliente solo puede pedir canciones: no puede borrar ni cambiar nada.

Los archivos nuevos funcionan también con las reglas actuales. Se pueden subir desde ya sin que el bar note nada; el cierre real ocurre en el paso 6 y se devuelve en un minuto.

## Paso 1 — Copia de seguridad (hoy mismo)

Consola de Firebase → *Realtime Database* → menú de tres puntos (⋮) → **Exportar JSON**. Guarde ese archivo en un lugar seguro: contiene datos del negocio.

## Paso 2 — Habilitar la identificación de equipos

Consola de Firebase → **Authentication** → *Comenzar* → pestaña *Sign-in method* → **Anónimo** → Habilitar → Guardar. No hay que crear usuarios ni contraseñas: cada equipo recibe solo un identificador propio.

## Paso 3 — Subir los archivos

Suba a GitHub, reemplazando los actuales: `Area52-POS.html`, `Area52-DJ.html`, `Area52-Impresora.html`, `Area52_TarjetasMesa.html` y `Area52-Musica.html`. Los demás no cambian. El bar sigue funcionando igual.

## Paso 4 — Autorizar los equipos de administración

En la **caja**: entrar al POS como administrador → pestaña **Admin** → tarjeta *Equipos autorizados* → **Autorizar este equipo** → escribir el nombre («Caja»). El primero queda como administración automáticamente.

Repita en el **celular de un socio** y acepte cuando pregunte si podrá aprobar otros equipos. Conviene tener siempre dos equipos de administración, por si uno se daña o se pierde.

Si quiere, puede autorizar de una vez los demás equipos de la misma forma (como equipos normales). Si no, simplemente pedirán aprobación después del paso 6.

Antes de seguir, revise en esa tarjeta que la lista de autorizados tenga **solo equipos suyos**. Si aparece alguno que no reconoce, quítelo.

## Paso 5 — La llave de los avisos del banco

Invente una llave larga (por ejemplo, tres palabras y números). Se usa en dos sitios:

1. En `reglas-firebase.json`, reemplace el texto `CAMBIE-ESTA-LLAVE` por su llave.
2. En el script de Google que revisa el correo del banco (script.google.com), en la línea del `payload`, agregue la llave al final, así: `{texto:texto,ts:Date.now(),origen:'correo',llave:'SU-LLAVE'}` y guarde. Si usa MacroDroid, agregue `"llave":"SU-LLAVE"` al cuerpo. El POS ya muestra las instrucciones actualizadas.

Sin la llave, nadie de afuera puede meter un falso «recibiste una transferencia».

## Paso 6 — Cerrar las reglas (con el bar cerrado)

Firebase → *Realtime Database* → **Reglas** → borre lo que hay, pegue el contenido de `reglas-firebase.json` (ya con su llave) → **Publicar**.

Pruebe enseguida:

1. En la caja: abrir el POS, entrar con PIN, tomar un pedido de prueba, cobrarlo y anularlo.
2. En un celular que aún no esté autorizado: abrir el POS, escribir el nombre y pedir aprobación. En la caja debe aparecer el aviso con el mismo código. Aprobar. El celular debe entrar solo.
3. Abrir la página de la impresora y la del DJ en sus equipos; si piden aprobación, apruébelos desde la caja. Mande a imprimir una comanda.
4. Con un celular que no sea del bar: abrir la carta y pedir una canción en la rocola.
5. Esperar un pago real o usar la «inyección de prueba» del POS para confirmar que los avisos del banco siguen llegando.

## Si algo falla

Vuelva a *Reglas*, pegue las anteriores (`{"rules":{".read":true,".write":true}}`) y publique. Todo queda como estaba y me cuenta qué falló.

## Paso 7 — Después de cerrar

1. **Cambie todos los PIN.** Estuvieron a la vista de cualquiera mientras la base estuvo abierta.
2. **Apruebe solo equipos que tenga al frente**, y confirme que el código del aviso sea el mismo que muestra el equipo. La dirección del POS es pública: un extraño podría abrirla y pedir entrada con cualquier nombre. Si aparece una solicitud que nadie en el bar está pidiendo, rechácela. Las solicitudes sin atender dejan de mostrarse a los 30 minutos.
3. Si se pierde un celular o se va un empleado: Admin → *Equipos autorizados* → **Quitar**. Ese equipo queda por fuera de inmediato y los demás no se afectan.

## Cosas que conviene saber

Un equipo es un navegador en un aparato. Si en un celular se borran los datos del navegador, se usa otro navegador o una ventana de incógnito, cuenta como equipo nuevo y hay que aprobarlo otra vez.

Si alguna vez se queda sin ningún equipo de administración (por ejemplo, se formatea la caja y se pierde el celular del socio), se recupera desde la consola de Firebase: abra el POS en el equipo nuevo y pida aprobación; en *Realtime Database* busque `solicitudes`, copie el identificador largo de esa solicitud y cree en `equipos` una entrada con ese identificador y dentro `ok: true` y `admin: true`.

## Qué se probó y qué no

Las reglas se probaron en un simulador con 66 casos (público, equipo sin aprobar, equipo normal, equipo de administración, avisos del banco) y las pantallas con una base simulada (30 casos: solicitar, aprobar, rechazar, quitar, páginas del personal y páginas públicas). No se pudo probar contra la base real de Firebase desde aquí: la primera prueba real es la del paso 6, y por eso va con el bar cerrado y con vuelta atrás inmediata.

## Lo que queda pendiente

La carta pública lee el mismo listado de productos del POS, que incluye el **costo** y las existencias de cada producto. Con estas reglas eso sigue siendo visible para quien sepa buscarlo. Se corrige en el siguiente paso, publicando para la carta una copia sin costos.
