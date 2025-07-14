import { Response } from "express";
import * as jwt from 'jsonwebtoken';

export const generateJWTTokenAndStore = (userId: string, email: string, role: string, res: Response) => {
    const secretKey = process.env.JWT_SECRET || "THis_is_the_secret_toke"

    const token = jwt.sign(
        {
            userId,
            email,
            role
        },
        secretKey,
        { expiresIn: '1h' } // Token expires in 1 hour
    );

     res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

}

export const verifyToken = (token: string): any => {
    const secretKey = process.env.JWT_SECRET || "THis_is_the_secret_toke";
    const { userId } = jwt.verify(token, secretKey);
    if (!userId) {
        throw new Error('Invalid token');
    }
    return userId;
}