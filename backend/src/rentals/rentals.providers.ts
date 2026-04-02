import {
  PAYMENTS_REPOSITORY,
  RENTAL_DISTANCE_LOGS_REPOSITORY,
  RENTALS_REPOSITORY,
  STAFF_HOURS_REPOSITORY,
  USERS_REPOSITORY,
} from '../../constants';
import { Payment } from 'src/payments/entities/payment.entity';
import { RentalDistanceLog } from 'src/quotes/entities/rental_distance_log.entity';
import { Rental } from 'src/quotes/entities/rental.entity';
import { StaffHour } from 'src/staff_details/entities/staff_hour.entity';
import { User } from 'src/users/entities/user.entity';

export const rentalsProviders = [
  {
    provide: RENTALS_REPOSITORY,
    useValue: Rental,
  },
  {
    provide: PAYMENTS_REPOSITORY,
    useValue: Payment,
  },
  {
    provide: STAFF_HOURS_REPOSITORY,
    useValue: StaffHour,
  },
  {
    provide: RENTAL_DISTANCE_LOGS_REPOSITORY,
    useValue: RentalDistanceLog,
  },
  {
    provide: USERS_REPOSITORY,
    useValue: User,
  },
];
