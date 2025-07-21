import { Request, Response } from "express";

export class RefreshTokenCommand{
    constructor(
        public readonly req: Request,
        public readonly res: Response
    ){}
}