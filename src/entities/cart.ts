import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { ProductSkus } from "./product_skus";

@Entity({name: "cart"})
export class Cart {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "user_id"})
    userId: User["id"];

    // @Column({name : "total"})
    // total: number;


}