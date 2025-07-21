import { User } from "@/entities";

export class DeleteStoreCommand {
    constructor(
        public readonly id: string,
        public readonly user: User 
    ){}
    
}