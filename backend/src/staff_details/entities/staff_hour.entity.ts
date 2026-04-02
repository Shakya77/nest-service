import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Rental } from 'src/quotes/entities/rental.entity';
import { User } from 'src/users/entities/user.entity';

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

  @BelongsTo(() => User, {
    foreignKey: 'staffId',
    targetKey: 'id',
    as: 'staff',
  })
  staff: User;

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
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  totalHours: number;
}
