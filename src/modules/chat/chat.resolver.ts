import { Query, Resolver } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload } from '@app/common'

import { ChatService } from './chat.service'

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => String, {
    description: 'Get Session Token for Chat SDK'
  })
  @Allow()
  async getChatToken(@CurrentUser() user: JwtUserPayload): Promise<string> {
    console.log('getChatToken,', user)
    return await this.chatService.getSessionToken(user?.userId)
  }
}
