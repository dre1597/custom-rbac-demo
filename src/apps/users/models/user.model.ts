import * as bcrypt from 'bcryptjs';
import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserStatus } from '../enum/user-status.enum';
import { RefreshToken } from './refresh-token.model';
import { Role } from './role.model';

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

  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID, allowNull: false })
  roleId: string;

  @BelongsTo(() => Role)
  role: Role;

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
