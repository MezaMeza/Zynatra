# Sprint 2 — Entregables (Desarrollo)

> **Proyecto:** ZYNATRA — Plataforma de Orientación Vocacional
> **Fecha:** Octubre 2026
> **App en producción:** https://zynatra-app-2026.azurewebsites.net/
> **Repositorio:** https://github.com/MezaMeza/Zynatra

---

## Resumen ejecutivo

| #   | Entregable        | Estado      |
| --- | ----------------- | ----------- |
| 1   | Compilación Final | ✅ Cumplido |
| 2   | Servidor Seguro   | ✅ Cumplido |
| 3   | Proxy Inverso     | ✅ Cumplido |
| 4   | Contenedores      | ✅ Cumplido |
| 5   | Conexión y CORS   | ✅ Cumplido |

**Stack de despliegue:** Azure App Service for Containers (Linux B1, región West US) + Azure Container Registry (Basic) + contenedor Nginx non-root + Firebase (Auth + Firestore Native).

> **Nota sobre infraestructura:** El plan original contemplaba una VM Ubuntu. La suscripción **Azure for Students** la bloqueó por política (`sys.regionrestriction`) y por falta de capacidad de VM en todas las regiones permitidas. Se adoptó **Azure App Service for Containers**, que cumple el espíritu de todos los entregables (contenedor aislado, usuario non-root, monitoreo, HTTPS gestionado). Ver anexo de decisión técnica.

---

## 1. Compilación Final

**Requisito:** Entregar la app (web o móvil) ultra rápida, comprimida y lista para producción.

**Estado:** ✅ Cumplido

### Evidencia

Build de producción optimizado (`npm run build` → Vite 8 + post-proceso gzip):

```
dist/index.html                               1.34 kB │ gzip:   0.57 kB
dist/assets/index-CU6lych2.css                6.51 kB │ gzip:   1.92 kB
dist/assets/firebase-core-CswZhZC7.js        50.66 kB │ gzip:  18.49 kB
dist/assets/index-DFZYrKNu.js                72.35 kB │ gzip:  21.50 kB
dist/assets/firebase-auth-4p_yaQuM.js       112.89 kB │ gzip:  33.39 kB
dist/assets/react-CepXLKLB.js               189.64 kB │ gzip:  59.65 kB
dist/assets/firebase-firestore-BdKuyLbH.js  475.59 kB │ gzip: 136.15 kB
✓ built in 1.19s
[gzip-dist] pre-compressed 15 asset(s).
```

**Optimizaciones aplicadas:**

- **Code-splitting** (`manualChunks` en `vite.config.js`): vendor chunks separados (react, firebase-core, firebase-auth, firebase-firestore) + 9 vistas con `React.lazy` + `Suspense`.
- **Sin warning de chunk >500 kB** (el mayor es `firebase-firestore` con 475.59 kB / 136.15 kB gzip).
- **Pre-compresión gzip** de los 15 assets (`scripts/gzip-dist.mjs`) servidos con `gzip_static` desde Nginx.
- **Caché inmutable** para assets con hash (`Cache-Control: public, max-age=31536000, immutable`).

### Artefactos

| Archivo                 | Rol                                                   |
| ----------------------- | ----------------------------------------------------- |
| `vite.config.js`        | Configuración de chunks y build                       |
| `src/App.jsx`           | Lazy-loading de vistas + ErrorBoundary                |
| `scripts/gzip-dist.mjs` | Pre-compresión gzip post-build                        |
| `package.json`          | `"build": "vite build && node scripts/gzip-dist.mjs"` |
| `Dockerfile`            | Build reproducible dentro del contenedor              |

---

## 2. Servidor Seguro

**Requisito:** Debe tener creado y administrar el servidor en Azure usando un usuario estándar (no 'root') e incluir monitoreo básico.

**Estado:** ✅ Cumplido (adaptado a App Service)

### Evidencia

| Aspecto                | Implementación                                                              |
| ---------------------- | --------------------------------------------------------------------------- |
| **Servidor en Azure**  | App Service Plan `zynatra-plan` (Linux, SKU B1) — región West US            |
| **No root**            | Contenedor `nginxinc/nginx-unprivileged` → corre como **UID 101 (no root)** |
| **Contenedor aislado** | Imagen `zynatraacr2026.azurecr.io/zynatra-app:v3`                           |
| **Monitoreo básico**   | 2 alertas de métricas + Action Group + logging                              |

**Monitoreo configurado:**

```
Action Group : zynatra-ag
Alertas      : zynatra-http5xx  (HTTP 5xx > 5 en 5 min)  → Enabled, Sev 2
               zynatra-cpu      (CPU del plan > 80%)     → Enabled, Sev 2
Logging      : App Service (application logs + docker container logs)
```

**Acceso:** El servidor se administra vía Azure CLI / Portal con la cuenta de la suscripción. No hay acceso root directo (servicio gestionado).

### Artefactos

| Archivo                                                               | Rol                                                  |
| --------------------------------------------------------------------- | ---------------------------------------------------- |
| `deploy/azure-setup.sh`                                               | Provisión + hardening (VM path — referencia)         |
| `deploy/monitoring.sh`                                                | Log Analytics + AMA + alertas (VM path — referencia) |
| `Dockerfile`                                                          | Runtime non-root                                     |
| Azure: `zynatra-plan`, alertas `zynatra-*`, action group `zynatra-ag` | Recursos vivos                                       |

> El script de VM se conserva como referencia. En App Service el hardening de SO lo gestiona Azure; el aislamiento y usuario non-root se garantizan en el contenedor.

---

## 3. Proxy Inverso

**Requisito:** Usar Nginx o Apache para recibir el tráfico web; nunca exponer el código directamente a internet.

**Estado:** ✅ Cumplido

### Evidencia

La app se sirve a través de **Nginx** (contenedor), confirmado por la cabecera HTTP:

```
HTTP/1.1 200 OK
Server: nginx
```

El usuario **nunca accede al código fuente**: se sirve únicamente el build estático (`/usr/share/nginx/html`). Las peticiones pasan por el front-end de Azure → contenedor Nginx.

**Configuración Nginx:**

- `server_tokens off` (no expone versión).
- SPA fallback (`try_files $uri $uri/ /index.html`).
- `gzip_static on` (sirve los `.gz` pre-comprimidos).
- Caché: inmutable para `/assets/*`, `no-cache` para `/index.html`.
- Endpoint de salud `/healthz`.

### Artefactos

| Archivo            | Rol                                              |
| ------------------ | ------------------------------------------------ |
| `nginx/nginx.conf` | Reverse proxy (proxy → app, rate limit, headers) |
| `nginx/app.conf`   | Servidor estático (caché, gzip, fallback)        |
| `Dockerfile`       | Copia `nginx/app.conf` y sirve `dist/`           |

---

## 4. Contenedores

**Requisito:** Usar Docker o entornos estrictamente aislados para ejecutar el proyecto y la base de datos.

**Estado:** ✅ Cumplido

### Evidencia

- **Imagen Docker multi-stage:** `zynatra-app:v3` (93.9 MB).
  - Stage build: `node:22-alpine` → `npm ci` + `npm run build`.
  - Stage runtime: `nginxinc/nginx-unprivileged:alpine` (non-root) sirviendo `dist/`.
- **Registro:** Azure Container Registry `zynatraacr2026` (tags: `latest`, `v2`, `v3`).
- **Orquestación:** `docker-compose.yml` (app interno `:8080` + proxy `:80`, red aislada, healthchecks, restart policy).
- **Aislamiento:** El contenedor `app` no publica puertos al exterior (solo el proxy).
- **Base de datos:** Firebase Firestore (servicio gestionado en la nube) — no requiere contenedor; se documenta como BD gestionada.

### Artefactos

| Archivo              | Rol                            |
| -------------------- | ------------------------------ |
| `Dockerfile`         | Imagen multi-stage non-root    |
| `docker-compose.yml` | Stack app + proxy, red aislada |
| `.dockerignore`      | Contexto de build mínimo       |
| ACR `zynatraacr2026` | Registro de imágenes           |

---

## 5. Conexión y CORS

**Requisito:** La app debe funcionar en Azure usando variables ocultas y con los permisos de red (CORS) correctamente configurados.

**Estado:** ✅ Cumplido

### Evidencia

**Variables ocultas (no en el repositorio):**

- Config de Firebase inyectada como **build args** (`ARG` → `ENV` en el `Dockerfile`) desde un `.env` **gitignored**.
- App Settings del Web App (variables de entorno gestionadas):
  ```
  WEBSITES_PORT
  DOCKER_REGISTRY_SERVER_URL
  DOCKER_REGISTRY_SERVER_USERNAME
  DOCKER_REGISTRY_SERVER_PASSWORD
  ```
- `.env.example` versionado con placeholders (sin secretos reales).

**Permisos de red (CORS / acceso):**

- **Firebase Auth → Authorized domains** con el dominio de producción autorizado.
- **Firestore Native** activo con reglas de seguridad (`firestore.rules`) — deny-by-default + acceso por rol.
- Firebase config (`apiKey`, `projectId`, etc.) es **pública por diseño** (config web de Firebase), protegida por API Key restringida + reglas.

### Artefactos

| Archivo             | Rol                                   |
| ------------------- | ------------------------------------- |
| `.env.example`      | Plantilla de variables (placeholders) |
| `.env` (gitignored) | Config real inyectada en build        |
| `Dockerfile`        | Build args → env horneadas            |
| `firestore.rules`   | Reglas de acceso a datos              |
| `firebase.json`     | Config para deploy de reglas          |

---

## Anexo A — Recursos en Azure

| Recurso            | Nombre                           | Detalle                                     |
| ------------------ | -------------------------------- | ------------------------------------------- |
| Resource Group     | `zynatra-rg`                     | West US                                     |
| App Service Plan   | `zynatra-plan`                   | Linux B1                                    |
| Web App            | `zynatra-app-2026`               | https://zynatra-app-2026.azurewebsites.net/ |
| Container Registry | `zynatraacr2026`                 | Basic                                       |
| Action Group       | `zynatra-ag`                     | Alertas                                     |
| Alertas            | `zynatra-http5xx`, `zynatra-cpu` | Sev 2, enabled                              |

## Anexo B — Verificación rápida

```bash
# App en línea (HTTPS + nginx)
curl -I https://zynatra-app-2026.azurewebsites.net/
#   -> HTTP/1.1 200 OK ; Server: nginx

# Build optimizado
npm run build
#   -> sin warning >500 kB ; 15 assets gzip

# Imagen Docker
docker images zynatra-app

# Alertas de monitoreo
az monitor metrics alert list -g zynatra-rg -o table
```

## Anexo C — Decisión técnica: VM → App Service

La suscripción **Azure for Students** impone:

1. Política `sys.regionrestriction` — solo permite 5 regiones (East US bloqueado).
2. **Sin capacidad de VM** para ninguna talla en las regiones permitidas (`SkuNotAvailable`).
3. **ACR Tasks bloqueado** (`az acr build`) → build local + push.
4. **Role assignments bloqueados** → se usan credenciales admin de ACR.

**Pivote adoptado:** App Service for Containers + ACR. Resultado: app en línea con HTTPS válido, contenedor non-root, Nginx, monitoreo y variables ocultas — cumpliendo los 5 entregables del Sprint 2.
