import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCartCommand } from '../command/create-cart.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem, ProductSkus, User } from '@/entities';
import { Repository } from 'typeorm';
import { ActivityLogService } from '@/log/activityLog.service';

@CommandHandler(CreateCartCommand)
export class CreateCartHandler implements ICommandHandler<CreateCartCommand> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>, 

    @InjectRepository(ProductSkus)
    private readonly productSkusRepository: Repository<ProductSkus>,
    private readonly activityLogService: ActivityLogService
  ) {}

  async execute(command: CreateCartCommand): Promise<any> {
    const { userId, productSkuId, quantity } = command;

    let currentUser: User | null = null;
    
    try {
      let cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['cartItems', 'cartItems.productSku', 'user'],
      });

      const productSku = await this.productSkusRepository.findOne({
        where: { id: productSkuId },
      });

      if(!productSku){
        throw new HttpException(`Product SKU ${productSkuId} not found`, HttpStatus.NOT_FOUND);
      }

      if(quantity > productSku.quantity) {
        throw new HttpException(
          `Requested quantity (${quantity}) exceeds available stock (${productSku.quantity})`,
          HttpStatus.BAD_REQUEST
        );
      }

      // If the cart exists
      if (cart) {
        const existingItem = cart.cartItems.find(
          (item) => item.productSku.id === productSkuId,
        );


        if (existingItem) {
          // Check if the quantity is above the current stock 
           if (existingItem.quantity + quantity >= productSku.quantity) {
              throw new HttpException(
                `Requested quantity (${quantity}) exceeds available stock (${productSku.quantity})`,
                HttpStatus.BAD_REQUEST
              );
            }
          existingItem.quantity += quantity;
          await this.cartItemRepository.save(existingItem);
        } else {
          const newItem = this.cartItemRepository.create({
            productSku: { id: productSkuId },
            quantity,
            cart,
          });

          await this.cartItemRepository.save(newItem);
          cart.cartItems.push(newItem);
        }

        await this.cartRepository.save(cart);
      } else {
        // Create new cart and first item
        const newCart = this.cartRepository.create({
          user: { id: userId },
        });

        const savedCart = await this.cartRepository.save(newCart);

        const newItem = this.cartItemRepository.create({
          productSku: { id: productSkuId },
          quantity,
          cart: { id: savedCart.id },
        });

        await this.cartItemRepository.save(newItem);
      }

      return { message: 'Cart Created successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to update cart: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
