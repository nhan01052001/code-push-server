import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity, IBaseEntity } from './baseEntity/base.entity';
import { Device } from './device.entity';
import { Log } from './log.entity';

export interface ICustomer extends IBaseEntity {
  CusCode?: string;
  CusName?: string;
  UriPor?: string;
  UriSys?: string;
  UriHR?: string;
  UriMain?: string;
  QRCode?: Buffer;
  QRCodeBase64?: string;
  EncAlgorithm?: string;
  DecAlgorithm?: string;
  HRMVersionApi?: string;
  VersionCode?: string;
  keyUpdateAndroid?: string;
  keyUpdateIos?: string;
  UriCenter?: string;
  UriIdentity?: string;
  LogoPath?: string;
  Devices?: Device[];
  Logs?: Log[];
  TotalRow?: number;
}

@Entity('Sys_Customer')
export class Customer extends BaseEntity {
  constructor(props?: ICustomer) {
    const {
      CusCode,
      CusName,
      UriPor,
      UriSys,
      UriHR,
      UriMain,
      QRCode,
      QRCodeBase64,
      EncAlgorithm,
      DecAlgorithm,
      HRMVersionApi,
      VersionCode,
      keyUpdateAndroid,
      keyUpdateIos,
      UriCenter,
      UriIdentity,
      LogoPath,
      Devices,
      Logs,
      TotalRow,
      ...superItem
    } = props || {};

    super(superItem);

    Object.assign(this, {
      CusCode,
      CusName,
      UriPor,
      UriSys,
      UriHR,
      UriMain,
      QRCode,
      QRCodeBase64,
      EncAlgorithm,
      DecAlgorithm,
      HRMVersionApi,
      VersionCode,
      keyUpdateAndroid,
      keyUpdateIos,
      UriCenter,
      UriIdentity,
      LogoPath,
      Devices,
      Logs,
      TotalRow,
    });
  }

  @Column({ length: 50, nullable: true })
  CusCode?: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  CusName?: string;

  @Column({ length: 100, nullable: true })
  UriPor?: string;

  @Column({ length: 100, nullable: true })
  UriSys?: string;

  @Column({ length: 100, nullable: true })
  UriHR?: string;

  @Column({ length: 100, nullable: true })
  UriMain?: string;

  @Column({ type: 'varbinary', nullable: true })
  QRCode?: Buffer;

  QRCodeBase64?: string;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  EncAlgorithm?: string;

  DecAlgorithm?: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  HRMVersionApi?: string;

  @Column({ length: 255, nullable: true })
  VersionCode?: string;

  @Column({ length: 255, nullable: true })
  keyUpdateAndroid?: string;

  @Column({ length: 255, nullable: true })
  keyUpdateIos?: string;

  @Column({ length: 255, nullable: true })
  UriCenter?: string;

  @Column({ length: 255, nullable: true })
  UriIdentity?: string;

  LogoPath?: string;

  TotalRow?: number;

  @OneToMany(() => Device, device => device.Customer)
  Devices?: Device[];

  @OneToMany(() => Log, log => log.Customer)
  Logs?: Log[];
} 