# Entregables — Diagramas de Flujo (ZYNATRA)

> Diagramas en **Mermaid**. Para verlos: pegar el bloque en <https://mermaid.live> → **Actions → Export PNG/SVG** → subir a Canva.
> También se pueden renderizar con `npx -y @mermaid-js/mermaid-cli -i archivo.mmd -o salida.svg`.

---

## 1. Arquitectura de despliegue (pipeline completo)

```mermaid
flowchart TD
    DEV["👨‍💻 Desarrollador"] -->|git push| GH["🐙 GitHub<br/>MezaMeza/Zynatra (main)"]
    GH -->|npm run build| BUILD["⚙️ Build Vite optimizado<br/>code-splitting + gzip"]
    BUILD -->|multi-stage| DOCKER["🐳 Dockerfile<br/>Node build → Nginx non-root"]
    DOCKER -->|docker tag/push| ACR["📦 Azure Container Registry<br/>zynatraacr2026"]
    ACR -->|pull imagen| ASP["☁️ Azure App Service for Containers<br/>Linux B1 · westus"]
    ASP --> NGINX["🔀 Contenedor Nginx<br/>non-root :8080"]
    NGINX -->|sirve SPA| USER["🌐 Usuario (HTTPS)<br/>zynatra-app-2026.azurewebsites.net"]
    NGINX -.->|lecturas/escrituras| FB["🔥 Firebase<br/>Auth (JWT) + Firestore Native"]
    ASP -.->|métricas| MON["📊 Azure Monitor<br/>2 alertas + action group"]
```

## 2. Flujo de despliegue (paso a paso)

```mermaid
flowchart LR
    A["1. Código local"] --> B["2. .env con claves<br/>(gitignored)"]
    B --> C["3. docker compose build"]
    C --> D["4. az acr login + docker push"]
    D --> E["5. az webapp config container set"]
    E --> F["6. az webapp restart"]
    F --> G["7. Verificación<br/>curl HTTP 200 · Server: nginx"]
    G --> H["8. Firebase Console<br/>Authorized domains + rules"]
```

## 3. Entregables Sprint 2 (Desarrollo)

```mermaid
flowchart TD
    S2["Sprint 2 — Desarrollo"] --> E1
    S2 --> E2
    S2 --> E3
    S2 --> E4
    S2 --> E5

    E1["1. Compilación Final<br/>build rápido + comprimido"] --> E1a["Vite manualChunks + React.lazy"]
    E1 --> E1b["gzip pre-compresión (15 assets)"]
    E1 --> E1c["Sin warning >500 kB"]

    E2["2. Servidor Seguro<br/>Azure + non-root + monitoreo"] --> E2a["App Service (VM bloqueada por política)"]
    E2 --> E2b["Contenedor Nginx non-root (UID 101)"]
    E2 --> E2c["2 alertas + action group + logging"]

    E3["3. Proxy Inverso<br/>Nginx / Apache"] --> E3a["Server: nginx (verificado)"]
    E3 --> E3b["Código nunca expuesto directamente"]

    E4["4. Contenedores<br/>Docker / aislamiento"] --> E4a["Dockerfile multi-stage"]
    E4 --> E4b["docker-compose (app + proxy)"]
    E4 --> E4c["Imagen en ACR"]

    E5["5. Conexión y CORS<br/>variables ocultas + permisos"] --> E5a["App Settings (env ocultas)"]
    E5 --> E5b["Firebase Authorized Domains"]
    E5 --> E5c["Firestore rules por rol"]
```

## 4. Entregables Sprint 3 (Desarrollo)

```mermaid
flowchart TD
    S3["Sprint 3 — Desarrollo"] --> F1
    S3 --> F2
    S3 --> F3
    S3 --> F4
    S3 --> F5

    F1["1. Rendimiento y Acceso<br/>en línea, carga rápida, URL"] --> F1a["HTTP 200 · ~0.5s"]
    F1 --> F1b["Code-splitting + gzip + caché"]
    F1 --> F1c["ErrorBoundary + caché offline"]

    F2["2. Seguridad (HTTPS)<br/>certificado SSL válido"] --> F2a["Cert *.azurewebsites.net (Microsoft)"]
    F2 --> F2b["HTTPS forzado"]

    F3["3. Flujo Automático<br/>end-to-end + errores amigables"] --> F3a["Login → dashboard por rol"]
    F3 --> F3b["404.html + 50x.html (sin código)"]
    F3 --> F3c["SPA fallback"]

    F4["4. Integraciones Complejas<br/>JWT + BD + APIs"] --> F4a["Firebase Auth (tokens JWT)"]
    F4 --> F4b["Firestore (6 colecciones)"]
    F4 --> F4c["Reglas de seguridad"]

    F5["5. Código Vinculado a GitHub<br/>código = repo main + README"] --> F5a["Commit desplegado = main"]
    F5 --> F5b["README con guía de despliegue"]
```

## 5. Flujo de autenticación (usuario)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant APP as SPA (React)
    participant AUTH as Firebase Auth
    participant DB as Firestore
    U->>APP: Ingresa email + contraseña
    APP->>AUTH: signInWithEmailAndPassword
    AUTH-->>APP: JWT (ID Token) + refresh
    APP->>DB: Consulta datos (con JWT)
    DB-->>APP: Documentos (según reglas)
    APP-->>U: Dashboard por rol (estudiante/docente/admin)
```
