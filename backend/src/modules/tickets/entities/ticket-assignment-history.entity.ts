import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { TicketEntity } from "./ticket.entity";
import { UserEntity } from "../../users/entities/user.entity";

export enum TicketAssignmentEventType {
  ASSIGNED = "ASSIGNED",
  REASSIGNED = "REASSIGNED",
}

@Entity("ticket_assignment_history")
@Index(["ticketId"])
export class TicketAssignmentHistoryEntity {
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
    name: "from_user_id",
    type: "uuid",
    nullable: true,
  })
  fromUserId!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "from_user_id" })
  fromUser!: UserEntity | null;

  @Column({
    name: "to_user_id",
    type: "uuid",
  })
  toUserId!: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "to_user_id" })
  toUser!: UserEntity;

  @Column({
    name: "assigned_by_user_id",
    type: "uuid",
  })
  assignedByUserId!: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "assigned_by_user_id" })
  assignedByUser!: UserEntity;

  @Column({
    name: "event_type",
    type: "varchar",
    length: 20,
  })
  eventType!: TicketAssignmentEventType;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;
}