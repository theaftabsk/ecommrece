import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enables rawBody property on request for payment signature validation
  });
  
  // Enable CORS to allow multi-tenant dynamic origins (localhost:3000, localhost:3001, and custom domains)
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`OakSol Commerce backend running on port: ${port}`);
}
bootstrap();
