import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart";
import { ProductSkus } from "./product_skus";

@Entity({name: "cart_item"})
export class CartItem {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;
    
    @Column({name: "cart_id"})
    cartId: Cart["id"];

    @Column({name: "product_skul_id"})
    productSkulId: ProductSkus["id"];

    @Column({name: "quantity"})
    quantity: number;
}