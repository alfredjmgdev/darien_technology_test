import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthController } from '../controllers/auth.controller';
import { UserModule } from './user.module';
import { JwtConfigModule } from './jwt.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtConfigModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
