import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  error?: string;
}

export class ApiSuccessResponse<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: T;
}

// Define the type union using interface instead
export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  error?: string;
  data?: T;
}
