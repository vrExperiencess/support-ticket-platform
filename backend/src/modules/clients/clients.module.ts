import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClientEntity } from './entities/client.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        ClientEntity,
        ]),
    ],
    exports: [
        TypeOrmModule,
    ],
})
export class ClientsModule {}
