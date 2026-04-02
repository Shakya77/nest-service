import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User, Roles } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { Rental, RentalStatus } from 'src/quotes/entities/rental.entity';
import { StaffHour } from 'src/staff_details/entities/staff_hour.entity';
import { RentalDistanceLog } from 'src/quotes/entities/rental_distance_log.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Injectable()
export class RentalsService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  private formatRental(rental: any) {
    const quote = rental.quote || {};
    const vehicle = rental.vehicle || quote.vehicles || quote.vehicle || {};
    const staff = rental.staff || {};
    const client = quote.client || {};
    const payment = rental.payments?.[0] || rental.payment || {};

    return {
      id: rental.id,
      quoteId: rental.quoteId,
      vehicleId: rental.vehicleId,
      vehicleName: vehicle.name,
      staffId: rental.staffId,
      staffName: staff.name,
      staffEmail: staff.email,
      clientId: quote.clientId,
      clientName: client.name,
      clientEmail: client.email,
      clientRewardPoints: Number(client.rewardPoints || 0),
      scheduledDate: rental.scheduleDate,
      plannedKm: rental.plannedKm,
      extraKm: rental.extraKm,
      totalPrice: rental.totalPrice,
      totalCost: rental.totalCost,
      status: rental.status,
      paidAmount: payment.amount,
      rewardPointsUsed: payment.rewardPointsUsed,
      rewardPointsEarned: payment.rewardPointsEarned,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt,
    };
  }

  async findAllAdmin() {
    const rentals = await Rental.findAll({
      include: [
        {
          model: Quote,
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'name', 'email', 'rewardPoints'],
            },
            { model: Vehicle },
          ],
        },
        { model: Vehicle },
        { model: User, as: 'staff', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'DESC']],
    });

    return rentals.map((rental) => this.formatRental(rental));
  }

  async findStaffRentals(staffId: number) {
    const rentals = await Rental.findAll({
      where: { staffId },
      include: [
        {
          model: Quote,
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'name', 'email', 'rewardPoints'],
            },
            { model: Vehicle },
          ],
        },
        { model: Vehicle },
        { model: User, as: 'staff', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'DESC']],
    });

    return rentals.map((rental) => this.formatRental(rental));
  }

  async findClientRentals(clientId: number) {
    const rentals = await Rental.findAll({
      include: [
        {
          model: Quote,
          where: { clientId },
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'name', 'email', 'rewardPoints'],
            },
            { model: Vehicle },
          ],
        },
        { model: Vehicle },
        { model: User, as: 'staff', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'DESC']],
    });

    const rentalIds = rentals.map((rental) => rental.id);
    const payments = rentalIds.length
      ? await Payment.findAll({ where: { rentalId: { [Op.in]: rentalIds } } })
      : [];

    const paymentMap = new Map<number, Payment>();
    payments.forEach((payment) => paymentMap.set(payment.rentalId, payment));

    return rentals.map((rental) =>
      this.formatRental({
        ...rental.toJSON(),
        payment: paymentMap.get(rental.id),
      }),
    );
  }

  async findStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [mostBookedVehicle, mostWorkingStaff, todaysIncome] =
      await Promise.all([
        Rental.findAll({
          attributes: [
            'vehicleId',
            [
              this.sequelize.fn('COUNT', this.sequelize.col('id')),
              'totalBookings',
            ],
          ],
          include: [{ model: Vehicle, attributes: ['id', 'name'] }],
          group: ['vehicleId', 'vehicle.id'],
          order: [
            [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'DESC'],
          ],
          limit: 1,
        }),
        StaffHour.findAll({
          attributes: [
            'staffId',
            [
              this.sequelize.fn('SUM', this.sequelize.col('totalHours')),
              'totalHours',
            ],
          ],
          include: [
            {
              model: User,
              as: 'staff',
              attributes: ['id', 'name', 'email'],
              where: { role: Roles.STAFF },
            },
          ],
          group: ['staffId', 'staff.id'],
          order: [
            [
              this.sequelize.fn('SUM', this.sequelize.col('totalHours')),
              'DESC',
            ],
          ],
          limit: 1,
        }),
        Payment.findAll({
          attributes: ['amount'],
          where: {
            paidAt: {
              [Op.between]: [startOfToday, endOfToday],
            },
          },
        }),
      ]);

    const totalIncome = todaysIncome.reduce(
      (sum, payment) => sum + Number((payment as any).amount || 0),
      0,
    );

    return {
      mostBookedVehicle: mostBookedVehicle[0]
        ? {
            id: (mostBookedVehicle[0] as any).vehicle?.id,
            name: (mostBookedVehicle[0] as any).vehicle?.name,
            totalBookings: Number(
              (mostBookedVehicle[0] as any).dataValues?.totalBookings || 0,
            ),
          }
        : null,
      mostWorkingStaff: mostWorkingStaff[0]
        ? {
            id: (mostWorkingStaff[0] as any).staff?.id,
            name: (mostWorkingStaff[0] as any).staff?.name,
            email: (mostWorkingStaff[0] as any).staff?.email,
            totalHours: Number(
              (mostWorkingStaff[0] as any).dataValues?.totalHours || 0,
            ),
          }
        : null,
      todaysIncome: {
        totalIncome,
      },
    };
  }

  async startRental(rentalId: number, staffId: number) {
    const transaction = await this.sequelize.transaction();

    try {
      const rental = await Rental.findOne({
        where: { id: rentalId },
        transaction,
      });

      if (!rental) {
        throw new NotFoundException('Rental not found');
      }

      if (Number(rental.staffId) !== Number(staffId)) {
        throw new ForbiddenException('This rental is not assigned to you');
      }

      if (rental.status !== RentalStatus.ASSIGNED) {
        throw new BadRequestException('Rental is not assigned');
      }

      await StaffHour.create(
        {
          rentalId,
          staffId,
          startTime: new Date(),
        } as any,
        { transaction },
      );

      await rental.update({ status: RentalStatus.INPROGRESS }, { transaction });

      await transaction.commit();
      return { message: 'Rental started' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async endRental(
    rentalId: number,
    staffId: number,
    rewardPointsUsed = 0,
    paymentMethod = 'cash',
  ) {
    const transaction = await this.sequelize.transaction();

    try {
      const rental = await Rental.findOne({
        where: { id: rentalId },
        include: [
          {
            model: Quote,
            include: [
              {
                model: User,
                as: 'client',
                attributes: ['id', 'name', 'email', 'rewardPoints'],
              },
            ],
          },
        ],
        transaction,
      });

      if (!rental) {
        throw new NotFoundException('Rental not found');
      }

      if (Number(rental.staffId) !== Number(staffId)) {
        throw new ForbiddenException('This rental is not assigned to you');
      }

      if (rental.status !== RentalStatus.INPROGRESS) {
        throw new BadRequestException('Rental is not in progress');
      }

      const latestStaffHour = await StaffHour.findOne({
        where: { rentalId, staffId },
        order: [['id', 'DESC']],
        transaction,
      });

      if (!latestStaffHour) {
        throw new BadRequestException('Staff hour record not found');
      }

      const startTime = new Date(latestStaffHour.startTime as any);
      const endTime = new Date();
      const totalHours = Number(
        ((endTime.getTime() - startTime.getTime()) / 3600000).toFixed(2),
      );

      await latestStaffHour.update(
        {
          endTime,
          totalHours,
        },
        { transaction },
      );

      const client = (rental as any).quote?.client;
      if (!client) {
        throw new BadRequestException('Client not found');
      }

      const currentPoints = Number(client.rewardPoints || 0);
      const pointsUsed = Number(rewardPointsUsed || 0);
      const billingAmount = Number(rental.totalPrice || 0);

      if (pointsUsed < 0) {
        throw new BadRequestException('Invalid reward points');
      }

      if (pointsUsed > currentPoints) {
        throw new BadRequestException('Insufficient reward points');
      }

      if (pointsUsed > billingAmount) {
        throw new BadRequestException('Points exceed total cost');
      }

      const rewardPointsEarned = Math.floor(billingAmount / 100);
      const finalAmount = billingAmount - pointsUsed;

      await Payment.create(
        {
          rentalId,
          clientId: client.id,
          amount: finalAmount,
          rewardPointsUsed: pointsUsed,
          rewardPointsEarned,
          paymentMethod,
          paidAt: endTime,
        } as any,
        { transaction },
      );

      await User.update(
        {
          rewardPoints: currentPoints - pointsUsed + rewardPointsEarned,
        },
        { where: { id: client.id }, transaction },
      );

      await rental.update({ status: RentalStatus.COMPLETED }, { transaction });

      await transaction.commit();
      return { message: 'Rental completed' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async addExtraKm(rentalId: number, staffId: number, addedKm: number) {
    if (!addedKm || Number(addedKm) <= 0) {
      throw new BadRequestException('addedKm must be greater than 0');
    }

    const transaction = await this.sequelize.transaction();

    try {
      const rental = await Rental.findOne({
        where: { id: rentalId },
        include: [{ model: Vehicle }],
        transaction,
      });

      if (!rental) {
        throw new NotFoundException('Rental not found');
      }

      if (Number(rental.staffId) !== Number(staffId)) {
        throw new ForbiddenException('This rental is not assigned to you');
      }

      const vehicle = (rental as any).vehicle;
      if (!vehicle) {
        throw new BadRequestException('Vehicle not found');
      }

      const nextExtraKm = Number(rental.extraKm || 0) + Number(addedKm);
      const nextTotalCost =
        Number(rental.totalPrice || 0) +
        nextExtraKm * Number(vehicle.basePricePerKm || 0);

      await RentalDistanceLog.create(
        {
          rentalId,
          addedKm,
          addedAt: new Date(),
        } as any,
        { transaction },
      );

      await rental.update(
        {
          extraKm: nextExtraKm,
          totalCost: nextTotalCost,
        },
        { transaction },
      );

      await transaction.commit();
      return { message: 'Extra km logged' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
