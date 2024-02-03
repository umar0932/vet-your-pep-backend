import { BadRequestException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import * as _ from 'lodash'
import { InjectStripeClient } from '@golevelup/nestjs-stripe'
import Stripe from 'stripe'

import { CustomerUserService } from '@app/customer-user'
import { SuccessResponse } from '@app/common'

import { CreateChargeInput } from './dto/input'

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => CustomerUserService))
    private customerService: CustomerUserService,
    @InjectStripeClient() private stripe: Stripe
  ) {}

  // Private Methods

  // Public Methods

  async createStripeCustomer(name: string, email: string) {
    try {
      return await this.stripe.customers.create({
        name,
        email
      })
    } catch (err) {
      throw new BadRequestException('User not registered on Stripe')
    }
  }

  // Controller Methods

  async createSubscriptionSession(
    user: any, // we haven't a userDto, it's to keep it simple
    priceId: string // change it to your dto with validations
  ): Promise<Stripe.Response<Stripe.Checkout.Session> | undefined> {
    try {
      return this.stripe.checkout.sessions.create({
        success_url: 'https://example.com/',
        customer: user.customerId, // it should not work
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription'
      })
    } catch (error) {
      console.error('Error from stripe:', error)
    }
  }

  async getPortal(customerId: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId
    })
  }

  // Resolver Query Methods

  // Resolver Mutation Methods

  async charge(chargeInput: CreateChargeInput): Promise<SuccessResponse> {
    try {
      const customer = await this.customerService.getCustomerById(chargeInput.customerId)

      const stripeStripeCurrency = this.configService.get<string>('stripe.currency')

      if (stripeStripeCurrency === undefined)
        throw new Error('Stripe currency is missing in the configuration')

      await this.stripe.paymentIntents.create({
        amount: _.round(chargeInput.amount * 100, 2),
        customer: customer.stripeCustomerId,
        payment_method: chargeInput.paymentMethodId,
        currency: stripeStripeCurrency,
        confirm: true,
        off_session: true
      })

      return { success: true, message: 'Charge and Order Created' }
    } catch (err) {
      this.logger.error(err?.message, err, 'PaymentService')
      throw new BadRequestException("Something went wrong while charging the customer's card.")
    }
  }
}
