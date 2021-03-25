import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  if (!process.env.LOCALHOST) {
    app.setGlobalPrefix('api');
  }

  const config = new DocumentBuilder()
    .setTitle('Börsen API')
    .setDescription('Die offizielle API der Börse')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
