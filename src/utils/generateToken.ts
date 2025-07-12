import { Response } from "express";

export const generateJWTTOken = (userId: string, email: string, role: string, res: Response) => {
    const jwt = require('jsonwebtoken');
    const secretKey = process.env.JWT_SECRET || ""

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