import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Permission } from './permission.model';
import { Role } from './role.model';

@Table({ tableName: 'role_permissions', timestamps: false })
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID })
  roleId: string;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.UUID })
  permissionId: string;
}
