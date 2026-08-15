/*
============================================================
QUERY 03
Tickets con más de 48 horas sin actualización
y que todavía no están cerrados
============================================================

Objetivo:
Detectar tickets que podrían requerir seguimiento por parte
del supervisor.

Importante:
RESOLVED sigue siendo considerado "no cerrado".
Únicamente se excluye CLOSED, siguiendo literalmente
el requerimiento de la prueba.

updated_at se modifica con actividad significativa del ticket:
- edición
- asignación
- reasignación
- cambio de estado
- comentario

Los tickets eliminados mediante soft-delete no participan.
============================================================
*/

SELECT
    t.id AS ticket_id,
    t.title,

    c.id AS client_id,
    c.name AS client_name,

    ts.code AS status_code,
    ts.name AS status_name,

    tp.code AS priority_code,
    tp.name AS priority_name,

    u.id AS assigned_agent_id,
    u.name AS assigned_agent_name,

    t.created_at,
    t.updated_at,

    EXTRACT(
        EPOCH FROM (
            NOW() - t.updated_at
        )
    ) / 3600 AS hours_without_update

FROM tickets t

INNER JOIN clients c
    ON c.id = t.client_id

INNER JOIN ticket_statuses ts
    ON ts.id = t.status_id

INNER JOIN ticket_priorities tp
    ON tp.id = t.priority_id

LEFT JOIN users u
    ON u.id = t.assigned_to_user_id

WHERE
    t.deleted_at IS NULL

    AND ts.code <> 'CLOSED'

    AND t.updated_at <
        NOW() - INTERVAL '48 hours'

ORDER BY
    t.updated_at ASC;