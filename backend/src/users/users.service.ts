import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles, User } from './entities/user.entity';
import { USERS_REPOSITORY } from '../../constants';
import * as bcrypt from 'bcryptjs';
import { StaffDetailsService } from 'src/staff_details/staff_details.service';
import { Sequelize } from 'sequelize-typescript';
import { Op, Transaction, fn, col } from 'sequelize';
import slugify from 'slugify';
import { StaffDetail } from 'src/staff_details/entities/staff_detail.entity';
import { StaffHour } from 'src/staff_details/entities/staff_hour.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: typeof User,
    private readonly staffDetailsService: StaffDetailsService,
    @Inject('SEQUELIZE')
    private sequelize: Sequelize,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const transaction: Transaction = await this.sequelize.transaction();

    try {
      const checkEmail = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
        transaction,
      });

      if (checkEmail) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const userData = {
        ...createUserDto,
        slug: slugify(createUserDto.name),
        password: hashedPassword,
      };

      const user = await this.usersRepository.create(
        userData as unknown as User,
        { transaction },
      );

      if (createUserDto.role === 'staff') {
        await this.staffDetailsService.create(
          {
            userId: user.id,
            ratePerHr: createUserDto.ratePerHr,
            licenseNumber: createUserDto.licenseNumber,
          },
          transaction,
        );
      }

      await transaction.commit();
      return user;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async createStaff(createUserDto: CreateUserDto) {
    return this.create({
      ...createUserDto,
      role: Roles.STAFF,
      isActive: createUserDto.isActive ?? true,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: Roles,
    userId?: number,
  ) {
    const offset = (page - 1) * limit;

    const whereCondition = (role as Roles) ? { role } : {};

    const { rows, count } = await this.usersRepository.findAndCountAll({
      where: {
        role: { [Op.ne]: Roles.ADMIN },
        ...whereCondition,
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        lastPage: Math.ceil(count / limit),
      },
    };
  }

  async listStaff() {
    const staff = await this.usersRepository.findAll({
      where: { role: Roles.STAFF },
      attributes: [
        'id',
        'name',
        'email',
        'isActive',
        'rewardPoints',
        [fn('SUM', col('staffHours.totalHours')), 'totalHours'],
      ],
      include: [
        {
          model: StaffDetail,
          as: 'staffDetail',
          attributes: ['ratePerHr', 'licenseNumber'],
        },
        {
          model: StaffHour,
          as: 'staffHours',
          attributes: [],
          required: false,
        },
      ],
      group: ['User.id', 'staffDetail.id'],
      order: [['id', 'DESC']],
      raw: true,
      nest: true,
    });

    return staff.map((item: any) => {
      const totalHours = Number(item.totalHours || 0);
      const hourlyRate = Number(item.staffDetail?.ratePerHr || 0);

      return {
        ...item,
        user: {
          id: item.id,
          name: item.name,
          email: item.email,
          isActive: item.isActive,
        },
        ratePerHr: hourlyRate,
        hourlyRate,
        totalHours,
        totalIncome: totalHours * hourlyRate,
      };
    });
  }

  async getMe(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'rewardPoints',
        'slug',
      ],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async findOneEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data = await this.usersRepository.update(updateUserDto, {
      where: { id },
    });

    return data;
  }

  async remove(id: number) {
    const data = await this.usersRepository.destroy({
      where: { id },
    });

    return data;
  }

  async changeStatus(id: number, role: string, isActive: boolean) {
    const data = await this.usersRepository.update(
      { isActive },
      {
        where: { id, role },
      },
    );

    return data;
  }
}
