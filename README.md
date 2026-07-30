# ZYNATRA — Documentación Técnica

**Plataforma de Orientación Vocacional con Inteligencia Artificial**

Zynatra es una plataforma educativa diseñada para ayudar a estudiantes de cualquier nivel a descubrir sus habilidades, aptitudes y vocación profesional. Combina test psicométricos, juegos interactivos, inteligencia artificial y herramientas de seguimiento académico en una sola aplicación.

Autor: Cristian Barreras  
Fecha: Julio 2026

---

## Sobre el proyecto

Zynatra surge de una realidad que muchos jóvenes enfrentan: no saber qué estudiar ni hacia dónde dirigir su futuro profesional. La plataforma está pensada para cualquier persona que quiera conocer sus fortalezas y explorar opciones de carrera de forma interactiva y divertida.

No importa si sos estudiante de primaria, secundaria, o simplemente alguien que quiere descubrir en qué es bueno — Zynatra te guía con herramientas probadas y un sistema de aprendizaje gamificado.

**Lo que ofrece la plataforma:**

- Test de Matrices Progresivas de Raven para medir capacidad intelectual
- Test vocacional que genera un perfil de aptitudes por áreas (ecología, tecnología, ingeniería, arte)
- Arena con 33 juegos educativos organizados por materia, cada uno con más de 100 preguntas para que nunca se repitan
- Asesor virtual tipo chatbot que responde según tu perfil y tus intereses
- Biblioteca de recursos educativos clasificados por área del conocimiento
- Sistema de tareas donde los docentes asignan y califican trabajos
- Directorio de universidades e institutos técnicos
- Panel de progreso con puntos de experiencia (XP), niveles, logros y rachas
- Panel administrativo para gestionar usuarios y cuentas

---

## Cómo está construido

La aplicación está hecha con **React 19** y empaquetada con **Vite 8**. No usa Next.js ni ningún framework de routing — el enrutamiento se maneja internamente con un `useState` que cambia la vista activa. Es una SPA simple pero funcional.

Para la base de datos se usa **Firebase** (Firestore + Authentication), pero el sistema tiene un modo offline que funciona con `localStorage` para desarrollo y pruebas sin necesidad de tener Firebase configurado. La detección es automática: si las variables de entorno de Firebase están vacías, todo se guarda localmente en el navegador.

Los iconos vienen de **Lucide React** y la app se puede compilar a Android usando **Capacitor**.

### Dependencias principales

Las que se usan en producción:

- **react** y **react-dom** (v19.2.6) — la base de todo
- **firebase** (v12.15.0) — autenticación y base de datos en la nube
- **lucide-react** (v1.20.0) — iconos SVG
- **@capacitor/core** y **@capacitor/android** (v8.4.0) — para generar la app de Android

Para desarrollo:

- **vite** (v8.0.12) — servidor de desarrollo y empaquetado
- **@vitejs/plugin-react** — plugin de React para Vite
- **eslint** con plugins de react-hooks y react-refresh — análisis de código
- **@capacitor/cli** — herramienta de línea de comandos para compilar a Android

---

## Variables de entorno

Se configuran en un archivo `.env` en la raíz del proyecto. Vite requiere que las variables empiecen con `VITE_` para exponerlas al navegador.

```
VITE_FIREBASE_API_KEY=tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

La variable `MEASUREMENT_ID` es opcional (es para Google Analytics). Las demás son necesarias si querés conectar Firebase. Si dejás todo vacío o no creás el archivo `.env`, la app funciona igual guardando todo en el navegador con localStorage — ideal para probar sin complicaciones.

---

## Estructura de carpetas

```
zynatra/
├── index.html                 → Página HTML principal
├── package.json               → Dependencias y scripts
├── vite.config.js             → Configuración de Vite
├── capacitor.config.json      → Config para Android
├── .env                       → Variables de Firebase
│
└── src/
    ├── main.jsx               → Punto de entrada de React
    ├── App.jsx                → Componente principal, maneja las vistas
    ├── App.css                → Estilos del layout general
    ├── index.css              → Estilos globales y sistema de diseño
    │
    ├── components/
    │   ├── Sidebar.jsx        → Menú lateral en desktop, barra inferior en móvil
    │   └── GameCenter.jsx     → Motor de juegos completo (quiz, memoria, V/F, etc.)
    │
    ├── context/
    │   ├── AuthContext.jsx    → Maneja login, logout, registro y sesión
    │   └── DataContext.jsx    → Carga datos del usuario, tareas, XP
    │
    ├── data/
    │   ├── achievements.js    → Lista de logros y retos diarios
    │   ├── advisor.js         → Respuestas del asesor virtual
    │   ├── games.js           → Catálogo de los 33 juegos
    │   ├── gamesQuestions.js  → Bancos de preguntas por materia
    │   ├── resources.js       → Artículos de la biblioteca
    │   └── scholarships.js    → Becas disponibles
    │
    ├── firebase/
    │   ├── config.js          → Inicializa Firebase o activa modo local
    │   └── services.js        → Todas las funciones del backend (CRUD)
    │
    ├── utils/
    │   └── vocational.js      → Algoritmo de cálculo del perfil vocacional
    │
    └── views/
        ├── Login/Login.jsx
        ├── Dashboard/StudentDashboard.jsx
        ├── Vocational/VocationalTest.jsx
        ├── Games/GamesHub.jsx
        ├── Advisor/VirtualAdvisor.jsx
        ├── Resources/ResourceLibrary.jsx
        ├── Progress/ProgressHub.jsx
        ├── Network/NetworkDirectory.jsx
        ├── Teacher/TeacherDashboard.jsx
        └── Superuser/
            ├── SuperuserDashboard.jsx
            └── AdminUsersPanel.jsx
```

---

## Cómo funciona la arquitectura

El flujo es bastante directo:

1. El usuario abre la app y ve la pantalla de login
2. Al autenticarse, `AuthContext` guarda los datos del usuario y determina su rol
3. `App.jsx` revisa el rol y muestra el dashboard correspondiente
4. Todas las operaciones de datos (guardar XP, crear tareas, calificar) pasan por `services.js`
5. `services.js` revisa si Firebase está activo — si sí, usa Firestore; si no, usa localStorage

No hay servidor backend propio. Todo se procesa en el cliente o directamente contra Firebase.

### El sistema de doble backend

En `firebase/config.js` hay una variable `isFirebaseConfigured` que verifica si la API key de Firebase está presente. Todas las funciones en `services.js` hacen un `if (isFirebaseConfigured)` antes de cada operación:

- Si es `true`: usa las funciones de Firebase como `signInWithEmailAndPassword`, `getDoc`, `setDoc`
- Si es `false`: hace exactamente lo mismo pero con `localStorage`

Esto permite que cualquiera pueda clonar el proyecto y probarlo sin tener que configurar Firebase ni ningún servicio externo.

---

## Roles y permisos

Hay tres roles en el sistema:

**Estudiante** (`student`): Puede hacer los test de IQ y vocacional, jugar en la arena, ver sus tareas, usar el asesor virtual, leer recursos de la biblioteca y revisar su progreso.

**Docente** (`teacher`): Puede crear tareas, ver las entregas de los estudiantes, calificarlas, y acceder a la biblioteca y al directorio de convenios.

**Administrador** (`admin`): Tiene acceso completo. Gestiona usuarios (crear, editar, suspender, cambiar contraseñas), ve estadísticas generales, resuelve solicitudes de recuperación de cuenta y controla todo el panel.

---

## Base de datos

### Con Firebase (Firestore)

Las colecciones principales son:

- **users** — datos de cada usuario: nombre, correo, rol, estado, teléfono, cédula, nacionalidad
- **students** — progreso académico: XP, nivel, perfil vocacional, metas, logros, juegos completados, racha
- **tasks** — tareas asignadas por docentes con título, descripción, materia y fecha límite
- **submissions** — entregas de tareas con estado (pendiente, entregado, calificado), nota y retroalimentación
- **connections** — universidades e institutos técnicos registrados
- **recovery_requests** — solicitudes de recuperación de contraseña

### Con localStorage (modo local)

Se usan estas claves en el navegador:

- `polaris_users` — todos los usuarios registrados, organizados por correo
- `polaris_students` — progreso de cada estudiante, organizado por ID
- `polaris_tasks` — lista de tareas
- `polaris_submissions` — lista de entregas
- `polaris_connections` — directorio de instituciones
- `polaris_recovery_requests` — solicitudes de recuperación
- `polaris_recovery_code` — código temporal de 6 dígitos para recuperar contraseña
- `polaris_session` — sesión activa del usuario

Cuando la app se abre por primera vez, `services.js` llena automáticamente estos datos con usuarios y contenido de ejemplo para poder probar todo de una vez.

---

## Funciones principales del backend (services.js)

Este archivo concentra todas las operaciones del sistema. Tiene más de 800 líneas y estas son las funciones más importantes:

**Autenticación:**
- `loginUser(email, password)` — valida credenciales y devuelve datos del usuario
- `registerUser(nombre, email, password, rol, colegioId, extraData)` — crea una cuenta nueva
- `logoutUser()` — cierra la sesión

**Datos del estudiante:**
- `getStudentData(studentId)` — trae todo el progreso del usuario
- `saveVocationalResult(studentId, profile)` — guarda el resultado del test vocacional
- `awardXP(studentId, xpAmount)` — suma puntos y recalcula el nivel
- `recordStreak(studentId)` — registra la actividad del día para la racha

**Tareas:**
- `getTasks(docenteId)` — lista las tareas, con filtro opcional por docente
- `createTask(titulo, descripcion, materia, fecha, docenteId)` — crea una tarea
- `submitTask(tareaId, estudianteId, feedback)` — el alumno entrega una tarea
- `gradeSubmission(submissionId, calificacion, feedback)` — el docente califica

**Gamificación:**
- `addGoal(studentId, titulo, plazo)` — agrega una meta personal
- `toggleGoal(studentId, goalId)` — marca o desmarca una meta como completada
- `completeDailyChallenge(studentId, challengeId)` — completa un reto del día
- `unlockAchievement(studentId, achievementId)` — desbloquea un logro
- `markGameCompleted(studentId, gameId)` — registra un juego completado
- `getLeaderboard(colegioId)` — tabla de posiciones ordenada por XP

**Administración:**
- `getAllSchoolUsers(colegioId)` — lista todos los usuarios registrados
- `resetUserPassword(email, newPassword)` — cambia la contraseña de alguien
- `updateUserStatus(email, estado)` — suspende o reactiva una cuenta
- `createStudentByAdmin(nombre, email)` — crea un estudiante desde el panel admin
- `updateUserByAdmin(email, fields)` — edita datos de cualquier usuario
- `resolveRecoveryRequest(requestId, data)` — el admin resuelve una solicitud de recuperación

---

## Sistema de XP y niveles

La fórmula es sencilla: cada 150 puntos de XP se sube un nivel.

```
Nivel = floor(XP / 150) + 1
```

Las formas de ganar puntos:
- Completar un juego de la arena: entre 25 y 50 XP según la dificultad
- Entregar una tarea: 20 XP
- Completar un reto diario: 15 XP
- Terminar el test vocacional o el test IQ: 50 XP cada uno

---

## Los juegos

`GameCenter.jsx` es el componente más grande del proyecto (27 KB). Tiene cinco motores de juego distintos:

1. **Quiz de opción múltiple** — preguntas con 4 opciones y barra de progreso
2. **Verdadero o Falso** — afirmaciones rápidas que hay que clasificar
3. **Juego de memoria** — encontrar pares de tarjetas ocultas
4. **Emparejar conceptos** — conectar un término con su definición
5. **Ordenar secuencia** — poner pasos o conceptos en el orden correcto

Las preguntas se almacenan en `gamesQuestions.js` y para algunas categorías como matemáticas, geometría e informática se generan dinámicamente para que no se repitan. Hay más de 100 preguntas por categoría.

---

## Recuperación de contraseña

Funciona en 4 pasos:

1. El usuario pone su correo electrónico
2. El sistema busca la cuenta, genera un código de 6 dígitos y se lo envía al correo y teléfono registrado
3. El usuario escribe el código en 6 casillas — tiene 5 intentos y el código vence a los 5 minutos
4. Si el código es correcto, establece su nueva contraseña

El código temporal se guarda en localStorage con su hora de expiración y un contador de intentos fallidos para mayor seguridad.

---

## Diseño responsive y móvil

La app fue pensada para verse bien en cualquier dispositivo. Los puntos de quiebre son:

- Más de 768px: sidebar lateral completo con todas las opciones
- 768px o menos: el sidebar desaparece y aparece una barra de navegación abajo, como en las apps de celular
- 420px o menos: fuentes y espaciados más pequeños para pantallas chicas
- 340px o menos: ajustes mínimos para pantallas muy reducidas

Detalles técnicos para móvil:
- Inputs con `font-size: 16px` para evitar el zoom automático al escribir
- Botones con mínimo 44px de altura para facilitar el toque
- Soporte para `safe-area-inset` de CSS (respeta el notch y los gestos de navegación en Android)
- Desactivado el highlight azul que aparece al tocar en Chrome para Android

---

## Compilación para Android

La configuración de Capacitor:

```json
{
  "appId": "com.zynatra.app",
  "appName": "Zynatra",
  "webDir": "dist"
}
```

Para generar el APK:

```
npm run build
npx cap sync android
npx cap open android
```

Eso abre Android Studio, y desde ahí se va a Build > Build APK.

---

## Cómo correr el proyecto

Para desarrollo local:

```
git clone <url-del-repositorio>
cd zynatra
npm install
npm run dev
```

Eso levanta el servidor en `localhost:5173` con recarga en caliente. Cualquier cambio que hagás se refleja al instante.

Para el build de producción:

```
npm run build
```

Los archivos optimizados quedan en `dist/` y se pueden subir a cualquier hosting.

---

## Despliegue

**En Firebase Hosting:**
```
npm run build
firebase login
firebase init hosting
firebase deploy
```

**En un servidor Apache (XAMPP u otro):**
Solo hay que copiar el contenido de `dist/` al directorio del servidor web.

**Como app Android:**
Compilar el APK con los pasos de arriba y distribuirlo directamente o publicarlo en Google Play.

---

Cristian Barreras  
cristianbarrerasp@gmail.com  
Julio 2026

<!-- Auth Module -->
