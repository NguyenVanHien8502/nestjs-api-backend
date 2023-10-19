import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ExpressAdapter } from '@nestjs/platform-express'
import express from 'express'
import cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import cors from 'cors'

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
  // app.use(cors()) //cho phép mọi request từ bất kỳ origin nào
  app.use(
    cors({
      origin: 'http://localhost:3000',
    }),
  )
  await app.init()
  await app.listen(5000)
}
bootstrap()
