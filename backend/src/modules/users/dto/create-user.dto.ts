import {
  Transform,
} from "class-transformer";

import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string"
      ? value.trim()
      : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string"
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  /**
   * Password inicial.
   *
   * Requerimos:
   * - mínimo 8 caracteres
   * - mayúscula
   * - minúscula
   * - número
   */
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    {
      message:
        "password must contain at least one uppercase letter, one lowercase letter and one number",
    },
  )
  password!: string;

  @IsUUID("4")
  roleId!: string;

  @IsBoolean()
  isActive: boolean = true;
}