import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Rental } from 'src/quotes/entities/rental.entity';

@Table({
  tableName: 'staff_hours',
  paranoid: true,
})
export class StaffHour extends Model<StaffHour> {
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
    type: DataType.INTEGER,
    allowNull: true,
  })
  staffId: number;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  startTime: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  endTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  totalHours: number;
}
