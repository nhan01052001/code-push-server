import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity, IBaseEntity } from './baseEntity/base.entity';
import { Customer } from './customer.entity';

export interface IDevice extends IBaseEntity {
  DeviceID?: string;
  UserIdHRM?: string;
  DeviceName?: string;
  DeviceOS?: string;
  DeviceOSVersion?: string;
  DeviceModel?: string;
  DateLogin?: Date;
  Customer?: Customer;
  CustomerID?: string;
  AboutDevice?: string;
  OS?: string;
  CusID?: string;
  VersionOS?: string;
  UserLoginHRM?: string;
}

@Entity('Sys_Device')
export class Device extends BaseEntity {
  constructor(props?: IDevice) {
    const {
      DeviceID,
      UserIdHRM,
      DeviceName,
      DeviceOS,
      DeviceOSVersion,
      DeviceModel,
      DateLogin,
      Customer,
      CustomerID,
      AboutDevice,
      OS,
      CusID,
      VersionOS,
      UserLoginHRM,
      ...superItem
    } = props || {};

    super(superItem);

    Object.assign(this, {
      DeviceID,
      UserIdHRM,
      DeviceName,
      DeviceOS,
      DeviceOSVersion,
      DeviceModel,
      DateLogin,
      Customer,
      CustomerID,
      AboutDevice,
      OS,
      CusID,
      VersionOS,
      UserLoginHRM,
    });
  }

  DeviceID?: string;

  UserIdHRM?: string;

  DeviceName?: string;

  DeviceOS?: string;

  DeviceOSVersion?: string;

  DeviceModel?: string;

  @Column({ type: 'datetime', nullable: true })
  DateLogin?: Date;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  AboutDevice?: string;

  OS?: string;
  
  @Column({ type: 'uuid', nullable: true })
  CusID?: string;

  @Column({ length: 50, nullable: true })
  VersionOS?: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  UserLoginHRM?: string;

  @ManyToOne(() => Customer, customer => customer.Devices)
  @JoinColumn({ name: 'CustomerID' })
  Customer?: Customer;

  CustomerID?: string;
} 