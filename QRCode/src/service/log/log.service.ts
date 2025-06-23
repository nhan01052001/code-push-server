import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../../entity/log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async findAll(): Promise<Log[]> {
    return this.logRepository.find();
  }

  async findById(id: string): Promise<Log> {
    return this.logRepository.findOne({ where: { ID: id } });
  }

  async create(logData: Partial<Log>): Promise<Log> {
    const log = this.logRepository.create(logData);
    return this.logRepository.save(log);
  }

  async update(id: string, logData: Partial<Log>): Promise<void> {
    await this.logRepository.update(id, logData);
  }

  async delete(id: string): Promise<void> {
    await this.logRepository.delete(id);
  }

  async findByFilter(filter: any): Promise<Log[]> {
    const query = this.logRepository.createQueryBuilder('log');
    
    if (filter.DeviceID) {
      query.andWhere('log.DeviceID = :deviceID', { deviceID: filter.DeviceID });
    }
    
    if (filter.UserIdHRM) {
      query.andWhere('log.UserIdHRM = :userIdHRM', { userIdHRM: filter.UserIdHRM });
    }
    
    if (filter.Action) {
      query.andWhere('log.Action = :action', { action: filter.Action });
    }
    
    if (filter.FromDate) {
      query.andWhere('log.DateLog >= :fromDate', { fromDate: new Date(filter.FromDate) });
    }
    
    if (filter.ToDate) {
      query.andWhere('log.DateLog <= :toDate', { toDate: new Date(filter.ToDate) });
    }
    
    query.orderBy('log.DateLog', 'DESC');
    
    if (filter.Limit) {
      query.take(filter.Limit);
    }
    
    return query.getMany();
  }

  async findByUser(userIdHRM: string): Promise<Log[]> {
    return this.logRepository.find({
      where: { UserIdHRM: userIdHRM },
      order: { DateLog: 'DESC' }
    });
  }

  async findByDevice(deviceID: string): Promise<Log[]> {
    return this.logRepository.find({
      where: { DeviceID: deviceID },
      order: { DateLog: 'DESC' }
    });
  }
} 