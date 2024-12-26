import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'refresh_tokens', timestamps: true, paranoid: true })
export class RefreshToken extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  token: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User, {
    as: 'user',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  })
  user: User;

  @BeforeCreate
  @BeforeUpdate
  static async removeOldTokens(instance: RefreshToken): Promise<void> {
    await RefreshToken.destroy({
      where: { userId: instance.userId },
      force: true,
    });
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashToken(refreshToken: RefreshToken): Promise<void> {
    if (refreshToken.token) {
      const hash = createHash('sha256')
        .update(refreshToken.token)
        .digest('hex');

      refreshToken.token = await bcrypt.hash(hash, 8);
    }
  }

  compareToken(attempt: string): boolean {
    const hash = createHash('sha256').update(attempt).digest('hex');
    return bcrypt.compareSync(hash, this.token);
  }
}
