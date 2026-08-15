import { IsUUID } from "class-validator";

export class ReassignTicketDto {
  @IsUUID("4")
  userId!: string;
}