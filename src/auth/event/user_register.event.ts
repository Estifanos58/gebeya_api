export class UserRegisterEvent {
    constructor(
        public readonly email: string,
        public readonly firstName: string,
        public readonly otp: string,
        public readonly otpExpires_at: string
    ){}
}