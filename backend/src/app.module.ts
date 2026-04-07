import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StaffDetailsModule } from './staff_details/staff_details.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { QuotesModule } from './quotes/quotes.module';
import { PaymentsModule } from './payments/payments.module';
import { RentalsModule } from './rentals/rentals.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    StaffDetailsModule,
    VehiclesModule,
    QuotesModule,
    PaymentsModule,
    RentalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
