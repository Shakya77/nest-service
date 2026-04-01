import { STAFF_DETAILS_REPOSITORY } from '../../constants';
import { StaffDetail } from './entities/staff_detail.entity';

export const StaffDetailsProviders = [
  {
    provide: STAFF_DETAILS_REPOSITORY,
    useValue: StaffDetail,
  },
];
