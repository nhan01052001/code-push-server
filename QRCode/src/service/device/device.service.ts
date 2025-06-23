import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../entity/device.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find();
  }

  async findById(id: string): Promise<Device> {
    return this.deviceRepository.findOne({ where: { ID: id } });
  }

  async findExistingDevice(deviceID: string, userIdHRM: string): Promise<Device> {
    return this.deviceRepository.findOne({
      where: {
        DeviceID: deviceID,
        UserIdHRM: userIdHRM
      }
    });
  }

  async create(deviceData: Partial<Device>): Promise<Device> {
    const device = this.deviceRepository.create(deviceData);
    return this.deviceRepository.save(device);
  }

  async update(id: string, deviceData: Partial<Device>): Promise<void> {
    await this.deviceRepository.update(id, deviceData);
  }

  async updateLoginTime(id: string): Promise<void> {
    await this.deviceRepository.update(id, {
      DateLogin: new Date(),
      DateUpdate: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    await this.deviceRepository.delete(id);
  }

  async findByUser(userIdHRM: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { UserIdHRM: userIdHRM }
    });
  }
} 