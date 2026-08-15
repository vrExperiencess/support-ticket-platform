/*
============================================================
QUERY 04
Usuario con mayor cantidad de tickets resueltos
durante el último mes calendario
============================================================

Objetivo:
Identificar al usuario que resolvió la mayor cantidad
de tickets durante el mes calendario anterior.

Ejemplo:
Si la consulta se ejecuta en agosto de 2026:

Desde:
2026-07-01 00:00:00

Hasta:
2026-08-01 00:00:00

Se utiliza resolved_by_user_id, NO assigned_to_user_id,
porque un ticket podría haber sido reasignado posteriormente.
============================================================
*/

SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email,

    r.code AS role_code,
    r.name AS role_name,

    COUNT(t.id) AS resolved_ticket_count

FROM users u

INNER JOIN roles r
    ON r.id = u.role_id

INNER JOIN tickets t
    ON t.resolved_by_user_id = u.id
    AND t.deleted_at IS NULL

WHERE
    t.resolved_at IS NOT NULL

    AND t.resolved_at >=
        DATE_TRUNC(
            'month',
            CURRENT_DATE
        ) - INTERVAL '1 month'

    AND t.resolved_at <
        DATE_TRUNC(
            'month',
            CURRENT_DATE
        )

GROUP BY
    u.id,
    u.name,
    u.email,
    r.code,
    r.name

ORDER BY
    resolved_ticket_count DESC,
    u.name ASC

LIMIT 1;