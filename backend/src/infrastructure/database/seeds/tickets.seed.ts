import { DataSource, In } from "typeorm";

import { TicketEntity } from "../../../modules/tickets/entities/ticket.entity";
import { TicketStatusEntity } from "../../../modules/tickets/entities/ticket-status.entity";
import { TicketPriorityEntity } from "../../../modules/tickets/entities/ticket-priority.entity";
import {
  TicketAssignmentEventType,
  TicketAssignmentHistoryEntity,
} from "../../../modules/tickets/entities/ticket-assignment-history.entity";

import { TicketCommentEntity } from "../../../modules/comments/entities/ticket-comment.entity";

import { USER_IDS } from "./users.seed";
import { CLIENT_IDS } from "./clients.seed";

export const STATUS_IDS = {
  OPEN: "50000000-0000-4000-8000-000000000001",
  IN_PROGRESS: "50000000-0000-4000-8000-000000000002",
  RESOLVED: "50000000-0000-4000-8000-000000000003",
  CLOSED: "50000000-0000-4000-8000-000000000004",
} as const;

export const PRIORITY_IDS = {
  LOW: "60000000-0000-4000-8000-000000000001",
  MEDIUM: "60000000-0000-4000-8000-000000000002",
  HIGH: "60000000-0000-4000-8000-000000000003",
  CRITICAL: "60000000-0000-4000-8000-000000000004",
} as const;

export const TICKET_IDS = {
  STALE_HIGH: "70000000-0000-4000-8000-000000000001",
  CRITICAL_ACTIVE: "70000000-0000-4000-8000-000000000002",
  RESOLVED_HIGH: "70000000-0000-4000-8000-000000000003",
  CLOSED_HIGH: "70000000-0000-4000-8000-000000000004",

  REASSIGNED_CRITICAL:
    "70000000-0000-4000-8000-000000000005",

  NORMAL_HIGH: "70000000-0000-4000-8000-000000000006",
  RESOLVED_MEDIUM: "70000000-0000-4000-8000-000000000007",
  CLOSED_CRITICAL: "70000000-0000-4000-8000-000000000008",

  STALE_PIXEL_HIGH:
    "70000000-0000-4000-8000-000000000009",

  REASSIGNED_ONCE:
    "70000000-0000-4000-8000-00000000000a",

  RESOLVED_CRITICAL:
    "70000000-0000-4000-8000-00000000000b",

  OLD_CLOSED_HIGH:
    "70000000-0000-4000-8000-00000000000c",

  UNASSIGNED:
    "70000000-0000-4000-8000-00000000000d",

  RESOLVED_LOW:
    "70000000-0000-4000-8000-00000000000e",
} as const;

const COMMENT_IDS = {
  C1: "80000000-0000-4000-8000-000000000001",
  C2: "80000000-0000-4000-8000-000000000002",
  C3: "80000000-0000-4000-8000-000000000003",
  C4: "80000000-0000-4000-8000-000000000004",
  C5: "80000000-0000-4000-8000-000000000005",
  C6: "80000000-0000-4000-8000-000000000006",
} as const;

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function daysAgo(days: number): Date {
  return hoursAgo(days * 24);
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return hoursFromNow(days * 24);
}

export async function seedTickets(
  dataSource: DataSource,
): Promise<void> {
  const ticketRepository =
    dataSource.getRepository(TicketEntity);

  const statusRepository =
    dataSource.getRepository(TicketStatusEntity);

  const priorityRepository =
    dataSource.getRepository(TicketPriorityEntity);

  const commentRepository =
    dataSource.getRepository(TicketCommentEntity);

  const assignmentRepository =
    dataSource.getRepository(TicketAssignmentHistoryEntity);

  /*
   * Ticket status catalog
   */
  await statusRepository.upsert(
    [
      {
        id: STATUS_IDS.OPEN,
        code: "OPEN",
        name: "Open",
        sortOrder: 1,
        isTerminal: false,
      },
      {
        id: STATUS_IDS.IN_PROGRESS,
        code: "IN_PROGRESS",
        name: "In Progress",
        sortOrder: 2,
        isTerminal: false,
      },
      {
        id: STATUS_IDS.RESOLVED,
        code: "RESOLVED",
        name: "Resolved",
        sortOrder: 3,
        isTerminal: false,
      },
      {
        id: STATUS_IDS.CLOSED,
        code: "CLOSED",
        name: "Closed",
        sortOrder: 4,
        isTerminal: true,
      },
    ],
    ["id"],
  );

  /*
   * Ticket priority catalog
   */
  await priorityRepository.upsert(
    [
      {
        id: PRIORITY_IDS.LOW,
        code: "LOW",
        name: "Low",
        weight: 1,
      },
      {
        id: PRIORITY_IDS.MEDIUM,
        code: "MEDIUM",
        name: "Medium",
        weight: 2,
      },
      {
        id: PRIORITY_IDS.HIGH,
        code: "HIGH",
        name: "High",
        weight: 3,
      },
      {
        id: PRIORITY_IDS.CRITICAL,
        code: "CRITICAL",
        name: "Critical",
        weight: 4,
      },
    ],
    ["id"],
  );

  /*
   * Remove only demo ticket data.
   *
   * This allows the seed to be executed repeatedly while keeping the
   * timestamps deterministic relative to the execution time.
   */
  const demoTicketIds = Object.values(TICKET_IDS);

  await commentRepository.delete({
    ticketId: In(demoTicketIds),
  });

  await assignmentRepository.delete({
    ticketId: In(demoTicketIds),
  });

  await ticketRepository.delete({
    id: In(demoTicketIds),
  });

  /*
   * Tickets
   */
  const tickets = [
    // 1 - More than 48h without update
    {
      id: TICKET_IDS.STALE_HIGH,

      clientId: CLIENT_IDS.ACME,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_1,
      resolvedByUserId: null,

      statusId: STATUS_IDS.OPEN,
      priorityId: PRIORITY_IDS.HIGH,

      title: "Intermittent access to customer portal",

      description:
        "The client reports intermittent failures when accessing the customer portal.",

      dueAt: hoursAgo(48),

      createdAt: daysAgo(7),
      updatedAt: hoursAgo(72),

      resolvedAt: null,
      closedAt: null,
    },

    // 2 - Active critical ticket
    {
      id: TICKET_IDS.CRITICAL_ACTIVE,

      clientId: CLIENT_IDS.NOVATECH,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_2,
      resolvedByUserId: null,

      statusId: STATUS_IDS.IN_PROGRESS,
      priorityId: PRIORITY_IDS.CRITICAL,

      title: "Production integration unavailable",

      description:
        "The production integration stopped responding and is affecting the client's operation.",

      dueAt: hoursFromNow(6),

      createdAt: daysAgo(2),
      updatedAt: hoursAgo(3),

      resolvedAt: null,
      closedAt: null,
    },

    // 3 - Agent 1 resolved ticket
    {
      id: TICKET_IDS.RESOLVED_HIGH,

      clientId: CLIENT_IDS.ACME,
      createdByUserId: USER_IDS.AGENT_1,
      assignedToUserId: USER_IDS.AGENT_1,
      resolvedByUserId: USER_IDS.AGENT_1,

      statusId: STATUS_IDS.RESOLVED,
      priorityId: PRIORITY_IDS.HIGH,

      title: "Authentication errors after password reset",

      description:
        "Several users were unable to authenticate after resetting their passwords.",

      dueAt: daysAgo(7),

      createdAt: daysAgo(10),
      updatedAt: daysAgo(6),

      resolvedAt: daysAgo(6),
      closedAt: null,
    },

    // 4 - Recent closed HIGH ticket
    {
      id: TICKET_IDS.CLOSED_HIGH,

      clientId: CLIENT_IDS.ANDES,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_2,
      resolvedByUserId: USER_IDS.AGENT_2,

      statusId: STATUS_IDS.CLOSED,
      priorityId: PRIORITY_IDS.HIGH,

      title: "Shipment synchronization failure",

      description:
        "Shipment information was not synchronized correctly with the client's system.",

      dueAt: daysAgo(6),

      createdAt: daysAgo(9),
      updatedAt: daysAgo(4),

      resolvedAt: daysAgo(5),
      closedAt: daysAgo(4),
    },

    // 5 - Intentionally reassigned 3 times
    {
      id: TICKET_IDS.REASSIGNED_CRITICAL,

      clientId: CLIENT_IDS.ACME,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_2,
      resolvedByUserId: null,

      statusId: STATUS_IDS.OPEN,
      priorityId: PRIORITY_IDS.CRITICAL,

      title: "Payment confirmation not received",

      description:
        "Transactions are completed but the client does not receive payment confirmation.",

      dueAt: daysAgo(1),

      createdAt: daysAgo(6),
      updatedAt: hoursAgo(10),

      resolvedAt: null,
      closedAt: null,
    },

    // 6
    {
      id: TICKET_IDS.NORMAL_HIGH,

      clientId: CLIENT_IDS.HORIZONTE,
      createdByUserId: USER_IDS.AGENT_1,
      assignedToUserId: USER_IDS.AGENT_1,
      resolvedByUserId: null,

      statusId: STATUS_IDS.OPEN,
      priorityId: PRIORITY_IDS.HIGH,

      title: "Inventory differences in daily report",

      description:
        "The daily inventory report shows differences from the source system.",

      dueAt: daysFromNow(3),

      createdAt: daysAgo(1),
      updatedAt: hoursAgo(2),

      resolvedAt: null,
      closedAt: null,
    },

    // 7
    {
      id: TICKET_IDS.RESOLVED_MEDIUM,

      clientId: CLIENT_IDS.NOVATECH,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_1,
      resolvedByUserId: USER_IDS.AGENT_1,

      statusId: STATUS_IDS.RESOLVED,
      priorityId: PRIORITY_IDS.MEDIUM,

      title: "Incorrect timezone in generated report",

      description:
        "Generated reports were displaying timestamps using an incorrect timezone.",

      dueAt: daysAgo(4),

      createdAt: daysAgo(7),
      updatedAt: daysAgo(5),

      resolvedAt: daysAgo(5),
      closedAt: null,
    },

    // 8
    {
      id: TICKET_IDS.CLOSED_CRITICAL,

      clientId: CLIENT_IDS.ACME,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_1,
      resolvedByUserId: USER_IDS.AGENT_1,

      statusId: STATUS_IDS.CLOSED,
      priorityId: PRIORITY_IDS.CRITICAL,

      title: "Critical API latency",

      description:
        "The customer API presented response times above the accepted threshold.",

      dueAt: daysAgo(13),

      createdAt: daysAgo(15),
      updatedAt: daysAgo(11),

      resolvedAt: daysAgo(12),
      closedAt: daysAgo(11),
    },

    // 9 - Stale ticket >48h
    {
      id: TICKET_IDS.STALE_PIXEL_HIGH,

      clientId: CLIENT_IDS.PIXEL,
      createdByUserId: USER_IDS.AGENT_2,
      assignedToUserId: USER_IDS.AGENT_2,
      resolvedByUserId: null,

      statusId: STATUS_IDS.OPEN,
      priorityId: PRIORITY_IDS.HIGH,

      title: "Webhook events not received",

      description:
        "The client reports that some webhook notifications have not been received.",

      dueAt: hoursAgo(12),

      createdAt: daysAgo(5),
      updatedAt: hoursAgo(60),

      resolvedAt: null,
      closedAt: null,
    },

    // 10 - Only one reassignment
    {
      id: TICKET_IDS.REASSIGNED_ONCE,

      clientId: CLIENT_IDS.ANDES,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_1,
      resolvedByUserId: null,

      statusId: STATUS_IDS.IN_PROGRESS,
      priorityId: PRIORITY_IDS.MEDIUM,

      title: "Duplicate records after synchronization",

      description:
        "Some records were duplicated after an automatic synchronization process.",

      dueAt: daysFromNow(1),

      createdAt: daysAgo(3),
      updatedAt: hoursAgo(4),

      resolvedAt: null,
      closedAt: null,
    },

    // 11
    {
      id: TICKET_IDS.RESOLVED_CRITICAL,

      clientId: CLIENT_IDS.HORIZONTE,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_2,
      resolvedByUserId: USER_IDS.AGENT_2,

      statusId: STATUS_IDS.RESOLVED,
      priorityId: PRIORITY_IDS.CRITICAL,

      title: "Checkout service unavailable",

      description:
        "Customers were unable to complete purchases due to a checkout service failure.",

      dueAt: daysAgo(2),

      createdAt: daysAgo(4),
      updatedAt: daysAgo(2),

      resolvedAt: daysAgo(2),
      closedAt: null,
    },

    // 12 - Created more than 30 days ago
    {
      id: TICKET_IDS.OLD_CLOSED_HIGH,

      clientId: CLIENT_IDS.PIXEL,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_2,
      resolvedByUserId: USER_IDS.AGENT_2,

      statusId: STATUS_IDS.CLOSED,
      priorityId: PRIORITY_IDS.HIGH,

      title: "Historical reporting incident",

      description:
        "Historical reporting data was temporarily unavailable.",

      dueAt: daysAgo(42),

      createdAt: daysAgo(45),
      updatedAt: daysAgo(40),

      resolvedAt: daysAgo(41),
      closedAt: daysAgo(40),
    },

    // 13 - Unassigned, useful to test administrator assignment
    {
      id: TICKET_IDS.UNASSIGNED,

      clientId: CLIENT_IDS.NOVATECH,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: null,
      resolvedByUserId: null,

      statusId: STATUS_IDS.OPEN,
      priorityId: PRIORITY_IDS.MEDIUM,

      title: "New ticket pending assignment",

      description:
        "New support request waiting for an administrator to assign an agent.",

      dueAt: daysFromNow(2),

      createdAt: hoursAgo(12),
      updatedAt: hoursAgo(12),

      resolvedAt: null,
      closedAt: null,
    },

    // 14 - LOW resolved ticket gives us resolution metrics for LOW priority
    {
      id: TICKET_IDS.RESOLVED_LOW,

      clientId: CLIENT_IDS.HORIZONTE,
      createdByUserId: USER_IDS.ADMIN,
      assignedToUserId: USER_IDS.AGENT_1,
      resolvedByUserId: USER_IDS.AGENT_1,

      statusId: STATUS_IDS.RESOLVED,
      priorityId: PRIORITY_IDS.LOW,

      title: "Minor visual inconsistency",

      description:
        "A minor formatting inconsistency was identified in a generated report.",

      dueAt: daysFromNow(1),

      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),

      resolvedAt: daysAgo(2),
      closedAt: null,
    },
  ];

  await ticketRepository.save(
    ticketRepository.create(tickets),
  );

  /*
   * Comments
   */
  const comments = [
    {
      id: COMMENT_IDS.C1,

      ticketId: TICKET_IDS.CRITICAL_ACTIVE,
      userId: USER_IDS.AGENT_2,

      content:
        "The incident has been reproduced and investigation is in progress.",

      isInternal: false,

      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(5),
    },
    {
      id: COMMENT_IDS.C2,

      ticketId: TICKET_IDS.CRITICAL_ACTIVE,
      userId: USER_IDS.SUPERVISOR,

      content:
        "Escalate the incident if the service is not recovered within the next two hours.",

      isInternal: true,

      createdAt: hoursAgo(4),
      updatedAt: hoursAgo(4),
    },
    {
      id: COMMENT_IDS.C3,

      ticketId: TICKET_IDS.REASSIGNED_CRITICAL,
      userId: USER_IDS.AGENT_1,

      content:
        "Initial analysis indicates the issue may be related to the payment notification process.",

      isInternal: false,

      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: COMMENT_IDS.C4,

      ticketId: TICKET_IDS.REASSIGNED_CRITICAL,
      userId: USER_IDS.SUPERVISOR,

      content:
        "Ticket reassigned due to workload distribution between support agents.",

      isInternal: true,

      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: COMMENT_IDS.C5,

      ticketId: TICKET_IDS.RESOLVED_HIGH,
      userId: USER_IDS.AGENT_1,

      content:
        "Authentication configuration was corrected and service was validated with the customer.",

      isInternal: false,

      createdAt: daysAgo(6),
      updatedAt: daysAgo(6),
    },
    {
      id: COMMENT_IDS.C6,

      ticketId: TICKET_IDS.STALE_PIXEL_HIGH,
      userId: USER_IDS.AGENT_2,

      content:
        "Waiting for additional information from the client to continue the investigation.",

      isInternal: false,

      createdAt: hoursAgo(60),
      updatedAt: hoursAgo(60),
    },
  ];

  await commentRepository.save(
    commentRepository.create(comments),
  );

  /*
   * Assignment history
   *
   * Every assigned ticket receives its initial ASSIGNED event.
   * Ticket 5 receives three REASSIGNED events.
   * Ticket 10 receives one REASSIGNED event.
   */
  const assignmentHistory = [
    {
      id: "90000000-0000-4000-8000-000000000001",
      ticketId: TICKET_IDS.STALE_HIGH,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(7),
    },

    {
      id: "90000000-0000-4000-8000-000000000002",
      ticketId: TICKET_IDS.CRITICAL_ACTIVE,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(2),
    },

    {
      id: "90000000-0000-4000-8000-000000000003",
      ticketId: TICKET_IDS.RESOLVED_HIGH,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(10),
    },

    {
      id: "90000000-0000-4000-8000-000000000004",
      ticketId: TICKET_IDS.CLOSED_HIGH,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(9),
    },

    // Ticket 5 - initial assignment
    {
      id: "90000000-0000-4000-8000-000000000005",
      ticketId: TICKET_IDS.REASSIGNED_CRITICAL,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(6),
    },

    // Ticket 5 - reassignment 1
    {
      id: "90000000-0000-4000-8000-000000000006",
      ticketId: TICKET_IDS.REASSIGNED_CRITICAL,
      fromUserId: USER_IDS.AGENT_1,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.SUPERVISOR,
      eventType: TicketAssignmentEventType.REASSIGNED,
      createdAt: daysAgo(4),
    },

    // Ticket 5 - reassignment 2
    {
      id: "90000000-0000-4000-8000-000000000007",
      ticketId: TICKET_IDS.REASSIGNED_CRITICAL,
      fromUserId: USER_IDS.AGENT_2,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.SUPERVISOR,
      eventType: TicketAssignmentEventType.REASSIGNED,
      createdAt: daysAgo(3),
    },

    // Ticket 5 - reassignment 3
    {
      id: "90000000-0000-4000-8000-000000000008",
      ticketId: TICKET_IDS.REASSIGNED_CRITICAL,
      fromUserId: USER_IDS.AGENT_1,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.SUPERVISOR,
      eventType: TicketAssignmentEventType.REASSIGNED,
      createdAt: daysAgo(1),
    },

    {
      id: "90000000-0000-4000-8000-000000000009",
      ticketId: TICKET_IDS.NORMAL_HIGH,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(1),
    },

    {
      id: "90000000-0000-4000-8000-00000000000a",
      ticketId: TICKET_IDS.RESOLVED_MEDIUM,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(7),
    },

    {
      id: "90000000-0000-4000-8000-00000000000b",
      ticketId: TICKET_IDS.CLOSED_CRITICAL,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(15),
    },

    {
      id: "90000000-0000-4000-8000-00000000000c",
      ticketId: TICKET_IDS.STALE_PIXEL_HIGH,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(5),
    },

    // Ticket 10 initially assigned to Agent 2
    {
      id: "90000000-0000-4000-8000-00000000000d",
      ticketId: TICKET_IDS.REASSIGNED_ONCE,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(3),
    },

    // Ticket 10 reassigned once to Agent 1
    {
      id: "90000000-0000-4000-8000-00000000000e",
      ticketId: TICKET_IDS.REASSIGNED_ONCE,
      fromUserId: USER_IDS.AGENT_2,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.SUPERVISOR,
      eventType: TicketAssignmentEventType.REASSIGNED,
      createdAt: daysAgo(1),
    },

    {
      id: "90000000-0000-4000-8000-00000000000f",
      ticketId: TICKET_IDS.RESOLVED_CRITICAL,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(4),
    },

    {
      id: "90000000-0000-4000-8000-000000000010",
      ticketId: TICKET_IDS.OLD_CLOSED_HIGH,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_2,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(45),
    },

    {
      id: "90000000-0000-4000-8000-000000000011",
      ticketId: TICKET_IDS.RESOLVED_LOW,
      fromUserId: null,
      toUserId: USER_IDS.AGENT_1,
      assignedByUserId: USER_IDS.ADMIN,
      eventType: TicketAssignmentEventType.ASSIGNED,
      createdAt: daysAgo(3),
    },
  ];

  await assignmentRepository.save(
    assignmentRepository.create(assignmentHistory),
  );

  console.log("  ✓ Ticket catalogs seeded");
  console.log(`  ✓ ${tickets.length} demo tickets seeded`);
  console.log(`  ✓ ${comments.length} demo comments seeded`);
  console.log(
    `  ✓ ${assignmentHistory.length} assignment history records seeded`,
  );
}