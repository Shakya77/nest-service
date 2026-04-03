import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { RentalStatus } from '../entities/rental.entity';

export class CreateRentalDto {
  @IsNumber()
  quoteId: number;

  @IsDateString()
  scheduleDate: string; 

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  plannedKm: number;

  @IsNumber()
  vehicleId: number;

  @IsNumber()
  staffId: number;

  @IsOptional()
  @IsNumber()
  extraKm?: number;

  @IsNumber()
  totalCost: number;

  @IsEnum(RentalStatus)
  status: RentalStatus;
}
