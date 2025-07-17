import { Injectable , CanActivate, ExecutionContext} from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { Roles } from '@/decorator/roles.decorator';
@Injectable()
export class RoleGuard implements CanActivate {
    constructor( private readonly refactor: Reflector){}
    canActivate( context: ExecutionContext): boolean {
        const role = this.refactor.get(Roles, context.getHandler() )
        return true;
    }
}