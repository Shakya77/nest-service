import {
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Quote } from 'src/quotes/entities/quote.entity';

@Table({
  tableName: 'vehicles',
  paranoid: true,
})
export class Vehicle extends Model<Vehicle> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  basePricePerKm: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  registrationNo: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isAvailable: boolean;

  @HasMany(() => Quote)
  quotes: Quote[];
}
