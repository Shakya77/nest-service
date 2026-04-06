import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Rental } from './rental.entity';

@Table({
  tableName: 'rental_distance_logs',
  paranoid: true,
})
export class RentalDistanceLog extends Model<RentalDistanceLog> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Rental)
  @Column({
    type: DataType.INTEGER,
  })
  rentalId: number;

  @BelongsTo(() => Rental)
  rental: Rental;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  addedKm: number;

  @Column({
    type: DataType.DATE,
  })
  addedAt: Date;
}
