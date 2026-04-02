import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsNumber()
  basePricePerKm: number;

  @IsString()
  registrationNo: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
