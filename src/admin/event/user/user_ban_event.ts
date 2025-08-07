import { User } from "@/entities";

export class UserBanEvent {
  constructor(
    public readonly user: User,
  ) {}
}