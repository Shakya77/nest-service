import { Inject, Injectable } from '@nestjs/common';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { RENTALS_REPOSITORY } from '../../constants';
import { Rental } from './entities/rental.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Quote } from 'src/quotes/entities/quote.entity';

@Injectable()
export class RentalsService {
  constructor(
    @Inject(RENTALS_REPOSITORY)
    private rentalsRepository: typeof Rental,
  ) {}

  async create(createRentalDto: CreateRentalDto) {
    const data = await this.rentalsRepository.create(
      createRentalDto as any as Rental,
    );

    return data;
  }

  async findAll(page: number, limit: number) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { rows, count } = await this.rentalsRepository.findAndCountAll({
      attributes: [
        'id',
        'status',
        'scheduleDate',
        'totalCost',
        'plannedKm',
        'vehicleId',
        'staffId',
        'extraKm',
        'totalPrice',
      ],
      include: [
        {
          model: Quote,
          attributes: ['id', 'bookingDate', 'status', 'vehicleId'],
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'basePricePerKm', 'registrationNo'],
        },
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: limitNumber,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page: pageNumber,
        lastPage: Math.ceil(count / limitNumber),
      },
    };
  }

  async findOne(id: number) {
    const rental = await this.rentalsRepository.findOne({
      where: { id },
      include: [
        {
          model: Quote,
          attributes: ['id', 'bookingDate', 'status', 'vehicleId'],
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'licensePlate', 'basePricePerKm'],
        },
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return rental;
  }

  update(id: number, updateRentalDto: UpdateRentalDto) {
    return `This action updates a #${id} rental`;
  }

  remove(id: number) {
    return `This action removes a #${id} rental`;
  }
}
