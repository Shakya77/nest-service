import { Inject, Injectable } from '@nestjs/common';
import { CreateStaffDetailDto } from './dto/create-staff_detail.dto';
import { UpdateStaffDetailDto } from './dto/update-staff_detail.dto';
import { col, fn, literal, Op, Transaction } from 'sequelize';
import {
  STAFF_DETAILS_REPOSITORY,
  STAFF_HOURS_REPOSITORY,
} from '../../constants';
import { StaffDetail } from './entities/staff_detail.entity';
import { StaffHour } from './entities/staff_hour.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class StaffDetailsService {
  constructor(
    @Inject(STAFF_DETAILS_REPOSITORY)
    private staffDetailsRepository: typeof StaffDetail,

    @Inject(STAFF_HOURS_REPOSITORY)
    private staffHoursRepository: typeof StaffHour,
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
      attributes: [
        'id',
        'ratePerHr',
        [fn('SUM', col('staffHours.totalHours')), 'totalHours'],
      ],

      include: [
        {
          association: 'user', // same as include: ['user']
          attributes: ['id', 'name', 'email', 'isActive'],
        },
        {
          model: StaffHour,
          as: 'staffHours',
          attributes: [],
          required: false, // LEFT JOIN
        },
      ],

      group: ['StaffDetail.id', 'StaffDetail.ratePerHr', 'user.id'],

      order: [['createdAt', 'DESC']],

      raw: true,
      nest: true,
    });

    const result = data.map((item) => {
      const totalHours = Number((item as any).totalHours || 0);
      const hourlyRate = Number((item as any).ratePerHr || 0);

      return {
        ...item,
        hourlyRate,
        totalHours,
        totalIncome: totalHours * hourlyRate,
      };
    });

    return result;
  }

  async findTopWorkingStaff() {
    const staff = await this.staffHoursRepository.findAll({
      attributes: [
        'staffId',
        [fn('SUM', col('StaffHour.totalHours')), 'totalHours'],
      ],
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'name', 'email', 'isActive'],
        },
      ],
      group: ['StaffHour.staffId', 'staff.id'],
      order: [[literal('"totalHours"'), 'DESC']],
      limit: 1,
    });

    return staff;
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
