import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RentalsService } from './rentals.service';

@Controller('rentals')
@UseGuards(AuthGuard('jwt'))
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get('staff')
  findStaffRentals(@Request() req) {
    return this.rentalsService.findStaffRentals(req.user.id);
  }

  @Get('client')
  findClientPastRides(@Request() req) {
    return this.rentalsService.findClientPastRides(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.findOne(id);
  }

  @Post(':id/start')
  startRental(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.startRental(id, req.user.id);
  }

  @Post(':id/end')
  endRental(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      rewardPointsUsed?: number;
      paymentMethod?: string;
    },
  ) {
    return this.rentalsService.endRental(
      id,
      req.user.id,
      body?.rewardPointsUsed ?? 0,
      body?.paymentMethod ?? 'cash',
    );
  }

  @Post(':id/extra')
  addExtraKm(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { addedKm: number },
  ) {
    return this.rentalsService.addExtraKm(id, req.user.id, body?.addedKm);
  }
}
