# Eco-Return Ireland Backend - Deployment Guide

> Target: Oracle Cloud VM.Standard.A1.Flex (ARM64), Docker Compose
>
> Strategy: GitHub Actions builds the image -> Push to Docker Hub -> Pull on VM

## Architecture

```
Internet -> :443 (HTTPS) -> [Caddy] -> [backend :8080] -> [db :5432]
                                                         -> [redis :6379]
```

- Caddy handles HTTPS (auto Let's Encrypt SSL for `api.isitfull.ie`)
- DB and Redis are on an internal Docker network, **not exposed to host**
- Backend is also internal -- only Caddy is exposed (ports 80/443)
- Containers communicate via Docker DNS (`backend`, `db`, `redis`)

---

## Step 1: Oracle Cloud -- Open Firewall Ports

Before anything works, you must open ports in Oracle Cloud's VCN:

1. Go to **Networking -> Virtual Cloud Networks** in Oracle Cloud Console
2. Click your VCN -> your **Subnet** -> **Security Lists** -> **Default Security List**
3. Add **Ingress Rules**:

| Source CIDR | Protocol | Dest Port | Description |
|-------------|----------|-----------|-------------|
| `0.0.0.0/0` | TCP | 80 | HTTP (Caddy redirect) |
| `0.0.0.0/0` | TCP | 443 | HTTPS (Caddy) |

Also open the Ubuntu firewall on the VM:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## Step 2: GitHub Actions -- Build and Deploy the Image

`.github/workflows/deploy-backend.yml` runs on every push to `main` that changes `backend/`. You can also start it by hand from the repository's **Actions** tab. It:

1. Builds `backend/Dockerfile` for `linux/arm64`
2. Pushes the image to Docker Hub, tagged `latest` and with the commit SHA
3. SSHes into the VM and runs `pull backend` and `up -d backend` with `docker-compose.prod.yml` in `/opt/app/eco-return`

The Dockerfile builds with `mvn package -DskipTests`, so nothing runs the tests before a deploy. Run the backend checks in [CONTRIBUTING.md](../CONTRIBUTING.md#checks) before merging to `main`.

Add these repository secrets under **Settings -> Secrets and variables -> Actions**:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `VM_HOST` | `<VM_PUBLIC_IP>` |
| `VM_USER` | SSH user on the VM, e.g. `ubuntu` |
| `VM_SSH_KEY` | Private SSH key for that user |

Until the VM is set up (steps 3 to 8), the SSH step fails, but the image is already pushed.

### Fallback: Build and Push by Hand

Use this only if the workflow cannot run. On your Mac (one-time setup):

```bash
docker login
export DOCKER_USER=your-dockerhub-username
```

Build the ARM64 image and push:

```bash
cd /path/to/Eco-Return-Ireland

docker buildx build \
  --platform linux/arm64 \
  -t $DOCKER_USER/eco-return-backend:latest \
  -f backend/Dockerfile \
  backend/ \
  --push
```

> If `buildx` is not set up yet:
> ```bash
> docker buildx create --name arm-builder --use
> docker buildx inspect --bootstrap
> ```

---

## Step 3: VM -- Install Docker

SSH into your Oracle VM:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y
exit
```

Verify:

```bash
docker --version
docker compose version
```

---

## Step 4: VM -- Prepare Deployment Files

Create the deployment directory:

```bash
sudo mkdir -p /opt/app/eco-return && sudo chown $USER:$USER /opt/app/eco-return
cd /opt/app/eco-return
mkdir -p config
```

Transfer files from the repository root on your Mac:

```bash
VM_IP=<VM_PUBLIC_IP>
VM_USER=ubuntu

scp deploy/docker-compose.prod.yml $VM_USER@$VM_IP:/opt/app/eco-return/
scp deploy/Caddyfile $VM_USER@$VM_IP:/opt/app/eco-return/
scp deploy/.env.production.example $VM_USER@$VM_IP:/opt/app/eco-return/
scp path/to/firebase-service-account.json $VM_USER@$VM_IP:/opt/app/eco-return/config/
scp backend/src/main/resources/db/init.sql $VM_USER@$VM_IP:/opt/app/eco-return/config/
```

The full RVM dataset is not in the repository. The maintainer copies it from outside the repository to `/opt/app/eco-return/config/1.json`:

```bash
scp path/to/1.json $VM_USER@$VM_IP:/opt/app/eco-return/config/1.json
```

---

## Step 5: VM -- Configure Environment

```bash
cd /opt/app/eco-return
cp .env.production.example .env.production
nano .env.production
```

Fill in all values:

| Variable | Description | Example |
|----------|-------------|---------|
| `DOCKER_IMAGE` | Docker Hub image path | `myuser/eco-return-backend:latest` |
| `DB_USERNAME` | PostgreSQL username | `eco_return_user` |
| `DB_PASSWORD` | PostgreSQL password | (generate below) |
| `REDIS_PASSWORD` | Redis password | (generate below) |
| `JWT_SECRET` | JWT signing key (>=32 chars) | (generate below) |
| `LOCATIONIQ_API_KEY` | LocationIQ API key | `pk_xxx` |
| `GOOGLE_GEOCODING_API_KEY` | Google Geocoding key | `AIzaSy...` |
| `MAPBOX_ACCESS_TOKEN` | Mapbox token. Required by `application-prod.yml`, although the Mapbox client is unused today | `pk.xxx` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `https://isitfull.ie` |
| `OCI_STORAGE_ENABLED` | Enable screenshot uploads | `true` |
| `OCI_AUTH_TYPE` | OCI auth method | `instance_principal` |
| `OCI_REGION` | OCI region | `uk-london-1` |
| `OCI_NAMESPACE` | OCI tenancy namespace | (from OCI console) |
| `OCI_BUCKET` | OCI bucket name | `isitfull-feedback` |

Generate secrets:

```bash
openssl rand -base64 48   # JWT secret
openssl rand -base64 24   # Redis password
openssl rand -base64 24   # DB password
```

---

## Step 6: VM -- DNS Setup

Point your domain to the VM's public IP:

| Type | Name | Value |
|------|------|-------|
| A | `api.isitfull.ie` | `<VM_PUBLIC_IP>` |

Caddy will automatically request a Let's Encrypt SSL certificate once DNS resolves.

---

## Step 7: VM -- Initialize Database

On first deployment, create the database schema manually:

```bash
cd /opt/app/eco-return

# Start only the DB first
docker compose -f docker-compose.prod.yml up -d db

# Wait for it to be healthy
docker compose -f docker-compose.prod.yml ps db

# Run the init script
cat config/init.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U $DB_USERNAME eco_return
```

---

## Step 8: VM -- Start All Services

```bash
cd /opt/app/eco-return

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Watch logs
docker compose -f docker-compose.prod.yml logs -f
```

Wait for these log messages:
- `eco-return-db`: `database system is ready to accept connections`
- `eco-return-redis`: `Ready to accept connections`
- `eco-return-backend`: `Started EcoReturnApplication`
- `eco-return-caddy`: `certificate obtained successfully`

---

## Step 9: Verify

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Test HTTPS endpoint
curl "https://api.isitfull.ie/api/v1/rvms/nearby?lat=53.35&lng=-6.26&radius=5000"

# Check logs
docker compose -f docker-compose.prod.yml logs backend --tail 50
```

---

## Step 10: Change Default Admin Password

The init script seeds a default admin:
- Username: `admin`
- Password: `changeme123`

Login to the admin panel and change this immediately.

---

## RVM Data Sync

1. **First startup**: If the database has no RVMs, the backend auto-imports from `/config/1.json`
2. **Daily sync**: Scheduled task at 3:00 AM fetches latest data from Re-turn.ie API
3. **Manual sync**: Use the admin panel's "Sync Re-turn" button

---

## Common Operations

### Update and Redeploy

Push or merge to `main` with changes under `backend/`, and the workflow (Step 2) builds and deploys the new image. To redeploy without a backend change, start it from the **Actions** tab.

If the workflow cannot run, build and push by hand as in the Step 2 fallback, then on the VM:

```bash
cd /opt/app/eco-return
docker compose -f docker-compose.prod.yml pull backend
docker compose -f docker-compose.prod.yml up -d backend
```

### View Logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f caddy
```

### Restart / Stop

```bash
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml down
```

### Database Backup / Restore

Manual backup:

```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U $DB_USERNAME eco_return > backup_$(date +%Y%m%d).sql
```

Restore:

```bash
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U $DB_USERNAME eco_return
```

### Automated Daily Backup (Cron)

On the VM, set up the backup script:

```bash
# Copy backup.sh to server (from the repository root on your Mac)
scp deploy/backup.sh $VM_USER@$VM_IP:/opt/app/eco-return/

# On the VM
chmod +x /opt/app/eco-return/backup.sh

# Source DB_USERNAME from .env.production for cron
# Add to crontab (runs daily at 2:00 AM, keeps 7 days)
crontab -e
```

Add this line:

```
0 2 * * * export $(grep DB_USERNAME /opt/app/eco-return/.env.production) && /opt/app/eco-return/backup.sh >> /opt/app/eco-return/backups/cron.log 2>&1
```

Verify backups:

```bash
ls -la /opt/app/eco-return/backups/
```

### Enter DB / Redis Shell

```bash
docker compose -f docker-compose.prod.yml exec db psql -U $DB_USERNAME eco_return
docker compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD
```

---

## Port Summary

| Service | Container Port | Host Port | Exposed? |
|---------|---------------|-----------|----------|
| caddy | 80, 443 | 80, 443 | Yes |
| backend | 8080 | -- | No (Caddy proxies) |
| db | 5432 | -- | No (internal only) |
| redis | 6379 | -- | No (internal only) |

---

## Troubleshooting

### Caddy can't get SSL certificate

- Verify DNS: `dig api.isitfull.ie` should return your VM's IP
- Check Oracle VCN firewall has ports 80 and 443 open
- Check Ubuntu iptables: `sudo iptables -L INPUT -n`
- Check Caddy logs: `docker compose -f docker-compose.prod.yml logs caddy`

### Backend can't connect to DB

```bash
docker compose -f docker-compose.prod.yml ps db
docker compose -f docker-compose.prod.yml logs db --tail 20
```

### OCI Instance Principal not working from Docker

If screenshot uploads fail, the container may not reach the OCI metadata service.

Option A -- Add metadata route:
```yaml
# In docker-compose.prod.yml, add to backend service:
extra_hosts:
  - "metadata.oraclecloud.com:169.254.169.254"
```

Option B -- Fall back to config file auth:
```bash
# In .env.production:
OCI_AUTH_TYPE=config_file
OCI_CONFIG_FILE=/config/oci-config
```
