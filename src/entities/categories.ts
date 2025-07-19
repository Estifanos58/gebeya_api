import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "Category"})
export class Category {
    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({name: "name"})
    name: string;

    @Column({name: "description", nullable: true})
    description: string;
}