import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AllowedRoles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/users/entities/user.entity';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('stats')
  findStats() {
    return this.rentalsService.findStats();
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  findAllAdmin() {
    return this.rentalsService.findAllAdmin();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('staff')
  findStaffRentals(@Request() req) {
    return this.rentalsService.findStaffRentals(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('client')
  findClientRentals(@Request() req) {
    return this.rentalsService.findClientRentals(req.user.id);
  }

  @AllowedRoles(Roles.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/start')
  startRental(@Request() req, @Param('id') id: string) {
    return this.rentalsService.startRental(+id, req.user.id);
  }

  @AllowedRoles(Roles.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/end')
  endRental(
    @Request() req,
    @Param('id') id: string,
    @Body()
    body: {
      rewardPointsUsed?: number;
      paymentMethod?: string;
    },
  ) {
    return this.rentalsService.endRental(
      +id,
      req.user.id,
      body.rewardPointsUsed ?? 0,
      body.paymentMethod ?? 'cash',
    );
  }

  @AllowedRoles(Roles.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/extra')
  addExtraKm(
    @Request() req,
    @Param('id') id: string,
    @Body('addedKm') addedKm: number,
  ) {
    return this.rentalsService.addExtraKm(+id, req.user.id, Number(addedKm));
  }
}
