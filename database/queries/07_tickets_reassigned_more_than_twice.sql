/*
============================================================
QUERY 07
Tickets reasignados más de dos veces
============================================================

Objetivo:
Identificar tickets que han cambiado de responsable
en más de dos ocasiones.

Importante:

ASSIGNED
no cuenta como reasignación inicial.

Únicamente se cuentan eventos:

REASSIGNED

Esto permite distinguir correctamente:

Unassigned -> Carlos
ASSIGNED

Carlos -> Andrea
REASSIGNED

Andrea -> Carlos
REASSIGNED

Carlos -> Andrea
REASSIGNED

Resultado:
3 reasignaciones.
============================================================
*/

SELECT
    t.id AS ticket_id,
    t.title,

    c.id AS client_id,
    c.name AS client_name,

    ts.code AS current_status_code,
    ts.name AS current_status_name,

    tp.code AS priority_code,
    tp.name AS priority_name,

    COUNT(tah.id) AS reassignment_count,

    t.created_at,
    t.updated_at

FROM tickets t

INNER JOIN ticket_assignment_history tah
    ON tah.ticket_id = t.id
    AND tah.event_type = 'REASSIGNED'

INNER JOIN clients c
    ON c.id = t.client_id

INNER JOIN ticket_statuses ts
    ON ts.id = t.status_id

INNER JOIN ticket_priorities tp
    ON tp.id = t.priority_id

WHERE
    t.deleted_at IS NULL

GROUP BY
    t.id,
    t.title,

    c.id,
    c.name,

    ts.code,
    ts.name,

    tp.code,
    tp.name,

    t.created_at,
    t.updated_at

HAVING
    COUNT(tah.id) > 2

ORDER BY
    reassignment_count DESC,
    t.updated_at DESC;