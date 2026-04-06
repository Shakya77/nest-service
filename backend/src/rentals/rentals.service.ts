import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateRentalDto } from './dto/create-rental.dto';
import {
  PAYMENTS_REPOSITORY,
  RENTAL_DISTANCE_LOGS_REPOSITORY,
  RENTALS_REPOSITORY,
  STAFF_HOURS_REPOSITORY,
  USERS_REPOSITORY,
} from '../../constants';
import { Rental } from './entities/rental.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { StaffHour } from 'src/staff_details/entities/staff_hour.entity';
import { RentalDistanceLog } from './entities/rental_distance_log.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { UpdateRentalDto } from './dto/update-rental.dto';

@Injectable()
export class RentalsService {
  constructor(
    @Inject(RENTALS_REPOSITORY)
    private rentalsRepository: typeof Rental,

    @Inject(STAFF_HOURS_REPOSITORY)
    private staffHoursRepository: typeof StaffHour,

    @Inject(RENTAL_DISTANCE_LOGS_REPOSITORY)
    private rentalDistanceLogsRepository: typeof RentalDistanceLog,

    @Inject(PAYMENTS_REPOSITORY)
    private paymentsRepository: typeof Payment,

    @Inject(USERS_REPOSITORY)
    private usersRepository: typeof User,
  ) {}

  async rentalEnd(id: number, userId: number, body: any) {
    const transaction = await Rental.sequelize!.transaction();
    
    try {
      const vehiclePrice = (await this.rentalsRepository.findOne({
        where: { id },
        attributes: ['vehicleId'],
        include: [
          {
            model: Vehicle,
            attributes: ['basePricePerKm'],
          },
          {
            model: Quote,
            attributes: [
              'id',
              'bookingDate',
              'status',
              'vehicleId',
              'clientId',
            ],
          },
        ],
      })) as any as Rental;

      const extraKm = await this.rentalDistanceLogsRepository.sum('addedKm', {
        where: { rentalId: id },
      });

      const expectedPrice = await this.rentalsRepository.sum('totalPrice', {
        where: { id },
      });

      const totalCost =
        expectedPrice + extraKm * vehiclePrice.vehicle.basePricePerKm;

      const rentalEnd = await this.staffHoursRepository.findAll({
        where: {
          staffId: userId,
          rentalId: id,
        },
      });

      const startTime = rentalEnd[0].startTime;
      const now = new Date();
      const totalHours = (now.getTime() - startTime.getTime()) / 3600000;

      await this.staffHoursRepository.update(
        {
          endTime: now,
          totalHours: totalHours,
        },
        {
          where: {
            staffId: userId,
            rentalId: id,
          },
          transaction,
        },
      );

      await this.rentalsRepository.update(
        {
          status: 'completed',
          totalPrice: totalCost,
          extraKm: extraKm,
        } as any as Rental,
        {
          where: {
            id,
          },
          transaction,
        },
      );
      const rewardPointsEarned = Math.floor(totalCost / 100);

      const payments = await this.paymentsRepository.create(
        {
          rentalId: id,
          amount: totalCost - body.rewardPointsUsed,
          clientId: vehiclePrice.quote.clientId,
          paymentDate: new Date(),
          rewardPointsEarned: rewardPointsEarned,
          paidAt: new Date(),
          paymentMethod: body.paymentMethod || 'cash',
          rewardPointsUsed: body.rewardPointsUsed || 0,
        } as any as Payment,
        { transaction },
      );

      const user = (await this.usersRepository.findOne({
        where: { id: vehiclePrice.quote.clientId },
      })) as any as User;

      await this.usersRepository.update(
        {
          rewardPoints:
            user.rewardPoints +
            rewardPointsEarned -
            (body.rewardPointsUsed || 0),
        } as any as User,
        { where: { id: vehiclePrice.quote.clientId }, transaction },
      );

      await transaction.commit();

      return rentalEnd;
    } catch (error) {
      await transaction.rollback();
      throw new BadRequestException(error?.message || 'Transaction failed');
    }
  }

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
          as: 'staff',
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
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'registrationNo', 'basePricePerKm'],
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return rental;
  }

  async rentalStart(id: number, userId: number) {
    const rentalStart = await this.rentalsRepository.update(
      { status: 'in_progress' } as any as Rental,
      { where: { id } },
    );

    await this.staffHoursRepository.create({
      rentalId: id,
      staffId: userId,
      startTime: new Date(),
    } as any as StaffHour);

    return rentalStart;
  }

  async rentalExtra(id: number, userId: number, body: any) {
    const { addedKm } = body;

    const rentalDistacneLog = await this.rentalDistanceLogsRepository.create({
      rentalId: id,
      addedKm: addedKm,
      addedAt: new Date(),
    } as any as RentalDistanceLog);

    return rentalDistacneLog;
  }

  async findAllUser(userId: number, page: number, limit: number) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { rows, count } = await this.rentalsRepository.findAndCountAll({
      where: { userId, status: 'completed' },
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
          model: Payment,
        },
        {
          model: User,
          as: 'staff',
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

  async findAllStaff(page: number, limit: number, staffId: number) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { rows, count } = await this.rentalsRepository.findAndCountAll({
      where: { staffId },
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
              attributes: ['id', 'name', 'email', 'rewardPoints'],
            },
          ],
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'basePricePerKm', 'registrationNo'],
        },
        {
          model: User,
          as: 'staff',
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

  async findDistanceLogs(id: number) {
    const distanceLogs = await this.rentalDistanceLogsRepository.findAll({
      where: { rentalId: id },
    });

    return distanceLogs;
  }

  async update(id: number, updateRentalDto: UpdateRentalDto) {}
  async remove(id: number) {}
}
