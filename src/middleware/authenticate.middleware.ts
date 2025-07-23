import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "@/entities";
import { verifyToken } from "src/utils/generateToken";
import { Repository } from "typeorm";

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}


@Injectable()
export class AuthenticateMiddleware implements NestMiddleware{

    constructor(@InjectRepository(User) private readonly userRepo: Repository<User>){}
    /**
     * Middleware to authenticate user based on JWT token
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Next function to call the next middleware
     */
    async use(req: Request, res: Response, next: NextFunction) {
        // Extract the token from the request cookies
        const token = req.cookies.accessToken;  
        // console.log("Token from cookies:", token);
        // If no token is found, return unauthorized response
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        } 

        try {
            // Verify the token and extract userId
            // If the token is invalid, it will throw an error
            const userId = verifyToken(token);

            if(!userId) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            // FInd the User from the db
            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            req.user = user; // Attach user to request object
            req.userId = user.id; // Attach userId to request object
         // Attach user info to request object
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
}