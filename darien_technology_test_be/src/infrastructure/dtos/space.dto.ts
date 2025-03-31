import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSpaceDto {
  @ApiProperty({ description: 'Space name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Space location' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'Space capacity' })
  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @ApiProperty({ description: 'Space description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSpaceDto {
  @ApiProperty({ description: 'Space name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Space location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Space capacity', required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ description: 'Space description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
