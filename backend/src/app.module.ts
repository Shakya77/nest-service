import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StaffDetailsModule } from './staff_details/staff_details.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, StaffDetailsModule, VehiclesModule, QuotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
