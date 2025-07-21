import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Product } from "./product";

@Entity({name: "store"})
export class Store {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "name"})
    name: string;

    @OneToOne(()=> User, {cascade: true})
    user: User

    @OneToMany(()=> Product, (product)=> product.store )
    product: Product[]

    @Column({name: "location"})
    location: string

    @Column({name: "phone_number"})
    phoneNumber: string

    @Column({name: "is_verified", type: "boolean" ,default: false})
    isVerified: boolean;

    @Column({name: "created_at", type: "date" })
    createdAt: Date
}