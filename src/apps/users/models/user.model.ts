import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

import { RefreshToken } from './refresh-token.model';
import { UserStatus } from '../enum/user-status.enum';

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class User extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @HasOne(() => RefreshToken, {
    as: 'refreshToken',
    foreignKey: 'userId',
  })
  refreshToken?: RefreshToken;

  @BeforeCreate
  @BeforeUpdate
  static hashPassword(user: User): void {
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, 10);
    }
  }

  comparePassword(attempt: string): boolean {
    return bcrypt.compareSync(attempt, this.password);
  }
}
