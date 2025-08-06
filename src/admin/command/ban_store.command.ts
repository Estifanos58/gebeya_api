import { User } from "@/entities";

export class BanStoreCommand {
  constructor(
    public readonly storeId: string,
    public readonly reason: string,
    public readonly user: User
  ) {}
}