import { Controller, Post } from '@nestjs/common'

import { MailService } from './mail.service'
import { SendEmailInput } from './dto/inputs/send-email.input'

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('/send-mail')
  async sendMail() {
    const sendEmailInput: SendEmailInput = {
      from: { name: 'umer', address: 'support@vetyourpep.com' },
      recipients: [{ name: 'Umer khalid', address: 'umar.khalid@chirptech.net' }],
      subject: 'Testing email',
      html: '<p><strong>Umer khalid </strong> Welcome to Vet your pep </p>'
    }
    return await this.mailService.sendEmail(sendEmailInput)
  }
}
