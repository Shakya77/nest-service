import {
  QUOTES_REPOSITORY,
  RENTAL_DISTANCE_LOGS_REPOSITORY,
  RENTAL_STAFF_HOURS_REPOSITORY,
  RENTALS_REPOSITORY,
} from '../../constants';
import { Quote } from './entities/quote.entity';
import { Rental } from './entities/rental.entity';
import { RentalDistanceLog } from './entities/rental_distance_log.entity';
import { RentalStaffHour } from './entities/rental_staff_hour.entity';

export const quotesProviders = [
  {
    provide: QUOTES_REPOSITORY,
    useValue: Quote,
  },
];

export const rentalsProviders = [
  {
    provide: RENTALS_REPOSITORY,
    useValue: Rental,
  },
];

export const rentalStaffHoursProviders = [
  {
    provide: RENTAL_STAFF_HOURS_REPOSITORY,
    useValue: RentalStaffHour,
  },
];

export const rentalDistanceLogsProviders = [
  {
    provide: RENTAL_DISTANCE_LOGS_REPOSITORY,
    useValue: RentalDistanceLog,
  },
];
