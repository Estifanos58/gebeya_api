import { Injectable , CanActivate, ExecutionContext} from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { Roles } from '@/decorator/roles.decorator';
@Injectable()
export class RoleGuard implements CanActivate {
    constructor( private readonly refactor: Reflector){}
    canActivate( context: ExecutionContext): boolean {
        const role = this.refactor.get(Roles, context.getHandler())
        const request = context.switchToHttp().getRequest();
        
        if (!role || !request.user) {
            return false; // If no roles are defined or user is not authenticated, deny access
        }
        const userRole = request.userRole;
        
        return userRole && role.includes(userRole);
    }
}