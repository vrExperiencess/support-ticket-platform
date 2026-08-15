import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("ticket_priorities")
export class TicketPriorityEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  name: string;

  @Column({
    type: "smallint",
  })
  weight: number;
}