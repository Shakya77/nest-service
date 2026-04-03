import { Sequelize } from 'sequelize-typescript';
import { Payment } from 'src/payments/entities/payment.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { Rental } from 'src/rentals/entities/rental.entity';
import { RentalDistanceLog } from 'src/rentals/entities/rental_distance_log.entity';
import { RentalStaffHour } from 'src/rentals/entities/rental_staff_hour.entity';
import { StaffDetail } from 'src/staff_details/entities/staff_detail.entity';
import { StaffHour } from 'src/staff_details/entities/staff_hour.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'nest',
      });

      sequelize.addModels([
        User,
        StaffDetail,
        Vehicle,
        Quote,
        Rental,
        Payment,
        StaffHour,
        RentalDistanceLog,
        RentalStaffHour,
      ]);

      await sequelize.sync();
      return sequelize;
    },
  },
];
