import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { USERS_REPOSITORY } from '../../constants';
import * as bcrypt from 'bcryptjs';
import { StaffDetailsService } from 'src/staff_details/staff_details.service';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';

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

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
