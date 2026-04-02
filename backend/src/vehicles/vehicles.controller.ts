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
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/users/entities/user.entity';
import { AllowedRoles } from 'src/auth/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('available')
  findAvailable() {
    return this.vehiclesService.findAvailable();
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/disable-dates')
  findDisableDates(@Param('id') id: string) {
    return this.vehiclesService.findDisableDates(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/records')
  findRecords(@Param('id') id: string) {
    return this.vehiclesService.findRecords(+id);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.vehiclesService.updateAvailability(+id, isAvailable);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}
