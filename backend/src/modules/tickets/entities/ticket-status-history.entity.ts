import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { UserEntity } from "../../users/entities/user.entity";

import { TicketEntity } from "./ticket.entity";
import { TicketStatusEntity } from "./ticket-status.entity";

@Entity("ticket_status_history")
@Index(["ticketId"])
export class TicketStatusHistoryEntity {
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
  @JoinColumn({
    name: "ticket_id",
  })
  ticket!: TicketEntity;

  /**
   * Es nullable porque al crear un ticket no existe
   * un estado anterior.
   */
  @Column({
    name: "from_status_id",
    type: "uuid",
    nullable: true,
  })
  fromStatusId!: string | null;

  @ManyToOne(() => TicketStatusEntity, {
    nullable: true,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "from_status_id",
  })
  fromStatus!: TicketStatusEntity | null;

  @Column({
    name: "to_status_id",
    type: "uuid",
  })
  toStatusId!: string;

  @ManyToOne(() => TicketStatusEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "to_status_id",
  })
  toStatus!: TicketStatusEntity;

  @Column({
    name: "changed_by_user_id",
    type: "uuid",
  })
  changedByUserId!: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "changed_by_user_id",
  })
  changedByUser!: UserEntity;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;
}