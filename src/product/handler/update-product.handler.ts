import { Category, Product, ProductSkus, Store } from '@/entities';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProductCommand } from '../command/updateProduct.command';
import { HttpException, HttpStatus } from '@nestjs/common';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ProductSkus)
    private readonly productSkusRepo: Repository<ProductSkus>,
  ) {}

  async execute(command: UpdateProductCommand): Promise<any> {
    const {
      id,
      name,
      description,
      cover,
      userId,
      categoryId,
      productSkus,
    } = command;

    try {
        const product = await this.productRepo.findOne({ where: { id, store: {user: {id: userId}} }, relations: ['store', 'store.user'] });
        if (!product) {
            throw new HttpException({ message: "Product not found" }, HttpStatus.NOT_FOUND);
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (cover) product.cover = cover;
        if (categoryId) {
            const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
            if (!category) {
                throw new HttpException({ message: "Category not found" }, HttpStatus.NOT_FOUND);
            }
            product.category = category;
        }
        if (productSkus) {
            await Promise.all(
                productSkus.map(async (sku) => {
                const updateSku = await this.productSkusRepo.findOne({ where: { id: sku.id } });
                if (!updateSku) {
                    throw new HttpException({ message: 'SKU not found' }, HttpStatus.NOT_FOUND);
                }
                if (sku.price) {
                    updateSku.prevPrice = updateSku.price;
                    updateSku.price = sku.price;
                }
                if (sku.size) updateSku.size = sku.size;
                if (sku.color) updateSku.color = sku.color;
                if (sku.quantity) updateSku.quantity = sku.quantity;
                await this.productSkusRepo.save(updateSku);
                }),
            );
            }

        const updatedProduct = await this.productRepo.save(product);

        return {
          message: "Product updated successfully",
          product: updatedProduct,
        };

    } catch (error) {
        throw new HttpException({ message: "Server Error Happened"}, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
