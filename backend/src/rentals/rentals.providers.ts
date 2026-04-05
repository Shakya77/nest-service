import {
  RENTAL_DISTANCE_LOGS_REPOSITORY,
  RENTALS_REPOSITORY,
} from '../../constants';
import { Rental } from './entities/rental.entity';
import { RentalDistanceLog } from './entities/rental_distance_log.entity';

export const rentalsProviders = [
  {
    provide: RENTALS_REPOSITORY,
    useValue: Rental,
  },
];

export const rentalDistanceLogsProviders = [
  {
    provide: RENTAL_DISTANCE_LOGS_REPOSITORY,
    useValue: RentalDistanceLog,
  },
];
