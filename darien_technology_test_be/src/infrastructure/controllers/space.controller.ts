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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSpaceUseCase } from '../../application/use-cases/space/createSpace.useCase';
import { GetSpacesUseCase } from '../../application/use-cases/space/getSpaces.useCase';
import { GetSpaceByIdUseCase } from '../../application/use-cases/space/getSpaceById.useCase';
import { UpdateSpaceUseCase } from '../../application/use-cases/space/updateSpace.useCase';
import { DeleteSpaceUseCase } from '../../application/use-cases/space/deleteSpace.useCase';
import { CreateSpaceDto, UpdateSpaceDto } from '../dtos/space.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
  IApiResponse,
} from '../dtos/api-response.dto';
import { CreateSpaceResponse } from '../../domain/interfaces/space/createSpaceResponse.interface';
import { GetSpaceResponse } from '../../domain/interfaces/space/getSpaceResponse.interface';
import { GetSpacesResponse } from '../../domain/interfaces/space/getSpacesResponse.interface';
import { UpdateSpaceResponse } from '../../domain/interfaces/space/updateSpaceResponse.interface';

@ApiTags('spaces')
@Controller('spaces')
@UsePipes(new ValidationPipe())
export class SpaceController {
  constructor(
    private readonly createSpaceUseCase: CreateSpaceUseCase,
    private readonly getSpacesUseCase: GetSpacesUseCase,
    private readonly getSpaceByIdUseCase: GetSpaceByIdUseCase,
    private readonly updateSpaceUseCase: UpdateSpaceUseCase,
    private readonly deleteSpaceUseCase: DeleteSpaceUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new space' })
  @ApiResponse({
    status: 201,
    description: 'Space successfully created',
    type: ApiSuccessResponse<CreateSpaceResponse>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiErrorResponse,
  })
  async createSpace(
    @Body() createSpaceDto: CreateSpaceDto,
  ): Promise<IApiResponse<CreateSpaceResponse>> {
    const { name, location, capacity, description } = createSpaceDto;
    return await this.createSpaceUseCase.execute(
      name,
      location,
      capacity,
      description,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all spaces with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return all spaces',
    type: ApiSuccessResponse<GetSpacesResponse>,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiErrorResponse,
  })
  async getSpaces(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<IApiResponse<GetSpacesResponse>> {
    return await this.getSpacesUseCase.execute(page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a space by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the space',
    type: ApiSuccessResponse<GetSpaceResponse>,
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found',
    type: ApiErrorResponse,
  })
  async getSpaceById(
    @Param('id') id: number,
  ): Promise<IApiResponse<GetSpaceResponse>> {
    return await this.getSpaceByIdUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a space' })
  @ApiResponse({
    status: 200,
    description: 'Space successfully updated',
    type: ApiSuccessResponse<UpdateSpaceResponse>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found',
    type: ApiErrorResponse,
  })
  async updateSpace(
    @Param('id') id: number,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ): Promise<IApiResponse<UpdateSpaceResponse>> {
    return await this.updateSpaceUseCase.execute(id, updateSpaceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a space' })
  @ApiResponse({
    status: 204,
    description: 'Space successfully deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete space with existing reservations',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found',
    type: ApiErrorResponse,
  })
  async deleteSpace(@Param('id') id: number): Promise<IApiResponse<void>> {
    return await this.deleteSpaceUseCase.execute(id);
  }
}
