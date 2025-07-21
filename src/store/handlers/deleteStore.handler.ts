import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteStoreCommand } from "../command/deleteStore.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

@CommandHandler(DeleteStoreCommand)
export class DeleteStoreHandler implements ICommandHandler<DeleteStoreCommand>{

    constructor(@InjectRepository(Store) private readonly storeRepo: Repository<Store>){}

    async execute(command: DeleteStoreCommand): Promise<any> {
        const { user, id } =  command;

        const store = await this.storeRepo.findOne({where: {id, user}})

        if(!store){
            throw new HttpException({ message: "You are not Authorized"}, HttpStatus.UNAUTHORIZED)
        }
        await this.storeRepo.delete({id}) 

        return {
            message: "Store deleted"
        }
    }
}