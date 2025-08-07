import { User } from "@/entities";

export class UserUnBanEvent {
  constructor(
    public readonly user: User,
  ) {}
}