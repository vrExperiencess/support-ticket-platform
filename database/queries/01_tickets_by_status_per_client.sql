/*
============================================================
QUERY 01
Tickets por estado para cada cliente
============================================================

Objetivo:
Obtener cuántos tickets tiene cada cliente en cada uno
de los estados disponibles.

Se utiliza CROSS JOIN entre clients y ticket_statuses para
mostrar también combinaciones cuyo total sea cero.

Esto permite obtener, por ejemplo:

Client A | OPEN        | 3
Client A | IN_PROGRESS | 2
Client A | RESOLVED    | 0
Client A | CLOSED      | 5

Los tickets eliminados mediante soft-delete no participan.
============================================================
*/

SELECT
    c.id AS client_id,
    c.name AS client_name,

    ts.id AS status_id,
    ts.code AS status_code,
    ts.name AS status_name,

    COUNT(t.id) AS ticket_count

FROM clients c

CROSS JOIN ticket_statuses ts

LEFT JOIN tickets t
    ON t.client_id = c.id
    AND t.status_id = ts.id
    AND t.deleted_at IS NULL

GROUP BY
    c.id,
    c.name,
    ts.id,
    ts.code,
    ts.name,
    ts.sort_order

ORDER BY
    c.name ASC,
    ts.sort_order ASC;