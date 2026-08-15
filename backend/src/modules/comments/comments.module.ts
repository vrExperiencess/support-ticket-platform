import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { TicketCommentEntity } from './entities/ticket-comment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        TicketCommentEntity,
        ]),
    ],
    exports: [
        TypeOrmModule,
    ],
})

export class CommentsModule {}
