import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('auth.jwtSecret'),
          signOptions: { expiresIn: configService.get('auth.jwtExpiresIn') },
        };
      },
    }),
  ],
  exports: [JwtModule],
})
export class CustomJwtModule {}
