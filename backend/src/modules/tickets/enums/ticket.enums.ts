/**
 * Valores de estado soportados actualmente por el dominio.
 *
 * La base de datos utiliza una tabla ticket_statuses,
 * por lo que estos enums NO reemplazan el catálogo.
 * Simplemente evitan strings mágicos en la aplicación.
 */
export enum TicketStatusCode {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum TicketPriorityCode {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Campos permitidos para ordenar el listado.
 *
 * No permitimos recibir directamente el nombre de una
 * columna SQL desde el cliente para evitar queries arbitrarias.
 */
export enum TicketSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  DUE_AT = "dueAt",
  PRIORITY = "priority",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}