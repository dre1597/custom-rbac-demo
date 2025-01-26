import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { RoleStatus } from '../enum/role-status.enum';
import { Permission } from './permission.model';
import { RolePermission } from './role-permissions.model';

@Table({ tableName: 'roles', timestamps: true, paranoid: true })
export class Role extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: RoleStatus.ACTIVE,
  })
  status: RoleStatus;

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];
}
