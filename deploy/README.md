# Zynatra — Azure Production Deployment

Plain-HTTP production deployment of the Zynatra SPA on a hardened Ubuntu VM.

```
Browser --:80--> proxy (nginx: security headers, rate limit)
                     |
                     v
                 app (nginx: static SPA + cache + gzip_static) --:8080 internal
                     |
Browser --HTTPS--> Firebase Auth / Firestore (rules + restricted API key)
```

- `app` = `Dockerfile` (multi-stage: Node build → nginx-unprivileged, non-root, `:8080`).
- `proxy` = `nginxinc/nginx-unprivileged` edge, host `80 → 8080`, mounted `nginx/nginx.conf`.
- Only the `proxy` publishes a host port. `app:8080` is internal to the compose network.

## Prerequisites

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (`az`) installed.
- An Azure subscription with access to **East US** and enough regional vCPU quota.
- An SSH key pair (`~/.ssh/id_rsa.pub` by default; override with `SSH_KEY_PATH`).
- Docker + the compose plugin **on your workstation** (to build/test locally).
- Real Firebase web config values (the 6 `VITE_FIREBASE_*` keys).

```bash
az login
az account show --output table          # confirm the right subscription
az vm list-usage -l eastus -o table     # Phase 0: check vCPU / BS-family quota
```

## 1. Provision the server

```bash
# Optional overrides:
#   export ADMIN_IP=203.0.113.7        # restrict SSH to your IP (recommended)
#   export VM_SIZE=Standard_B2s        # if BS-family quota allows 2 vCPU

bash deploy/azure-setup.sh
```

This creates `zynatra-rg`, a Standard static public IP, an NSG allowing **only**
22 and 80, an Ubuntu 22.04 VM (`Standard_B1ms` by default) with a non-root sudo
user, and then over SSH: key-only auth, UFW (22/80 only), fail2ban and Docker.

The script prints the **public IP** at the end.

## 2. Enable monitoring + alert

```bash
# Optional: export ALERT_EMAIL=ops@example.com
bash deploy/monitoring.sh
```

Creates the `zynatra-law` Log Analytics workspace, installs the Azure Monitor
Agent extension on the VM, and enables a **CPU > 80% (5m)** metric alert.

## 3. Deploy the application

```bash
# On the VM (after step 1), copy the deployable files:
scp docker-compose.yml zynatra@<PUBLIC_IP>:~/zynatra/
scp -r nginx zynatra@<PUBLIC_IP>:~/zynatra/

# Create .env from the example and fill in the real Firebase values:
cp .env.example .env      # then edit .env
scp .env zynatra@<PUBLIC_IP>:~/zynatra/.env

# Build and start the stack on the VM:
ssh zynatra@<PUBLIC_IP>
cd ~/zynatra
docker compose up -d --build
docker compose ps          # both services should report (healthy)
curl -I http://localhost/  # security headers + 200
```

### Updates

```bash
git pull
docker compose up -d --build
```

### Teardown

```bash
az group delete --name zynatra-rg --yes --no-wait
```

## 4. Firebase Auth Authorized Domains (required for login)

Firebase Authentication rejects sign-ins from origins that are not allow-listed.

1. Open the [Firebase Console](https://console.firebase.google.com/) → your project.
2. **Authentication → Settings → Authorized domains → Add domain**.
3. Add the VM's public IP / host:
   - `<PUBLIC_IP>` (e.g. `20.123.45.67`)
   - Add `localhost` too if you want to test locally.
4. Save. Sign in on `http://<PUBLIC_IP>/`; the session must authenticate against
   real Firebase.

Additionally restrict the browser API key (Google Cloud Console → APIs & Services
→ Credentials) to HTTP referrers `http://<PUBLIC_IP>/*` so the public key cannot
be reused from other origins.

## 5. Firestore rules

`firestore.rules` denies everything by default and grants authenticated,
role-aware access to `users, students, tasks, submissions, connections,
recovery_requests`. Deploy them with:

```bash
firebase deploy --only firestore:rules
```

## Verification checklist (rubric 1–5)

| # | Check | Command |
|---|-------|---------|
| 1 | Split bundle, no `>500 kB` warning | `npm run build` |
| 2 | Stack healthy, app port isolated | `docker compose ps`; `curl http://<IP>:8080/` refused |
| 3 | Proxy on 80, headers present | `curl -I http://<IP>/` → nosniff/SAMEORIGIN/Referrer-Policy |
| 3 | Asset immutable / index no-cache | `curl -I http://<IP>/assets/<file>`; `curl -I http://<IP>/index.html` |
| 4 | Hardened server | `sudo ufw status`; `sudo fail2ban-client status`; SSH without key refused |
| 5 | Monitoring | `az monitor metrics alert list -g zynatra-rg -o table` |
| 5 | Firebase login + rules | Login from `http://<IP>/`; unauthorized read denied |

> **Note**: `deploy/*.sh` requires `shellcheck` clean before pushing
> (`shellcheck deploy/*.sh`).
