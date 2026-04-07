import { Exclude } from 'class-transformer';
import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { StaffDetail } from 'src/staff_details/entities/staff_detail.entity';
import { StaffHour } from 'src/staff_details/entities/staff_hour.entity';

export enum Roles {
  ADMIN = 'admin',
  STAFF = 'staff',
  USER = 'user',
}

@Table({
  tableName: 'users',
  paranoid: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  slug: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email: string;

  @Exclude()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string;

  @Column({
    type: DataType.ENUM(...Object.values(Roles)),
    defaultValue: Roles.USER,
    allowNull: false,
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  rewardPoints: number;

  @HasOne(() => StaffDetail, {
    foreignKey: 'userId',
    sourceKey: 'id',
    as: 'staffDetail',
  })
  staffDetail: StaffDetail;

  @HasMany(() => StaffHour, {
    foreignKey: 'staffId',
    sourceKey: 'id',
    as: 'staffHours',
  })
  staffHours: StaffHour[];

  
}
