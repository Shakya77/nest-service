import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PAYMENTS_REPOSITORY,
  RENTAL_DISTANCE_LOGS_REPOSITORY,
  RENTALS_REPOSITORY,
  STAFF_HOURS_REPOSITORY,
  USERS_REPOSITORY,
} from '../../constants';
import { Rental, RentalStatus } from 'src/quotes/entities/rental.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Op } from 'sequelize';
import { StaffHour } from 'src/staff_details/entities/staff_hour.entity';
import { RentalDistanceLog } from 'src/quotes/entities/rental_distance_log.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class RentalsService {
  constructor(
    @Inject(RENTALS_REPOSITORY)
    private rentalsRepository: typeof Rental,
    @Inject(PAYMENTS_REPOSITORY)
    private paymentsRepository: typeof Payment,
    @Inject(STAFF_HOURS_REPOSITORY)
    private staffHoursRepository: typeof StaffHour,
    @Inject(RENTAL_DISTANCE_LOGS_REPOSITORY)
    private rentalDistanceLogsRepository: typeof RentalDistanceLog,
    @Inject(USERS_REPOSITORY)
    private usersRepository: typeof User,
    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
  ) {}

  private mapRental(rental: any) {
    const quote = rental.quote || {};
    const client = quote.client || {};
    const vehicle = rental.vehicle || quote.vehicles || {};
    const staff = rental.staff || {};

    return {
      id: rental.id,
      quoteId: rental.quoteId,
      clientId: quote.clientId,
      clientName: client.name,
      clientEmail: client.email,
      clientRewardPoints: Number(client.rewardPoints || 0),
      vehicleId: rental.vehicleId,
      vehicleName: vehicle.name,
      staffId: rental.staffId,
      staffName: staff.name,
      staffEmail: staff.email,
      scheduledDate: rental.scheduleDate,
      plannedKm: rental.plannedKm,
      extraKm: rental.extraKm,
      totalPrice: rental.totalPrice,
      totalCost: rental.totalCost,
      status: rental.status,
      paidAmount: rental.paidAmount,
      rewardPointsUsed: rental.rewardPointsUsed,
      rewardPointsEarned: rental.rewardPointsEarned,
    };
  }

  private includeConfig() {
    return [
      {
        model: Quote,
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Vehicle,
            attributes: ['id', 'name'],
          },
        ],
      },
      {
        model: Vehicle,
        attributes: ['id', 'name'],
      },
      {
        model: User,
        as: 'staff',
        attributes: ['id', 'name', 'email'],
      },
    ];
  }

  async findAll() {
    const rentals = await this.rentalsRepository.findAll({
      include: this.includeConfig(),
      order: [['id', 'DESC']],
    });

    return rentals.map((item) => this.mapRental(item));
  }

  async findStaffRentals(staffId: number) {
    const rentals = await this.rentalsRepository.findAll({
      where: { staffId },
      include: this.includeConfig(),
      order: [['id', 'DESC']],
    });

    return rentals.map((item) => this.mapRental(item));
  }

  async findClientPastRides(clientId: number) {
    const rentals = await this.rentalsRepository.findAll({
      include: [
        {
          model: Quote,
          where: { clientId },
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: Vehicle,
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Vehicle,
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['id', 'DESC']],
    });

    const rentalIds = rentals.map((rental) => rental.id);
    const payments = rentalIds.length
      ? await this.paymentsRepository.findAll({
          where: { rentalId: { [Op.in]: rentalIds } },
        })
      : [];

    const paymentByRentalId = new Map<number, Payment>();
    payments.forEach((payment) =>
      paymentByRentalId.set(payment.rentalId, payment),
    );

    return rentals
      .filter((rental) => rental.status === 'completed')
      .map((item) => {
        const mapped = this.mapRental(item as any);
        const payment = paymentByRentalId.get(item.id);

        return {
          ...mapped,
          paidAmount: payment ? Number(payment.amount) : null,
          rewardPointsUsed: payment ? payment.rewardPointsUsed : null,
          rewardPointsEarned: payment ? payment.rewardPointsEarned : null,
        };
      });
  }

  async findOne(id: number) {
    const rental = await this.rentalsRepository.findOne({
      where: { id },
      include: this.includeConfig(),
    });

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    return this.mapRental(rental);
  }

  async startRental(rentalId: number, staffId: number) {
    const transaction = await this.sequelize.transaction();

    try {
      const rental = await this.rentalsRepository.findOne({
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
        throw new BadRequestException('Only assigned rentals can be started');
      }

      await this.staffHoursRepository.create(
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
      const rental = await this.rentalsRepository.findOne({
        where: { id: rentalId },
        include: [
          {
            model: Quote,
            include: [
              {
                model: User,
                as: 'client',
                attributes: ['id', 'rewardPoints'],
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
        throw new BadRequestException('Only in-progress rentals can be ended');
      }

      const latestHour = await this.staffHoursRepository.findOne({
        where: {
          rentalId,
          staffId,
        },
        order: [['id', 'DESC']],
        transaction,
      });

      if (latestHour && !latestHour.endTime) {
        const endTime = new Date();
        const startTime = new Date(latestHour.startTime as any);
        const totalHours = Number(
          ((endTime.getTime() - startTime.getTime()) / 3600000).toFixed(2),
        );

        await latestHour.update(
          {
            endTime,
            totalHours,
          },
          { transaction },
        );
      }

      const client = (rental as any).quote?.client;
      const currentPoints = Number(client?.rewardPoints || 0);
      const pointsUsed = Number(rewardPointsUsed || 0);
      const billAmount = Number(rental.totalCost || rental.totalPrice || 0);

      if (
        pointsUsed < 0 ||
        pointsUsed > currentPoints ||
        pointsUsed > billAmount
      ) {
        throw new BadRequestException('Invalid reward points used');
      }

      const finalAmount = billAmount - pointsUsed;
      const earnedPoints = Math.floor(finalAmount / 100);

      await this.paymentsRepository.create(
        {
          rentalId,
          clientId: client?.id,
          amount: finalAmount,
          rewardPointsUsed: pointsUsed,
          rewardPointsEarned: earnedPoints,
          paymentMethod,
          paidAt: new Date(),
        } as any,
        { transaction },
      );

      if (client?.id) {
        await this.usersRepository.update(
          {
            rewardPoints: currentPoints - pointsUsed + earnedPoints,
          },
          { where: { id: client.id }, transaction },
        );
      }

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
      const rental = await this.rentalsRepository.findOne({
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

      if (rental.status === RentalStatus.COMPLETED) {
        throw new BadRequestException('Completed rental cannot be edited');
      }

      const vehicle = (rental as any).vehicle;
      const nextExtraKm = Number(rental.extraKm || 0) + Number(addedKm);
      const nextTotalCost =
        Number(rental.totalPrice || 0) +
        nextExtraKm * Number(vehicle?.basePricePerKm || 0);

      await this.rentalDistanceLogsRepository.create(
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
      return { message: 'Extra km added' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
