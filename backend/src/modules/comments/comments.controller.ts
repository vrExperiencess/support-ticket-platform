import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";

import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";

import { CommentsService } from "./comments.service";

import { CreateCommentDto } from "./dto/create-comment.dto";
import { TicketCommentResponseDto } from "./dto/comment-response.dto";

@Controller(
  "tickets/:ticketId/comments",
)
@UseGuards(
  JwtAuthGuard,
  PermissionsGuard,
)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  @Permissions("tickets.read")
  findAll(
    @Param(
      "ticketId",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    ticketId: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<
    TicketCommentResponseDto[]
  > {
    return this.commentsService.findAll(
      ticketId,
      user,
    );
  }

  /**
   * No usamos @Permissions aquí porque:
   *
   * comentario normal -> tickets.comment
   * comentario interno -> tickets.comment.internal
   *
   * TicketPolicyService decide cuál aplica.
   */
  @Post()
  create(
    @Param(
      "ticketId",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    ticketId: string,

    @Body()
    dto: CreateCommentDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketCommentResponseDto> {
    return this.commentsService.create(
      ticketId,
      dto,
      user,
    );
  }
}