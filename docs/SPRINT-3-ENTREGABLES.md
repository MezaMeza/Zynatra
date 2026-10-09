# Sprint 3 — Entregables (Desarrollo)

> **Proyecto:** ZYNATRA — Plataforma de Orientación Vocacional
> **Fecha:** Octubre 2026
> **App en producción:** https://zynatra-app-2026.azurewebsites.net/
> **Repositorio:** https://github.com/cris2008cris/ZINATRA
> **Commit de referencia:** `cd67d82` — *feat(deploy): production deployment stack (Docker, Nginx, Azure) + Sprint docs*

---

## Resumen ejecutivo

| # | Entregable | Estado |
|---|-----------|--------|
| 1 | Rendimiento y Acceso | ✅ Cumplido |
| 2 | Seguridad (HTTPS) | ✅ Cumplido |
| 3 | Flujo Automático | ✅ Cumplido |
| 4 | Integraciones Complejas | ✅ Cumplido |
| 5 | Código Vinculado a GitHub | 🟡 Parcial (commit local; push pendiente) |

---

## 1. Rendimiento y Acceso

**Requisito:** La aplicación debe estar en línea, cargar al instante, poder accederse mediante una URL y no caerse al usarla.

**Estado:** ✅ Cumplido

### Evidencia

**URL pública (HTTPS):** https://zynatra-app-2026.azurewebsites.net/

Tiempos de respuesta medidos en producción (3 peticiones consecutivas):
```
root intento 1: HTTP=200  0.497s
root intento 2: HTTP=200  0.596s
root intento 3: HTTP=200  0.431s
```

**Optimizaciones de rendimiento:**
- **Code-splitting**: la carga inicial solo descarga Login + core; los dashboards pesados se cargan bajo demanda (`React.lazy` + `Suspense`).
- **Pre-compresión gzip**: 15 assets servidos con `Content-Encoding: gzip` (ej. React 189 kB → 59 kB; Firestore 475 kB → 136 kB).
- **Caché inmutable** para assets con hash (`max-age=31536000, immutable`).
- **Caché offline** (Firestore persistent cache) → resiliencia ante cortes de red.
- **Healthcheck** de contenedor (`/healthz`) + restart policy → la app se recupera sola.

**Resiliencia (no se cae):**
- `ErrorBoundary` global (muestra "Reconectando Zynatra…" + botón Reintentar).
- Doble backend (Firebase ↔ localStorage) → funciona incluso sin conexión a la BD.

---

## 2. Seguridad (HTTPS)

**Requisito:** Es obligatorio tener el "candado de seguridad" (certificado SSL válido) activo en la web.

**Estado:** ✅ Cumplido

### Evidencia

Certificado TLS válido emitido por Microsoft para `*.azurewebsites.net`:
```
issuer  = C=US, O=Microsoft Corporation, CN=Microsoft TLS G2 RSA CA OCSP 10
subject = C=US, ST=WA, L=Redmond, O=Microsoft Corporation, CN=*.azurewebsites.net
notBefore = Aug 29 11:05:11 2026 GMT
notAfter  = Feb 25 11:05:11 2027 GMT
```

- **HTTPS forzado** por Azure App Service (redirección de HTTP → HTTPS).
- Cabecera de respuesta confirma servidor seguro:
  ```
  HTTP/1.1 200 OK
  Server: nginx
  ```

**Verificación:** https://zynatra-app-2026.azurewebsites.net/ → candado verde en el navegador.

---

## 3. Flujo Automático

**Requisito:** El sistema debe funcionar de principio a fin sin ayuda técnica, mostrando pantallas de error amigables si algo falla; ej. error 404, 50X (sin mostrar código).

**Estado:** ✅ Cumplido

### Evidencia

**Flujo end-to-end automático:**
1. Usuario entra a la URL → pantalla de Login.
2. Se registra / inicia sesión → `AuthContext` detecta rol → muestra el dashboard correspondiente.
3. Todas las operaciones (XP, tareas, calificaciones) funcionan sin intervención técnica.

**Pantallas de error amigables (sin código ni stack traces):**

| Situación | Comportamiento | Archivo |
|---|---|---|
| Recurso inexistente (404) | Página **"No encontramos esta página"** + botón "Volver al inicio" | `public/404.html` |
| Servicio caído (500/502/503/504) | Página **"Estamos solucionando un problema"** + botón "Reintentar" | `public/50x.html` |
| Error de render en React | ErrorBoundary → **"Reconectando Zynatra…"** + Reintentar | `src/App.jsx` |

**Verificación en producción:**
```
asset inexistente  -> HTTP 404  +  "No encontramos esta página"
ruta SPA /xyz      -> HTTP 200  (index.html, navegación cliente)
```

Configuración Nginx (`nginx/app.conf`):
```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
```

---

## 4. Integraciones Complejas

**Requisito:** Todo debe estar conectado a la perfección, incluyendo seguridad avanzada (Tokens JWT), bases de datos, APIs externas (si aplican).

**Estado:** ✅ Cumplido

> Detalle completo en **`docs/INTEGRACIONES.md`**.

### Evidencia

| Integración | Tecnología | Seguridad |
|---|---|---|
| **Autenticación** | Firebase Auth (Email/Password) | **Tokens JWT** firmados + refresh automático + Authorized Domains |
| **Base de datos** | Firestore Native (NoSQL) | Reglas **deny-by-default** + acceso por rol |
| **Caché offline** | Firestore persistent cache | — |
| **Secretos** | Build args + Azure App Settings | `.env` gitignored |
| **APIs externas** | — (no aplica) | — |

- **Tokens JWT:** Firebase emite un ID Token (JWT) al autenticar; el SDK lo adjunta a cada operación y las reglas de Firestore lo validan.
- **Base de datos:** 6 colecciones (`users`, `students`, `tasks`, `submissions`, `connections`, `recovery_requests`) con reglas de seguridad (`firestore.rules`).
- **Protección anti-escalada:** un usuario no puede auto-asignarse el rol `admin`.

---

## 5. Código Vinculado a GitHub

**Requisito:** El código que está funcionando en Azure debe ser exactamente el mismo de la rama principal de GitHub, respaldado con instrucciones claras en el README.

**Estado:** 🟡 Parcial

### Evidencia

- **Commit de referencia:** `cd67d82` — contiene TODO el código desplegado (Dockerfile, nginx, build optimization, fixes, docs).
- **README con instrucciones de despliegue:** nueva sección **"Despliegue en producción"** en `README.md`, con:
  - Arquitectura (Internet → Azure → Nginx → Firebase).
  - Requisitos (Docker, Azure CLI).
  - Build local, push a ACR y despliegue en App Service.
  - Verificación con `curl`.
- **Imagen desplegada:** `zynatraacr2026.azurecr.io/zynatra-app:v4` — construida desde el commit `cd67d82`.

### ⚠️ Pendiente para cerrar el entregable
El commit está **local** (`cd67d82`). Para cumplir 100% el requisito, hay que **hacer push a `main`** en GitHub:

```bash
git push origin main
```

*(Pendiente por decisión explícita: no subir a Git todavía.)*

---

## Anexo — Verificación rápida

```bash
# 1. App en línea (HTTPS + nginx)
curl -I https://zynatra-app-2026.azurewebsites.net/
#   -> HTTP/1.1 200 OK ; Server: nginx

# 2. Página de error amigable
curl -s https://zynatra-app-2026.azurewebsites.net/no-existe.js | grep "No encontramos"

# 3. Build optimizado
npm run build
#   -> sin warning >500 kB ; 15 assets gzip

# 4. Commit desplegado
git log --oneline -1
#   -> cd67d82 feat(deploy): production deployment stack...
```
