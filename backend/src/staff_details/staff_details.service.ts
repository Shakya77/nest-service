import { Inject, Injectable } from '@nestjs/common';
import { CreateStaffDetailDto } from './dto/create-staff_detail.dto';
import { UpdateStaffDetailDto } from './dto/update-staff_detail.dto';
import { Transaction } from 'sequelize';
import { STAFF_DETAILS_REPOSITORY } from '../../constants';
import { StaffDetail } from './entities/staff_detail.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class StaffDetailsService {
  constructor(
    @Inject(STAFF_DETAILS_REPOSITORY)
    private staffDetailsRepository: typeof StaffDetail,
  ) {}

  async create(
    createStaffDetailDto: CreateStaffDetailDto,
    transaction?: Transaction,
  ) {
    const data = await this.staffDetailsRepository.create(
      {
        ...createStaffDetailDto,
      } as any as StaffDetail,
      { transaction },
    );

    return data;
  }

  async findAll() {
    const data = await this.staffDetailsRepository.findAll({
      include: {
        model: User,
      },
      order: [['createdAt', 'DESC']],
    });

    return data;
  }

  async findOne(id: number) {
    return `This action returns a #${id} staffDetail`;
  }

  async update(id: number, updateStaffDetailDto: UpdateStaffDetailDto) {
    return `This action updates a #${id} staffDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} staffDetail`;
  }
}
