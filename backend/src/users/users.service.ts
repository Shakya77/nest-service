import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { USERS_REPOSITORY } from '../../constants';
import * as bcrypt from 'bcryptjs';
import { StaffDetailsService } from 'src/staff_details/staff_details.service';
import { Sequelize } from 'sequelize-typescript';
import { Op, Transaction } from 'sequelize';

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

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { rows, count } = await this.usersRepository.findAndCountAll({
      where: whereCondition,
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
