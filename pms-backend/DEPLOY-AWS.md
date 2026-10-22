# Despliegue del PMS en AWS (EC2 + Docker Compose)

Guía para publicar el backend del PMS en una instancia EC2 con todos sus
servicios en contenedores. Es la opción más simple y económica, y mantiene
**RedisJSON** (cap. 7) y **RabbitMQ** (cap. 16) reales.

## Arquitectura

```
                 Internet
                    │
          Elastic IP (IP fija)
                    │
                    ▼
        ┌───────────────────────────────┐
        │  EC2 (Ubuntu 24.04, t3.small) │
        │                               │
        │  nginx :80/:443  ──► app :3000│
        │                    (Node)     │
        │   ├── postgres:16             │
        │   ├── redis/redis-stack       │
        │   └── rabbitmq:3-management   │
        │                               │
        │  Volúmenes Docker (pgdata,    │
        │  redisdata, rabbitdata)       │
        └───────────────────────────────┘
```

Los contenedores `db`, `redis` y `rabbitmq` **no** exponen puertos a Internet:
solo la `app` los alcanza por la red interna de Docker. El único punto de
entrada es nginx.

---

## 1. Requisitos previos

- Cuenta de AWS con permisos sobre EC2.
- (Opcional) Un dominio para habilitar HTTPS con Let's Encrypt.
- Docker ya no hace falta instalarlo en tu PC: el build se hace en la instancia.

## 2. Crear la instancia EC2

En la consola de AWS → **EC2 → Launch instance**:

| Parámetro | Valor |
|---|---|
| Nombre | `pms-backend` |
| AMI | Ubuntu Server 24.04 LTS (x86_64) |
| Tipo | `t3.small` (2 vCPU, 2 GB) — subir a `t3.medium` si hace falta |
| Key pair | crear/descargar una `.pem` (la usarás por SSH) |
| Almacenamiento | 20 GB **gp3** |
| Usuario | `ubuntu` |

## 3. Grupo de seguridad (Security Group)

Reglas de entrada (solo lo imprescindible):

| Tipo | Puerto | Origen | Motivo |
|---|---|---|---|
| SSH | 22 | **Tu IP** (`x.x.x.x/32`) | Administración |
| HTTP | 80 | 0.0.0.0/0 | Entrada web |
| HTTPS | 443 | 0.0.0.0/0 | Entrada web (si usas TLS) |

No abras 3000, 5432, 6379 ni 5672: al estar en Docker, solo nginx debe ser
accesible desde fuera.

## 4. Elastic IP

EC2 → **Elastic IPs → Allocate** y asóciala a la instancia. Así la IP pública no
cambia al reiniciar. (Si luego usas un dominio, apunta un registro `A` a esa IP.)

## 5. Conectar por SSH e instalar Docker

```bash
ssh -i mi_clave.pem ubuntu@<ELASTIC_IP>

# Docker Engine + plugin compose
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu   # cerrar y reabrir la sesión SSH
```

## 6. Subir el proyecto

```bash
git clone <URL_DE_TU_REPO> pms
cd pms/pms-backend
# Si el repo es privado, usa un token o sube solo la carpeta pms-backend por scp.
```

## 7. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Rellena como mínimo: `JWT_SECRET`, `DB_PASSWORD`, `RABBITMQ_PASS` y el `MAIL_*`.
`DB_USERNAME`, `DB_PASSWORD` y `DB_NAME` son los que usará el contenedor de
PostgreSQL, así que deben coincidir con lo que espera la app (comparten el
mismo archivo `.env`, por lo que ya coinciden).

> El archivo `.env` está en `.gitignore`: nunca se sube al repositorio.

## 8. Crear el esquema y sembrar los datos iniciales

Primero levanta solo las dependencias y espera a que estén sanas:

```bash
docker compose -f docker-compose.prod.yml up -d db redis rabbitmq
docker compose -f docker-compose.prod.yml ps        # db / redis / rabbitmq -> healthy
```

Crea el esquema de TypeORM y el rol/usuario por defecto (una sola vez). Este
paso usa `DB_SYNCHRONIZE=true`, el valor por defecto del `.env`:

```bash
docker compose -f docker-compose.prod.yml run --rm app node dist/src/main.js --init
```

> **Importante:** ahora edita `.env` y pon `DB_SYNCHRONIZE=false`. Con varios
> workers (`CLUSTER_WORKERS > 1`), si se deja en `true`, todos intentan crear el
> esquema a la vez al arrancar y uno falla (`23505` en `pg_type`), quedándose
> sin conexión a la base de datos.

```bash
nano .env      # DB_SYNCHRONIZE=false
```

## 9. Levantar la aplicación completa

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps        # todo -> healthy
```

Comprueba que responde a través de nginx:

```bash
curl -i http://localhost/ping                       # -> "pong"

curl -s -X POST http://localhost/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"superadmin@pms.local","password":"Super@2026"}'
```

El login debe devolver `200` con `accessToken`. **Cambia la contraseña** de
`superadmin` en cuanto entres por primera vez.

## 10. HTTPS con Let's Encrypt (opcional, recomendado)

Con un dominio apuntando a la Elastic IP:

```bash
sudo apt-get install -y certbot
sudo certbot certonly --webroot -w /var/www/certbot -d api.tu-dominio.com \
  --deploy-hook "docker compose -f docker-compose.prod.yml exec nginx nginx -s reload"
```

Copia el certificado a `deploy/certs/`, descomenta el bloque `server { listen 443 … }`
de `deploy/nginx/nginx.conf` y reinicia nginx:

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

## 11. Operación

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f app

# Actualizar tras un push
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Backup de PostgreSQL
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$DB_USERNAME" "$DB_NAME" > backup_$(date +%F).sql
```

Además, programa **snapshots de EBS** (EC2 → Elastic Block Store → Lifecycle
Manager) para tener copias de toda la instancia.

## 12. Optimización de costes

- `t3.small` con **27 GB de EBS gp3** suele entrar en la capa gratuita durante
  el primer año; después ronda los **$20–30/mes** en total.
- Elige la región más cercana a tus usuarios.
- Ajusta `CLUSTER_WORKERS` en `.env` al número de vCPU (2 para `t3.small`).
- Sin balanceador (ALB) ni RDS: todo dentro de la instancia.
- Para abaratar más en pruebas, para la instancia cuando no la uses (el
  almacenamiento sigue cobrándose, la CPU no).

## Notas del proyecto

- La aplicación se ejecuta compilada (`node dist/src/main.js`) y con el modo
  clúster de Node (`CLUSTER_WORKERS`). No se usa PM2 dentro del contenedor.
- `DB_SYNCHRONIZE` controla el `synchronize` de TypeORM. En producción con más
  de un worker déjalo en `false` (el esquema se crea una vez con `--init`).
- `analytics_worker.js` (cap. 18) es JavaScript plano; el `Dockerfile` lo copia
  a `dist/src/workers/` porque `tsc` no lo incluye.
- Los datos persisten en volúmenes Docker (`pgdata`, `redisdata`,
  `rabbitdata`) que sobreviven a `up -d --build`.
