
export enum StoreSortQuery {
    STORE_NAME = 'name',
    STORE_CREATED_AT = 'createdAt',
    STORE_PRODUCTS = 'products',
    STORE_ORDERS = 'orders',
}

export class GetStoresQuery {
  constructor(
    public readonly search: string = '',
    public readonly verified: boolean | null = null,
    public readonly sortBy: StoreSortQuery = StoreSortQuery.STORE_CREATED_AT,
    public readonly order: 'asc' | 'desc' = 'desc',
    public readonly banned: boolean | null = null,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}