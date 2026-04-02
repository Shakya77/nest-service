import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RentalsController } from './rentals.controller';
import { rentalsProviders } from './rentals.providers';
import { RentalsService } from './rentals.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RentalsController],
  providers: [RentalsService, ...rentalsProviders],
  exports: [RentalsService],
})
export class RentalsModule {}
