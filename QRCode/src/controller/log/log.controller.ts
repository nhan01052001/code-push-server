import { Controller, Post, Body } from '@nestjs/common';
import { LogService } from '../../service/log/log.service';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  async logActivity(@Body() logData: any) {
    try {
      // Tạo log mới
      await this.logService.create({
        ID: undefined, // ID sẽ được tạo tự động
        DeviceID: logData.DeviceID,
        UserIdHRM: logData.UserIdHRM,
        Action: logData.Action,
        Description: logData.Description,
        DateLog: new Date(),
        DateCreate: new Date(),
        DateUpdate: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { success: false };
    }
  }

  @Post('list')
  async getLogs(@Body() filter: any) {
    try {
      // Tìm logs theo các tiêu chí
      const logs = await this.logService.findByFilter(filter);
      return logs;
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }
} 