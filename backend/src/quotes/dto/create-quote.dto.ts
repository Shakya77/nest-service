import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuoteDto {
  @IsNumber()
  vehicleId: number;

  @IsDateString()
  bookingDate: string;

  @IsNumber()
  requestedKm: number;

  @IsString()
  pickupLocation: string;

  @IsOptional()
  @IsString()
  status?: string;
}
