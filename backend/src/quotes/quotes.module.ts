import { forwardRef, Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { quotesProviders } from './quotes.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { RentalsModule } from 'src/rentals/rentals.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    forwardRef(() => VehiclesModule),
    RentalsModule,
  ],  
  controllers: [QuotesController],
  providers: [QuotesService, ...quotesProviders],
  exports: [QuotesService, ...quotesProviders],
})
export class QuotesModule {}
