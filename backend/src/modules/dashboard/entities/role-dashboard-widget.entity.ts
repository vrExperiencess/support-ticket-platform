// src/modules/dashboard/entities/role-dashboard-widget.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { RoleEntity } from "../../roles/entities/role.entity";

import { DashboardWidgetEntity } from "./dashboard-widget.entity";

/**
 * Relación entre roles y widgets.
 *
 * Gracias a esta tabla el dashboard no necesita:
 *
 * if role === ADMIN ...
 *
 * sino que la configuración se obtiene desde DB.
 */
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

  @ManyToOne(
    () => RoleEntity,
    {
      nullable: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "role_id",
  })
  role!: RoleEntity;

  @ManyToOne(
    () => DashboardWidgetEntity,
    (widget) => widget.roleConfigurations,
    {
      nullable: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "widget_id",
  })
  widget!: DashboardWidgetEntity;

  /**
   * Permite mantener la configuración registrada pero
   * ocultar temporalmente el widget.
   */
  @Column({
    type: "boolean",
    default: true,
  })
  enabled!: boolean;

  /**
   * Orden visual del dashboard.
   */
  @Column({
    name: "sort_order",
    type: "smallint",
    default: 0,
  })
  sortOrder!: number;

  /**
   * Configuración visual extensible.
   *
   * Ejemplo:
   *
   * {
   *   "size": "lg",
   *   "variant": "primary"
   * }
   *
   * No necesitamos modificar schema cuando aparezcan
   * nuevas opciones visuales.
   */
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