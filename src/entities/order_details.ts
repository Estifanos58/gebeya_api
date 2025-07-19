import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Payment } from "./payment";

@Entity({name: "order_details"})
export class OrderDetails {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "user_id"})
    userId: User["id"];

    @Column({name: "payment_id"})
    paymentId: Payment["id"];

    // @Column({name: "total"})
    // total: number;
}