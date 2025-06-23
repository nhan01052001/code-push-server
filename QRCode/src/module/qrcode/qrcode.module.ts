import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QrcodeService } from "../../service/qrcode/qrcode.service";
import { QRCodeController } from "../../controller/qrcode/qrcode.controller";
import { entities } from "../../entities.provider";
import { CustomerModule } from "../customer/customer.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    forwardRef(() => CustomerModule),
  ],
  controllers: [QRCodeController],
  providers: [QrcodeService],
  exports: [QrcodeService],
})
export class QrcodeModule {}
