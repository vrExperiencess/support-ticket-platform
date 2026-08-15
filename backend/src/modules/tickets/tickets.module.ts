import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { TicketAssignmentHistoryEntity } from './entities/ticket-assignment-history.entity';
import { TicketPriorityEntity } from './entities/ticket-priority.entity';
import { TicketStatusEntity } from './entities/ticket-status.entity';
import { TicketEntity } from './entities/ticket.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TicketAssignmentHistoryEntity,
            TicketPriorityEntity,
            TicketStatusEntity,
            TicketEntity
        ]),
    ],
    exports: [
        TypeOrmModule,
    ],
})

export class RolesModule {}

export class TicketsModule {}
