import { ConfigService } from '@nestjs/config'
import { Injectable, Logger } from '@nestjs/common'

import * as nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

import { Configuration } from '@config/configuration.interface'

import { SendEmailInput } from './dto/inputs/send-email.input'
// import SMTPTransport from 'nodemailer/lib/smtp-transport'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private config
  private transporter: Mail

  constructor(private configService: ConfigService) {}

  // Private Methods

  // Public Methods

  mailTransport() {
    this.config = this.configService.get<Configuration['email']>('email')

    this.transporter = nodemailer.createTransport(this.config.transport)

    return this.transporter
  }

  async sendEmail(sendEmailInput: SendEmailInput) {
    const { from, recipients, subject, html } = sendEmailInput

    const transport = this.mailTransport()

    const options: Mail.Options = {
      from,
      to: recipients,
      subject,
      html
    }

    try {
      const result = await transport.sendMail(options)

      return result
    } catch (error) {}
  }
}
