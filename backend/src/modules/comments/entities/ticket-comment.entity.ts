import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { TicketEntity } from "../../tickets/entities/ticket.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Entity("ticket_comments")
export class TicketCommentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "ticket_id",
    type: "uuid",
  })
  ticketId!: string;

  @ManyToOne(() => TicketEntity, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "ticket_id" })
  ticket!: TicketEntity;

  @Column({
    name: "user_id",
    type: "uuid",
  })
  userId!: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({
    type: "text",
  })
  content!: string;

  @Column({
    name: "is_internal",
    type: "boolean",
    default: false,
  })
  isInternal!: boolean;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}