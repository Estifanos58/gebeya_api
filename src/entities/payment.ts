import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OrderDetails } from "./order_details";

export enum Status {
    COMPLETE = "complete",
    INPROGRESS = "in_progress",
    CANCELED = "canceled"
}

@Entity({name: "payment"})
export class Payment {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "order_id"})
    orderId: OrderDetails["id"];

    @Column({name: "amount"})
    amount: number;

    @Column({name: "status", enum: Status})
    status: Status
}