import { UserRole } from "../entities/user";

export class CreateUserCommand {
    constructor(
        public readonly email: string,
        public readonly password: string,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly role: UserRole,
        public readonly phoneNumber?: string | null,
        public readonly address?: string | null,
        public readonly profilePicture?: string | null,
        public readonly age?: number | null
    ) {}
}