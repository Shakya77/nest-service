import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDetailDto } from './create-staff_detail.dto';

export class UpdateStaffDetailDto extends PartialType(CreateStaffDetailDto) {}
