const int = (val: string | undefined, num: number): number =>
  val ? (isNaN(parseInt(val)) ? num : parseInt(val)) : num
const bool = (val: string | undefined, bool: boolean): boolean =>
  val == null ? bool : val == 'true'

export default () => ({
  port: int(process.env.PORT || '5000', 10),
  database: {
    host: process.env.DB_HOST,
    url: process.env.DATABASE_URL
  },
  jwt: {
    customer: {
      secret: process.env.JWT_KEY_CUSTOMER,
      signOptions: { expiresIn: process.env.JWT_KEY_CUSTOMER_EXPIRY }
    },
    admin: {
      secret: process.env.JWT_KEY_ADMIN,
      signOptions: { expiresIn: process.env.JWT_KEY_ADMIN_EXPIRY }
    }
  },
  stripeConfig: {
    apiKey: process.env.STRIPE_SECRET_KEY,
    webhookConfig: {
      requestBodyProperty: 'rawBody',
      stripeSecrets: {
        account: process.env.STRIPE_WEBHOOK_SECRET
      }
    }
  },
  stripe: {
    publish: process.env.STRIPE_PUBLISH_KEY,
    currency: process.env.STRIPE_CURRENCY
  },
  chat_api: {
    url: process.env.CHAT_API_URL,
    token: process.env.CHAT_API_TOKEN
  },
  email: {
    name: process.env.EMAIL_NAME ?? 'Vet Your Pep',
    from: process.env.EMAIL_FROM ?? '',
    retries: int(process.env.EMAIL_FAIL_RETRIES, 3),
    transport: {
      host: process.env.EMAIL_HOST ?? '',
      port: int(process.env.EMAIL_PORT, 587),
      secure: bool(process.env.EMAIL_SECURE, false),
      auth: {
        user: process.env.EMAIL_USER ?? process.env.EMAIL_FROM ?? '',
        pass: process.env.EMAIL_PASSWORD ?? ''
      }
    }
  }
})
