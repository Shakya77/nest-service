import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VEHICLE_REPOSITORY } from '../../constants';
import { Quote, QuoteStatus } from 'src/quotes/entities/quote.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Rental } from 'src/rentals/entities/rental.entity';
import { col, fn, literal } from 'sequelize';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: typeof Vehicle,
  ) {}

  async create(createVehicleDto: CreateVehicleDto) {
    return await this.vehicleRepository.create({
      ...createVehicleDto,
      isAvailable: createVehicleDto.isAvailable ?? true,
    } as any as Vehicle);
  }

  async findAvailable() {
    const data = await this.vehicleRepository.findAll({
      where: { isAvailable: true },
      order: [['createdAt', 'DESC']],
    });

    return data;
  }

  async findAll() {
    return await this.vehicleRepository.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    return vehicle;
  }

  async findDisableDates(id: number) {
    const quotes = await Quote.findAll({
      attributes: ['bookingDate'],
      where: {
        vehicleId: id,
        status: QuoteStatus.APPROVED,
      },
      order: [['bookingDate', 'ASC']],
    });

    return [
      ...new Set(
        quotes.map(
          (quote) =>
            new Date((quote as any).bookingDate).toISOString().split('T')[0],
        ),
      ),
    ];
  }

  async findRecords(id: number) {
    const records = await Quote.findAll({
      where: { vehicleId: id },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['name', 'email'],
        },
      ],
      order: [['id', 'DESC']],
      limit: 10,
    });

    return records.map((record: any) => ({
      id: record.id,
      clientId: record.clientId,
      clientName: record.client?.name,
      clientEmail: record.client?.email,
      vehicleId: record.vehicleId,
      estimatedPrice: record.estimatedPrice,
      requestedKm: record.requestedKm,
      bookingDate: record.bookingDate,
      pickupLocation: record.pickupLocation,
      status: record.status,
    }));
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const data = await this.vehicleRepository.findOne({ where: { id } });

    if (!data) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.vehicleRepository.update(updateVehicleDto, {
      where: { id },
    });

    return await this.vehicleRepository.findOne({ where: { id } });
  }

  async updateAvailability(id: number, isAvailable: boolean) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.vehicleRepository.update({ isAvailable }, { where: { id } });

    return await this.vehicleRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await vehicle.destroy();

    return { message: 'Vehicle removed successfully' };
  }
}
