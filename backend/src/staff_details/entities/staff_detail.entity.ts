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
export class StaffDetail extends Model {
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

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  ratePerHr: number;

  @Column({
    type: DataType.STRING,
  })
  licenseNumber: string;

  @BelongsTo(() => User)
  user: User;
}
