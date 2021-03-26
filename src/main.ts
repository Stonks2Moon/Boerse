import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { css } from './SwaggerCSS';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('Börsen API')
    .setDescription('Die offizielle API der Börse')
    .setVersion('1.0')
    .build();

  const options: SwaggerCustomOptions = {
    customSiteTitle: 'Börsen API',
    customfavIcon:
      'https://timos.s3.eu-central-1.amazonaws.com/moonstonks/favicon.svg',
    customCss: css,
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, options);

  await app.listen(3000);
}
bootstrap();
