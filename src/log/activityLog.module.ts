import { EntityModule } from "@/entities/entity.module";
import { Module } from "@nestjs/common";
import { ActivityLogService } from "./activityLog.service";

@Module({
    imports: [
        EntityModule,
    ],
    providers: [ActivityLogService],
    exports: [ActivityLogService],
})

export class ActivityLogModule {}