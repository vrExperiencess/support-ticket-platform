// src/modules/dashboard/entities/dashboard-widget.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { RoleDashboardWidgetEntity } from "./role-dashboard-widget.entity";

/**
 * Catálogo de widgets disponibles en la aplicación.
 *
 * Esta tabla NO define qué rol ve cada widget.
 * Solo define qué widgets existen.
 */
@Entity("dashboard_widgets")
export class DashboardWidgetEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * Clave técnica utilizada tanto por backend como frontend.
   *
   * Ej:
   * open_tickets
   * my_tickets
   * global_metrics
   */
  @Column({
    type: "varchar",
    length: 100,
    unique: true,
  })
  key!: string;

  /**
   * Nombre presentado al usuario.
   */
  @Column({
    type: "varchar",
    length: 150,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  description!: string | null;

  /**
   * Permite desactivar un widget globalmente sin borrar
   * configuración de roles.
   */
  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  @OneToMany(
    () => RoleDashboardWidgetEntity,
    (roleWidget) => roleWidget.widget,
  )
  roleConfigurations!: RoleDashboardWidgetEntity[];
}