import { User } from "@/entities";

export class UserBanCommand {
    constructor(
        public readonly userId: User['id'],
    ){}
}