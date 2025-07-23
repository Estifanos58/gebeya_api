import { Size, Store, User} from "@/entities";

export type Skus = {
    size: Size,
    price: string,
    quantity: number,
    color: string
}

export class CreateProductCommand {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly cover: string,
        public readonly userId: User['id'],
        public readonly storeId: Store['id'],
        public readonly categoryId: string,
        public readonly productSkus: Array<Skus>
    ) {}
}