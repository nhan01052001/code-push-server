import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity, IBaseEntity } from './baseEntity/base.entity';
import { Customer } from './customer.entity';

export interface ILog extends IBaseEntity {
  DeviceID?: string;
  UserIdHRM?: string;
  Action?: string;
  Description?: string;
  DateLog?: Date;
  Customer?: Customer;
  CustomerID?: string;
  ContentLog?: string;
  CusID?: string;
  UserID?: string;
}

@Entity('Sys_LogPortalApp')
export class Log extends BaseEntity {
  constructor(props?: ILog) {
    const {
      DeviceID,
      UserIdHRM,
      Action,
      Description,
      DateLog,
      Customer,
      CustomerID,
      ContentLog,
      CusID,
      UserID,
      ...superItem
    } = props || {};

    super(superItem);

    Object.assign(this, {
      DeviceID,
      UserIdHRM,
      Action,
      Description,
      DateLog,
      Customer,
      CustomerID,
      ContentLog,
      CusID,
      UserID,
    });
  }

  DeviceID?: string;

  UserIdHRM?: string;

  Action?: string;

  Description?: string;

  @Column({ type: 'datetime', nullable: true })
  DateLog?: Date;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  ContentLog?: string;

  @Column({ type: 'uuid', nullable: true })
  CusID?: string;

  @Column({ type: 'uuid', nullable: true })
  UserID?: string;

  @ManyToOne(() => Customer, customer => customer.Logs)
  @JoinColumn({ name: 'CustomerID' })
  Customer?: Customer;

  CustomerID?: string;
} 