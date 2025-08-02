import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./categories";
import { ProductSkus } from "./product_skus";
import { Store } from "./store";
import { Comment } from "./comment";

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

  @OneToMany(() => ProductSkus, (sku) => sku.product, {cascade: true})
  skus: ProductSkus[];

  @ManyToOne(()=> Store, (store)=>store.product)
  @JoinColumn({name: "store_id"})
  store: Store

  @OneToMany(()=> Comment, (comment)=> comment.product, {cascade: true})
  comment: Comment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  
}
