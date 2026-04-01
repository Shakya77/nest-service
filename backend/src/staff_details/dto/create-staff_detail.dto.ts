import { IsNumber, IsString } from 'class-validator';

export class CreateStaffDetailDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  ratePerHr: number;

  @IsString()
  licenseNumber: string;
}
