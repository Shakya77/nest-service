import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { AllowedRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.create(createRentalDto);
  }

  @Get()
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return await this.rentalsService.findAll(page, limit);
  }

  @AllowedRoles(Roles.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/staff')
  async findAllStaff(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.rentalsService.findAllStaff(page, limit, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/start')
  async rentalStart(@Param('id') id: string, @Request() req) {
    return await this.rentalsService.rentalStart(+id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/extra')
  async rentalExtra(
    @Param('id') id: string,
    @Request() req,
    @Body() body: any,
  ) {
    return await this.rentalsService.rentalExtra(+id, req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/end')
  async rentalEnd(@Param('id') id: string, @Request() req, @Body() body: any) {
    return await this.rentalsService.rentalEnd(+id, req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user')
  async findAllUser(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.rentalsService.findAllUser(req.user.id, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.rentalsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalDto,
  ) {
    return await this.rentalsService.update(+id, updateRentalDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.rentalsService.remove(+id);
  }

  @Get('/:id/distance-logs')
  async findDistanceLogs(@Param('id') id: number) {
    return await this.rentalsService.findDistanceLogs(id);
  }
}
