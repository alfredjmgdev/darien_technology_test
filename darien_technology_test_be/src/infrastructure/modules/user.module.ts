import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { RegisterUserUseCase } from '../../application/use-cases/user/registerUser.useCase';
import { LoginUserUseCase } from '../../application/use-cases/user/loginUser.useCase';
import { JwtConfigModule } from './jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtConfigModule],
  providers: [
    {
      provide: 'UserRepositoryPort',
      useClass: UserRepository,
    },
    RegisterUserUseCase,
    LoginUserUseCase,
  ],
  exports: ['UserRepositoryPort', RegisterUserUseCase, LoginUserUseCase],
})
export class UserModule {}
