import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { rentalsProviders } from './rentals.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RentalsController],
  providers: [RentalsService, ...rentalsProviders],
  exports: [RentalsService, ...rentalsProviders],
})
export class RentalsModule {}
