import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffDetailsService } from './staff_details.service';
import { CreateStaffDetailDto } from './dto/create-staff_detail.dto';
import { UpdateStaffDetailDto } from './dto/update-staff_detail.dto';

@Controller('staff')
export class StaffDetailsController {
  constructor(private readonly staffDetailsService: StaffDetailsService) {}

  @Post()
  create(@Body() createStaffDetailDto: CreateStaffDetailDto) {
    return this.staffDetailsService.create(createStaffDetailDto);
  }

  @Get()
  findAll() {
    return this.staffDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaffDetailDto: UpdateStaffDetailDto,
  ) {
    return this.staffDetailsService.update(+id, updateStaffDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffDetailsService.remove(+id);
  }
}
