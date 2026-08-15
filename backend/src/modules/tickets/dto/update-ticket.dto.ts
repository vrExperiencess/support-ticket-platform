import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateTicketDto {
  @IsOptional()
  @IsUUID("4")
  clientId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsUUID("4")
  priorityId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}