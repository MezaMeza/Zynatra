# Integraciones — ZYNATRA

> Documento de integraciones del sistema (Sprint 3 · Entregable 4).
> **App en producción:** https://zynatra-app-2026.azurewebsites.net/
> **Proyecto Firebase:** `zinatra-abed2`

ZYNATRA es una SPA sin backend propio: todas las integraciones se realizan **directamente desde el cliente** contra servicios gestionados.

```
┌──────────────────────────────┐
│  SPA React (Nginx container) │
└───────────────┬──────────────┘
                │
     ┌──────────┼───────────────┐
     ▼          ▼               ▼
┌─────────┐ ┌────────────┐ ┌──────────────┐
│ Firebase│ │ Firestore  │ │ APIs externas│
│ Auth    │ │ (Base de   │ │ (opcionales) │
│ (JWT)   │ │  datos)    │ │              │
└─────────┘ └────────────┘ └──────────────┘
```

---

## 1. Firebase Authentication (Seguridad avanzada · Tokens JWT)

**Módulo:** `src/firebase/config.js`, `src/firebase/services.js`, `src/context/AuthContext.jsx`

- **Método:** Email/Password.
- **Tokens JWT:** Firebase emite un **ID Token (JWT firmado)** al autenticar. El SDK lo adjunta automáticamente a cada operación contra Firestore, y lo **refresca** de forma transparente.
- **Sesión persistente:** la sesión se mantiene entre recargas (persistencia en IndexedDB gestionada por el SDK).
- **Estado de sesión:** `onAuthStateChanged` (en `AuthContext`) sincroniza el usuario activo con el estado de React.
- **Funciones usadas:** `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`.

```js
// config.js — inicialización
app = initializeApp(firebaseConfig);
auth = getAuth(app);
db   = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
```

**Flujo de autenticación:**
1. El usuario ingresa email + contraseña.
2. Firebase valida y devuelve un **JWT (ID Token)** + refresh token.
3. `AuthContext` guarda el usuario y su rol.
4. Cada lectura/escritura a Firestore viaja con el JWT → las reglas de seguridad lo evalúan.

---

## 2. Firestore (Base de datos)

**Módulo:** `src/firebase/services.js` (CRUD), `firestore.rules` (seguridad)

Base de datos **NoSQL orientada a documentos**, en modo **Native**.

### Colecciones

| Colección | Contenido |
|---|---|
| `users` | Perfil: nombre, email, rol (`student`/`teacher`/`admin`), estado, datos personales |
| `students` | Progreso: XP, nivel, perfil vocacional, logros, juegos, racha |
| `tasks` | Tareas asignadas por docentes |
| `submissions` | Entregas de tareas (estado, nota, retroalimentación) |
| `connections` | Universidades e institutos (directorio) |
| `recovery_requests` | Solicitudes de recuperación de contraseña |

### Operaciones

`getDoc`, `setDoc`, `addDoc`, `getDocs`, `query`, `where`, `updateDoc`.

### Caché offline

Se usa `persistentLocalCache` con `persistentMultipleTabManager` → la app sigue funcionando sin conexión y sincroniza al reconectar.

### Reglas de seguridad (`firestore.rules`)

- **Deny by default** (`allow read, write: if false`).
- Acceso **solo autenticado** y **por rol** (helpers `isSignedIn()`, `isAdmin()`, `isStaff()`).
- Protección anti-escalada: un usuario no puede auto-asignarse `admin`.

---

## 3. Modo doble backend (resiliencia)

`src/firebase/config.js` expone `isFirebaseConfigured`:

- **`true`** → usa Firebase Auth + Firestore.
- **`false`** → usa **localStorage** (modo demo offline, sin configuración).

Esto permite clonar el repo y probarlo sin Firebase, y garantiza que la app no se rompa si falta la configuración.

---

## 4. Variables de entorno y secretos

- Las claves de Firebase se inyectan en **build time** como `ARG` → `ENV` en el `Dockerfile`, desde un `.env` **gitignored**.
- En Azure se exponen como **App Settings** (variables ocultas).
- La config de Firebase web es **pública por diseño**; su seguridad recae en:
  - **API Key restringida** por dominio/referrer.
  - **Reglas de Firestore** (autorización real).
  - **Authorized Domains** en Firebase Auth.

---

## 5. APIs externas

- **Actuales:** ninguna API externa de backend (la recuperación de contraseña es un flujo interno).
- **Enlaces salientes:** compartir en LinkedIn (`linkedin.com/sharing`) — solo navegación, no integración de datos.
- **Nota:** el build histórico en Netlify incluía `smtpjs.com` (envío de correo); el código actual del repositorio **no** lo usa.

---

## 6. Matriz de integración

| Integración | Tecnología | Estado | Seguridad |
|---|---|---|---|
| Autenticación | Firebase Auth | ✅ Activo | JWT + Authorized Domains |
| Base de datos | Firestore Native | ✅ Activo | Reglas deny-by-default + por rol |
| Caché offline | Firestore persistent cache | ✅ Activo | — |
| Config/secretos | Build args + App Settings | ✅ Activo | `.env` gitignored |
| APIs externas | — | ➖ No aplica | — |
