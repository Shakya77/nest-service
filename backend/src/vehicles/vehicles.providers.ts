import { VEHICLE_REPOSITORY } from '../../constants';
import { Vehicle } from './entities/vehicle.entity';

export const vehiclesProviders = [
  {
    provide: VEHICLE_REPOSITORY,
    useValue: Vehicle,
  },
];
