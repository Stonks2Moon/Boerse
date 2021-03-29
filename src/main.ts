import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { css } from './SwaggerCSS';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Börsen API')
    .setDescription('Die offizielle API der Börse')
    .setVersion('1.0')
    .addBearerAuth({
      in: 'header',
      type: 'http',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter your given JWT token',
    })
    .build();

  const options: SwaggerCustomOptions = {
    customSiteTitle: 'Börsen API',
    customfavIcon:
      'https://timos.s3.eu-central-1.amazonaws.com/moonstonks/favicon.svg',
    customCss: css,
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, options);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
