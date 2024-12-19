import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

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
