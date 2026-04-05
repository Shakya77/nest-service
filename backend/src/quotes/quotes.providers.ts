import { QUOTES_REPOSITORY } from '../../constants';
import { Quote } from './entities/quote.entity';

export const quotesProviders = [
  {
    provide: QUOTES_REPOSITORY,
    useValue: Quote,
  },
];
