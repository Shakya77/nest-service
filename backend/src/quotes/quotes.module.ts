import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { quotesProviders, rentalsProviders } from './quotes.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [QuotesController],
  providers: [QuotesService, ...quotesProviders, ...rentalsProviders],
  exports: [QuotesService],
})
export class QuotesModule {}
