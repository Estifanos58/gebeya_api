import { User } from "@/entities";

export class GetUserQuery{
    constructor(
        public readonly user: User
    ){}
}