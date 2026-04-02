import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PAYMENTS_REPOSITORY } from '../../constants';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private paymentsRepository: typeof Payment,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const data = await this.paymentsRepository.create({
      ...createPaymentDto,
      paidAt: createPaymentDto.paidAt
        ? new Date(createPaymentDto.paidAt)
        : new Date(),
      rewardPointsUsed: createPaymentDto.rewardPointsUsed ?? 0,
      rewardPointsEarned: createPaymentDto.rewardPointsEarned ?? 0,
      paymentMethod: createPaymentDto.paymentMethod ?? 'cash',
    } as Payment);

    return data;
  }

  async findAll() {
    return await this.paymentsRepository.findAll({
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
      order: [['id', 'DESC']],
    });
  }

  async findOne(id: number) {
    return await this.findPaymentById(id);
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findPaymentById(id);

    await payment.update({
      ...updatePaymentDto,
      paidAt: updatePaymentDto.paidAt
        ? new Date(updatePaymentDto.paidAt)
        : payment.paidAt,
    });

    return await this.findPaymentById(id);
  }

  async remove(id: number) {
    const payment = await this.findPaymentById(id);
    await payment.destroy();

    return { message: 'Payment deleted successfully' };
  }

  private async findPaymentById(id: number) {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
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
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
