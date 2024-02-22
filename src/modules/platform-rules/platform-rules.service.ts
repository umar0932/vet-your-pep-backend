import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Brackets, Repository } from 'typeorm'

import { AdminService } from '@app/admin'
import { CustomerUserService } from '@app/customer-user'
import { JwtUserPayload } from '@app/common'

import {
  CreatePlatFormRulesInput,
  ListPlatFormRulesInput,
  UpdatePlatFormRulesInput
} from './dto/inputs'
import { PlatFormRules } from './entities'

@Injectable()
export class PlatFormRulesService {
  constructor(
    private adminService: AdminService,
    private customerService: CustomerUserService,
    @InjectRepository(PlatFormRules)
    private platFormRulesRepository: Repository<PlatFormRules>
  ) {}

  // Private Methods

  // Public Methods

  async getPlatFormRuleByTitle(title: string): Promise<boolean> {
    const findPlatFormRuleByTitle = await this.platFormRulesRepository.count({ where: { title } })
    if (findPlatFormRuleByTitle > 0) return true
    return false
  }

  // Resolver Query Methods

  async getPlatFormRuleById(id: string): Promise<PlatFormRules> {
    const findPlatFormRules = await this.platFormRulesRepository.findOne({
      where: { id }
    })
    if (!findPlatFormRules)
      throw new NotFoundException('PlatForm rule with the provided ID does not exist')

    return findPlatFormRules
  }

  async getPlatFormRulesWithPagination({
    limit,
    offset,
    filter
  }: ListPlatFormRulesInput): Promise<[PlatFormRules[], number]> {
    const { title, search } = filter || {}

    try {
      const queryBuilder = this.platFormRulesRepository.createQueryBuilder('platform_rules')

      title && queryBuilder.andWhere('platform_rules.title = :title', { title })

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(platform_rules.title) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      queryBuilder.take(limit).skip(offset).leftJoinAndSelect('platform_rules.admin', 'admin')

      const [platFormRules, total] = await queryBuilder.getManyAndCount()

      return [platFormRules, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Channel')
    }
  }

  // Resolver Mutation Methods

  async createPlatFormRule(
    createPlatFormRulesInput: CreatePlatFormRulesInput,
    user: JwtUserPayload
  ): Promise<PlatFormRules> {
    const { userId, type } = user || {}
    await this.adminService.adminOnlyAccess(type)

    const { title, ...rest } = createPlatFormRulesInput

    const platFormRuleExists = await this.getPlatFormRuleByTitle(title)
    if (platFormRuleExists) throw new BadRequestException('Platform rule title already exists')

    const platFormRule = await this.platFormRulesRepository.save({
      title,
      ...rest,
      createdBy: userId
    })

    return platFormRule
  }

  async updatePlatFormRule(
    updateEventInput: UpdatePlatFormRulesInput,
    user: JwtUserPayload
  ): Promise<PlatFormRules> {
    const { userId, type } = user || {}
    await this.adminService.adminOnlyAccess(type)
    const { platFormRulesId, title, ...rest } = updateEventInput

    const platFormRule = await this.getPlatFormRuleById(platFormRulesId)

    const platFormRuleExists = await this.getPlatFormRuleByTitle(title)
    if (platFormRuleExists) throw new BadRequestException('Platform rule title already exists')

    try {
      await this.platFormRulesRepository.update(platFormRule.id, {
        ...rest,
        title,
        admin: { id: userId },
        updatedBy: userId,
        updatedDate: new Date()
      })

      return await this.getPlatFormRuleById(platFormRulesId)
    } catch (error) {
      throw new BadRequestException('Failed to update event')
    }
  }
}
