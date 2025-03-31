import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReservationUseCase } from '../../application/use-cases/reservation/createReservation.useCase';
import { GetReservationsUseCase } from '../../application/use-cases/reservation/getReservations.useCase';
import { GetReservationByIdUseCase } from '../../application/use-cases/reservation/getReservationById.useCase';
import { UpdateReservationUseCase } from '../../application/use-cases/reservation/updateReservation.useCase';
import { DeleteReservationUseCase } from '../../application/use-cases/reservation/deleteReservation.useCase';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from '../dtos/reservation.dto';
import { Request } from 'express';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly getReservationsUseCase: GetReservationsUseCase,
    private readonly getReservationByIdUseCase: GetReservationByIdUseCase,
    private readonly updateReservationUseCase: UpdateReservationUseCase,
    private readonly deleteReservationUseCase: DeleteReservationUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: Request & { user: { email: string } },
  ) {
    const { spaceId, reservationDate, startTime, endTime } =
      createReservationDto;
    return await this.createReservationUseCase.execute(
      spaceId,
      req.user.email,
      reservationDate,
      startTime,
      endTime,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reservations with pagination' })
  @ApiResponse({ status: 200, description: 'Return all reservations' })
  async getReservations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.getReservationsUseCase.execute(page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a reservation by ID' })
  @ApiResponse({ status: 200, description: 'Return the reservation' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async getReservationById(@Param('id') id: number) {
    return await this.getReservationByIdUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a reservation' })
  @ApiResponse({ status: 200, description: 'Reservation successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async updateReservation(
    @Param('id') id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return await this.updateReservationUseCase.execute(
      id,
      updateReservationDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reservation' })
  @ApiResponse({ status: 204, description: 'Reservation successfully deleted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this reservation',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async deleteReservation(
    @Param('id') id: number,
    @Req() request: Request & { user: { email: string } },
  ) {
    return await this.deleteReservationUseCase.execute(id, request.user.email);
  }
}
