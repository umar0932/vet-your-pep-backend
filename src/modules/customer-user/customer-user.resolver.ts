import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'

import { Profile } from 'passport'

import { Allow, CurrentUser, JwtUserPayload, SocialProfile, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import {
  CreateCustomerInput,
  ListCustomersInputs,
  LoginCustomerInput,
  RegisterOrLoginSocialInput,
  UpdateCustomerInput
} from './dto/inputs'
import { Customer } from './entities/customer.entity'
import {
  CustomerEmailUpdateResponse,
  CustomerLoginOrRegisterResponse,
  ListCustomersResponse
} from './dto/args'
import { CustomerUserService } from './customer-user.service'
import { GqlAuthGuard, SocialAuthGuard } from './guards'

@Resolver(() => Customer)
export class CustomerUserResolver {
  constructor(private readonly customerUserService: CustomerUserService) {}

  @Mutation(() => CustomerLoginOrRegisterResponse, { description: 'Customer Login' })
  @UseGuards(GqlAuthGuard)
  async loginAsCustomer(
    @Args('input') loginCustomerInput: LoginCustomerInput,
    @CurrentUser() user: any
  ) {
    return await this.customerUserService.login(loginCustomerInput, user)
  }

  @UseGuards(SocialAuthGuard)
  @Mutation(() => CustomerLoginOrRegisterResponse, { description: 'Customer Social Registration' })
  async continueWithSocialSite(
    @SocialProfile() profile: Profile,
    @Args('input') input: RegisterOrLoginSocialInput
  ): Promise<CustomerLoginOrRegisterResponse> {
    return await this.customerUserService.continueWithSocialSite(profile, input.provider)
  }

  @Mutation(() => CustomerLoginOrRegisterResponse, {
    description: 'This will signup new Customers'
  })
  async createCustomer(
    @Args('input') createCustomerData: CreateCustomerInput
  ): Promise<CustomerLoginOrRegisterResponse> {
    return await this.customerUserService.createCustomer(createCustomerData)
  }

  @Query(() => ListCustomersResponse, {
    description: 'The List of Customers with Pagination and filters'
  })
  @Allow()
  async getCustomersAdmin(
    @Args('input') listCustomersInputs: ListCustomersInputs
  ): Promise<ListCustomersResponse> {
    const { limit, offset, filter } = listCustomersInputs
    const [customers, count] = await this.customerUserService.findAllCustomersWithPagination({
      limit,
      offset,
      filter
    })
    return { results: customers, totalRows: count }
  }

  @Query(() => Customer, { description: 'Get the Customer' })
  @Allow()
  async getCustomerData(@CurrentUser() user: JwtUserPayload): Promise<Customer> {
    return await this.customerUserService.getCustomerById(user.userId)
  }

  @Mutation(() => Customer, { description: 'This will update Customer' })
  @Allow()
  async updateCustomer(
    @Args('input') updateCustomerInput: UpdateCustomerInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<Partial<Customer>> {
    return await this.customerUserService.updateCustomerData(updateCustomerInput, user.userId)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will update Customer Password'
  })
  @Allow()
  async updateCustomerPassword(
    @CurrentUser() user: JwtUserPayload,
    @Args('password') password: string
  ): Promise<SuccessResponse> {
    return await this.customerUserService.updatePassword(password, user.userId)
  }

  @Mutation(() => CustomerEmailUpdateResponse, {
    description: 'Update customer email'
  })
  @Allow()
  async updateCustomerEmail(@CurrentUser() user: JwtUserPayload, @Args('input') email: string) {
    return this.customerUserService.updateCustomerEmail(user.userId, email)
  }

  @Query(() => S3SignedUrlResponse, {
    description: 'Get S3 bucket Signed Url'
  })
  @Allow()
  async getCustomerUploadUrl(): Promise<S3SignedUrlResponse> {
    return this.customerUserService.getCustomerUploadUrl()
  }

  @Mutation(() => String, {
    description: 'This will save/update user profile image in DB'
  })
  @Allow()
  async saveCustomerMediaUrl(
    @Args('fileName') fileName: string,
    @CurrentUser() user: JwtUserPayload
  ): Promise<any> {
    return this.customerUserService.saveMediaUrl(user.userId, fileName)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will a customer to moderator'
  })
  @Allow()
  async makeModerator(
    @CurrentUser() user: JwtUserPayload,
    @Args('input') moderatorId: string
  ): Promise<SuccessResponse> {
    return await this.customerUserService.makeModerator(moderatorId, user.userId)
  }
}
