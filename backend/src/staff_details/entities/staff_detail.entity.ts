import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { StaffHour } from './staff_hour.entity';

@Table({
  tableName: 'staff_details',
  paranoid: true,
})
export class StaffDetail extends Model<StaffDetail> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => StaffHour, {
    foreignKey: 'staffId',
    sourceKey: 'userId',
    as: 'staffHours',
  })
  staffHours: StaffHour[];

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  ratePerHr: number;

  @Column({
    type: DataType.STRING,
  })
  licenseNumber: string;
}
