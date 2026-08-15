
Demo credentials

Admin
admin@support.local
Admin123!

Supervisor
supervisor@support.local
Supervisor123!

Agent
agent1@support.local
Agent123!



#que ahce cada perfil 

| Acción                    | Admin |   Supervisor  |     Agent |
| ------------------------- | ----: | ------------: | --------: |
| Ver todos                 |     ✅ |          ✅ |        ❌ |
| Crear                     |     ✅ |          ❌ |        ✅ |
| Asignar ticket sin agente |     ✅ |          ✅ |        ❌ |
| Reasignar ticket          |     ✅ |          ✅ |        ❌ |
| Editar cualquiera         |     ✅ |          ❌ |        ❌ |
| Editar asignado           |      — |            — |        ✅ |
| Comentario normal         |     ✅ |          ❌ |        ✅ |
| Comentario interno        |     ✅ |          ✅ |        ❌ |
| Cambiar estado            |     ✅ |          ❌ | asignado |
| Cerrar/reabrir            |     ✅ |          ❌ |        ❌ |
| Eliminar                  |     ✅ |          ❌ |        ❌ |



endpoisnt para tickets

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

GET /api/tickets/catalogs/statuses
GET /api/tickets/catalogs/priorities
GET /api/tickets/catalogs/clients
GET /api/tickets/catalogs/assignees