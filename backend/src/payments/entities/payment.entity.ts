import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Rental } from 'src/rentals/entities/rental.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'payments',
  paranoid: true,
})
export class Payment extends Model<Payment> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Rental)
  @Column({
    type: DataType.INTEGER,
  })
  rentalId: number;

  @BelongsTo(() => Rental)
  rental: Rental;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  clientId: number;

  @BelongsTo(() => User)
  client: User;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  amount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  rewardPointsUsed: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  rewardPointsEarned: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'cash',
  })
  paymentMethod: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  paidAt: Date;
}
