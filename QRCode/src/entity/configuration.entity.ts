import { Entity, Column } from 'typeorm';
import { BaseEntity, IBaseEntity } from './baseEntity/base.entity';

export interface IConfiguration extends IBaseEntity {
  NameAppAndroid?: string;
  NameAppIOS?: string;
  Source?: string;
  VersionAndroid?: string;
  VersionIOS?: string;
}

@Entity('Sys_Configuration')
export class Configuration extends BaseEntity {
  constructor(props?: IConfiguration) {
    const {
      NameAppAndroid,
      NameAppIOS,
      Source,
      VersionAndroid,
      VersionIOS,
      ...superItem
    } = props || {};

    super(superItem);

    Object.assign(this, {
      NameAppAndroid,
      NameAppIOS,
      Source,
      VersionAndroid,
      VersionIOS,
    });
  }

  @Column({ type: 'nvarchar', length: 255, nullable: true, unique: true })
  NameAppAndroid?: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true, unique: true })
  NameAppIOS?: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Source?: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  VersionAndroid?: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  VersionIOS?: string;
} 