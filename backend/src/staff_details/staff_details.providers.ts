import {
  STAFF_DETAILS_REPOSITORY,
  STAFF_HOURS_REPOSITORY,
} from '../../constants';
import { StaffDetail } from './entities/staff_detail.entity';
import { StaffHour } from './entities/staff_hour.entity';

export const StaffDetailsProviders = [
  {
    provide: STAFF_DETAILS_REPOSITORY,
    useValue: StaffDetail,
  },
];

export const StaffHoursProviders = [
  {
    provide: STAFF_HOURS_REPOSITORY,
    useValue: StaffHour,
  },
];
