import { Controller, Post, Body } from '@nestjs/common';
import { DeviceService } from '../../service/device/device.service';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async registerDevice(@Body() deviceData: any) {
    try {
      // Kiểm tra xem thiết bị đã tồn tại chưa
      const existingDevice = await this.deviceService.findExistingDevice(
        deviceData.DeviceID,
        deviceData.UserIdHRM
      );

      if (!existingDevice) {
        // Nếu chưa tồn tại, tạo mới thiết bị
        await this.deviceService.create({
          ID: undefined, // ID sẽ được tạo tự động
          DeviceID: deviceData.DeviceID,
          UserIdHRM: deviceData.UserIdHRM,
          DeviceName: deviceData.DeviceName,
          DeviceOS: deviceData.DeviceOS,
          DeviceOSVersion: deviceData.DeviceOSVersion,
          DeviceModel: deviceData.DeviceModel,
          DateCreate: new Date(),
          DateUpdate: new Date(),
          DateLogin: new Date()
        });
      } else {
        // Nếu đã tồn tại, cập nhật thời gian đăng nhập
        await this.deviceService.updateLoginTime(existingDevice.ID);
      }

      return { success: true };
    } catch (error) {
      console.error('Error registering device:', error);
      return { success: false };
    }
  }
} 