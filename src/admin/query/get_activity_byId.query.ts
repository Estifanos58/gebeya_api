import { ActivityLog } from "@/entities";

export class GetActivityByIdQuery {
    constructor(
        public readonly id: ActivityLog['id']
    ){}
}