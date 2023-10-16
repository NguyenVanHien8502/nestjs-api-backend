import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ExpressAdapter } from '@nestjs/platform-express'
import express from 'express'
import cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const expressApp = express()
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  )
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  await app.init()
  await app.listen(3000)
}
bootstrap()
