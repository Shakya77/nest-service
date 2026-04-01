import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  role: string;

  @IsBoolean()
  isActive: boolean;

  @IsNumber()
  rewardPoints: number;

  @IsString()
  licenseNumber: string;

  @IsNumber()
  userId: number;

  @IsNumber()
  ratePerHr: number;
}
