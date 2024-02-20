import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { ConfigModule } from '@nestjs/config'
import { GraphQLError, GraphQLFormattedError } from 'graphql'
import { GraphQLModule } from '@nestjs/graphql'
import { HttpStatus, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import * as dotenv from 'dotenv'
import { join } from 'path'

import { AdminModule } from '@app/admin'
import { AwsS3ClientModule } from '@app/aws-s3-client'
import { ChannelsModule } from '@app/channel'
import { ChatModule } from '@app/chat'
import { CommentModule } from '@app/comments'
import { CustomerUserModule } from '@app/customer-user'
import { EventModule } from '@app/events'
import { LikeModule } from '@app/like'
import { PaymentModule } from '@app/payment'
import { PlatFormRulesModule } from '@app/platform-rules'
import { PostModule } from '@app/post'

import { dataSourceOptions } from 'db/data-source'
import EnvConfig from './config/config'

dotenv.config()

const env = `${process.env.NODE_ENV}`

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${env}`, '.env'],
      load: [EnvConfig],
      isGlobal: true
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // playground: env !== 'prod',
      // introspection: env !== 'prod',
      sortSchema: true,
      formatError: (error: GraphQLError | any) => {
        const graphQLFormattedError: GraphQLFormattedError & {
          statusCode: HttpStatus
        } = {
          statusCode:
            error?.extensions?.originalError?.statusCode ||
            error?.extensions?.code ||
            HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            error?.extensions?.originalError?.message || error?.message || 'Something went wrong'
        }
        return graphQLFormattedError
      }
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AdminModule,
    CustomerUserModule,
    AwsS3ClientModule,
    ChannelsModule,
    ChatModule,
    CommentModule,
    LikeModule,
    PaymentModule,
    PostModule,
    EventModule,
    PlatFormRulesModule
  ]
})
export class AppModule {}
