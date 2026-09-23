# MOCCA Accesorios — App de ventas

Módulos incluidos hasta ahora: **autenticación + catálogo** y **panel de
administración de productos y categorías**. El carrito y el registro de
ventas vienen en el siguiente módulo.

## Qué incluye esta versión

- Login con correo/contraseña, diferenciando rol admin/vendedor.
- Catálogo con buscador, filtro por categoría (con ícono propio) y fotos
  (grid tipo boutique). Se actualiza **en tiempo real**: cualquier cambio
  del admin se refleja al instante en la pantalla del vendedor.
- **Admin**: botón flotante "+" para crear productos, tocar cualquier
  tarjeta para editarla (nombre, categoría, precio, stock, hasta 4 fotos),
  y un gestor de categorías (crear, renombrar, borrar) accesible desde
  "Categorías" junto al título del catálogo.
- Las fotos se redimensionan y comprimen en el navegador antes de subirse a
  Firebase Storage, para no gastar de más.
- "Eliminar" un producto lo archiva (no lo borra de verdad): deja de verse
  en el catálogo pero el dato queda a salvo para cuando existan reportes de
  ventas históricas.
- Borrar una categoría se bloquea si todavía tiene productos activos —hay
  que reasignarlos o archivarlos primero.
- Botón temporal (solo visible para el admin) para cargar tus 8 categorías y
  ~228 productos reales, tomados de tus archivos Excel/CSV. Es seguro usarlo
  varias veces: nunca duplica ni pisa datos existentes.
- Reglas de seguridad de Firestore y Storage (`firestore.rules`,
  `storage.rules`) que ya reflejan los permisos admin/vendedor.

## Paso 1 — Crear el proyecto en Firebase

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo (ej. `mocca-accesorios`).
2. En el menú lateral, entra a **Compilación > Authentication** → pestaña
   "Sign-in method" → habilita **Correo electrónico/contraseña**.
3. Entra a **Compilación > Firestore Database** → "Crear base de datos" → modo
   **producción** → elige la región más cercana (ej. `southamerica-east1`).
4. Entra a **Compilación > Storage** → "Comenzar". Desde febrero de 2026,
   Storage exige el plan de pago **Blaze** — Firebase te va a pedir vincular
   una tarjeta para continuar. No es un cobro automático: Blaze incluye una
   capa gratuita amplia y con el tamaño de este catálogo no deberías generar
   ningún cargo. Ver la guía completa para el detalle paso a paso.
5. Ve a **⚙️ Configuración del proyecto** (ícono de engranaje) → baja hasta
   "Tus apps" → clic en el ícono `</>` (Web) → dale un nombre → **Registrar app**.
6. Copia el objeto `firebaseConfig` que te muestra (apiKey, authDomain, etc.).

## Paso 2 — Conectar la app con tu proyecto

Abre `src/firebase/config.js` y reemplaza los valores de `firebaseConfig` con
los que copiaste en el paso anterior.

## Paso 3 — Crear tu usuario administrador

1. En Firebase Console → **Authentication** → "Add user" → ingresa tu correo y
   una contraseña. Copia el **UID** que se genera.
2. En **Firestore Database** → "Iniciar colección" → nombre de colección: `users`.
3. ID del documento: pega el **UID** que copiaste.
4. Agrega estos campos:
   - `nombre` (string) → tu nombre
   - `rol` (string) → `admin`
   - `activo` (boolean) → `true`
5. Guarda. Ya puedes iniciar sesión como administrador.

Para crear el usuario del vendedor, repite lo mismo pero con `rol: "vendedor"`.

## Paso 4 — Publicar las reglas de seguridad

En Firebase Console → **Firestore Database** → pestaña "Reglas" → pega el
contenido completo de `firestore.rules` (de este proyecto) → **Publicar**.

Además, en Firebase Console → **Storage** → pestaña "Rules" → pega el
contenido completo de `storage.rules` → **Publicar**. Esto asegura que solo
el admin pueda subir o borrar fotos de producto, aunque cualquier usuario
con sesión iniciada pueda verlas.

## Paso 5 — Subir el proyecto a GitHub

1. Crea un repositorio nuevo en GitHub (ej. `mocca-accesorios`), vacío (sin
   README ni .gitignore, ya los trae el proyecto).
2. Sube todos los archivos de esta carpeta a ese repositorio (puedes arrastrar
   los archivos desde la interfaz web de GitHub si estás en iPad, o usar
   GitHub Desktop).

## Paso 6 — Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → "Add New" → "Project".
2. Selecciona el repositorio `mocca-accesorios`.
3. Vercel detecta automáticamente que es un proyecto Vite — no necesitas
   cambiar nada en la configuración de build.
4. Clic en **Deploy**. En un par de minutos tendrás la URL pública de la app.

## Paso 7 — Cargar el catálogo real

1. Abre la app desplegada e inicia sesión como administrador.
2. Verás un botón **"Cargar catálogo inicial"** arriba del catálogo — dale
   clic una vez. Se cargarán las 8 categorías y los productos con su stock y
   precio actuales (sin fotos todavía).
3. Inicia sesión como vendedor para confirmar que ves el mismo catálogo.

## Siguientes módulos (en orden)

1. **Carrito y registro de venta**: agregar productos, validar stock,
   descuento automático de inventario, pago mixto, solicitud de descuento.
2. **Autorización de descuentos/anulaciones**: flujo de solicitud (vendedor) →
   aprobación (admin).
3. **Cuadre de caja por turno**.
4. **Reportes y exportación a Excel**.

No avanzamos al siguiente módulo hasta que confirmes que este funciona
correctamente para ti.
