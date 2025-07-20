import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./categories";
import { ProductSkus } from "./product_skus";

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  cover: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @OneToMany(() => ProductSkus, (sku) => sku.product)
  skus: ProductSkus[];
}
