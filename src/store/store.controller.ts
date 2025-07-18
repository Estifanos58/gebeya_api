import { Body, Controller, Post, Req, Res } from "@nestjs/common"
import { CreateStoreDto } from "./dto/createStore.dto";
import { Roles } from "@/decorator/roles.decorator";
import { Request, Response } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { CreateStoreCommand } from "./command/createStore.command";

@Controller('store')
@Roles(["merchant"])
export class StoreController {

    constructor(private readonly commandBus: CommandBus) {}
    @Post()
    async createStore(@Body() body: CreateStoreDto, @Req() req: Request, @Res() res: Response): Promise<any> {
        // Logic to create a store
        const store = await this.commandBus.execute(new CreateStoreCommand(req.user.id, body.storeName, body.location, body.phoneNumber)); 

        return { message: "Store created successfully", data: body };

    }
}