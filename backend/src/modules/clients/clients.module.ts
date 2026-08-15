import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClientEntity } from "./entities/client.entity";
import { ClientsService } from "./clients.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientEntity,
    ]),
  ],

  providers: [
    ClientsService,
  ],

  exports: [
    ClientsService,
  ],
})
export class ClientsModule {}