import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Product } from "./product";
import { Comment } from "./comment";
import { Payment } from "./payment";

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

    @Column({ name: 'chapa_api_key', nullable: true })
    chapaApiKey: string; // Encrypted string

    @OneToMany(()=> Payment, payment => payment.store, { nullable: true })
    payments: Payment[];


    @Column({name: "created_at", type: "timestamp" , default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date
}