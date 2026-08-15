/*
============================================================
QUERY 02
Top 5 clientes con mayor cantidad de tickets
de prioridad HIGH o CRITICAL
============================================================

Objetivo:
Identificar los clientes que concentran mayor cantidad
de solicitudes de soporte de alta prioridad.

No se filtra por estado porque el requerimiento solicita
tickets HIGH/CRITICAL en general.

Los tickets eliminados mediante soft-delete se excluyen.
============================================================
*/

SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.company_name,

    COUNT(t.id) AS high_critical_ticket_count,

    COUNT(t.id) FILTER (
        WHERE tp.code = 'HIGH'
    ) AS high_ticket_count,

    COUNT(t.id) FILTER (
        WHERE tp.code = 'CRITICAL'
    ) AS critical_ticket_count

FROM clients c

INNER JOIN tickets t
    ON t.client_id = c.id
    AND t.deleted_at IS NULL

INNER JOIN ticket_priorities tp
    ON tp.id = t.priority_id

WHERE tp.code IN (
    'HIGH',
    'CRITICAL'
)

GROUP BY
    c.id,
    c.name,
    c.company_name

ORDER BY
    high_critical_ticket_count DESC,
    c.name ASC

LIMIT 5;