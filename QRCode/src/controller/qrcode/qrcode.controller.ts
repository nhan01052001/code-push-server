import { Controller, Get, Post, Body, Param, Res, Query, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { CustomerService } from "../../service/customer/customer.service";
import { QrcodeService } from "../../service/qrcode/qrcode.service";
import * as QRCode from "qrcode";
import * as fs from "fs";
import * as path from "path";
import { createCanvas, loadImage } from "canvas";
import jsQR from "jsqr";

@Controller("api")
export class QRCodeController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly qrcodeService: QrcodeService
  ) {}

  @Get("AppCustomer")
  async getCustomerByQRCode(@Query("QRCode") qrCode: string) {
    try {
      // Giải mã QR code để lấy ID
      const decryptedId = this.qrcodeService.decryptCode(qrCode);

      // Tìm khách hàng theo ID
      const customer = await this.customerService.findById(decryptedId);

      if (!customer) {
        return {};
      }

      return {
        ID: customer.ID,
        CusName: customer.CusName,
        UriHR: customer.UriHR,
        UriMain: customer.UriMain,
        UriPor: customer.UriPor,
        UriSys: customer.UriSys,
        VersionCode: customer.VersionCode,
        keyUpdateAndroid: customer.keyUpdateAndroid,
        keyUpdateIos: customer.keyUpdateIos,
        UriCenter: customer.UriCenter,
        UriIdentity: customer.UriIdentity,
      };
    } catch (error) {
      return {};
    }
  }

  @Get("infoByURL")
  async getInfoCustomer(@Query("link") link: string) {
    try {
      const customer = await this.customerService.getInfoCustomer(link);
      return customer;
    } catch (error) {
      return {};
    }
  }

  @Get("GenerateQR/:id")
  async generateQRCode(@Param("id") id: string, @Res() res: Response) {
    try {
      // Mã hóa ID
      const encryptedId = this.qrcodeService.encryptCode(id, [0, 1, 2, 3, 4]);

      // Tạo QR code
      const qrCodeBuffer = await QRCode.toBuffer(encryptedId, {
        errorCorrectionLevel: "Q",
        margin: 1,
        scale: 8,
      });

      res.set("Content-Type", "image/png");
      res.send(qrCodeBuffer);
    } catch (error) {
      res.status(500).send("Error generating QR code");
    }
  }

  /**
   * Giải mã QR code từ chuỗi base64
   */
  @Post("AppCustomer/Post")
  async decodeQRCodeFromBase64(@Body() data: { base64String: string }, @Res() res: Response) {
    let qrCodeText = '';
    
    try {
      if (!data || !data.base64String) {
        // Nếu không có base64String, trả về kết quả rỗng
        return this.getCustomerByQRCode('');
      }

      // Lấy chuỗi base64 từ request
      let base64String = data.base64String;
      
      // Nếu có header data:image, tách lấy phần sau dấu phẩy
      if (base64String.includes(',')) {
        base64String = base64String.split(',')[1];
      }

      // Chuyển base64 thành buffer (tương tự như Convert.FromBase64String trong C#)
      const imageBuffer = Buffer.from(base64String, 'base64');

      // Đọc hình ảnh từ buffer (tương tự như Bitmap.FromStream trong C#)
      const image = await loadImage(imageBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Sử dụng jsQR để giải mã QR code (tương tự như barcodeReader.Decode trong C#)
      const barcodeResult = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      // Kiểm tra kết quả và lấy nội dung QR code
      if (barcodeResult) {
        qrCodeText = barcodeResult.data;
      }

      // Gọi phương thức Get với nội dung QR code (tương tự như return Get(qrCode) trong C#)
      const customerResult = await this.getCustomerByQRCode(qrCodeText);
      return res.status(HttpStatus.OK).json(customerResult);
      
    } catch (error) {
      // Nếu có lỗi, thử gọi phương thức Get với qrCode đã giải mã được (nếu có)
      // Hoặc trả về đối tượng rỗng nếu chưa giải mã được
      try {
        const customerResult = await this.getCustomerByQRCode(qrCodeText);
        return res.status(HttpStatus.OK).json(customerResult);
      } catch {
        // Nếu cả hai cách đều thất bại, trả về đối tượng rỗng
        return res.status(HttpStatus.OK).json({});
      }
    }
  }
}
