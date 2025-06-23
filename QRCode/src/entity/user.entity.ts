import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity, IBaseEntity } from './baseEntity/base.entity';
import * as bcrypt from 'bcryptjs';

export interface IUser extends IBaseEntity {
  Username?: string;
  Password?: string;
  FullName?: string;
  Email?: string;
  IsActive?: boolean;
}

@Entity('User')
export class User extends BaseEntity {
  constructor(props?: IUser) {
    const {
      Username,
      Password,
      FullName,
      Email,
      IsActive,
      ...superItem
    } = props || {};

    super(superItem);

    Object.assign(this, {
      Username,
      Password,
      FullName,
      Email,
      IsActive,
    });
  }

  @Column({ type: 'nvarchar', length: 50, unique: true })
  Username?: string;

  @Column({ type: 'nvarchar', length: 100 })
  Password?: string;

  @Column({ type: 'nvarchar', length: 100 })
  FullName?: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  Email?: string;

  @Column({ type: 'bit', default: 1 })
  IsActive?: boolean;

  @BeforeInsert()
  async hashPassword() {
    if (this.Password) {
      this.Password = await bcrypt.hash(this.Password, 10);
    }
  }
} 