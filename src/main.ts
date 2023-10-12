import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ExpressAdapter } from '@nestjs/platform-express'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const expressApp = express()
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  )
  app.use(cookieParser())
  await app.init()
  await app.listen(3000)
}
bootstrap()
