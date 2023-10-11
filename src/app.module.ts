/* eslint-disable prettier/prettier */
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from './user/user.module'
import { UserController } from './user/user.controller'
import { UserGuard } from './user/user.guard'

@Module({
  imports: [UserModule, MongooseModule.forRoot(process.env.MONGO_URL)],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserGuard)
      .exclude(
        { path: 'api/user/register', method: RequestMethod.POST },
        { path: 'api/user/login', method: RequestMethod.POST },
      )
      .forRoutes(UserController)
  }
}
