import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column } from 'typeorm';

export interface IBaseEntity {
  ID?: string;
  UserCreate?: string;
  DateCreate?: Date;
  UserUpdate?: string;
  DateUpdate?: Date;
  IsDelete?: boolean;
  ActionStatus?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export class BaseEntity {
  constructor(props?: IBaseEntity) {
    const { 
      ID, 
      UserCreate, 
      DateCreate, 
      UserUpdate, 
      DateUpdate, 
      IsDelete,
      ActionStatus,
      page,
      pageSize,
      keyword
    } = props || {};

    Object.assign(this, { 
      ID, 
      UserCreate, 
      DateCreate, 
      UserUpdate, 
      DateUpdate, 
      IsDelete,
      ActionStatus,
      page,
      pageSize,
      keyword
    });
  }

  @Column({ nullable: false, width: 300 })
  @PrimaryGeneratedColumn("uuid")
  ID?: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  UserCreate?: string;

  @CreateDateColumn()
  DateCreate?: Date;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  UserUpdate?: string;

  @UpdateDateColumn()
  DateUpdate?: Date;

  @Column({ type: 'bit', nullable: true, default: 0 })
  IsDelete?: boolean;

  ActionStatus?: string;

  page?: number;

  pageSize?: number;

  keyword?: string;
} 