import { BadRequestException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'

import { AxiosError } from 'axios'
import { firstValueFrom } from 'rxjs'

import { CustomerUserService } from '@app/customer-user'

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => CustomerUserService))
    private customerService: CustomerUserService,
    private httpService: HttpService
  ) {}

  private async createChatUser(userId: string): Promise<boolean> {
    const customer = await this.customerService.getCustomerById(userId)
    const payload = {
      user_id: userId,
      nickname: customer?.firstName,
      profile_url: customer?.profileImage ?? ''
    }
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.configService.get('chat_api.url')}/v3/users`,
          {
            ...payload
          },
          {
            headers: {
              'Api-Token': this.configService.get('chat_api.token')
            }
          }
        )
      )
        .then(res => res.data)
        .catch(this.handleError(null))
      return true
    } catch (e) {
      return false
    }
  }

  private async getTokenApi1(userId: string): Promise<any> {
    const tokenAPI = `${this.configService.get('chat_api.url')}/v3/users/${userId}/token`
    this.logger.log(tokenAPI)
    return await firstValueFrom(
      this.httpService.post(
        tokenAPI,
        {},
        {
          headers: {
            'Api-Token': this.configService.get('chat_api.token'),
            'Content-Type': 'application/json; charset=utf8'
          }
        }
      )
    )
      .then(res => res.data)
      .catch(this.handleError(null))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleError<T>(result?: T) {
    return (error: AxiosError<any>): T => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        // console.log("Error", error.message);
      }
      //   console.log(error.config);
      console.log('finally==> ', error?.response?.data)
      return error?.response?.data || error
    }
  }

  async getSessionToken(userId: string): Promise<string> {
    this.logger.debug('getSessionToken', userId)
    let data = await this.getTokenApi1(userId)
    this.logger.debug('data from api', data)
    // create a user
    if (data?.error) {
      if (data?.code === 400201) {
        const status = await this.createChatUser(userId)
        this.logger.log('create User status', status)
        if (status) {
          data = await this.getTokenApi1(userId)
        }
      } else {
        throw new BadRequestException('This feature is not available at the moment')
      }
    }
    return data?.token
  }
}
