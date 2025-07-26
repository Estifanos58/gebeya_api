import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from "express";
import { CreateOrderCommand } from "./command/create_order.command";


@Controller('order')
export class OrderController {
    
    constructor(
        private readonly commandBus: CommandBus
    ){}

    @Post()
    async createOrder(@Body() body: {cartId: string}, @Req() req: Request, @Res() res: Response){
        const order = await this.commandBus.execute(new CreateOrderCommand(req.userId!, body.cartId))
        return res.status(200).json({...order});
    }
}