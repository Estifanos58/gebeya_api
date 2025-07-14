import { User } from "../entities/user";

export class VerifyOtpCommand {
    constructor(
        public readonly user: User, // User object from the request
        public readonly otp: number // OTP to verify
    ) {}
}