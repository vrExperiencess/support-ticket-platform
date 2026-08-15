/*
============================================================
QUERY 05
Tiempo promedio de resolución por prioridad
============================================================

Objetivo:
Calcular cuánto tiempo tardan en promedio los tickets
en ser resueltos según su prioridad.

Tiempo de resolución:

resolved_at - created_at

Solo se consideran tickets que realmente fueron resueltos.

Se devuelve:
- intervalo PostgreSQL legible
- cantidad de horas promedio
- cantidad de tickets utilizados para el cálculo
============================================================
*/

SELECT
    tp.id AS priority_id,
    tp.code AS priority_code,
    tp.name AS priority_name,

    COUNT(t.id) AS resolved_ticket_count,

    AVG(
        t.resolved_at -
        t.created_at
    ) AS average_resolution_time,

    ROUND(
        (
            AVG(
                EXTRACT(
                    EPOCH FROM (
                        t.resolved_at -
                        t.created_at
                    )
                )
            ) / 3600
        )::numeric,
        2
    ) AS average_resolution_hours

FROM ticket_priorities tp

INNER JOIN tickets t
    ON t.priority_id = tp.id
    AND t.deleted_at IS NULL

WHERE
    t.resolved_at IS NOT NULL

GROUP BY
    tp.id,
    tp.code,
    tp.name,
    tp.weight

ORDER BY
    tp.weight ASC;