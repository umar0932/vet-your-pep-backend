import { applyDecorators, UseGuards } from '@nestjs/common'
import { SetMetadata } from '@nestjs/common'

import { UserRole } from '@app/customer-user'

import { JWTGuard, RolesGuard } from '../guard'

export const ROLES_KEY = 'roles'

export const Allow = (userType?: UserRole[]) => {
  return applyDecorators(SetMetadata(ROLES_KEY, userType), UseGuards(JWTGuard, RolesGuard))
}
