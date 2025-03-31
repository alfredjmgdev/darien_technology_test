import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { UserRepositoryPort } from '../../../domain/repositories/user.repository.port';
import * as bcrypt from 'bcrypt';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    email: string,
    password: string,
    name: string,
  ): Promise<IApiResponse<{ id: number }>> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'User already exists',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: { id: user.id },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error registering user',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
