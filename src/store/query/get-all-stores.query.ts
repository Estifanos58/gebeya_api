export enum StoreOrder{
    NAME = "name",
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt"
}

export class GetAllStoreQuery {
    constructor(
        public readonly name: string | null = null,
        public readonly orderBy: StoreOrder | null = StoreOrder.NAME,
        public readonly sortBy: "ASC" | "DESC" = "ASC",
        public readonly isVerified: boolean | null = null,
        public readonly banned: boolean | null = null,
    ){}
}