# Support Ticket Platform

Plataforma Full Stack para la administración de tickets de soporte, desarrollada como parte de una prueba técnica orientada a evaluar capacidades de arquitectura, desarrollo Frontend/Backend, modelado relacional, SQL, seguridad, diseño de APIs y criterio técnico.

La aplicación permite gestionar tickets, usuarios, clientes, comentarios, asignaciones, estados, permisos y métricas operativas mediante un dashboard configurable según el perfil del usuario.

---

## 🎥 Video demo

A continuación puedes ver una demostración rápida del resultado final de la aplicación, incluyendo autenticación, dashboard, gestión de tickets y administración de usuarios.

[![Support Ticket Platform - Video Demo](https://img.youtube.com/vi/p50pc3ORh8U/maxresdefault.jpg)](https://youtu.be/p50pc3ORh8U)

▶️ **[Ver demostración en YouTube](https://youtu.be/p50pc3ORh8U)**

---

## 1. Objetivo

El objetivo de la solución es implementar un sistema de soporte en el cual diferentes perfiles puedan interactuar con los tickets de acuerdo con sus responsabilidades.

Los principales perfiles contemplados son:

* **Administrator**
* **Supervisor**
* **Support Agent**

La solución fue diseñada procurando mantener un equilibrio entre:

* separación de responsabilidades;
* seguridad;
* mantenibilidad;
* trazabilidad;
* facilidad de evolución;
* claridad del modelo de datos;
* simplicidad operativa;
* cumplimiento de los requerimientos de la prueba.

---

# 2. Stack tecnológico

## Frontend

* React
* Vite
* React Router
* TypeScript / JavaScript
* Consumo de API REST
* Arquitectura basada en componentes

## Backend

* Node.js
* NestJS
* TypeScript
* TypeORM
* API REST
* JWT Authentication
* RBAC basado en Roles y Permisos

## Base de datos

* PostgreSQL
* SQL
* TypeORM Entities
* Seed data
* Consultas SQL independientes para los ejercicios solicitados

## Infraestructura local

* Docker
* Docker Compose
* PostgreSQL ejecutado en contenedor

## Cloud target

La prueba solicita considerar **AWS** como plataforma cloud objetivo.

La implementación se mantuvo local y reproducible mediante Docker para evitar introducir complejidad de infraestructura innecesaria dentro del tiempo disponible para la prueba.

Una evolución natural en AWS sería:

```text
Internet
   |
   v
CloudFront / ALB
   |
   +---------------------+
   |                     |
   v                     v
Frontend              Backend
React                 NestJS
S3/CloudFront         ECS/Fargate
                         |
                         v
                  Amazon RDS
                  PostgreSQL
```

---

# 3. Decisión arquitectónica principal

Se eligió implementar un **monolito modular**.

```text
Frontend
   |
   | HTTP / REST
   v
NestJS API
   |
   +-- Auth
   +-- Users
   +-- Roles
   +-- Permissions
   +-- Clients
   +-- Tickets
   +-- Comments
   +-- Dashboard
   |
   v
PostgreSQL
```

No se utilizaron microservicios deliberadamente.

Para el alcance actual, dividir Auth, Tickets, Users, Dashboard, Comments, etc. en servicios independientes habría implicado agregar:

* comunicación entre servicios;
* múltiples deployments;
* service discovery;
* observabilidad distribuida;
* manejo de errores entre servicios;
* mayor configuración de infraestructura;
* mayor complejidad para mantener consistencia transaccional.

Todo esto habría incrementado significativamente el costo técnico sin generar un beneficio proporcional para una aplicación de este tamaño.

El monolito modular permite mantener una separación clara entre dominios sin introducir complejidad operacional prematura.

Además, deja abierta la posibilidad de extraer módulos hacia servicios independientes en el futuro si la escala o las necesidades del negocio lo justifican.

---

# 4. Organización conceptual del Backend

La aplicación se divide por dominio.

```text
backend/
└── src/
    ├── auth/
    ├── users/
    ├── roles/
    ├── permissions/
    ├── clients/
    ├── tickets/
    ├── comments/
    └── dashboard/
```

Cada módulo mantiene sus propias responsabilidades.

El flujo general es:

```text
HTTP Request
     |
     v
Controller
     |
     v
Service / Business Logic
     |
     v
TypeORM
     |
     v
PostgreSQL
```

## Controller

Responsable de:

* recibir solicitudes HTTP;
* validar parámetros;
* obtener el usuario autenticado;
* delegar la operación al Service;
* retornar la respuesta correspondiente.

## Service

Contiene las reglas de negocio.

Por ejemplo:

* determinar si un usuario puede editar un ticket;
* verificar si un agente tiene asignado el ticket;
* ejecutar una reasignación;
* cerrar o reabrir tickets;
* registrar cambios;
* recuperar métricas.

Esta decisión evita colocar reglas complejas directamente en los Controllers.

---

# 5. Estructura del proyecto

Conceptualmente el repositorio sigue una estructura similar a:

```text
support-ticket-platform/
│
├── frontend/
│
├── backend/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── queries/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

La intención es mantener claramente separados:

* código del Frontend;
* código del Backend;
* infraestructura;
* scripts SQL;
* datos iniciales;
* documentación.

---

# 6. Modelo de datos

La base de datos fue diseñada de forma relacional evitando almacenar información de autorización o estados importantes como texto arbitrario.

Las tablas principales son:


roles
permissions
role_permissions

users

clients

ticket_statuses
ticket_priorities

tickets
ticket_comments
ticket_assignment_history
ticket_status_history

dashboard_widgets

---

# 7. Roles

La tabla:


roles

representa los perfiles funcionales existentes en el sistema.

Actualmente:


ADMIN
SUPERVISOR
SUPPORT_AGENT


No se colocaron únicamente condiciones como:


if (user.role === "ADMIN")


por toda la aplicación.

En cambio, se diseñó un modelo de autorización basado en permisos.

---

# 8. Permissions y RBAC

El modelo utiliza:


roles
permissions
role_permissions
users


Relación conceptual:


User
 |
 v
Role
 |
 v
RolePermissions
 |
 v
Permissions


Esto permite que las capacidades del sistema sean configurables.

Por ejemplo, conceptualmente pueden existir permisos como:


tickets.read
tickets.create
tickets.update
tickets.assign
tickets.reassign
tickets.change_status
tickets.close
tickets.reopen
tickets.delete

comments.create
comments.create_internal

users.read
users.create
users.update

dashboard.read


La ventaja de este modelo es evitar acoplar completamente la autorización al nombre de un rol.

Por ejemplo, en el futuro podría aparecer un rol:

TEAM_LEAD


al que se le podrían asignar determinados permisos sin necesidad de reconstruir toda la lógica de autorización.

---

# 9. Backend como autoridad de seguridad

El Frontend puede esconder o mostrar botones para mejorar la experiencia del usuario, pero la autorización real siempre debe realizarse en el Backend.


Agent
  |
  | PATCH /tickets/:id
  v
Backend
  |
  +--> ¿Tiene permiso?
  |
  +--> ¿El ticket está asignado a este agente?
  |
  +--> Sí -> operación permitida
  |
  +--> No -> 403 Forbidden


## Por lo tanto, modificar manualmente una solicitud HTTP desde DevTools, Postman o cualquier otro cliente no permite evadir las restricciones del sistema.

---

# 10. Autenticación

La autenticación se maneja mediante JWT.

Flujo conceptual:


Usuario
   |
   | email + password
   v
POST /api/auth/login
   |
   v
Validación de credenciales
   |
   v
JWT
   |
   v
Frontend
   |
   | Authorization: Bearer <token>
   v
API


El token contiene la identidad necesaria para determinar el usuario autenticado y sus permisos.

---

# 11. Credenciales de demostración

> Estas credenciales existen exclusivamente para facilitar la evaluación local de la prueba técnica y no deben utilizarse en ambientes productivos.

## Administrator

```text
Email:    admin@support.local
Password: Admin123!
```

## Supervisor

```text
Email:    supervisor@support.local
Password: Supervisor123!
```

## Support Agent

```text
Email:    agent1@support.local
Password: Agent123!
```

---

# 12. Matriz funcional por perfil

| Acción                    | Admin | Supervisor |       Agent       |
| ------------------------- | :---: | :--------: |     :-----------: |
| Ver todos los tickets     |   ✅   |      ✅     |       ❌       |
| Crear ticket              |   ✅   |      ❌     |       ✅       |
| Asignar ticket sin agente |   ✅   |      ✅     |       ❌       |
| Reasignar ticket          |   ✅   |      ✅     |       ❌       |
| Editar cualquier ticket   |   ✅   |      ❌     |       ❌       |
| Editar ticket asignado    |   —     |      —      |       ✅       |
| Comentario normal         |   ✅   |      ❌     |       ✅       |
| Comentario interno        |   ✅   |      ✅     |       ❌       |
| Cambiar estado            |   ✅   |      ❌     | Solo asignado   |
| Cerrar ticket             |   ✅   |      ❌     |       ❌       |
| Reabrir ticket            |   ✅   |      ❌     |       ❌       |
| Eliminar ticket           |   ✅   |      ❌     |       ❌       |

Esta matriz representa reglas de negocio, no únicamente restricciones visuales.

Todas estas condiciones son verificadas en Backend.

---

# 13. Tickets

El módulo `tickets` concentra la mayor parte de la lógica operacional de la aplicación.

Un ticket contiene información relacionada con:

* cliente;
* creador;
* agente asignado;
* estado;
* prioridad;
* título;
* descripción;
* fechas;
* resolución;
* actualización;
* cierre.

Las relaciones permiten posteriormente obtener métricas sin tener que duplicar información.

---

# 14. Estados de ticket

Los estados se almacenan en:

```text
ticket_statuses
```

en lugar de mantener valores arbitrarios directamente en el código.

Por ejemplo:

```text
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

Esto permite separar claramente conceptos que pueden parecer equivalentes pero que operacionalmente representan etapas diferentes.

Especialmente:

```text
RESOLVED != CLOSED
```

Un ticket puede haber sido resuelto técnicamente sin haber sido cerrado definitivamente.

Esta diferencia también afecta algunas consultas SQL descritas posteriormente.

---

# 15. Prioridades

Las prioridades se normalizaron mediante:

```text
ticket_priorities
```

Por ejemplo:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Esto permite:

* integridad referencial;
* filtros consistentes;
* ordenamiento;
* estadísticas;
* evitar valores escritos incorrectamente.

---

# 16. Clientes

Los tickets pertenecen a clientes.

Para ello se utiliza:

```text
clients
```

separando los datos del cliente de los datos específicos del ticket.

Esta normalización permite ejecutar fácilmente métricas como:

* cantidad de tickets por cliente;
* clientes con mayor cantidad de tickets críticos;
* distribución por cliente;
* estadísticas históricas.

---

# 17. Comentarios

Los comentarios se almacenan en:

```text
ticket_comments
```

Los comentarios pueden tener diferente naturaleza.

Conceptualmente:

```text
NORMAL
INTERNAL
```

Los comentarios internos están destinados a comunicación administrativa u operacional que no necesariamente debería exponerse a todos los perfiles.

De acuerdo con las reglas definidas:

```text
Admin      -> normal + interno
Supervisor -> interno
Agent      -> normal
```

---

# 18. Historial de asignaciones

Una decisión importante fue **no sobrescribir simplemente la información cuando cambia el agente de un ticket**.

Aunque `tickets` puede contener el agente actualmente asignado, se mantiene además:

```text
ticket_assignment_history
```

El historial permite conocer:

```text
Ticket A
   |
   +-- Agent 1
   |
   +-- Agent 2
   |
   +-- Agent 1
   |
   +-- Agent 3
```

Esta decisión permite:

* auditoría;
* trazabilidad;
* saber cuántas veces se reasignó un ticket;
* conocer agentes anteriores;
* obtener métricas;
* soportar la Query #7 del ejercicio.

---

# 19. Historial de estados

De forma equivalente se dispone de:

```text
ticket_status_history
```

para conservar la evolución del ticket.

Ejemplo:

```text
OPEN
  |
  v
IN_PROGRESS
  |
  v
RESOLVED
  |
  v
CLOSED
```

Esto evita perder información histórica cuando se modifica el estado actual del registro principal.

---

# 20. API de Tickets

## Obtener tickets

```http
GET /api/tickets
```

Retorna los tickets visibles para el usuario autenticado.

La respuesta depende del perfil.

### Admin

Puede consultar todos.

### Supervisor

Puede consultar todos.

### Agent

Solo obtiene los tickets que funcionalmente le corresponde consultar de acuerdo con las reglas establecidas.

---

## Obtener ticket

```http
GET /api/tickets/:id
```

---

## Crear ticket

```http
POST /api/tickets
```

Permitido para:

```text
Admin
Agent
```

---

## Editar ticket

```http
PATCH /api/tickets/:id
```

### Admin

Puede modificar cualquier ticket.

### Agent

Solo puede modificar tickets asignados a él.

---

# 21. Asignación

## Asignar ticket

```http
POST /api/tickets/:id/assign
```

Usado principalmente cuando un ticket todavía no posee agente.

Permitido para:

```text
Admin
Supervisor
```

---

# 22. Reasignación

```http
POST /api/tickets/:id/reassign
```

Permitido para:

```text
Admin
Supervisor
```

Una reasignación genera información histórica en:

```text
ticket_assignment_history
```

permitiendo diferenciar entre el agente actual y los agentes que anteriormente tuvieron responsabilidad sobre el ticket.

---

# 23. Cambio de estado

```http
PATCH /api/tickets/:id/status
```

### Admin

Puede cambiar el estado.

### Agent

Puede cambiar el estado únicamente cuando el ticket está asignado al agente autenticado.

---

# 24. Cierre

```http
POST /api/tickets/:id/close
```

El cierre se modeló como una operación explícita en lugar de depender exclusivamente de:

```http
PATCH /tickets/:id
```

porque representa una **acción de negocio**.

Cerrar un ticket puede requerir posteriormente:

* validaciones;
* auditoría;
* timestamps;
* notificaciones;
* eventos;
* métricas.

Actualmente está reservado al perfil:

```text
Admin
```

---

# 25. Reapertura

```http
POST /api/tickets/:id/reopen
```

La reapertura también se representa como una operación de dominio explícita.

Permitida para:

```text
Admin
```

---

# 26. Eliminación

```http
DELETE /api/tickets/:id
```

Permitida exclusivamente para:

```text
Admin
```

---

# 27. Historiales

## Assignment history

```http
GET /api/tickets/:id/assignment-history
```

## Status history

```http
GET /api/tickets/:id/status-history
```

Estas rutas permiten consultar la trazabilidad del ticket sin mezclarla con la respuesta principal.

---

# 28. Comentarios

## Obtener comentarios

```http
GET /api/tickets/:id/comments
```

## Crear comentario

```http
POST /api/tickets/:id/comments
```

El Backend determina qué tipo de comentario puede crear cada perfil.

---

# 29. Catálogos de Tickets

Los formularios del Frontend no contienen valores críticos hardcodeados.

Los catálogos son obtenidos desde Backend.

## Estados

```http
GET /api/tickets/catalogs/statuses
```

## Prioridades

```http
GET /api/tickets/catalogs/priorities
```

## Clientes

```http
GET /api/tickets/catalogs/clients
```

## Agentes asignables

```http
GET /api/tickets/catalogs/assignees
```

Esto permite mantener al Backend y a PostgreSQL como fuente de verdad.

---

# 30. Users Module

Además de la autenticación se implementó un módulo específico para gestión de usuarios.

## Listar usuarios

```http
GET /api/users
```

## Obtener catálogo de roles

```http
GET /api/users/catalogs/roles
```

## Obtener usuario

```http
GET /api/users/:id
```

## Crear usuario

```http
POST /api/users
```

## Actualizar usuario

```http
PATCH /api/users/:id
```

La administración completa de usuarios se considera una extensión útil sobre el requisito mínimo de consulta de usuarios.

La implementación mantiene separada la administración de usuarios de la autenticación.

```text
Auth
 |
 +-- login
 +-- token
 +-- identidad

Users
 |
 +-- consulta
 +-- creación
 +-- edición
 +-- roles
```

Esto evita convertir el módulo de autenticación en un módulo con responsabilidades excesivas.

---

# 31. Dashboard

El Dashboard dispone de un endpoint agregado:

```http
GET /api/dashboard
```

La idea es que el Frontend no tenga que realizar múltiples consultas directas a diferentes tablas para construir la vista.

El flujo es:

```text
DashboardPage
      |
      v
GET /api/dashboard
      |
      v
DashboardService
      |
      v
Queries / Aggregations
      |
      v
PostgreSQL
```

El Backend entrega la información necesaria para representar el dashboard según el usuario autenticado.

---

# 32. Dashboard configurable

Se contempló:

```text
dashboard_widgets
```

para evitar que la composición de cada dashboard quede completamente hardcodeada en React.

Conceptualmente:

```text
Role
  |
  v
Dashboard Widgets
  |
  +-- metric
  +-- chart
  +-- table
  +-- operational block
```

En Frontend la estructura puede interpretarse mediante:

```text
DashboardPage
      |
      v
DashboardRenderer
      |
      v
WidgetRegistry
```

El `WidgetRegistry` permite mapear configuraciones recibidas hacia componentes reales.

Por ejemplo:

```ts
{
  "type": "metric"
}
```

puede ser interpretado por:

```text
MetricCard
```

Esta arquitectura permite crear diferentes dashboards sin duplicar páginas completas por perfil.

---

# 33. Resolved 30d

Una métrica utilizada por el dashboard es:

```text
Resolved 30d
```

Representa tickets resueltos durante una **ventana móvil de los últimos 30 días**.

Por ejemplo, conceptualmente:

```sql
resolved_at >= NOW() - INTERVAL '30 days'
```

Esta definición es importante porque no es igual a consultar únicamente el mes calendario anterior.

---

# 34. Las 8 consultas SQL

Además del uso de TypeORM, el ejercicio requiere demostrar dominio explícito de SQL.

Por esa razón las consultas solicitadas se mantienen como SQL legible e independiente.

```text
database/
└── queries/
    ├── 01_tickets_by_status_and_client.sql
    ├── 02_top_clients_high_priority.sql
    ├── 03_stale_tickets.sql
    ├── 04_top_resolver_previous_month.sql
    ├── 05_avg_resolution_by_priority.sql
    ├── 06_open_tickets_by_agent.sql
    ├── 07_frequently_reassigned_tickets.sql
    └── 08_closed_vs_created_last_30_days.sql
```

---

# 35. Query 1 — Tickets por estado y cliente

Obtiene la distribución de tickets agrupados por:

```text
Cliente
Estado
```

Permite analizar la carga de soporte de cada organización.

Conceptualmente:

```text
Client A
   OPEN          10
   IN_PROGRESS    5
   RESOLVED       7

Client B
   OPEN           2
   CLOSED        14
```

---

# 36. Query 2 — Top 5 clientes con tickets High/Critical

Identifica los cinco clientes con mayor cantidad de tickets cuya prioridad corresponde a:

```text
HIGH
CRITICAL
```

Esta métrica ayuda a identificar clientes que están generando mayor cantidad de incidentes relevantes.

---

# 37. Query 3 — Tickets con más de 48 horas sin actualización

La consulta identifica tickets:

```text
updated_at < NOW() - INTERVAL '48 hours'
```

y que todavía no estén cerrados.

## Decisión importante

Para esta consulta:

```text
RESOLVED
```

**continúa contando como "no cerrado".**

Solo se excluye:

```text
CLOSED
```

La razón es que el requerimiento habla específicamente de tickets **no cerrados**, no de tickets no resueltos.

Por lo tanto:

```text
OPEN         -> incluido
IN_PROGRESS  -> incluido
RESOLVED     -> incluido
CLOSED       -> excluido
```

Esta diferencia fue intencional.

---

# 38. Query 4 — Mayor resolutor del último mes

Esta consulta determina el agente que resolvió mayor cantidad de tickets durante el último mes.

## Interpretación de "último mes"

Se decidió interpretar:

> último mes

como **el mes calendario inmediatamente anterior**.

Por ejemplo, si hoy fuera agosto:

```text
Inicio: 1 de julio
Fin:    1 de agosto
```

Se utiliza conceptualmente:

```sql
DATE_TRUNC('month', ...)
```

Esta interpretación evita que "último mes" cambie de significado dependiendo del día exacto de ejecución.

---

# 39. Diferencia entre Query 4 y Resolved 30d

Estas dos métricas utilizan intencionalmente ventanas temporales diferentes.

## Query 4

```text
Mes calendario anterior
```

## Dashboard — Resolved 30d

```text
Últimos 30 días desde este instante
```

Por ejemplo:

```text
Query 4
01 Jul ---------------- 01 Ago

Resolved 30d
16 Jul ---------------- 15 Ago
```

No representan el mismo período y no deberían producir necesariamente los mismos resultados.

---

# 40. Query 5 — Tiempo promedio de resolución por prioridad

Calcula cuánto tarda en resolverse un ticket según su prioridad.

Agrupación:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Conceptualmente se evalúa:

```text
resolved_at - created_at
```

Esta métrica permite identificar si los tickets de mayor prioridad efectivamente están siendo atendidos con mayor rapidez.

---

# 41. Query 6 — Tickets abiertos por agente

Una decisión que debía definirse explícitamente era qué significa:

> tickets abiertos

Para esta consulta se decidió interpretar literalmente el estado:

```text
OPEN
```

Por lo tanto:

```text
OPEN         -> incluido
IN_PROGRESS  -> no incluido
RESOLVED     -> no incluido
CLOSED       -> no incluido
```

Si el requerimiento hubiese solicitado:

> carga activa por agente

entonces tendría mayor sentido considerar:

```text
OPEN
+
IN_PROGRESS
```

Pero esa no fue la interpretación utilizada para esta consulta.

---

# 42. Query 7 — Tickets reasignados más de dos veces

Utiliza:

```text
ticket_assignment_history
```

para encontrar tickets cuyo número de cambios de asignación sea mayor a:

```text
2
```

Este requerimiento es una de las razones principales por las que se decidió crear una tabla de historial en lugar de almacenar únicamente:

```text
tickets.assignee_id
```

---

# 43. Query 8 — Porcentaje de cerrados frente a creados

Analiza los tickets creados y cerrados durante los últimos 30 días.

La consulta utiliza una ventana móvil:

```text
NOW() - INTERVAL '30 days'
```

permitiendo calcular la relación entre demanda y capacidad de cierre.

Esta métrica ayuda a identificar si el backlog está creciendo o disminuyendo.

---

# 44. Decisiones SQL que deben conocerse

Las siguientes decisiones fueron deliberadas y forman parte de la interpretación funcional del ejercicio.

### Query 3

`RESOLVED` todavía se considera **no cerrado**.

Solo se excluye:

```text
CLOSED
```

### Query 4

"Último mes" significa:

```text
mes calendario anterior
```

utilizando `DATE_TRUNC`.

### Dashboard — Resolved 30d

Utiliza:

```text
ventana móvil de 30 días
```

y no mes calendario.

### Query 6

"Tickets abiertos" corresponde estrictamente a:

```text
OPEN
```

No se incluye:

```text
IN_PROGRESS
```

Si se quisiera representar carga operacional activa, sí sería apropiado utilizar ambos.

---

# 45. ¿Por qué usar SQL explícito si ya existe TypeORM?

TypeORM se utiliza principalmente para:

* entidades;
* relaciones;
* persistencia operacional;
* CRUD;
* consistencia del modelo.

Sin embargo, para reporting y análisis existen situaciones donde SQL es más expresivo.

Por ejemplo:

* agregaciones;
* `GROUP BY`;
* `COUNT`;
* `AVG`;
* ventanas temporales;
* joins analíticos;
* rankings.

Además, uno de los objetivos de la prueba es evaluar conocimientos de SQL.

Por eso se decidió no esconder estas consultas detrás del ORM.

---

# 46. Datos semilla

La base de datos incluye datos semilla destinados a permitir que la aplicación pueda evaluarse inmediatamente.

Los seeds incluyen:

* roles;
* permisos;
* asociaciones rol-permiso;
* usuarios;
* clientes;
* estados;
* prioridades;
* tickets;
* comentarios;
* asignaciones;
* reasignaciones;
* diferentes fechas;
* tickets abiertos;
* tickets en progreso;
* tickets resueltos;
* tickets cerrados.

Los datos no se generaron únicamente para mostrar filas.

Las fechas y estados fueron pensados para que las consultas SQL y el dashboard produzcan resultados significativos.

---

# 47. Razón de utilizar datos semilla completos

Una prueba técnica debería poder evaluarse sin que el evaluador tenga que crear manualmente decenas de registros.

Los datos semilla permiten probar inmediatamente:

```text
Login
  |
  v
Dashboard
  |
  v
Tickets
  |
  v
Asignación
  |
  v
Comentarios
  |
  v
Cambio de estados
  |
  v
Queries
```

También permiten comparar el comportamiento de:

```text
Admin
Supervisor
Agent
```

desde el primer inicio.

---

# 48. Frontend

El Frontend fue diseñado como cliente de la API y no como propietario de las reglas de negocio.

Responsabilidades principales:

```text
React
 |
 +-- navegación
 +-- formularios
 +-- visualización
 +-- estado de interfaz
 +-- consumo de API
 +-- renderizado por permisos
```

El Frontend puede adaptar visualmente la experiencia según el perfil.

Por ejemplo:

```text
Agent
  -> no mostrar "Delete Ticket"

Supervisor
  -> mostrar "Reassign"

Admin
  -> mostrar todas las operaciones permitidas
```

Pero ocultar un botón **no constituye seguridad**.

La seguridad correspondiente sigue aplicada en Backend.

---

# 49. Separación entre catálogo y formularios

Los formularios obtienen catálogos desde Backend.

Ejemplo:

```text
CreateTicketPage
      |
      +--> GET statuses
      |
      +--> GET priorities
      |
      +--> GET clients
      |
      +--> GET assignees
```

Esto evita duplicar información como:

```js
const priorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL"
];
```

en múltiples componentes.

---

# 50. Manejo de estados de negocio

Se prefirieron endpoints que expresan acciones de negocio cuando la operación tiene semántica propia.

Por ejemplo:

```http
POST /tickets/:id/close
POST /tickets/:id/reopen
POST /tickets/:id/assign
POST /tickets/:id/reassign
```

en lugar de utilizar únicamente:

```http
PATCH /tickets/:id
```

para absolutamente todo.

Esto hace la API más expresiva.

```text
POST /reassign
```

comunica mejor la intención que:

```json
{
  "assigneeId": "..."
}
```

en un PATCH genérico.

También facilita introducir posteriormente:

* auditoría;
* eventos;
* notificaciones;
* reglas adicionales;
* autorización específica.

---

# 51. Consistencia y trazabilidad

Las operaciones relevantes no deberían destruir información histórica.

Por eso existen tablas como:

```text
ticket_assignment_history
ticket_status_history
```

Esta decisión permite responder preguntas que serían imposibles utilizando únicamente el estado actual de `tickets`.

Por ejemplo:

> ¿Cuántas veces se reasignó este ticket?

> ¿Quién lo tuvo asignado anteriormente?

> ¿Cuál fue su evolución de estados?

> ¿Cuándo pasó a RESOLVED?

---

# 52. Consideraciones sobre TypeORM Synchronize

Durante desarrollo puede resultar conveniente habilitar temporalmente:

```ts
synchronize: true
```

para acelerar la construcción inicial del modelo.

Sin embargo, **no debería utilizarse en producción**.

En un entorno real se recomienda:

```text
synchronize: false
```

y manejar cualquier modificación de esquema mediante:

```text
database/migrations
```

Esto evita que cambios en entidades alteren automáticamente una base de datos productiva.

---

# 53. Configuración mediante variables de entorno

La configuración sensible debe permanecer fuera del repositorio.

Conceptualmente:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=...
```

El repositorio debería proporcionar:

```text
.env.example
```

sin incluir secretos reales.

---


# 54. Posible evolución

En un entorno de producción podrían incorporarse posteriormente:

* migrations formales;
* unit tests;
* integration tests;
* E2E tests;
* Swagger / OpenAPI;
* rate limiting;
* refresh tokens;
* recuperación de contraseña;
* logs centralizados;
* observabilidad;
* CI/CD;
* AWS ECS/Fargate;
* Amazon RDS;
* AWS Secrets Manager;
* CloudWatch;
* CloudFront;
* métricas históricas;
* notificaciones;
* SLA;
* paginación avanzada;
* filtros adicionales;
* búsqueda full text;
* soft deletes.

Estas funcionalidades no son necesarias para demostrar el núcleo arquitectónico del ejercicio, pero la solución actual permite incorporarlas progresivamente.

---

# 55. ¿Por qué no desplegar AWS?

El objetivo principal de la prueba era demostrar:

* diseño;
* arquitectura;
* SQL;
* Backend;
* Frontend;
* autorización;
* dominio.

Agregar infraestructura cloud antes de completar correctamente el núcleo funcional podría haber reducido el tiempo disponible para resolver los aspectos que realmente representan el negocio.

Docker proporciona inicialmente:

* reproducibilidad;
* aislamiento;
* configuración homogénea;
* facilidad de evaluación.

AWS queda como un siguiente paso claro y documentado.

---

# 56. Uso de Inteligencia Artificial

Durante el desarrollo de esta prueba técnica se utilizaron herramientas de **Inteligencia Artificial generativa como herramienta de apoyo al proceso de ingeniería**.

La IA fue utilizada principalmente para apoyar actividades como:

* análisis inicial del requerimiento;
* discusión de alternativas arquitectónicas;
* generación de estructuras base;
* revisión de código;
* apoyo en construcción y revisión de consultas SQL;
* identificación de posibles edge cases;
* refactorización;
* documentación técnica;
* revisión de consistencia entre Backend, Frontend y modelo de datos.

La utilización de IA se realizó como una herramienta complementaria al proceso de desarrollo.

Las decisiones sobre:

* arquitectura;
* modelo de datos;
* reglas de negocio;
* autorización;
* estructura de módulos;
* integración;
* validación funcional;
* interpretación de los requerimientos;

fueron evaluadas e integradas dentro de la solución final.

El código generado o sugerido mediante herramientas de IA fue revisado, adaptado y validado dentro del contexto de la aplicación.

La intención de documentar su utilización es mantener transparencia sobre las herramientas utilizadas durante el proceso de desarrollo.

---

# 57. Criterio frente al uso de IA

Se considera la IA una herramienta adicional dentro del conjunto de herramientas disponibles para ingeniería de software, de manera similar al uso de:

* documentación;
* Stack Overflow;
* linters;
* IDEs;
* autocompletado;
* generadores;
* documentación oficial.

Su utilización no reemplaza la necesidad de comprender las decisiones implementadas.

Por ese motivo, las principales decisiones de arquitectura y las interpretaciones realizadas durante la prueba se encuentran documentadas explícitamente en este README.


# 58. Principales endpoints

## Authentication

```http
POST /api/auth/login
```

## Tickets

```http
GET    /api/tickets
GET    /api/tickets/:id

POST   /api/tickets
PATCH  /api/tickets/:id

POST   /api/tickets/:id/assign
POST   /api/tickets/:id/reassign

PATCH  /api/tickets/:id/status

POST   /api/tickets/:id/close
POST   /api/tickets/:id/reopen

DELETE /api/tickets/:id

GET /api/tickets/:id/assignment-history
GET /api/tickets/:id/status-history

GET  /api/tickets/:id/comments
POST /api/tickets/:id/comments
```

## Ticket catalogs

```http
GET /api/tickets/catalogs/statuses
GET /api/tickets/catalogs/priorities
GET /api/tickets/catalogs/clients
GET /api/tickets/catalogs/assignees
```

## Dashboard

```http
GET /api/dashboard
```

## Users

```http
GET    /api/users
GET    /api/users/catalogs/roles
GET    /api/users/:id

POST   /api/users
PATCH  /api/users/:id
```
