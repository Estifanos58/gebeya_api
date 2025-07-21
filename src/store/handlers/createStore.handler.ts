import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateStoreCommand } from "../command/createStore.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Store, User, UserRole } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

@CommandHandler(CreateStoreCommand)
export class CreateStoreHandler implements ICommandHandler<CreateStoreCommand> {

    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Store) private readonly storeRepo: Repository<Store>
    ){}

    async execute(command: CreateStoreCommand): Promise<any> {
        const { createdBy, storeName, location, phoneNumber } =  command;

        const  user = await this.userRepo.findOne({where: {id : createdBy}})

        if(!user){
            throw new HttpException({message: "user with this id not found"}, HttpStatus.NOT_FOUND)
        }

        if(user.role !== UserRole.MERCHANT){
            throw new HttpException({message: "user Must be Merchant"}, HttpStatus.UNAUTHORIZED)
        }

        const store = await this.storeRepo.save({
            name: storeName,
            location,
            phoneNumber,
            user
        })

        return {
            message: "Store created successfully",
            data: store
        }
    }
}   