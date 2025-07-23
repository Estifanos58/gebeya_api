import { Body, Controller, Delete, Param, Post, Query, Req, Res } from "@nestjs/common"
import { CreateStoreDto } from "./dto/createStore.dto";
import { Roles } from "@/decorator/roles.decorator";
import { Request, Response } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { CreateStoreCommand } from "./command/createStore.command";
import { DeleteStoreCommand } from "./command/deleteStore.command";
import { UserRole } from "@/entities";

@Controller('store') 
@Roles([UserRole.MERCHANT, UserRole.ADMIN]) // Example roles, adjust as necessary
export class StoreController {

    constructor(private readonly commandBus: CommandBus) {}


    @Post()
    async createStore(@Body() body: CreateStoreDto, @Req() req: Request, @Res() res: Response): Promise<any> {
        // Logic to create a store
        const store = await this.commandBus.execute(new CreateStoreCommand(req.userId!, body.storeName, body.location, body.phoneNumber)); 
        return res.status(201).json({...store});
    }

    @Delete(":id")
    async deleteStore(@Param("id") id: string ,@Req() req: Request, @Res() res: Response){

        const store = await this.commandBus.execute(new DeleteStoreCommand(id, req.user.id))

        return res.status(200).json({...store});
    }

}