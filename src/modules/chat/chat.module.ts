import { ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { Module, forwardRef } from '@nestjs/common'

import { CustomerUserModule } from '@app/customer-user'

import { ChatResolver } from './chat.resolver'
import { ChatService } from './chat.service'

@Module({
  imports: [HttpModule, forwardRef(() => CustomerUserModule)],
  providers: [ChatService, ChatResolver, ConfigService],
  exports: [ChatService]
})
export class ChatModule {}
