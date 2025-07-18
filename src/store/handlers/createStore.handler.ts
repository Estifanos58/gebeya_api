import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateStoreCommand } from "../command/createStore.command";

@CommandHandler(CreateStoreCommand)
export class CreateStoreHandler implements ICommandHandler<CreateStoreCommand> {
    async execute(command: CreateStoreCommand): Promise<any> {
        const { createdBy, storeName, location, phoneNumber } =  command;
    }
}   