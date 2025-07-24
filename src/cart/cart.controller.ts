import { Body, Controller, Patch, Post, Req, Res } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateCartDto } from "./dto/create-cart.dto";
import { Request, Response } from "express";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { CreateCartCommand } from "./command/create-cart.command";
import { updateCartCommand } from "./command/update-cart.command";

@Controller("cart")
export class CartController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ){}

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
}