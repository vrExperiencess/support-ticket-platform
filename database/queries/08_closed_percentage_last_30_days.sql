/*
============================================================
QUERY 08
Porcentaje de tickets cerrados frente al total de tickets
creados durante los últimos 30 días
============================================================

Objetivo:
Tomar como población todos los tickets creados en los
últimos 30 días y determinar qué porcentaje se encuentra
actualmente CLOSED.

Fórmula:

closed_created_last_30_days
---------------------------- × 100
total_created_last_30_days

NULLIF evita división entre cero si no existen tickets.
============================================================
*/

SELECT
    COUNT(t.id) AS total_created_last_30_days,

    COUNT(t.id) FILTER (
        WHERE ts.code = 'CLOSED'
    ) AS closed_tickets_last_30_days,

    COALESCE(
        ROUND(
            (
                100.0
                *
                COUNT(t.id) FILTER (
                    WHERE ts.code = 'CLOSED'
                )
                /
                NULLIF(
                    COUNT(t.id),
                    0
                )
            )::numeric,
            2
        ),
        0
    ) AS closed_percentage

FROM tickets t

INNER JOIN ticket_statuses ts
    ON ts.id = t.status_id

WHERE
    t.deleted_at IS NULL

    AND t.created_at >=
        NOW() - INTERVAL '30 days';