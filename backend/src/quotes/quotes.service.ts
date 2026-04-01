import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Roles, User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Quote, QuoteStatus } from './entities/quote.entity';
import { Rental } from './entities/rental.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class QuotesService {
  constructor(
    @Inject('QUOTES_REPOSITORY')
    private quotesRepository: typeof Quote,
    @Inject('RENTALS_REPOSITORY')
    private rentalsRepository: typeof Rental,
    @Inject('USERS_REPOSITORY')
    private usersRepository: typeof User,
    private readonly sequelize: Sequelize,
  ) {}

  async create(createQuoteDto: CreateQuoteDto) {
    const data = await this.quotesRepository.create(
      createQuoteDto as unknown as Quote,
    );

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
    const check = await this.quotesRepository.findOne({ where: { id } });

    if (!check) {
      throw new BadRequestException('Quote not found');
    }

    if (
      check.status === QuoteStatus.APPROVED ||
      check.status === QuoteStatus.REJECTED
    ) {
      throw new BadRequestException('Quote already approved or rejected');
    }

    // const validStaff = await this.usersRepository.findOne({
    //   where: { role: Roles.STAFF, id: staffId },
    // });

    // if (!validStaff) {
    //   throw new BadRequestException('Staff not found');
    // }

    const transaction = await this.sequelize.transaction();
    var data;
    try {
      data = await this.quotesRepository.update(
        { status: status as QuoteStatus },
        {
          where: { id },
        },
      );

      if (status === QuoteStatus.APPROVED) {
        await this.rentalsRepository.create({
          quoteId: id,
          scheduleDate: check.bookingDate,
          totalPrice: check.estimatedPrice,
          plannedKm: check.requestedKm,
          vehicleId: check.vehicleId,
          staffId: staffId,
        } as unknown as Rental);
      }
    } catch (error) {
      throw new BadRequestException('Failed to update quote status');
    } finally {
      await transaction.commit();
    }

    return data;
  }
}
