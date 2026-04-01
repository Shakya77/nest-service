import { IsNumber, isString, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsNumber()
  basePricePerKm: number;

  @IsString()
  registrationNo: string;
}
