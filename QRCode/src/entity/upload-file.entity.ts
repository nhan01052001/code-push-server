import { Entity, Column } from 'typeorm';
import { BaseEntity, IBaseEntity } from './baseEntity/base.entity';

export interface IUploadFile extends IBaseEntity {
  FileName?: string;
  FilePath?: string;
  FileType?: string;
  FileSize?: number;
}

@Entity('UploadFile')
export class UploadFile extends BaseEntity {
  constructor(props?: IUploadFile) {
    const {
      FileName,
      FilePath,
      FileType,
      FileSize,
      ...superItem
    } = props || {};

    super(superItem);

    Object.assign(this, {
      FileName,
      FilePath,
      FileType,
      FileSize,
    });
  }

  @Column({ type: 'nvarchar', length: 255 })
  FileName?: string;

  @Column({ type: 'nvarchar', length: 255 })
  FilePath?: string;

  @Column({ type: 'nvarchar', length: 100 })
  FileType?: string;

  @Column({ type: 'int' })
  FileSize?: number;
} 