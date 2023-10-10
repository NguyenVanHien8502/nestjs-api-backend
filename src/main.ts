import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ExpressAdapter } from '@nestjs/platform-express'
import * as express from 'express'

async function bootstrap() {
  const expressApp = express()
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  )
  await app.init()
  await app.listen(3000)
}
bootstrap()
