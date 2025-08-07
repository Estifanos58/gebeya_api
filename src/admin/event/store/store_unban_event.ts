import { Store, User } from "@/entities";

export class StoreUnBanEvent {
  constructor(
    public readonly store: Store,
  ) {}
}