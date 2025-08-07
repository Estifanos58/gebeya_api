import { ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/entities";
import { Repository } from "typeorm";
import { ActivityLogService } from "@/log/activityLog.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { logAndThrowInternalServerError } from "@/utils/InternalServerError";
import { NotFoundException } from "@nestjs/common";
import { UserUnbanCommand } from "../command/unban_user.command";
import { UserUnBanEvent } from "../event/user/user_unban_event";

export class UserUnbanHandler implements ICommandHandler<UserUnbanCommand>{

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly activityLogService: ActivityLogService,
        private readonly eventEmitter: EventEmitter2
    ){}

    async execute(command: UserUnbanCommand): Promise<any> {
        const {userId} = command;

        try {
            
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found.`);
            }

            user.banned = false;
            await this.userRepository.save(user);

            this.activityLogService.info(
                'User has been unbanned',
                'Admin/UserUnbanHandler',
                user.email,
                user.role,
                { User_id: user.id}
            );

            this.eventEmitter.emit('user.unbanned', new UserUnBanEvent(user));

            return {
                message: `User with ID ${user.id} has been unbanned successfully.`,
            };
        } catch (error) {
            logAndThrowInternalServerError(
                error,
                "UserUnbanHandler",
                "Admin/UserUnbanHandler",
                this.activityLogService,
                {userId}
            )
        }
    }
}