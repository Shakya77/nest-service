import { PAYMENTS_REPOSITORY } from '../../constants';
import { Payment } from './entities/payment.entity';

export const paymentsProviders = [
  {
    provide: PAYMENTS_REPOSITORY,
    useValue: Payment,
  },
];
