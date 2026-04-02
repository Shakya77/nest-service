import { Column, DataType, Model, Table } from 'sequelize-typescript';

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
}
