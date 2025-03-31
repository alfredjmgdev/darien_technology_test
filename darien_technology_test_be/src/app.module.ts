import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ReservationModule } from './infrastructure/modules/reservation.module';
import { SpaceModule } from './infrastructure/modules/space.module';
import { UserModule } from './infrastructure/modules/user.module';
import { AuthModule } from './infrastructure/modules/auth.module';
import { AppService } from './app.service';
import { getDatabaseConfig } from './infrastructure/database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    ReservationModule,
    SpaceModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
