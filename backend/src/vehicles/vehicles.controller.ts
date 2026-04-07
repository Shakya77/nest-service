import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Roles } from 'src/users/entities/user.entity';
import { AllowedRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('/:id/bookings')
  async findRentals(@Param('id') id: string) {
    return await this.vehiclesService.findRentals(+id);
  }

  @Get('bookedVehicle')
  async findBookedVehicle() {
    return await this.vehiclesService.findBookedVehicle();
  }

  @Get('available')
  @Public()
  async findAvailable() {
    return await this.vehiclesService.findAvailable();
  }

  @AllowedRoles(Roles.ADMIN)
  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.vehiclesService.create(createVehicleDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @Get()
  async findAll() {
    return await this.vehiclesService.findAll();
  }

  @AllowedRoles(Roles.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.vehiclesService.findOne(+id);
  }

  @Public()
  @Get(':id/disable-dates')
  async findDisableDates(@Param('id') id: string) {
    return await this.vehiclesService.findDisableDates(+id);
  }

  @Get(':id/records')
  async findRecords(@Param('id') id: string) {
    return await this.vehiclesService.findRecords(+id);
  }

  @AllowedRoles(Roles.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.vehiclesService.update(+id, updateVehicleDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @Patch(':id')
  async updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return await this.vehiclesService.updateAvailability(+id, isAvailable);
  }

  @AllowedRoles(Roles.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.vehiclesService.remove(+id);
  }
}
