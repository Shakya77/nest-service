import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

export enum QuoteStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Table({
  tableName: 'quotes',
  paranoid: true,
})
export class Quote extends Model<Quote> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vehicleId: number;

  @BelongsTo(() => Vehicle, {
    foreignKey: 'vehicleId',
  })
  vehicles: Vehicle;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  clientId: number;

  @BelongsTo(() => User, {
    foreignKey: 'clientId',
  })
  client: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  bookingDate: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  requestedKm: number;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
  })
  pickupLocation: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
  })
  estimatedPrice: number;

  @Column({
    type: DataType.ENUM(...Object.values(QuoteStatus)),
  })
  status: QuoteStatus;
}
