import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsPositive()
  rentalId!: number;

  @IsInt()
  @IsPositive()
  clientId!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rewardPointsUsed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rewardPointsEarned?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
