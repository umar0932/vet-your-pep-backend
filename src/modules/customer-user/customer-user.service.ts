import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'

import { EntityManager, FindOptionsWhere, Repository } from 'typeorm'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Profile } from 'passport'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { validate as uuidValidate } from 'uuid'
import { uuid } from 'uuidv4'

import { AdminService } from '@app/admin'
import { AwsS3ClientService } from '@app/aws-s3-client'
import {
  JWT_STRATEGY_NAME,
  JwtDto,
  SocialProviderTypes,
  SuccessResponse,
  comparePassword,
  encodePassword,
  isValidPassword
} from '@app/common'
import { PaymentService } from '@app/payment'
import { SocialProvider } from '@app/common/entities'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { CreateCustomerInput, ListCustomersInputs, LoginCustomerInput } from './dto/inputs'
import { Customer } from './entities/customer.entity'
import {
  CustomerEmailUpdateResponse,
  CustomerLoginOrRegisterResponse,
  CustomerWithoutPasswordResponse
} from './dto/args'
import { UserRole } from './customer-user.constants'

@Injectable()
export class CustomerUserService {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectEntityManager() private readonly manager: EntityManager,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
    private jwtService: JwtService,
    private s3Service: AwsS3ClientService,
    @InjectRepository(SocialProvider)
    private socialProviderRepository: Repository<SocialProvider>
  ) {}

  private async handleCustomerLogin(
    customer: Partial<Customer>
  ): Promise<CustomerLoginOrRegisterResponse> {
    if (customer.id && customer.email) {
      const payload: JwtDto = {
        email: customer.email,
        sub: customer.id,
        type: JWT_STRATEGY_NAME.CUSTOMER
      }

      return {
        accessToken: await this.getJwtToken(payload),
        user: customer
      }
    } else {
      throw new BadRequestException('Token failed to create')
    }
  }

  private async checkEmailExist(email: string): Promise<boolean> {
    if (!email) throw new BadRequestException('Customer Email is invalid')
    const checkCustomerEmail = await this.customerRepository.count({
      where: { email }
    })
    if (checkCustomerEmail > 1) return true

    return false
  }

  async validateCustomer(email: string, password: string): Promise<any> {
    const user = await this.getCustomerByEmail(email)
    const isValidPwd = await this.validatePassword(password, user?.password)
    if (isValidPwd) return user
    throw new BadRequestException('Invalid email or password')
  }

  async validatePassword(pwd: string, dbPwd: string): Promise<boolean> {
    // await this.isValidPwd(pwd)
    const isValidPwd = pwd && (await comparePassword(pwd, dbPwd))

    if (!isValidPwd) return false
    return true
  }

  async isValidPwd(pwd: string): Promise<boolean> {
    const checkPwd = isValidPassword(pwd)

    if (!checkPwd) throw new BadRequestException('Invalid email or password')
    return true
  }

  async getCustomerById(id: string): Promise<Customer> {
    if (!id) throw new BadRequestException('Customer Id is invalid')
    const findCustomerById = await this.customerRepository.findOne({
      where: { id, isActive: true }
    })
    if (!findCustomerById)
      throw new BadRequestException('Customer with the provided ID does not exist')

    return findCustomerById
  }

  async getModeratorById(id: string): Promise<Customer> {
    if (!id) throw new BadRequestException('Moderator Id is invalid')
    const findModeratorById = await this.customerRepository.findOne({
      where: { id, role: UserRole.MODERATOR, isActive: true }
    })
    if (!findModeratorById)
      throw new BadRequestException('Moderator with the provided ID does not exist')

    return findModeratorById
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    if (!email) throw new BadRequestException('Customer Email is invalid')
    const findCustomerByEmail = await this.customerRepository.findOne({
      where: { email, isActive: true }
    })
    if (!findCustomerByEmail)
      throw new NotFoundException('Customer with the provided email does not exist')

    return findCustomerByEmail
  }

  async findOneBySocialId(socialId: string): Promise<SocialProvider> {
    const findsocialProviderById = await this.socialProviderRepository.findOne({
      where: { socialId }
    })
    if (!findsocialProviderById)
      throw new BadRequestException('Social Provider with the provided ID does not exist')

    return findsocialProviderById
  }

  async existsBySocialId(socialId: string, provider: SocialProviderTypes): Promise<number> {
    const count = await this.socialProviderRepository.count({ where: { socialId, provider } })

    return count
  }

  async saveProviderAndCustomer(customer: Partial<Customer>, provider: Partial<SocialProvider>) {
    return this.manager.transaction(async transactionalManager => {
      const createdCustomer = transactionalManager.create(Customer, customer)
      const savedCustomer = await transactionalManager.save(createdCustomer)
      await transactionalManager.save(SocialProvider, {
        customer: savedCustomer,
        ...provider
      })
      return savedCustomer
    })
  }

  async login(
    loginCustomerInput: LoginCustomerInput,
    user: any
  ): Promise<CustomerLoginOrRegisterResponse> {
    const payload = {
      email: loginCustomerInput?.email,
      sub: user?.id,
      type: JWT_STRATEGY_NAME.CUSTOMER
    }
    return {
      accessToken: await this.getJwtToken(payload),
      user: user
    }
  }

  async createCustomer(data: CreateCustomerInput): Promise<CustomerLoginOrRegisterResponse> {
    const { email, firstName, lastName } = data
    const name = firstName.concat(' ').concat(lastName)

    const stripeCustomer = await this.paymentService.createStripeCustomer(name, email)

    const user = await this.customerRepository.findOne({ where: { email } })
    if (user) throw new BadRequestException('Email already exists')

    const password = await encodePassword(data.password)

    const currentUser = await this.customerRepository.save({
      ...data,
      password,
      stripeCustomerId: stripeCustomer.id
    })

    if (!currentUser) throw new BadRequestException('User not registered')

    return this.handleCustomerLogin(currentUser)
  }

  async continueWithSocialSite(
    profile: Profile,
    provider: SocialProviderTypes
  ): Promise<CustomerLoginOrRegisterResponse> {
    const email = profile.emails![0].value
    const firstName = profile.name?.givenName
    const lastName = profile.name?.familyName
    const socialId = profile.id

    const socialLoginById = await this.existsBySocialId(socialId, provider)

    if (socialLoginById) {
      const customer = await this.getCustomerByEmail(email)
      return this.handleCustomerLogin(customer)
    }

    const checkCustomerEmail = await this.checkEmailExist(email)
    if (checkCustomerEmail)
      throw new BadRequestException('User is already registered with other account')

    try {
      const randomPassword = await randomStringGenerator()
      const pwd = await encodePassword(randomPassword)
      const customer: Partial<Customer> = await this.saveProviderAndCustomer(
        { email, firstName, lastName, password: pwd },
        { provider, socialId }
      )

      return this.handleCustomerLogin(customer)
    } catch (err) {
      throw new BadRequestException('User addition transaction failed')
    }
  }

  getJwtToken = async ({ sub, email, type }: JwtDto) => {
    const payload: JwtDto = { email, sub, type }
    return this.jwtService.sign(payload)
  }

  async findAllCustomersWithPagination({
    limit,
    offset,
    filter
  }: ListCustomersInputs): Promise<[Customer[], number]> {
    const { email, id, firstName, lastName, cellPhone } = filter || {}

    const query: FindOptionsWhere<Customer> | FindOptionsWhere<Customer>[] = {
      ...(email ? { email } : {}),
      ...(id && uuidValidate(id) ? { id } : {}),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(cellPhone ? { cellPhone } : {})
    }

    const [customers, total] = await this.customerRepository.findAndCount({
      where: query,
      take: limit,
      skip: offset * limit
    })

    return [customers, total]
  }

  async getAllCustomers(userId: string): Promise<Partial<CustomerWithoutPasswordResponse[]>> {
    const isAdmin = await this.adminService.getAdminById(userId)

    if (!isAdmin) throw new ForbiddenException('Only admin can access this data.')

    const customersData: Partial<Customer>[] = await this.customerRepository.find()

    const customersWithoutPasswords: Partial<CustomerWithoutPasswordResponse>[] = customersData.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password, ...rest }) => rest
    )
    return customersWithoutPasswords
  }

  async updateCustomerData(
    customerInput: Partial<Customer>,
    customerId: string
  ): Promise<Partial<Customer>> {
    const customerData = await this.getCustomerById(customerId)

    try {
      await this.customerRepository.update(customerData.id, {
        ...customerInput,
        updatedDate: new Date()
      })
    } catch (e) {
      throw new BadRequestException('Failed to update data')
    }

    const updatedCustomerData = await this.getCustomerById(customerId)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = updatedCustomerData

    return rest
  }

  async makeModerator(moderatorId: string, adminId: string): Promise<SuccessResponse> {
    await this.adminService.getAdminById(adminId)

    const moderator = await this.getCustomerById(moderatorId)

    try {
      await this.customerRepository.update(moderator.id, {
        role: UserRole.MODERATOR,
        updatedBy: adminId,
        updatedDate: new Date()
      })
    } catch (e) {
      throw new BadRequestException('Failed to update user role')
    }
    return { success: true, message: 'User role has been updated to moderator' }
  }

  async updatePassword(password: string, customerId: string): Promise<SuccessResponse> {
    const customerData = await this.getCustomerById(customerId)
    if (!customerData) throw new BadRequestException('Customer with the provided ID does not exist')

    // const checkPwd = await isValidPassword(password)
    // if (!checkPwd) {
    //   throw new BadRequestException('Invalid username or password')
    // }

    try {
      const pwd = await encodePassword(password)

      await this.customerRepository.update(customerData.id, {
        password: pwd,
        updatedBy: customerId,
        updatedDate: new Date()
      })
    } catch (e) {
      throw new BadRequestException('Failed to update customer data')
    }
    return { success: true, message: 'Password of customer has been updated' }
  }

  async updateCustomerEmail(userId: string, email: string): Promise<CustomerEmailUpdateResponse> {
    try {
      const customerData: Partial<Customer> = await this.getCustomerByEmail(email)
      if (customerData.id) {
        await this.customerRepository.update(customerData.id, {
          email,
          updatedDate: new Date()
        })
      }

      const updatedCustomerData: Partial<Customer> = await this.getCustomerById(userId)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = updatedCustomerData
      if (updatedCustomerData.id && updatedCustomerData.email) {
        const payload: JwtDto = {
          email: updatedCustomerData.email,
          sub: updatedCustomerData.id,
          type: JWT_STRATEGY_NAME.ADMIN
        }

        return {
          accessToken: await this.getJwtToken(payload),
          user: rest
        }
      } else throw new BadRequestException("Couldn't update email")
    } catch (err) {
      throw new BadRequestException("Couldn't update email")
    }
  }

  async updateStripeId(stripeCustomerId: string, customerId: string): Promise<Customer> {
    const customerData = await this.getCustomerById(customerId)
    try {
      await this.customerRepository.update(customerData.id, {
        stripeCustomerId,
        updatedDate: new Date()
      })
    } catch (e) {
      throw new BadRequestException('Failed to update data')
    }
    return customerData
  }

  async getCustomerUploadUrl(): Promise<S3SignedUrlResponse> {
    const key = `user_profile_image_uploads/${uuid()}-user-profile`
    const bucketName = this.configService.get('USER_UPLOADS_BUCKET')

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key
    })
    const url = await getSignedUrl(this.s3Service.getClient(), command, {
      expiresIn: 3600
    })
    return {
      signedUrl: url,
      fileName: key
    }
  }

  async saveMediaUrl(userId: string, fileName: string): Promise<boolean> {
    const updateMediaUrl = await this.updateCustomerData(
      {
        mediaUrl: fileName
      },
      userId
    )
    const isUpdatedMedia = updateMediaUrl?.id ? true : false
    if (isUpdatedMedia) return true
    return false
  }
}
