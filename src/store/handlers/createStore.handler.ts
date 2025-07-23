import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateStoreCommand } from "../command/createStore.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Store, User, UserRole } from "@/entities";
import { Repository } from "typeorm";
import { HttpException, HttpStatus, Logger } from "@nestjs/common";

@CommandHandler(CreateStoreCommand)
export class CreateStoreHandler implements ICommandHandler<CreateStoreCommand> {
  private readonly logger = new Logger(CreateStoreHandler.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>
  ) {}

  async execute(command: CreateStoreCommand): Promise<any> {
    const { createdBy, storeName, location, phoneNumber } = command;

    const user = await this.userRepo.findOne({ where: { id: createdBy } });

    if (!user) {
      throw new HttpException({ message: "User with this ID not found" }, HttpStatus.NOT_FOUND);
    }

    if (user.role !== UserRole.MERCHANT) {
      throw new HttpException({ message: "User must be a Merchant to create a store" }, HttpStatus.UNAUTHORIZED);
    }

    // Optional: Prevent duplicate store creation
    const existingStore = await this.storeRepo.findOne({ where: { user: { id: user.id } } });
    if (existingStore) {
      throw new HttpException({ message: "Merchant already owns a store" }, HttpStatus.CONFLICT);
    }

    const store = this.storeRepo.create({
      name: storeName,
      location,
      phoneNumber,
      user,
    });

    const savedStore = await this.storeRepo.save(store);

    return {
      message: "Store created successfully",
      data: savedStore,
    };
  }
}
