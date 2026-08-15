import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import {
  DataSource,
  Repository,
} from "typeorm";

import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";

import { TicketEntity } from "../tickets/entities/ticket.entity";
import { TicketCommentEntity } from "./entities/ticket-comment.entity";

import { TicketPolicyService } from "../tickets/policies/ticket-policy/ticket-policy.service";

import { CreateCommentDto } from "./dto/create-comment.dto";
import { TicketCommentResponseDto } from "./dto/comment-response.dto";


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(TicketCommentEntity)
    private readonly commentRepository: Repository<TicketCommentEntity>,

    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,

    private readonly dataSource: DataSource,

    private readonly ticketPolicy: TicketPolicyService,
  ) {}

  async findAll(
    ticketId: string,
    user: AuthenticatedUser,
  ): Promise<TicketCommentResponseDto[]> {
    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        "Ticket not found.",
      );
    }

    this.ticketPolicy.assertCanReadTicket(
      user,
      ticket,
    );

    /**
     * Los agentes normales NO reciben comentarios internos.
     */
    const comments =
      await this.commentRepository.find({
        where:
          this.ticketPolicy.canViewInternalComments(
            user,
          )
            ? {
                ticketId,
              }
            : {
                ticketId,
                isInternal: false,
              },

        relations: {
          user: true,
        },

        order: {
          createdAt: "ASC",
        },
      });

    return comments.map(
      (comment) =>
        this.mapComment(comment),
    );
  }

  async create(
    ticketId: string,
    dto: CreateCommentDto,
    user: AuthenticatedUser,
  ): Promise<TicketCommentResponseDto> {
    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        "Ticket not found.",
      );
    }

    const internal =
      dto.isInternal ?? false;

    this.ticketPolicy.assertCanComment(
      user,
      ticket,
      internal,
    );

    let commentId = "";

    await this.dataSource.transaction(
      async (manager) => {
        const commentRepository =
          manager.getRepository(
            TicketCommentEntity,
          );

        const ticketRepository =
          manager.getRepository(
            TicketEntity,
          );

        const transactionalTicket =
          await ticketRepository.findOne({
            where: {
              id: ticketId,
            },
          });

        if (!transactionalTicket) {
          throw new NotFoundException(
            "Ticket not found.",
          );
        }

        const comment =
          commentRepository.create({
            ticketId,

            userId:
              user.id,

            content:
              dto.content.trim(),

            isInternal:
              internal,
          });

        const savedComment =
          await commentRepository.save(
            comment,
          );

        /**
         * Un comentario representa actividad sobre el ticket.
         */
        transactionalTicket.updatedAt =
          new Date();

        await ticketRepository.save(
          transactionalTicket,
        );

        commentId =
          savedComment.id;
      },
    );

    const saved =
      await this.commentRepository.findOne({
        where: {
          id: commentId,
        },

        relations: {
          user: true,
        },
      });

    if (!saved) {
      throw new NotFoundException(
        "Comment could not be loaded after creation.",
      );
    }

    return this.mapComment(
      saved,
    );
  }

  private mapComment(
    comment: TicketCommentEntity,
  ): TicketCommentResponseDto {
    return {
      id: comment.id,

      content:
        comment.content,

      isInternal:
        comment.isInternal,

      createdAt:
        comment.createdAt,

      updatedAt:
        comment.updatedAt,

      user: {
        id:
          comment.user.id,

        name:
          comment.user.name,

        email:
          comment.user.email,
      },
    };
  }
}