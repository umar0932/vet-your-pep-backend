import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Reflector } from '@nestjs/core'

import { Observable } from 'rxjs'

import { UserRole } from '@app/customer-user'

import { ROLES_KEY } from '../decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredRoles) return true

    const ctx = GqlExecutionContext.create(context)
    const user = ctx.getContext().req.user

    return requiredRoles.some(role => user.role?.includes(role))
  }
}
