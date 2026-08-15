/*
============================================================
QUERY 06
Cantidad de tickets OPEN por agente
============================================================

Objetivo:
Conocer la carga de tickets actualmente en estado OPEN
asignada a cada SUPPORT_AGENT.

Se incluyen agentes con cero tickets mediante LEFT JOIN.

Aquí "abierto" se interpreta literalmente como:

status.code = 'OPEN'

No incluye IN_PROGRESS.
============================================================
*/

SELECT
    u.id AS agent_id,
    u.name AS agent_name,
    u.email,

    COUNT(t.id) FILTER (
        WHERE ts.code = 'OPEN'
    ) AS open_ticket_count

FROM users u

INNER JOIN roles r
    ON r.id = u.role_id

LEFT JOIN tickets t
    ON t.assigned_to_user_id = u.id
    AND t.deleted_at IS NULL

LEFT JOIN ticket_statuses ts
    ON ts.id = t.status_id

WHERE
    r.code = 'SUPPORT_AGENT'
    AND u.is_active = TRUE

GROUP BY
    u.id,
    u.name,
    u.email

ORDER BY
    open_ticket_count DESC,
    u.name ASC;