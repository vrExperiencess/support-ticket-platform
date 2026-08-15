// src/modules/auth/strategies/jwt.strategy.ts

import {
  Inject,
  Injectable,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import {
  PassportStrategy,
} from "@nestjs/passport";

import {
  ExtractJwt,
  Strategy,
} from "passport-jwt";

import { AuthService } from "../auth.service";

import type { JwtPayload } from "../interfaces/jwt-payload.interface";

import type { AuthenticatedUser } from "../interfaces/authenticated-user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  "jwt",
) {
  constructor(
    /**
     * ConfigService debe ser un provider real de Nest.
     *
     * NO usar:
     * import type { ConfigService }
     *
     * porque Nest lo necesita en runtime.
     */
    @Inject(ConfigService)
    configService: ConfigService,

    private readonly authService: AuthService,
  ) {
    super({
      /**
       * Extrae el JWT desde:
       *
       * Authorization: Bearer <token>
       */
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * passport-jwt rechazará automáticamente
       * tokens expirados.
       */
      ignoreExpiration: false,

      /**
       * Debe coincidir con la llave usada
       * al firmar el token en JwtModule.
       */
      secretOrKey:
        configService.getOrThrow<string>(
          "JWT_SECRET",
        ),
    });
  }

  /**
   * Después de validar firma y expiración,
   * Passport ejecuta este método.
   *
   * No confiamos en permisos guardados en el token:
   * volvemos a cargar usuario, role y permissions
   * desde DB.
   */
  async validate(
    payload: JwtPayload,
  ): Promise<AuthenticatedUser> {
    return this.authService.getAuthenticatedUser(
      payload.sub,
    );
  }
}