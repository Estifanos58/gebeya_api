import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCartCommand } from '../command/create-cart.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from '@/entities';
import { Repository } from 'typeorm';

@CommandHandler(CreateCartCommand)
export class CreateCartHandler implements ICommandHandler<CreateCartCommand> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async execute(command: CreateCartCommand): Promise<any> {
    const { userId, productSkuId, quantity } = command;

    try {
      let cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['cartItems', 'cartItems.productSku'],
      });

      // If the cart exists
      if (cart) {
        const existingItem = cart.cartItems.find(
          (item) => item.productSku.id === productSkuId,
        );

        if (existingItem) {
          existingItem.quantity += quantity;
          await this.cartItemRepository.save(existingItem);
        } else {
          const newItem = this.cartItemRepository.create({
            productSku: { id: productSkuId },
            quantity,
            cart: { id: cart.id },
          });
          await this.cartItemRepository.save(newItem);
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

      return { message: 'Cart updated successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to update cart: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
