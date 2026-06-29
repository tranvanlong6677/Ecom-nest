import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { JwtService } from './services/jwt.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthGuard } from './guards/auth.guard';

const sharedServices = [PrismaService, HashingService, JwtService];
const sharedGuards = [AccessTokenGuard, ApiKeyGuard, AuthGuard];

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN ??
          '1h') as unknown as number,
      },
    }),
  ],
  providers: [...sharedServices, ...sharedGuards],
  exports: [...sharedServices, ...sharedGuards, JwtModule],
})
export class SharedModule {}
