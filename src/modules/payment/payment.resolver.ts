import { Resolver, Mutation, Args } from '@nestjs/graphql'

import { Allow, SuccessResponse } from '@app/common'

import { PaymentService } from './payment.service'
import { CreateChargeInput } from './dto/input'

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => SuccessResponse, { description: 'This will charge the Customer on test stripe' })
  @Allow()
  async testCharge(@Args('chargeInput') chargeInput: CreateChargeInput): Promise<SuccessResponse> {
    return await this.paymentService.charge(chargeInput)
  }
}
