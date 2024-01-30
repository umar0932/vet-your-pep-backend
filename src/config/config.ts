export default () => ({
  port: parseInt(process.env.PORT || '5000', 10),
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
  }
})
