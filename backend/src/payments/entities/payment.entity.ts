import { Model } from 'sequelize';
import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { Rental } from 'src/quotes/entities/rental.entity';
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
    type: DataType.STRING,
  })
  rentalId: string;

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
    type: DataType.DATE,
  })
  rewardPointsEarned: number;
}
