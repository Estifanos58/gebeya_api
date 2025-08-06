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
    private readonly activityLogService: ActivityLogService,
  ) {}

  @OnEvent("user.registered")
  handleUserRegistration(event: UserRegisterEvent) {
    const {user, otp, otpExpires_at } = event;

    // Send OTP to the user via email
    const html = WELCOME_OTP_TEMPLATE;
    const mail = {
      to: user.email,
      subject: "Welcome to Our Service",
      html: html,
      placeholders: {
        name: user.firstName,
        otp,
        expiresAt: otpExpires_at,
        year: new Date().getFullYear().toString(),
      },
    };
    this.mailService.sendMail(mail).catch((error) => {
        this.activityLogService.error(
          'Failed to send User Registration email',
          'Auth/RegistrationEvent',
          user.email,
          user.role,
          { UserId: user.id, error: error.message },
        );
      })

    // Future Improvements: Add "User has just been registered" notification to admin
  }
}
