import { Response } from "express";
import * as jwt from 'jsonwebtoken';

export const generateJWTToken = (userId: string, email: string, role: string, isRefresh: boolean) => {
    const secretKey = process.env.JWT_SECRET || "THis_is_the_secret_toke"

    const expiresIn = isRefresh ? '15d' : '1h'; // Refresh token lasts longer than access token
    const token = jwt.sign(
        {
            userId,
            email,
            role
        },
        secretKey,
        { expiresIn: expiresIn } 
    );

    return token;

}

export const storeTokenInCookie = (res: Response, token: string, isRefresh: boolean) => {
    const tokenName = isRefresh ? 'refreshToken' : 'accessToken';
    // Set the token in the response cookie
    res.cookie(tokenName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: isRefresh ? 15 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000 // Refresh token lasts longer than access token
    });
}

export const verifyToken = (token: string): any => {
    const secretKey = process.env.JWT_SECRET || "THis_is_the_secret_toke";
    const { userId } =  jwt.verify(token, secretKey) as any;
    if (!userId) {
        throw new Error('Invalid token');
    }
    return userId;
}