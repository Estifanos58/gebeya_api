import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshTokenCommand } from "../commands/refresh-token.command";
import { HttpException, HttpStatus } from "@nestjs/common";
import { generateJWTToken, storeTokenInCookie, verifyToken } from "@/utils/generateToken";
import { InjectRepository } from "@nestjs/typeorm";
import { Credentials, User } from "@/entities";
import { Repository } from "typeorm";

@CommandHandler(RefreshTokenCommand)

export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand>{

    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User> ,
        @InjectRepository(Credentials) private readonly credRepo: Repository<Credentials>
    ){}

    async execute(command: RefreshTokenCommand): Promise<any> {
        const {req, res} = command
        const refresh_token = req.cookies.refreshToken;

        if(!refresh_token){
            throw new HttpException({ message: "refresh_token Not Found" }, HttpStatus.BAD_REQUEST)
        }

        const userId = verifyToken(refresh_token);

        const credential = await this.credRepo.findOne({where: {user: {id: userId}}});

        if(!credential || !credential?.refreshToken || (credential?.refreshToken !== refresh_token) || (verifyToken(credential?.refreshToken) !== userId)){
            throw new HttpException({ message: "Invalid Refresh Token" }, HttpStatus.FORBIDDEN)
        }

        // Generate Token For the User
        const accessToken = generateJWTToken(userId, credential.user?.email! , credential.user?.role!, false);
        const refreshToken = generateJWTToken(userId, credential.user.email, credential.user.role, true);

        // Store Token To Cookie
        storeTokenInCookie(res, accessToken, false);
        storeTokenInCookie(res, refreshToken, true);

        return {
            message: "Token  Refreshed"
        }
    
    }
}