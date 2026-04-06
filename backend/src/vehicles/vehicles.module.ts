import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { vehiclesProviders } from './vehicles.providers';
import { DatabaseModule } from 'src/database/database.module';
import { RentalsModule } from 'src/rentals/rentals.module';
import { QuotesModule } from 'src/quotes/quotes.module';

@Module({
  imports: [DatabaseModule, RentalsModule, QuotesModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, ...vehiclesProviders],
  exports: [VehiclesService, ...vehiclesProviders],
})
export class VehiclesModule {}
