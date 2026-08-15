import { Module} from "@nestjs/common";
import { TypeOrmModule} from "@nestjs/typeorm";
import { RoleEntity} from "../roles/entities/role.entity";
import {TicketEntity} from "../tickets/entities/ticket.entity";
import {UserEntity} from "./entities/user.entity";
import {UsersController} from "./users.controller";
import {UsersService} from "./users.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      TicketEntity,
    ]),
  ],

  controllers: [
    UsersController,
  ],

  providers: [
    UsersService,
  ],

  exports: [
    UsersService,
  ],
})
export class UsersModule {}