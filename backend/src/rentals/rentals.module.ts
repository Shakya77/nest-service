import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import {
  rentalDistanceLogsProviders,
  rentalsProviders,
} from './rentals.providers';
import { DatabaseModule } from 'src/database/database.module';
import { StaffDetailsModule } from 'src/staff_details/staff_details.module';

@Module({
  imports: [DatabaseModule, StaffDetailsModule],
  controllers: [RentalsController],
  providers: [
    RentalsService,
    ...rentalsProviders,
    ...rentalDistanceLogsProviders,
  ],
  exports: [RentalsService, ...rentalsProviders],
})
export class RentalsModule {}
