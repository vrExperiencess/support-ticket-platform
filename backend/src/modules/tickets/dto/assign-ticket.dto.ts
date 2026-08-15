import { IsUUID } from "class-validator";

export class AssignTicketDto {
  /**
   * Usuario SUPPORT_AGENT al cual será asignado el ticket.
   */
  @IsUUID("4")
  userId!: string;
}