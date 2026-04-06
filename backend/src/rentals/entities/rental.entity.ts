import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { User } from 'src/users/entities/user.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { Payment } from 'src/payments/entities/payment.entity';

export enum RentalStatus {
  ASSIGNED = 'assigned',
  INPROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Table({
  tableName: 'rentals',
  paranoid: true,
})
export class Rental extends Model<Rental> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @BelongsTo(() => User, 'userId')
  user: User;

  @ForeignKey(() => Quote)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quoteId: number;

  @BelongsTo(() => Quote)
  quote: Quote;

  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.INTEGER,
  })
  vehicleId: number;

  @BelongsTo(() => Vehicle)
  vehicle: Vehicle;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  staffId: number;

  @BelongsTo(() => User, 'staffId')
  staff: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  scheduleDate: Date;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('totalPrice');
      return parseFloat(rawValue);
    },
  })
  totalPrice: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('plannedKm');
      return parseFloat(rawValue);
    },
  })
  plannedKm: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('extraKm');
      return parseFloat(rawValue);
    },
  })
  extraKm: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('totalCost');
      return parseFloat(rawValue);
    },
    set(value: number) {
      this.setDataValue('totalCost', value);
    },
  })
  totalCost: number;

  @Column({
    type: DataType.ENUM(...Object.values(RentalStatus)),
    defaultValue: RentalStatus.ASSIGNED,
  })
  status: RentalStatus;

  @HasOne(() => Payment)
  payment: Payment;
}
