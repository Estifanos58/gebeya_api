import { User } from "@/entities";

export class UserUnbanCommand {
  constructor(
    public readonly userId: User['id'],
  ) {}
}