import { Response } from "express";

export class ResetPasswordCommand {
    constructor(
        public readonly token: string,
        public readonly email: string,
        public readonly newPassword: string,
        public readonly res?: Response
    ) {}
}