import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { UserRepositoryPort } from '../../../domain/repositories/user.repository.port';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IApiResponse } from '../../../infrastructure/dtos/api-response.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<IApiResponse<{ access_token: string }>> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = { sub: user.id, email: user.email };
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          access_token: this.jwtService.sign(payload),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error during login',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
