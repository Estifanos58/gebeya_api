import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderDetails } from "./order_details";

export enum Status {
    COMPLETE = "complete",
    INPROGRESS = "in_progress",
    CANCELED = "canceled"
}

@Entity({ name: "payment" })
export class Payment {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @OneToOne(() => OrderDetails, (order) => order.payment)
  order: OrderDetails;

  @Column()
  amount: number;

  @Column({ type: "enum", enum: Status })
  status: Status;
}
