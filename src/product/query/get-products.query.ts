
export enum ProductSortBy {
  CREATED_AT = 'createdAt', 
  PRICE = 'price',
  NAME = 'name',
  RATING = 'rating',
}


export class GetProductsQuery {
  constructor(
    public readonly categoryId: string,
    public readonly sortBy: ProductSortBy = ProductSortBy.CREATED_AT,
    public readonly sortOrder: 'ASC' | 'DESC' = 'ASC',
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly name?: string,
    public readonly minRange?: number,
    public readonly maxRange?: number,
  ) {}
}