import { ProductSortBy } from "../query/get-products.query";

export class QueryProductsDto {
  constructor(
    public readonly storeId?: string,
    public readonly categoryId?: string,
    public readonly sortBy: ProductSortBy = ProductSortBy.CREATED_AT,
    public readonly sortOrder: 'ASC' | 'DESC' = 'ASC',
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly name?: string,
    public readonly minRange?: number,
    public readonly maxRange?: number,
  ) {}
}