import { RENTALS_REPOSITORY } from "../../constants";
import { Rental } from "./entities/rental.entity";

export const rentalsProviders = [
  {
    provide: RENTALS_REPOSITORY,
    useValue: Rental,
  },
];
