import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateProductCommand } from "../command/createProduct.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Product, ProductSkus, Store } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus, Logger } from "@nestjs/common";

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  private readonly logger = new Logger(CreateProductHandler.name);

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductSkus)
    private readonly productSkusRepo: Repository<ProductSkus>
  ) {}

  async execute(command: CreateProductCommand): Promise<any> {
    const { name, description, cover, userId, storeId, productSkus } = command;

    try {
      const store = await this.storeRepo.findOne({
        where: { id: storeId, user: { id: userId } },
        relations: ['user'],
      });

      if (!store) {
        throw new HttpException({ message: "You are not allowed to add products to this store" }, HttpStatus.FORBIDDEN);
      }

      const product = this.productRepo.create({
        name,
        description,
        cover,
        store,
      });

      const savedProduct = await this.productRepo.save(product);

      const skusToSave = productSkus.map((item) =>
        this.productSkusRepo.create({
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          product: savedProduct,
        })
      );

      const savedSkus = await this.productSkusRepo.save(skusToSave);

      return {
        message: "Product created successfully",
        product: savedProduct,
        skus: savedSkus,
      };
    } catch (error) {
      this.logger.error("Failed to create product", error.stack);
      throw new HttpException(
        { message: "Internal Server Error", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
