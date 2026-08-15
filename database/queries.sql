/*
====================================================================
SUPPORT TICKET PLATFORM
Required SQL Queries
====================================================================

Database: PostgreSQL

This file contains the eight SQL queries required by the
technical assessment.

Soft-deleted tickets (deleted_at IS NOT NULL) are intentionally
excluded from operational and analytical queries.

====================================================================
*/


/*
====================================================================
1. Tickets by status for each client
====================================================================
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


/*
====================================================================
2. Top 5 clients with the highest number of HIGH or CRITICAL tickets
====================================================================
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
WHERE
    tp.code IN (
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


/*
====================================================================
3. Non-closed tickets without updates for more than 48 hours
====================================================================
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


/*
====================================================================
4. User with the most resolved tickets during the previous month
====================================================================
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


/*
====================================================================
5. Average ticket resolution time by priority
====================================================================
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


/*
====================================================================
6. Number of OPEN tickets by support agent
====================================================================
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


/*
====================================================================
7. Tickets reassigned more than twice
====================================================================
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


/*
====================================================================
8. Percentage of closed tickets versus tickets created
   during the last 30 days
====================================================================
*/

SELECT
    COUNT(t.id)
        AS total_created_last_30_days,

    COUNT(t.id) FILTER (
        WHERE ts.code = 'CLOSED'
    )
        AS closed_tickets_last_30_days,

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