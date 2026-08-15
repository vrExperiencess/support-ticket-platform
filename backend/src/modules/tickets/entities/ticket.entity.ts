import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { ClientEntity } from "../../clients/entities/client.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { TicketStatusEntity } from "./ticket-status.entity";
import { TicketPriorityEntity } from "./ticket-priority.entity";

@Entity("tickets")
@Index(["clientId", "statusId"])
@Index(["assignedToUserId", "statusId"])
@Index(["priorityId", "createdAt"])
export class TicketEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "client_id",
    type: "uuid",
  })
  clientId!: string;

  @ManyToOne(() => ClientEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "client_id" })
  client!: ClientEntity;

  @Column({
    name: "created_by_user_id",
    type: "uuid",
  })
  createdByUserId!: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser!: UserEntity;

  @Column({
    name: "assigned_to_user_id",
    type: "uuid",
    nullable: true,
  })
  assignedToUserId!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "assigned_to_user_id" })
  assignedToUser!: UserEntity | null;

  @Column({
    name: "resolved_by_user_id",
    type: "uuid",
    nullable: true,
  })
  resolvedByUserId!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "resolved_by_user_id" })
  resolvedByUser!: UserEntity | null;

  @Column({
    name: "status_id",
    type: "uuid",
  })
  statusId!: string;

  @ManyToOne(() => TicketStatusEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "status_id" })
  status!: TicketStatusEntity;

  @Column({
    name: "priority_id",
    type: "uuid",
  })
  priorityId!: string;

  @ManyToOne(() => TicketPriorityEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "priority_id" })
  priority!: TicketPriorityEntity;

  @Column({
    type: "varchar",
    length: 255,
  })
  title!: string;

  @Column({
    type: "text",
  })
  description!: string;

  @Column({
    name: "due_at",
    type: "timestamptz",
    nullable: true,
  })
  dueAt!: Date | null;

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

  @Column({
    name: "resolved_at",
    type: "timestamptz",
    nullable: true,
  })
  resolvedAt!: Date | null;

  @Column({
    name: "closed_at",
    type: "timestamptz",
    nullable: true,
  })
  closedAt!: Date | null;
}