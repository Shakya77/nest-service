import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Roles, User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Quote, QuoteStatus } from './entities/quote.entity';
import { Rental } from './entities/rental.entity';
import { Sequelize } from 'sequelize-typescript';
import {
  QUOTES_REPOSITORY,
  RENTALS_REPOSITORY,
  USERS_REPOSITORY,
  VEHICLE_REPOSITORY,
} from '../../constants';

@Injectable()
export class QuotesService {
  constructor(
    @Inject(QUOTES_REPOSITORY)
    private quotesRepository: typeof Quote,
    @Inject(RENTALS_REPOSITORY)
    private rentalsRepository: typeof Rental,
    @Inject(USERS_REPOSITORY)
    private usersRepository: typeof User,
    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
    @Inject(VEHICLE_REPOSITORY)
    private vehiclesRepository: typeof Vehicle,
  ) {}

  async create(createQuoteDto: CreateQuoteDto) {
    const validVehicle = await this.vehiclesRepository.findOne({
      where: { id: createQuoteDto.vehicleId },
    });

    if (!validVehicle) {
      throw new BadRequestException('Vehicle not found');
    }

    const validClient = await this.usersRepository.findOne({
      where: { id: createQuoteDto.clientId },
    });

    if (!validClient) {
      throw new BadRequestException('Client not found');
    }

    const estimatedPrice =
      validVehicle.basePricePerKm * createQuoteDto.requestedKm;

    const data = await this.quotesRepository.create({
      ...createQuoteDto,
      estimatedPrice,
    } as unknown as Quote);

    return data;
  }

  async findAll() {
    const data = await this.quotesRepository.findAll({
      attributes: [
        'id',
        'bookingDate',
        'requestedKm',
        'pickupLocation',
        'estimatedPrice',
        'status',
        'createdAt',
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'basePricePerKm', 'registrationNo'],
        },
      ],
    });

    return data;
  }

  async findOne(id: number) {
    const data = await this.quotesRepository.findOne({
      where: { id },
      include: ['vehicles', 'client'],
    });
    return data;
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto) {
    const check = await this.quotesRepository.findOne({ where: { id } });

    if (!check) {
      throw new BadRequestException('Quote not found');
    }

    const data = await this.quotesRepository.update(updateQuoteDto, {
      where: { id },
    });
    return data;
  }

  async remove(id: number) {
    const check = await this.quotesRepository.findOne({ where: { id } });

    if (!check) {
      throw new BadRequestException('Quote not found');
    }

    const data = await this.quotesRepository.destroy({ where: { id } });

    return data;
  }

  async updateStatus(id: number, status: string, staffId: number) {
    const transaction = await this.sequelize.transaction();

    try {
      const check = await this.quotesRepository.findOne({
        where: { id },
      });

      if (!check) {
        throw new BadRequestException('Quote not found');
      }

      if (
        check.status === QuoteStatus.APPROVED ||
        check.status === QuoteStatus.REJECTED
      ) {
        throw new BadRequestException('Quote already approved or rejected');
      }

      const validStaff = await this.usersRepository.findOne({
        where: { role: Roles.STAFF, id: staffId },
      });

      if (!validStaff) {
        throw new BadRequestException('Staff not found');
      }

      await this.quotesRepository.update(
        { status: status as QuoteStatus },
        {
          where: { id },
          transaction,
        },
      );

      if (status === QuoteStatus.APPROVED) {
        await this.rentalsRepository.create(
          {
            quoteId: id,
            scheduleDate: check.bookingDate,
            totalPrice: check.estimatedPrice,
            plannedKm: check.requestedKm,
            vehicleId: check.vehicleId,
            staffId: staffId,
          } as unknown as Rental,
          { transaction },
        );
      }

      await transaction.commit();

      return { message: 'Quote status updated successfully' };
    } catch (error) {
      await transaction.rollback();
      throw new BadRequestException(error.message || 'Transaction failed');
    }
  }
}
