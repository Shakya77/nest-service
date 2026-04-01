import { Module } from '@nestjs/common';
import { StaffDetailsService } from './staff_details.service';
import { StaffDetailsController } from './staff_details.controller';
import { StaffDetailsProviders } from './staff_details.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StaffDetailsController],
  providers: [StaffDetailsService, ...StaffDetailsProviders],
  exports: [StaffDetailsService],
})
export class StaffDetailsModule {}
