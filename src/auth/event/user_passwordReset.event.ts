import { User } from "@/entities";

export class UserPasswordResetEvent {
  constructor(
    public readonly user: User,
    public readonly temporaryToken: string,
    public readonly expiresAt: string, // Format the date as needed
  ) {}
}