import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { updateCartCommand } from "../command/update-cart.command";
import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart, CartItem, ProductSkus } from "@/entities";
import { ActivityLogService } from "@/log/activityLog.service";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";

@CommandHandler(updateCartCommand)
export class UpdateCartHandler implements ICommandHandler<updateCartCommand> {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(ProductSkus)
    private readonly productSkusRepository: Repository<ProductSkus>,

    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(command: updateCartCommand): Promise<any> {
    const { userId, productSkuId, quantity } = command;

    try {
      if (quantity < 0) {
        throw new HttpException('Quantity cannot be negative', HttpStatus.BAD_REQUEST);
      }

      const cartItem = await this.cartItemRepository.findOne({
        where: {
          cart: { user: { id: userId } },
          productSku: { id: productSkuId },
        },
        relations: ['cart','cart.user', 'productSku'],
      });

      if (!cartItem) {
        throw new HttpException(
          `Cart item with SKU ${productSkuId} for user ${userId} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      if (quantity === 0) {
        await this.cartItemRepository.remove(cartItem);
        return { message: 'Cart item removed successfully' };
      }

      const storeProduct = await this.productSkusRepository.findOne({
        where: { id: productSkuId },
      });

      if (!storeProduct) {
        throw new HttpException(`Product SKU ${productSkuId} not found`, HttpStatus.NOT_FOUND);
      }

      if (quantity >= storeProduct.quantity) {
        this.activityLogService.warn(
          'User Requested Product Quanity Exceeds Available Stock',
          'Cart/Update',
          cartItem.cart.user.id,
          cartItem.cart.user.role,
          {
            productSkuId: productSkuId,
            requestedQuantity: quantity,
            availableStock: storeProduct.quantity,
          },
        )
        throw new HttpException(
          `Requested quantity (${quantity}) exceeds available stock (${storeProduct.quantity})`,
          HttpStatus.BAD_REQUEST
        );
      }

      cartItem.quantity = quantity;
      const updatedItem = await this.cartItemRepository.save(cartItem);

      return {
        message: "Cart item updated successfully",
        data: updatedItem,
      };
    } catch (error) {
      logAndThrowInternalServerError(
        error,
        'UpdateCartHandler',
        'Cart/Update',
        this.activityLogService,
        { userId, productSkuId: productSkuId, },
      )
    }
  }
}
