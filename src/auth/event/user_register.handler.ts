import { MailService } from "@/mail/mail.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WELCOME_OTP_TEMPLATE } from "@/utils/templates";
import { UserRegisterEvent } from "./user_register.event";
import { ActivityLogService } from "@/log/activityLog.service";

@Injectable()
export class UserRegisterHandler {
  constructor(
    private readonly mailService: MailService,
  ) {}

  @OnEvent("user.registered")
  async handleUserRegistration(event: UserRegisterEvent) {
    const { email, firstName, otp, otpExpires_at } = event;

    // Send OTP to the user via email
    const html = WELCOME_OTP_TEMPLATE;
    const mail = {
      to: email,
      subject: "Welcome to Our Service",
      html: html,
      placeholders: {
        name: firstName,
        otp,
        expiresAt: otpExpires_at,
        year: new Date().getFullYear().toString(),
      },
    };
    await this.mailService.sendMail(mail);

    // Future Improvements: Add "User has just been registered" notification to admin
  }
}
