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

import { RoleEntity } from "../../roles/entities/role.entity";

@Entity("users")
@Index(["roleId"])
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "role_id",
    type: "uuid",
  })
  roleId!: string;

  @ManyToOne(
    () => RoleEntity,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({
    name: "role_id",
  })
  role!: RoleEntity;

  @Column({
    type: "varchar",
    length: 150,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 255,
    unique: true,
  })
  email!: string;

  /*
   * Nunca se devuelve este campo al frontend.
   */
  @Column({
    name: "password_hash",
    type: "varchar",
    length: 255,
  })
  passwordHash!: string;

  /*
   * En lugar de eliminar usuarios históricamente
   * relacionados con tickets, se desactivan.
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

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}