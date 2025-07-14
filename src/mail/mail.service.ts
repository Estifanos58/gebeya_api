import { MailerService } from "@nestjs-modules/mailer";

export class MailService {
    constructor(
        private readonly mailerService: MailerService,
    ) {}

    async sendOtp(email: string, otp: number, otpExpiresAt: Date): Promise<void> {
        try {
            await this.mailerService.sendMail({
                from: "",
                to: email,
                subject: 'Your OTP Code',
                html: `<p>Your OTP code is <strong>${otp}</strong>.</p>`
            });
            console.log(`OTP sent to ${email}. It will expire at ${otpExpiresAt}`);
        } catch (error) {
            console.error(`Failed to send OTP to ${email}:`, error);
            throw new Error('Failed to send OTP');
        }
    }
}