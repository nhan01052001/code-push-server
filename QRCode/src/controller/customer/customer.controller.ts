import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  UnauthorizedException,
  Request,
} from "@nestjs/common";
import { CustomerService } from "../../service/customer/customer.service";
import { Response } from "express";
import { Customer } from "../../entity/customer.entity";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

@Controller("customer")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Post("create")
  @UseInterceptors(FileInterceptor("logo"))
  async createCustomer(
    @Request() req,
    @Body("data") data: string,
    @UploadedFile() logo: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      // Kiểm tra role PE
      if (req.user && req.user.role === 'pe') {
        return res.status(403).send({
          status: "FAIL",
          error: "Tài khoản PE không có quyền tạo mới QR Code"
        });
      }

      let logoPath = null;
      let customerData: Customer;

      try {
        customerData = JSON.parse(data);
      } catch (e) {
        return res.status(400).send({
          status: "FAIL",
          error: "Dữ liệu khách hàng không hợp lệ",
        });
      }

      // Nếu có logo, lưu tạm thời
      if (logo) {
        const tempDir = os.tmpdir();
        logoPath = path.join(
          tempDir,
          `temp_logo_${Date.now()}${path.extname(logo.originalname)}`
        );
        fs.writeFileSync(logoPath, logo.buffer);
        customerData.LogoPath = logoPath;
      }

      try {
        const result = await this.customerService.createCustomer(customerData);

        // Xóa file tạm sau khi đã sử dụng
        if (logoPath && fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }

        return res.status(200).send(result);
      } catch (error) {
        // Xóa file tạm nếu có lỗi
        if (logoPath && fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }

        throw error;
      }
    } catch (error) {
      return res.status(400).send({
        status: "FAIL",
        error: error?.message ?? "Lỗi không xác định",
      });
    }
  }

  @Get("get/:id")
  async getCustomerById(@Param("id") id: string) {
    try {
      const customer = await this.customerService.findById(id);
      if (!customer) {
        return null;
      }

      return {
        ID: customer.ID,
        CusCode: customer.CusCode,
        CusName: customer.CusName,
        UriSys: customer.UriSys,
        UriPor: customer.UriPor,
        UriMain: customer.UriMain,
        UriHR: customer.UriHR,
        UriCenter: customer.UriCenter,
        UriIdentity: customer.UriIdentity,
        VersionCode: customer.VersionCode,
        keyUpdateIos: customer.keyUpdateIos,
        keyUpdateAndroid: customer.keyUpdateAndroid,
      };
    } catch (error) {
      console.error("Error getting customer:", error);
      return null;
    }
  }

  @Post("products")
  async getProducts(@Body() filter: any) {
    try {
      return await this.customerService.getProducts(filter);
    } catch (error) {
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("allProducts")
  async getAllProducts(
    @Query("page") page: number = 1,
    @Query("pageSize") pageSize: number = 10,
    @Query("search") search?: string
  ) {
    try {
      return await this.customerService.getAllProducts({
        page,
        pageSize,
        search,
      });
    } catch (error) {
      return {
        items: [],
        metadata: {
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        },
      };
    }
  }

  @Get("qrByUri")
  async getQRByURI(@Query("uri") uri: string) {
    try {
      return await this.customerService.getQRByURI(uri);
    } catch (error) {
      return null;
    }
  }

  @Post("infoCustomer")
  async getInfoCustomer(@Body() linkModel: any) {
    try {
      return await this.customerService.getInfoCustomer(linkModel.Link);
    } catch (error) {
      return null;
    }
  }

  @Get("qrcode/:id")
  async getQRCode(@Param("id") id: string, @Res() res: Response) {
    try {
      const customer = await this.customerService.findById(id);
      if (!customer || !customer.QRCode) {
        return res.status(404).send("QR Code not found");
      }

      res.set("Content-Type", "image/png");
      return res.send(customer.QRCode);
    } catch (error) {
      return res.status(500).send("Error retrieving QR code");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("deleteQRCode")
  async deleteQRCode(
    @Request() req,
    @Body() body: { ID: string }, 
    @Res() res: Response
  ) {
    try {
      // Kiểm tra role PE
      if (req.user && req.user.role === 'pe') {
        return res.status(403).send({
          status: "FAIL",
          error: "Tài khoản PE không có quyền xóa QR Code"
        });
      }

      const result = await this.customerService.deleteQRCode(body.ID);
      
      return res.status(200).send({
        status: result.status,
        message: "Đã xoá QR Code thành công"
      });
    } catch (error) {
      return res.status(500).send({
        status: "FAIL",
        error: error?.message || "Lỗi khi xoá QR Code"
      });
    }
  }
}
