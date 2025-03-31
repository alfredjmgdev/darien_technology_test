import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';

// Define the JWT payload interface
interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Type guard function
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {
    // Get the config value
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const jwtSecretValue = configService.get('JWT_SECRET');

    // Validate the type
    if (!isString(jwtSecretValue) || jwtSecretValue.length === 0) {
      throw new UnauthorizedException(
        'JWT_SECRET is not defined or invalid in environment variables',
      );
    }

    // Now TypeScript knows jwtSecretValue is a string
    const jwtSecret: string = jwtSecretValue;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}
