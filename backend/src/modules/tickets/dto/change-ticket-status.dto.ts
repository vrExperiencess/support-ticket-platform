import { IsEnum } from "class-validator";

import { TicketStatusCode } from "../enums/ticket.enums";

export class ChangeTicketStatusDto {
  @IsEnum(TicketStatusCode)
  status!: TicketStatusCode;
}