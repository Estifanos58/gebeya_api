import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import { ConfigService } from "@nestjs/config";


@Injectable()
export class MailService {
    constructor( private readonly configService: ConfigService){}
    emailTransport(){
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('EMAIL_HOST') || 'sandbox.smtp.mailtrap.io',
            port: this.configService.get<number>('PORT') || 2525,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        return transporter;
    }

    async sendOtp(mail: SendMailType): Promise<void> {
        const { to, html, placeholders, subject } = mail;
        const transformHtml = substitutePlaceholders(html!, placeholders!);
        try {
            const transporter = this.emailTransport();
            const options: nodemailer.SendMailOptions = {
                from: this.configService.get<string>('EMAIL_USERNAME'),
                to: to,
                subject: subject,
                html: transformHtml
            }

            await transporter.sendMail(options);
            console.log(`OTP sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send OTP to :`, error);
            throw new Error('Failed to send OTP');
        }
    }
}