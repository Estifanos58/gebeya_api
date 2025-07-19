import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./categories";

@Entity({name: "products"})
export class Product {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "name"})
    name: string;

    @Column({name: "description", nullable: true})
    description: string;

    @Column({name: "cover"})
    cover: string;

    @Column({name: "catagoy_id"})
    catagoryId: Category["id"];
}