import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { TicketEntity } from "../tickets/entities/ticket.entity";
import { TicketCommentEntity } from "./entities/ticket-comment.entity";

import { TicketsModule } from "../tickets/tickets.module";

import { CommentsController } from "./comments.controller";

import { CommentsService } from "./comments.service";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketCommentEntity,
      TicketEntity,
    ]),

    /*
     * Necesitamos TicketPolicyService,
     * exportado por TicketsModule.
     */
    TicketsModule,
  ],

  controllers: [
    CommentsController,
  ],

  providers: [
    CommentsService,
  ],

  exports: [
    CommentsService,
  ],
})
export class CommentsModule {}