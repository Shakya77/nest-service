import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { User } from 'src/users/entities/user.entity';
import { Quote } from 'src/quotes/entities/quote.entity';

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

  @BelongsTo(() => User)
  staff: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  scheduleDate: Date;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
  })
  totalPrice: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
  })
  plannedKm: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
  })
  extraKm: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
  })
  totalCost: number;

  @Column({
    type: DataType.ENUM(...Object.values(RentalStatus)),
    defaultValue: RentalStatus.ASSIGNED,
  })
  status: RentalStatus;
}
