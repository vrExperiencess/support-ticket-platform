import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { ClientsModule } from "../clients/clients.module";
import { UsersModule } from "../users/users.module";

import { TicketCommentEntity } from "../comments/entities/ticket-comment.entity";
import { TicketEntity } from "./entities/ticket.entity";
import { TicketStatusEntity } from "./entities/ticket-status.entity";
import { TicketPriorityEntity } from "./entities/ticket-priority.entity";
import { TicketAssignmentHistoryEntity } from "./entities/ticket-assignment-history.entity";
import { TicketStatusHistoryEntity } from "./entities/ticket-status-history.entity";

import { TicketPolicyService } from "./policies/ticket-policy/ticket-policy.service";
import { TicketsService } from "./tickets.service";

import { TicketsController } from "./tickets.controller";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketEntity,
      TicketStatusEntity,
      TicketPriorityEntity,
      TicketAssignmentHistoryEntity,
      TicketStatusHistoryEntity,
      TicketCommentEntity,
    ]),

    UsersModule,

    ClientsModule,
  ],

  controllers: [
    TicketsController,
  ],

  providers: [
    TicketsService,
    TicketPolicyService,
  ],

  exports: [
    TicketsService,
    TicketPolicyService,
  ],
})
export class TicketsModule {}