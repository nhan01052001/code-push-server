import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../../entities.provider';
import { CustomerController } from '../../controller/customer/customer.controller';
import { CustomerService } from '../../service/customer/customer.service';
import { QrcodeModule } from '../qrcode/qrcode.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    forwardRef(() => QrcodeModule)
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}