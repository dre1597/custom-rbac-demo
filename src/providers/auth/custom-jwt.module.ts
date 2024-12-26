import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

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
