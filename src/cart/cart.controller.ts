import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateCartDto } from "./dto/create-cart.dto";
import { Request, Response } from "express";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { CreateCartCommand } from "./command/create-cart.command";
import { updateCartCommand } from "./command/update-cart.command";
import { DeleteCartCommand } from "./command/delete-cart.command";
import { DeleteCartItemCommand } from "./command/delete-cartItem.command";
import { GetCartQuery } from "./query/get-cart.query";

@Controller("cart")
export class CartController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ){}

    @Get()
    async getCart(@Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.queryBus.execute(new GetCartQuery(req.userId!));
        return res.status(200).json({...cart});
    }

    @Post('add')
    async createCart(@Body() createCartdto: CreateCartDto, @Req() req: Request,  @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new CreateCartCommand(req.userId!, createCartdto.productSkuId, createCartdto.quantity));
        return res.status(201).json({...cart})
    }

    @Patch('update')
    async updateCart(@Body() UpdateCartDto: CreateCartDto,@Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new updateCartCommand(req.userId!, UpdateCartDto.productSkuId, UpdateCartDto.quantity));
        return res.status(200).json({...cart});
    }

    @Delete('delete')
    async deleteCart(@Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new DeleteCartCommand(req.userId!));
        return res.status(200).json({...cart});
    }

    @Delete(':id')
    async deleteCartItem(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        const cart = await this.commandBus.execute(new DeleteCartItemCommand(req.userId!, id));
        return res.status(200).json({...cart});
    }
}
