import { Store } from "@/entities";

export class StoreApproveEvent {
    constructor(
        public readonly store: Store
    ) {}
}

