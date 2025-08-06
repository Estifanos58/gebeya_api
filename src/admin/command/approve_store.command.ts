import { User } from "@/entities";

export class ApproveStoreCommand {
  constructor(
    public readonly storeId: string,
    public readonly isApproved: boolean,
    public readonly user: User
) {}
}
