import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'rental_staff_hours',
  paranoid: true,
})
export class RentalStaffHour extends Model<RentalStaffHour> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
  })
  rentalId: number;

  @Column({
    type: DataType.INTEGER,
  })
  staffId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  hoursWorked: number;
}
