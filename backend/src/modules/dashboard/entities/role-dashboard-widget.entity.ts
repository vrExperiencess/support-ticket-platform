import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";

import { RoleEntity } from "../../roles/entities/role.entity";
import { DashboardWidgetEntity } from "./dashboard-widget.entity";

@Entity("role_dashboard_widgets")
export class RoleDashboardWidgetEntity {
  @PrimaryColumn({
    name: "role_id",
    type: "uuid",
  })
  roleId!: string;

  @PrimaryColumn({
    name: "widget_id",
    type: "uuid",
  })
  widgetId!: string;

  @ManyToOne(() => RoleEntity, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "role_id" })
  role!: RoleEntity;

  @ManyToOne(() => DashboardWidgetEntity, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "widget_id" })
  widget!: DashboardWidgetEntity;

  @Column({
    type: "boolean",
    default: true,
  })
  enabled!: boolean;

  @Column({
    name: "sort_order",
    type: "smallint",
    default: 0,
  })
  sortOrder!: number;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  config!: Record<string, unknown> | null;

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