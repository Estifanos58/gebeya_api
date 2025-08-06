import { User } from "@/entities";

export class UserRegisterEvent {
    constructor(
        public readonly user: User,
        public readonly otp: string,
        public readonly otpExpires_at: string
    ){}
}