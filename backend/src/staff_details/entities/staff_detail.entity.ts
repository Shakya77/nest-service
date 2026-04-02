import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

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

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  ratePerHr: number;

  @Column({
    type: DataType.STRING,
  })
  licenseNumber: string;
}
