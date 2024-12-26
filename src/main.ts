import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  const config = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors();
  const port = config.get<number>('api.port');
  const nodeEnv = config.get<string>('api.nodeEnv');

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Custom RBAC demo')
      .setDescription('Custom RBAC demo')
      .setVersion('0.1')
      .addBearerAuth(undefined, 'defaultBearerAuth')
      .addBearerAuth(undefined, 'refreshBearerAuth')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const theme = new SwaggerTheme();
    const options = {
      explorer: true,
      customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
    };

    SwaggerModule.setup('api', app, document, options);
  }

  await app.listen(port, () => {
    logger.log(`Server listening at port ${port}`);
    logger.log(`Running in mode: ${nodeEnv}`);
  });
}

bootstrap();
