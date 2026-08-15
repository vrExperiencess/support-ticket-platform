import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateTicketDto {
  /**
   * Cliente al cual pertenece la solicitud.
   */
  @IsUUID("4")
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10000)
  description!: string;

  /**
   * La prioridad proviene de ticket_priorities.
   */
  @IsUUID("4")
  priorityId!: string;

  /**
   * Fecha límite opcional.
   *
   * El administrador/agente no envía createdAt,
   * status, creator ni resolver; esos campos los
   * determina el backend.
   */
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}