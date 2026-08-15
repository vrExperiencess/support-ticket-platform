# Support Ticket Platform — Guía de ejecución

Esta guía contiene únicamente los pasos necesarios para ejecutar la aplicación completa utilizando Docker.

La solución incluye:

* Frontend React + Nginx
* Backend NestJS
* PostgreSQL
* Datos semilla para pruebas
* Usuarios demo

---

## 1. Requisitos

Antes de iniciar, asegúrese de tener instalado:

* Git
* Docker Desktop
* Docker Compose

Puede comprobar Docker ejecutando:

```bash
docker --version
```

y:

```bash
docker compose version
```

---

# 2. Descargar el repositorio

Clonar el repositorio:

```bash
git clone <https://github.com/vrExperiencess/support-ticket-platform.git>
```

Entrar en la carpeta del proyecto:

```bash
cd support-ticket-platform
```

No es necesario instalar dependencias manualmente con `npm install`.

Docker se encarga de construir tanto el Frontend como el Backend.

---

# 3. Levantar la aplicación

Desde la raíz del proyecto ejecutar:

```bash
docker compose up --build
```

Este comando realizará automáticamente:

```text
PostgreSQL
    ↓
Creación de la base de datos
    ↓
Creación del esquema
    ↓
Ejecución de datos semilla
    ↓
NestJS Backend
    ↓
React + Nginx Frontend
```

La primera ejecución puede tardar un poco más porque Docker debe descargar las imágenes y construir los contenedores.

Cuando los servicios estén listos, la aplicación estará disponible en:

```text
Frontend
http://localhost:8080
```

```text
Backend API
http://localhost:3000/api
```

PostgreSQL queda disponible en:

```text
Host: localhost
Port: 5432
Database: support_ticket_db
User: support_user
Password: support_password
```

---

# 4. Credenciales de demostración

## Administrator

```text
Email:
admin@support.local

Password:
Admin123!
```

## Supervisor

```text
Email:
supervisor@support.local

Password:
Supervisor123!
```

## Support Agent

```text
Email:
agent1@support.local

Password:
Agent123!
```

También existe un segundo agente de prueba:

```text
Email:
agent2@support.local

Password:
Agent123!
```

---

# 5. Verificar los contenedores

En otra terminal puede ejecutarse:

```bash
docker compose ps
```

Los tres servicios deberían aparecer activos:

```text
support_ticket_database
support_ticket_backend
support_ticket_frontend
```

Idealmente Database, Backend y Frontend aparecerán con estado:

```text
healthy
```

---

# 6. Probar la aplicación

Abrir en el navegador:

```text
http://localhost:8080
```

Ingresar, por ejemplo, con:

```text
admin@support.local
Admin123!
```

Después del inicio de sesión podrá acceder al Dashboard y los módulos habilitados para el perfil.

---

# 7. Probar la API directamente

El Backend también se expone directamente en:

```text
http://localhost:3000/api
```

Por ejemplo, el login puede probarse con Postman:

```http
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "email": "admin@support.local",
  "password": "Admin123!"
}
```

Las rutas protegidas requieren enviar:

```http
Authorization: Bearer <token>
```

---

# 8. Detener la aplicación

Para detener los contenedores:

```bash
docker compose down
```

La información de PostgreSQL se conserva gracias al volumen Docker.

Al volver a ejecutar:

```bash
docker compose up
```

la información continuará disponible.

---

# 9. Reiniciar completamente la base de datos

Si se desea regresar el entorno al estado inicial de demostración:

```bash
docker compose down -v
```

y posteriormente:

```bash
docker compose up --build
```

La opción:

```text
-v
```

elimina el volumen de PostgreSQL.

Al volver a iniciar la aplicación:

* se crea una nueva base de datos;
* se genera nuevamente el esquema;
* se ejecutan los datos semilla;
* se restauran los usuarios demo.

---

# 10. Reconstruir la aplicación después de cambios

Si se realizan cambios en Frontend o Backend:

```bash
docker compose up --build
```

También puede reconstruirse sin iniciar los contenedores:

```bash
docker compose build
```

---

# 11. Ver logs

Para visualizar los logs de todos los servicios:

```bash
docker compose logs -f
```

Backend:

```bash
docker compose logs -f backend
```

Frontend:

```bash
docker compose logs -f frontend
```

Base de datos:

```bash
docker compose logs -f database
```

---

# 12. Arquitectura Docker

La comunicación interna funciona de la siguiente manera:

```text
Browser
   |
   | http://localhost:8080
   v
React + Nginx
   |
   | /api/*
   v
NestJS Backend
backend:3000
   |
   v
PostgreSQL
database:5432
```

El Frontend utiliza Nginx como proxy hacia el Backend, por lo que el navegador no necesita conocer los nombres internos de los contenedores Docker.

---

# 13. Puertos utilizados

La aplicación utiliza:

| Servicio   | Puerto |
| ---------- | -----: |
| Frontend   | `8080` |
| Backend    | `3000` |
| PostgreSQL | `5432` |

Si alguno de estos puertos se encuentra ocupado por otra aplicación, será necesario liberar dicho puerto antes de iniciar el entorno.

Por ejemplo, puede existir otra instalación local de PostgreSQL utilizando:

```text
5432
```

---

# 14. Ejecución rápida

Para una evaluación rápida, solamente es necesario:

```bash
git clone <https://github.com/vrExperiencess/support-ticket-platform.git>

cd support-ticket-platform

docker compose up --build
```

Después abrir:

```text
http://localhost:8080
```

y utilizar:

```text
admin@support.local
Admin123!
```

---

## Nota

Las credenciales, variables de entorno y configuración incluidas en este repositorio están destinadas exclusivamente al entorno local de demostración de la prueba técnica.

En un entorno productivo se utilizarían mecanismos apropiados para gestión de secretos, migraciones de base de datos y configuración por ambiente.
