import { UserRole } from "@/entities";
import { Reflector } from "@nestjs/core";

export const Roles = Reflector.createDecorator<UserRole[]>()