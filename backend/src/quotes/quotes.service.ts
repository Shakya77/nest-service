import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Roles, User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Quote, QuoteStatus } from './entities/quote.entity';
import { Sequelize } from 'sequelize-typescript';
import {
  QUOTES_REPOSITORY,
  RENTALS_REPOSITORY,
  USERS_REPOSITORY,
  VEHICLE_REPOSITORY,
} from '../../constants';
import { Op } from 'sequelize';
import { Rental, RentalStatus } from 'src/rentals/entities/rental.entity';

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

  async createForClient(createQuoteDto: CreateQuoteDto, clientId: number) {
    const validVehicle = await this.vehiclesRepository.findOne({
      where: { id: createQuoteDto.vehicleId },
    });

    if (!validVehicle) {
      throw new BadRequestException('Vehicle not found');
    }

    const estimatedPrice =
      Number(validVehicle.basePricePerKm) * Number(createQuoteDto.requestedKm);

    return await this.quotesRepository.create({
      clientId,
      vehicleId: createQuoteDto.vehicleId,
      requestedKm: createQuoteDto.requestedKm,
      bookingDate: createQuoteDto.bookingDate,
      pickupLocation: createQuoteDto.pickupLocation,
      estimatedPrice,
      status: QuoteStatus.PENDING,
    } as unknown as Quote);
  }

  async findAllAdmin() {
    const quotes = await this.quotesRepository.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          as: 'client',
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'basePricePerKm', 'registrationNo'],
        },
      ],
      order: [['id', 'DESC']],
    });

    return quotes;
  }

  async findAllClient(clientId: number) {
    const quotes = await this.quotesRepository.findAll({
      where: { clientId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          as: 'client',
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'basePricePerKm', 'registrationNo'],
        },
      ],
      order: [['id', 'DESC']],
    });

    return quotes;
  }

  async findOne(id: number) {
    const data = await this.quotesRepository.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          as: 'client',
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'basePricePerKm', 'registrationNo'],
        },
      ],
    });

    return data;
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto, clientId: number) {
    const check = await this.quotesRepository.findOne({
      where: { id, clientId },
    });

    if (!check) {
      throw new BadRequestException('Quote not found');
    }

    if (check.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Only pending quotes can be updated');
    }

    let estimatedPrice: number | undefined;
    if (
      updateQuoteDto.vehicleId !== undefined ||
      updateQuoteDto.requestedKm !== undefined
    ) {
      const nextVehicleId = updateQuoteDto.vehicleId ?? check.vehicleId;
      const nextRequestedKm = updateQuoteDto.requestedKm ?? check.requestedKm;

      const vehicle = await this.vehiclesRepository.findOne({
        where: { id: nextVehicleId },
      });

      if (!vehicle) {
        throw new BadRequestException('Vehicle not found');
      }

      estimatedPrice = Number(vehicle.basePricePerKm) * Number(nextRequestedKm);
    }

    const updatePayload: any = {
      ...updateQuoteDto,
      estimatedPrice,
    };

    if (updatePayload.bookingDate) {
      updatePayload.bookingDate = new Date(updatePayload.bookingDate);
    }

    await this.quotesRepository.update(updatePayload, {
      where: { id, clientId },
    });

    return await this.findOne(id);
  }

  async remove(id: number, clientId: number) {
    const check = await this.quotesRepository.findOne({
      where: { id, clientId },
    });

    if (!check) {
      throw new BadRequestException('Quote not found');
    }

    if (check.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Only pending quotes can be deleted');
    }

    const data = await this.quotesRepository.destroy({ where: { id } });

    return data;
  }

  async updateStatus(id: number, status: string, staffId: any = null) {
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

      await this.quotesRepository.update(
        { status: status as QuoteStatus },
        {
          where: { id },
          transaction,
        },
      );

      if (status === QuoteStatus.APPROVED) {
        const validStaff = await this.usersRepository.findOne({
          where: { role: Roles.STAFF, id: staffId },
        });

        if (!validStaff) {
          throw new BadRequestException('Staff not found');
        }

        await this.rentalsRepository.create(
          {
            quoteId: id,
            userId: check.clientId,
            scheduleDate: check.bookingDate,
            totalPrice: check.estimatedPrice,
            plannedKm: check.requestedKm,
            vehicleId: check.vehicleId,
            staffId: staffId,
            extraKm: 0,
            totalCost: check.estimatedPrice,
            status: RentalStatus.ASSIGNED,
          } as unknown as Rental,
          { transaction },
        );
      }

      await transaction.commit();

      return { message: 'Quote status updated successfully' };
    } catch (error: any) {
      await transaction.rollback();
      throw new BadRequestException(error?.message || 'Transaction failed');
    }
  }

  async findVehicleDisableDates(vehicleId: number) {
    const quotes = await this.quotesRepository.findAll({
      attributes: ['bookingDate'],
      where: {
        vehicleId,
        status: QuoteStatus.APPROVED,
        bookingDate: {
          [Op.gte]: new Date(),
        },
      },
      order: [['bookingDate', 'ASC']],
    });

    const uniqueDates = [
      ...new Set(
        quotes.map((quote) => {
          const bookingDate = new Date((quote as any).bookingDate);
          return bookingDate.toISOString().split('T')[0];
        }),
      ),
    ];

    return uniqueDates;
  }
}
