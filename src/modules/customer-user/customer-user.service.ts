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

import { Brackets, EntityManager, Repository } from 'typeorm'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Profile } from 'passport'
import { PutObjectCommand } from '@aws-sdk/client-s3'
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
import { Customer, CustomerFollower } from './entities'
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
    @InjectRepository(CustomerFollower)
    private customerFollowerRepository: Repository<CustomerFollower>,
    @InjectEntityManager() private readonly manager: EntityManager,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
    private jwtService: JwtService,
    private s3Service: AwsS3ClientService,
    @InjectRepository(SocialProvider)
    private socialProviderRepository: Repository<SocialProvider>
  ) {}

  // Private Methods

  private async checkEmailExist(email: string): Promise<boolean> {
    if (!email) throw new BadRequestException('Customer Email is invalid')
    const checkCustomerEmail = await this.customerRepository.count({
      where: { email }
    })
    if (checkCustomerEmail > 1) return true

    return false
  }

  private async handleCustomerLogin(
    customer: Partial<Customer>
  ): Promise<CustomerLoginOrRegisterResponse> {
    if (customer.id && customer.email && customer.firstName && customer.lastName) {
      const payload: JwtDto = {
        email: customer.email,
        sub: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        profileImage: customer.profileImage,
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

  private async updateFollowerCounts(
    followerId: string,
    following: Customer,
    method: string
  ): Promise<void> {
    return this.manager.transaction(async transactionalManager => {
      const follower = await this.getCustomerById(followerId)
      try {
        const { totalFollowers } = following
        const { totalFollowings } = follower

        if (method === 'follow') {
          await transactionalManager.update(Customer, follower.id, {
            totalFollowers: Number(totalFollowers || 0) + 1
          })
          await transactionalManager.update(Customer, following.id, {
            totalFollowings: Number(totalFollowings || 0) + 1
          })
        } else if (method === 'unfollow') {
          await transactionalManager.update(Customer, follower.id, {
            totalFollowers: Math.max(Number(totalFollowers || 0) - 1, 0)
          })
          await transactionalManager.update(Customer, following.id, {
            totalFollowings: Math.max(Number(totalFollowings || 0) - 1, 0)
          })
        } else throw new BadRequestException('Invalid method.')
      } catch (error) {
        throw new BadRequestException('Error updating follower counts.')
      }
    })
  }

  // Public Methods

  async existsBySocialId(socialId: string, provider: SocialProviderTypes): Promise<number> {
    const count = await this.socialProviderRepository.count({ where: { socialId, provider } })

    return count
  }

  async findOneBySocialId(socialId: string): Promise<SocialProvider> {
    const findsocialProviderById = await this.socialProviderRepository.findOne({
      where: { socialId }
    })
    if (!findsocialProviderById)
      throw new BadRequestException('Social Provider with the provided ID does not exist')

    return findsocialProviderById
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

  async getCustomerByEmail(email: string): Promise<Customer> {
    if (!email) throw new BadRequestException('Customer Email is invalid')
    const findCustomerByEmail = await this.customerRepository.findOne({
      where: { email, isActive: true }
    })
    if (!findCustomerByEmail)
      throw new NotFoundException('Customer with the provided email does not exist')

    return findCustomerByEmail
  }

  getJwtToken = async ({ sub, email, firstName, lastName, profileImage, type }: JwtDto) => {
    const payload: JwtDto = { sub, email, firstName, lastName, profileImage, type }
    return this.jwtService.sign(payload)
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

  async isValidPwd(pwd: string): Promise<boolean> {
    const checkPwd = isValidPassword(pwd)

    if (!checkPwd) throw new BadRequestException('Invalid email or password')
    return true
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

  // Resolver Query Methods

  async findAllCustomersWithPagination({
    limit,
    offset,
    filter
  }: ListCustomersInputs): Promise<[Customer[], number]> {
    const { email, search } = filter || {}

    try {
      const queryBuilder = await this.customerRepository.createQueryBuilder('customer_user')

      email && queryBuilder.andWhere('customer_user.email = :email', { email })

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(customer_user.firstName) LIKE LOWER(:search)', {
              search: `%${search}%`
            })
              .orWhere('LOWER(customer_user.lastName) LIKE LOWER(:search)', {
                search: `%${search}%`
              })
              .orWhere('LOWER(customer_user.email) LIKE LOWER(:search)', {
                search: `%${search}%`
              })
          })
        )
      }

      const [customers, total] = await queryBuilder
        .leftJoinAndSelect('customer_user.followers', 'followers')
        .leftJoinAndSelect('customer_user.following', 'following')
        .take(limit)
        .skip(offset)
        .getManyAndCount()

      return [customers, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Users')
    }
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

  async getFollowers(customerId: string): Promise<Customer[]> {
    const followers = await this.customerFollowerRepository.find({
      where: { following: { id: customerId } },
      relations: ['followers']
    })
    return followers.map(follower => follower.followers)
  }

  async getFollowing(customerId: string): Promise<Customer[]> {
    const following = await this.customerFollowerRepository.find({
      where: { followers: { id: customerId } },
      relations: ['following']
    })
    return following.map(followTo => followTo.following)
  }

  async searchCustomers(search: string): Promise<[Customer[], number]> {
    try {
      const queryBuilder = await this.customerRepository.createQueryBuilder('customer_user')

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(customer_user.email) LIKE LOWER(:search)', {
              search: `%${search}%`
            })
          })
        )
      }

      const [customers, total] = await queryBuilder.getManyAndCount()

      return [customers, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Users')
    }
  }

  // Resolver Mutation Methods

  async loginCustomer(
    loginCustomerInput: LoginCustomerInput,
    user: any
  ): Promise<CustomerLoginOrRegisterResponse> {
    const payload = {
      email: loginCustomerInput?.email,
      sub: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profileImage: user?.profileImage,
      type: JWT_STRATEGY_NAME.CUSTOMER
    }
    return {
      accessToken: await this.getJwtToken(payload),
      user: user
    }
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
      isActive: true,
      stripeCustomerId: stripeCustomer.id
    })

    if (!currentUser) throw new BadRequestException('User not registered')

    return this.handleCustomerLogin(currentUser)
  }

  async followCustomer(followerId: string, followingId: string): Promise<SuccessResponse> {
    const following = await this.getCustomerById(followingId)

    const follower = await this.customerFollowerRepository.findOne({
      where: {
        followers: { id: followerId },
        following: { id: followingId }
      }
    })

    if (follower) throw new BadRequestException('Already following.')

    await this.customerFollowerRepository.save({
      followers: { id: followerId },
      following: following
    })

    await this.updateFollowerCounts(followerId, following, 'follow')

    return { success: true, message: 'Following successfully' }
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

  async saveMediaUrl(userId: string, fileName: string): Promise<boolean> {
    const updateMediaUrl = await this.updateCustomerData(
      {
        profileImage: fileName
      },
      userId
    )
    const isUpdatedMedia = updateMediaUrl?.id ? true : false
    if (isUpdatedMedia) return true
    return false
  }

  async unfollowCustomer(followerId: string, followingId: string): Promise<SuccessResponse> {
    const following = await this.getCustomerById(followingId)

    const follower = await this.customerFollowerRepository.findOne({
      where: {
        followers: { id: followerId },
        following: { id: followingId }
      }
    })

    if (!follower) throw new NotFoundException('Not following.')

    await this.customerFollowerRepository.remove(follower)

    // Update counts
    await this.updateFollowerCounts(followerId, following, 'unfollow')
    return { success: true, message: 'Unfollowed successfully' }
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
      if (
        updatedCustomerData.id &&
        updatedCustomerData.email &&
        updatedCustomerData.firstName &&
        updatedCustomerData.lastName
      ) {
        const payload: JwtDto = {
          email: updatedCustomerData.email,
          sub: updatedCustomerData.id,
          firstName: updatedCustomerData.firstName,
          lastName: updatedCustomerData.lastName,
          profileImage: updatedCustomerData.profileImage,
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

  async updatePassword(password: string, customerId: string): Promise<SuccessResponse> {
    const customerData = await this.getCustomerById(customerId)

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
}
