import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/user/registerUser.useCase';
import { LoginUserUseCase } from '../../application/use-cases/user/loginUser.useCase';
import { RegisterUserDto, LoginUserDto } from '../dtos/auth.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
  IApiResponse,
} from '../dtos/api-response.dto';
import { RegisterResponse } from '../../domain/interfaces/auth/registerResponse.interface';
import { LoginResponse } from '../../domain/interfaces/auth/loginResponse.interface';
@ApiTags('auth')
@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: ApiSuccessResponse<RegisterResponse>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: ApiErrorResponse,
  })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<IApiResponse<RegisterResponse>> {
    const { email, password, name } = registerUserDto;
    const response = await this.registerUserUseCase.execute(
      email,
      password,
      name,
    );
    return response;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: ApiSuccessResponse<LoginResponse>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ApiErrorResponse,
  })
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<IApiResponse<LoginResponse>> {
    const { email, password } = loginUserDto;
    const response = await this.loginUserUseCase.execute(email, password);
    return response;
  }
}
