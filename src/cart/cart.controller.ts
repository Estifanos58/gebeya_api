import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateCartDto } from "./dto/create-cart.dto";
import { Request, Response } from "express";
import { CreateCartCommand } from "./command/create-cart.command";
import { updateCartCommand } from "./command/update-cart.command";
import { DeleteCartCommand } from "./command/delete-cart.command";
import { DeleteCartItemCommand } from "./command/delete-cartItem.command";
import { GetCartQuery } from "./query/get-cart.query";
import { ApiResponse } from "@nestjs/swagger";

@Controller("cart")
export class CartController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ){}

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Cart retrieved successfully',
        type: Object
    })
    async getCart(@Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.queryBus.execute(new GetCartQuery(req.userId!));
        return res.status(200).json({...cart});
    }

    @Post('add')
    @ApiResponse({
        status: 201,
        description: 'Cart Created successfully',
        type: Object
    })
    async createCart(@Body() createCartdto: CreateCartDto, @Req() req: Request,  @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new CreateCartCommand(req.userId!, createCartdto.productSkuId, createCartdto.quantity));
        return res.status(201).json({...cart})
    }

    @Patch('update')
    @ApiResponse({
        status: 200,
        description: 'Cart item updated successfully',
        type: Object
    })
    async updateCart(@Body() UpdateCartDto: CreateCartDto,@Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new updateCartCommand(req.userId!, UpdateCartDto.productSkuId, UpdateCartDto.quantity));
        return res.status(200).json({...cart});
    }

    @Delete('delete')
    @ApiResponse({
        status: 200,
        description: 'Cart deleted successfully',
        type: Object
    })
    async deleteCart(@Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new DeleteCartCommand(req.userId!));
        return res.status(200).json({...cart});
    }

    @Delete(':id')
    @ApiResponse({
        status: 200,
        description: 'Cart item deleted successfully',
        type: Object
    })
    async deleteCartItem(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new DeleteCartItemCommand(req.userId!, id));
        return res.status(200).json({...cart});
    }
}
