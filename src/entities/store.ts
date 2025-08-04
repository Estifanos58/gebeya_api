import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Product } from "./product";
import { Comment } from "./comment";
import { Payment } from "./payment";
import { Order } from "./order";

@Entity({name: "store"})
export class Store {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "name"})
    name: string;

    @OneToOne(()=> User)
    @JoinColumn({name: "user_id"})
    user: User

    @OneToMany(()=> Product, (product)=> product.store )
    product: Product[]

    @OneToMany(()=> Comment, (comment)=> comment.store)
    comment: Comment[]

    @Column({name: "location"})
    location: string

    @Column({name: "phone_number"})
    phoneNumber: string

    @Column({name: "is_verified", type: "boolean" ,default: false})
    isVerified: boolean;

    @OneToMany(()=> Payment, payment => payment.store, { nullable: true })
    payments: Payment[];

    @OneToMany(()=> Order, order => order.store, { nullable: true })
    orders: Order[];


    @Column({name: "created_at", type: "timestamp" , default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date
}