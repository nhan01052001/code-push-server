import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './orm.config';

// Các module sẽ được thêm sau khi tạo
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './module/customer/customer.module';
import { DeviceModule } from './module/device/device.module';
import { LogModule } from './module/log/log.module';
import { UploadModule } from './module/upload/upload.module';
import { QrcodeModule } from './module/qrcode/qrcode.module';
import { HomeModule } from './module/home/home.module';
import { CmdModule } from './module/cmd/cmd.module';
import { ConfigurationModule } from './module/configuration/configuration.module';
import { entities } from './entities.provider';
import { ProxyModule } from './module/proxy/proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ormConfig),
    AuthModule,
    CustomerModule,
    DeviceModule,
    LogModule,
    UploadModule,
    QrcodeModule,
    HomeModule,
    CmdModule,
    ConfigurationModule,
    ProxyModule,
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 