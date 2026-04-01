import { IsDate, IsNumber, IsString } from 'class-validator';
import { QuoteStatus } from '../entities/quote.entity';

export class CreateQuoteDto {
  @IsNumber()
  clientId: number;
  @IsNumber()
  vehicleId: number;

  @IsDate()
  bookingDate: Date;

  @IsNumber()
  requestedKm: number;

  @IsString()
  pickupLocation: string;

  @IsNumber()
  estimatedPrice: number;

  @IsString()
  status: QuoteStatus;
}
