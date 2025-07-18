import { User } from "@/auth/entities/user";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("store")
export class Store {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "createaBy"})
    createdBy: User["id"]

    @Column({name: "storeName", unique: true})
    storeName: string

    @Column({ name: "location"})
    location: string;

    @Column({name: "is_active", default: true})
    isActive: boolean

    @Column({name: "phone_number"})
    phoneNumber: string

    
}