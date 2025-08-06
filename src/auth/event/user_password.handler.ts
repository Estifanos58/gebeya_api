import { MailService } from "@/mail/mail.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PASSWORD_RESET_TEMPLATE } from "@/utils/templates";
import { UserPasswordResetEvent } from "./user_passwordReset.event";



@Injectable()
export class UserPasswordResetHandler {
    constructor(
        private readonly mailService: MailService,
    ){}

    @OnEvent('user.passwordResetRequested')
     handleUserPasswordReset(event: UserPasswordResetEvent) {
        const { user, temporaryToken, expiresAt } = event;

        // Send Password Reset Email to the user
        const link = `https://yourapp.com/reset-password?token=${temporaryToken}&email=${user.email}`;
        
              // Send OTP to the user via email
              const html = PASSWORD_RESET_TEMPLATE;
              const mail = {
                to: user.email,
                subject: 'Password Reset Request',
                html: html,
                placeholders: {
                  name: user.firstName,
                  resetLink: link,
                  expiresAt, // Format the date as needed
                  year: new Date().getFullYear().toString(),
                },
              };
        this.mailService.sendMail(mail);
    }

}