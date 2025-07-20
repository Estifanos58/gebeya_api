import { User } from "@/entities";

export class CreateStoreCommand{
    constructor(
        public readonly createdBy: User["id"],
        public readonly storeName: string,
        public readonly location: string,
        public readonly phoneNumber: string,
    ){}
}