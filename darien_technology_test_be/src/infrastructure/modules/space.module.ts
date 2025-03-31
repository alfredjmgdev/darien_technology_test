import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceEntity } from '../database/entities/space.entity';
import { SpaceController } from '../controllers/space.controller';
import { SpaceRepository } from '../repositories/space.repository';
import { CreateSpaceUseCase } from '../../application/use-cases/space/createSpace.useCase';
import { GetSpacesUseCase } from '../../application/use-cases/space/getSpaces.useCase';
import { GetSpaceByIdUseCase } from '../../application/use-cases/space/getSpaceById.useCase';
import { UpdateSpaceUseCase } from '../../application/use-cases/space/updateSpace.useCase';
import { DeleteSpaceUseCase } from '../../application/use-cases/space/deleteSpace.useCase';
import { ReservationRepository } from '../repositories/reservation.repository';
import { ReservationEntity } from '../database/entities/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpaceEntity, ReservationEntity])],
  controllers: [SpaceController],
  providers: [
    {
      provide: 'SpaceRepositoryPort',
      useClass: SpaceRepository,
    },
    {
      provide: 'ReservationRepositoryPort',
      useClass: ReservationRepository,
    },
    CreateSpaceUseCase,
    GetSpacesUseCase,
    GetSpaceByIdUseCase,
    UpdateSpaceUseCase,
    DeleteSpaceUseCase,
  ],
  exports: ['SpaceRepositoryPort', 'ReservationRepositoryPort'],
})
export class SpaceModule {}
