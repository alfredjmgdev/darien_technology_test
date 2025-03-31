import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from '../database/entities/reservation.entity';
import { ReservationController } from '../controllers/reservation.controller';
import { ReservationRepository } from '../repositories/reservation.repository';
import { CreateReservationUseCase } from '../../application/use-cases/reservation/createReservation.useCase';
import { GetReservationsUseCase } from '../../application/use-cases/reservation/getReservations.useCase';
import { GetReservationByIdUseCase } from '../../application/use-cases/reservation/getReservationById.useCase';
import { UpdateReservationUseCase } from '../../application/use-cases/reservation/updateReservation.useCase';
import { DeleteReservationUseCase } from '../../application/use-cases/reservation/deleteReservation.useCase';
import { SpaceRepository } from '../repositories/space.repository';
import { SpaceEntity } from '../database/entities/space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationEntity, SpaceEntity])],
  controllers: [ReservationController],
  providers: [
    {
      provide: 'ReservationRepositoryPort',
      useClass: ReservationRepository,
    },
    {
      provide: 'SpaceRepositoryPort',
      useClass: SpaceRepository,
    },
    CreateReservationUseCase,
    GetReservationsUseCase,
    GetReservationByIdUseCase,
    UpdateReservationUseCase,
    DeleteReservationUseCase,
  ],
  exports: ['ReservationRepositoryPort'],
})
export class ReservationModule {}
