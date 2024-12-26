import {
  CreateOptions,
  CreationAttributes,
  DestroyOptions,
  FindOptions,
  UpdateOptions,
} from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';

export class BaseRepository<T extends Model> {
  constructor(protected readonly model: ModelCtor<T>) {}

  async findAll(options?: FindOptions<T>): Promise<T[]> {
    return this.model.findAll(options);
  }

  async findByPk(id: string, options?: FindOptions): Promise<T | null> {
    return await this.model.findByPk(id, options);
  }

  async findOne(options?: FindOptions): Promise<T | null> {
    return this.model.findOne(options);
  }

  async create(
    values: CreationAttributes<T>,
    options?: CreateOptions<T>,
  ): Promise<T> {
    const created = await this.model.create(values, options);
    return created.toJSON();
  }

  async update(
    values: Partial<CreationAttributes<T>>,
    options: UpdateOptions<T>,
  ): Promise<void> {
    await this.model.update(values, options);
  }

  async delete(options: DestroyOptions<T>): Promise<void> {
    await this.model.destroy(options);
  }

  async softDelete(id: string): Promise<void> {
    const record = await this.model.findByPk(id, { paranoid: false });
    if (record) {
      await record.destroy({ force: false });
    }
  }

  async restore(id: string): Promise<void> {
    const record = await this.model.findByPk(id, { paranoid: false });
    if (record && record.restore) {
      await record.restore();
    }
  }
}
