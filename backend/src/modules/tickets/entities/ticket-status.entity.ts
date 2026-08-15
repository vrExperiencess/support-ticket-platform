import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("ticket_statuses")
export class TicketStatusEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 50,
    unique: true,
  })
  code!: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  name!: string;

  @Column({
    name: "sort_order",
    type: "smallint",
    default: 0,
  })
  sortOrder!: number;

  @Column({
    name: "is_terminal",
    type: "boolean",
    default: false,
  })
  isTerminal!: boolean;
}