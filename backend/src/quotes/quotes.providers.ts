import { QUOTES_REPOSITORY, RENTALS_REPOSITORY } from '../../constants';
import { Quote } from './entities/quote.entity';
import { Rental } from './entities/rental.entity';

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
