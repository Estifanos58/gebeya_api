import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product";

export enum Size{
    LARGE = "lg",
    SMALL = "sm",
    VERY_LARGE= "vlg",
    VERY_SMALL= "vsm"
}

@Entity({name: "product_skus"})
export class ProductSkus{
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "product_id"})
    productId: Product["id"];

    @Column({name: "size", enum: Size})
    size: Size

    @Column({name: "price"})
    price: string;

    @Column({name: "quantity"})
    quantity: number;

    @Column({name: "prev_price"})
    prevPrice: number;
}