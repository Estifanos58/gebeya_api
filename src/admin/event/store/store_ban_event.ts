import { Store } from "@/entities";

export class StoreBanEvent {
  constructor(
    public readonly store: Store,
    public readonly reason: string
  ) {}
}