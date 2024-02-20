import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AdminModule } from '@app/admin'
import { CustomerUserModule } from '@app/customer-user'

import { PlatFormRules } from './entities'
import { PlatFormRulesResolver } from './platform-rules.resolver'
import { PlatFormRulesService } from './platform-rules.service'

@Module({
  imports: [TypeOrmModule.forFeature([PlatFormRules]), AdminModule, CustomerUserModule],
  providers: [PlatFormRulesResolver, PlatFormRulesService],
  exports: [PlatFormRulesService]
})
export class PlatFormRulesModule {}
