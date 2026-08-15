import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  /**
   * true = comentario operativo interno.
   *
   * El backend comprobará que el usuario tenga
   * tickets.comment.internal.
   */
  @IsOptional()
  @IsBoolean()
  isInternal: boolean = false;
}