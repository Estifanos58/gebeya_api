import { Column, Entity, JoinColumn,  ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Product } from "./product";



@Entity({ name: "comment"})
export class Comment {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @ManyToOne(()=> User, (user)=>user.comment)
    @JoinColumn({name: "user_id"})
    user: User;

    @Column({name: "message"})
    message: string;

    @ManyToOne(()=> Product, (product)=>product.comment)
    @JoinColumn({name: "product_id"})
    product: Product

    @Column({name: "review",type: "int", nullable: true})
    review: number

}
