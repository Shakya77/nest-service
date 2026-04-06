import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PAYMENTS_REPOSITORY } from '../../constants';
import { Payment } from './entities/payment.entity';
import { Op } from 'sequelize';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private paymentsRepository: typeof Payment,
  ) {}

  async payments() {
    const data = await this.paymentsRepository.sum('amount', {
      where: {
        paidAt: {
          [Op.lt]: new Date(),
        },
      },
    });

    return { total: data };
  }

  async findAll() {
    const data = await this.paymentsRepository.findAll({
      attributes: [
        'id',
        'amount',
        'paidAt',
        'rewardPointsEarned',
        'paymentMethod',
      ],
      include: [
        {
          association: 'rental',
          attributes: ['id', 'quoteId', 'status', 'scheduleDate'],
        },
        {
          association: 'client',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return data;
  }
}
