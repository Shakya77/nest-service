import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VEHICLE_REPOSITORY } from '../../constants';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository,
  ) {}

  async create(createVehicleDto: CreateVehicleDto) {
    return await this.vehicleRepository.create({
      ...createVehicleDto,
      isAvailable: createVehicleDto.isAvailable ?? true,
    });
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

  async remove(id: number) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await vehicle.destroy();

    return { message: 'Vehicle removed successfully' };
  }
}
