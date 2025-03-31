import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDate, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'Space ID' })
  @IsNotEmpty()
  @IsNumber()
  spaceId: number;

  @ApiProperty({ description: 'Reservation date' })
  @IsNotEmpty()
  @IsDate()
  reservationDate: Date;

  @ApiProperty({ description: 'Start time' })
  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @ApiProperty({ description: 'End time' })
  @IsNotEmpty()
  @IsDate()
  endTime: Date;
}

export class UpdateReservationDto {
  @ApiProperty({ description: 'Reservation date', required: false })
  @IsDate()
  reservationDate?: Date;

  @ApiProperty({ description: 'Start time', required: false })
  @IsDate()
  startTime?: Date;

  @ApiProperty({ description: 'End time', required: false })
  @IsDate()
  endTime?: Date;
}
