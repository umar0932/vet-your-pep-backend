import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload } from '@app/common'

import {
  CreatePlatFormRulesInput,
  ListPlatFormRulesInput,
  UpdatePlatFormRulesInput
} from './dto/inputs'
import { PlatFormRules } from './entities'
import { PlatFormRulesService } from './platform-rules.service'
import { ListPlatFormRulesResponse } from './dto/args'

@Resolver(() => PlatFormRules)
export class PlatFormRulesResolver {
  constructor(private readonly platFormRulesService: PlatFormRulesService) {}

  // Queries

  @Query(() => ListPlatFormRulesResponse, {
    description: 'The List of PlatForm rules Pagination and filters'
  })
  @Allow()
  async getPlatFormRules(
    @Args('input') args: ListPlatFormRulesInput
  ): Promise<ListPlatFormRulesResponse> {
    const { limit, offset, filter } = args
    const [channels, count] = await this.platFormRulesService.getPlatFormRulesWithPagination({
      limit,
      offset,
      filter
    })
    return { results: channels, totalRows: count, limit, offset }
  }

  // Mutations

  @Mutation(() => PlatFormRules, { description: 'Create new plate form rules' })
  @Allow()
  async createPlatFormRule(
    @Args('input') createPlatFormRulesInput: CreatePlatFormRulesInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<PlatFormRules> {
    return this.platFormRulesService.createPlatFormRule(createPlatFormRulesInput, user)
  }

  @Mutation(() => PlatFormRules, {
    description: 'This will update Event'
  })
  @Allow()
  async updatePlatFormRule(
    @Args('input') updatePlatFormRulesInput: UpdatePlatFormRulesInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<PlatFormRules> {
    return await this.platFormRulesService.updatePlatFormRule(updatePlatFormRulesInput, user)
  }
}
