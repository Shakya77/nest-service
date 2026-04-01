import { Sequelize } from 'sequelize-typescript';
import { Quote } from 'src/quotes/entities/quote.entity';
import { Rental } from 'src/quotes/entities/rental.entity';
import { StaffDetail } from 'src/staff_details/entities/staff_detail.entity';
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

      sequelize.addModels([User, StaffDetail, Vehicle, Quote, Rental]);

      await sequelize.sync();
      return sequelize;
    },
  },
];
