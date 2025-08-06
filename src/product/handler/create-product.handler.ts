import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateProductCommand } from "../command/createProduct.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Category, Product, ProductSkus, Store } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ActivityLogService } from "@/log/activityLog.service";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductSkus)
    private readonly productSkusRepo: Repository<ProductSkus>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: CreateProductCommand): Promise<any> {
    const { name, description, cover, userId, storeId, categoryId , productSkus } = command;

    try {
      const store = await this.storeRepo.findOne({
        where: { id: storeId, user: { id: userId } },
        relations: ['user'],
      });

      if (!store) {
        throw new HttpException({ message: "You are not allowed to add products to this store" }, HttpStatus.FORBIDDEN);
      }

      if(!store.isVerified) {
        throw new HttpException({ message: "Store is not verified" }, HttpStatus.FORBIDDEN);
      }

      if(store.banned){
        throw new HttpException({ message: "Store is banned" }, HttpStatus.FORBIDDEN);
      }

      const category = await this.categoryRepo.findOne({
        where: { id: categoryId },
      })

      if (!category) {
        throw new HttpException({ message: "Category not found" }, HttpStatus.NOT_FOUND);
      }



      const product = this.productRepo.create({
        name,
        description,
        cover,
        store,
        category
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

      this.activityLogService.info(
        'New Product Added',
        'Product created successfully',
        store.user.email,
        store.user.role,
        {
          userId: store.user.id,
          storeId: store.id,
          productId: savedProduct.id,
        }
      )

      return {
        message: "Product created successfully",
        product: savedProduct,
        skus: savedSkus,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'CreateProductHandler',
        'Product/Creation',
        this.activityLogService,
        {
          userId,
          storeId,
        }
      )
     
    }
  }
}
