import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, Equal, IsNull } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import * as QRCode from "qrcode";
import * as path from "path";
import * as fs from "fs";
import { createCanvas, loadImage } from "canvas";

import { Customer } from "../../entity/customer.entity";
import { QrcodeService } from "../qrcode/qrcode.service";
import { ErrorResponse } from "../../util/error/error-response.error";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @Inject(forwardRef(() => QrcodeService))
    private readonly qrcodeService: QrcodeService
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ where: { IsDelete: IsNull() } });
  }

  async findById(id: string): Promise<Customer> {
    return this.customerRepository.findOne({
      where: { ID: id, IsDelete: IsNull() },
    });
  }

  async findByCode(code: string): Promise<Customer> {
    return this.customerRepository.findOne({
      where: { CusCode: code, IsDelete: IsNull() },
    });
  }

  async countByCode(code: string, excludeId: string): Promise<number> {
    return this.customerRepository.count({
      where: {
        CusCode: code,
        ID: Not(Equal(excludeId)),
        IsDelete: IsNull(),
      },
    });
  }

  async create(customerData: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepository.create(customerData);
    return this.customerRepository.save(customer);
  }

  async update(id: string, customerData: Partial<Customer>): Promise<void> {
    await this.customerRepository.update(id, customerData);
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async getProducts(filter: any): Promise<any[]> {
    // Implement logic to get products based on the filter
    // This would depend on your database schema and relationships
    const query = this.customerRepository.createQueryBuilder("customer");

    if (filter.CusCode) {
      query
        .where("customer.CusCode = :cusCode", { cusCode: filter.CusCode })
        .andWhere({ IsDelete: IsNull() });
    }

    // Thêm các điều kiện lọc khác nếu cần

    const customers = await query.getMany();

    return Promise.all(
      customers.map(async (customer) => {
        // Đọc file QR code và chuyển sang base64
        const qrCodePath = path.join(
          process.cwd(),
          "public",
          "qrcodes",
          `${customer.ID}.png`
        );
        let qrCodeBase64 = null;

        try {
          if (fs.existsSync(qrCodePath)) {
            const qrBuffer = fs.readFileSync(qrCodePath);
            qrCodeBase64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;
          }
        } catch (error) {
          qrCodeBase64 = null;
        }

        return {
          ID: customer.ID,
          CusCode: customer.CusCode,
          CusName: customer.CusName,
          UriHR: customer.UriHR,
          UriMain: customer.UriMain,
          UriPor: customer.UriPor,
          UriSys: customer.UriSys,
          UriCenter: customer.UriCenter,
          UriIdentity: customer.UriIdentity,
          VersionCode: customer.VersionCode,
          keyUpdateAndroid: customer.keyUpdateAndroid,
          keyUpdateIos: customer.keyUpdateIos,
          QRCodeBase64: qrCodeBase64,
          DecAlgorithm: customer.DecAlgorithm,
        };
      })
    );
  }

  async getAllProducts(filter: any): Promise<any> {
    // Lấy tham số phân trang
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Tạo query với queryBuilder
    const query = this.customerRepository.createQueryBuilder("customer").where({ IsDelete: IsNull() });

    // Thêm điều kiện tìm kiếm nếu có
    if (filter.search) {
      query
        .where(
          "customer.CusCode LIKE :search OR customer.CusName LIKE :search OR customer.VersionCode LIKE :search",
          { search: `%${filter.search}%` }
        );
    }

    // Đếm tổng số bản ghi trước khi phân trang
    const total = await query.getCount();

    // Thêm phân trang
    query.skip(skip).take(pageSize);

    // Thêm sắp xếp
    query.orderBy("customer.DateCreate", "DESC");

    // Lấy dữ liệu
    const customers = await query.getMany();

    // Chuyển đổi dữ liệu và thêm QR code base64
    const items = await Promise.all(
      customers.map(async (customer) => {
        // Đọc file QR code và chuyển sang base64
        const qrCodePath = path.join(
          process.cwd(),
          "public",
          "qrcodes",
          `${customer.ID}.png`
        );
        let qrCodeBase64 = null;

        try {
          if (fs.existsSync(qrCodePath)) {
            const qrBuffer = fs.readFileSync(qrCodePath);
            qrCodeBase64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;
          }
        } catch (error) {
          qrCodeBase64 = null;
        }

        return {
          ID: customer.ID,
          CusCode: customer.CusCode,
          CusName: customer.CusName,
          UriHR: customer.UriHR,
          UriMain: customer.UriMain,
          UriPor: customer.UriPor,
          UriSys: customer.UriSys,
          UriCenter: customer.UriCenter,
          UriIdentity: customer.UriIdentity,
          VersionCode: customer.VersionCode,
          keyUpdateAndroid: customer.keyUpdateAndroid,
          keyUpdateIos: customer.keyUpdateIos,
          QRCodeBase64: qrCodeBase64,
          DecAlgorithm: customer.EncAlgorithm ? this.qrcodeService.encryptCode(customer.ID, customer.EncAlgorithm.trim().split("").map(Number)) : null,
        };
      })
    );

    // Trả về kết quả với metadata phân trang
    return {
      items,
      metadata: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getQRByURI(uri: string): Promise<any> {
    const customer = await this.customerRepository.findOne({
      where: [
        { UriHR: uri },
        { UriMain: uri },
        { UriPor: uri },
        { UriSys: uri },
        { UriCenter: uri },
        { UriIdentity: uri },
      ],
    });

    if (!customer) {
      return null;
    }

    return {
      ID: customer.ID,
      CusCode: customer.CusCode,
      CusName: customer.CusName,
      UriHR: customer.UriHR,
      UriMain: customer.UriMain,
      UriPor: customer.UriPor,
      UriSys: customer.UriSys,
      UriCenter: customer.UriCenter,
      UriIdentity: customer.UriIdentity,
      VersionCode: customer.VersionCode,
      keyUpdateAndroid: customer.keyUpdateAndroid,
      keyUpdateIos: customer.keyUpdateIos,
    };
  }

  async getInfoCustomer(link: string): Promise<any> {
    // Implement logic to get customer info based on link
    // This is likely similar to getQRByURI but might have different formatting
    const customer = await this.getQRByURI(link);
    return customer;
  }

  async createCustomer(
    customerData: Customer
  ): Promise<{ status: string; data?: Customer }> {
    // Kiểm tra nếu đang cập nhật (có ID)
    if (customerData.ID) {
      // Kiểm tra trùng mã khách hàng
      const duplicates = await this.countByCode(
        customerData.CusCode,
        customerData.ID
      );
      if (duplicates > 1) {
        return { status: "EXIST" };
      }

      let updatedFields: Partial<Customer> = {
        CusCode: customerData.CusCode,
        CusName: customerData.CusName,
        UriHR: customerData.UriHR,
        UriMain: customerData.UriMain,
        UriPor: customerData.UriPor,
        UriSys: customerData.UriSys,
        UriCenter: customerData.UriCenter,
        UriIdentity: customerData.UriIdentity,
        VersionCode: customerData.VersionCode,
        keyUpdateAndroid: customerData.keyUpdateAndroid,
        keyUpdateIos: customerData.keyUpdateIos,
        DateUpdate: new Date(),
      };

      // Kiểm tra nếu có logo mới được cung cấp
      if (customerData.LogoPath) {
        // Lấy thông tin khách hàng hiện tại
        const existingCustomer = await this.findById(customerData.ID);
        if (!existingCustomer) {
          return { status: "FAIL" };
        }

        // Lấy dữ liệu mã hóa hiện tại
        let encryptedData = null;
        if (existingCustomer.EncAlgorithm) {
          encryptedData = existingCustomer.EncAlgorithm;
        } else {
          const rndChar: number[] =
            await this.qrcodeService.generateQRCodeForCustomer(
              customerData.ID.toString().split("-").length - 1
            );
          encryptedData = this.qrcodeService.encryptCode(
            customerData.ID,
            rndChar
          );
          updatedFields.EncAlgorithm = rndChar.join("");
        }

        // Tạo QR Code mới với logo mới
        const qrBuffer = await this.generateQRCode(
          encryptedData,
          customerData.LogoPath
        );

        // Cập nhật QR code trong cơ sở dữ liệu
        updatedFields.QRCode = qrBuffer;

        // Cập nhật file QR code
        const qrCodePath = path.join(
          process.cwd(),
          "public",
          "qrcodes",
          `${customerData.ID}.png`
        );
        fs.mkdirSync(path.dirname(qrCodePath), { recursive: true });
        fs.writeFileSync(qrCodePath, qrBuffer);
      }

      // Cập nhật khách hàng
      await this.update(customerData.ID, updatedFields);

      // Lấy dữ liệu khách hàng sau khi cập nhật
      const updatedCustomer = await this.findById(customerData.ID);
      if (updatedCustomer.QRCode && updatedCustomer.QRCode.toString("base64")) {
        updatedCustomer.QRCodeBase64 = `data:image/png;base64,${updatedCustomer.QRCode.toString("base64")}`;
      }
      return { status: "SUCCESS", data: updatedCustomer };
    } else {
      // Kiểm tra trùng mã khách hàng
      const existingCustomer = await this.findByCode(customerData.CusCode);
      if (existingCustomer) {
        return { status: "EXIST" };
      }

      // Tạo mới khách hàng
      const customerId = uuidv4();
      const rndChar: number[] =
        await this.qrcodeService.generateQRCodeForCustomer(
          customerId.toString().split("-").length - 1
        );
      const encryptedData = this.qrcodeService.encryptCode(customerId, rndChar);

      // Tạo QR Code
      const qrBuffer = await this.generateQRCode(
        encryptedData,
        customerData.LogoPath
      );

      // Chuyển đổi buffer thành base64
      const qrCodeBase64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;

      // Khởi tạo đối tượng customer để lưu
      const newCustomer = new Customer({
        ID: customerId,
        CusCode: customerData.CusCode,
        CusName: customerData.CusName,
        UriHR: customerData.UriHR,
        UriMain: customerData.UriMain,
        UriPor: customerData.UriPor,
        UriSys: customerData.UriSys,
        UriCenter: customerData.UriCenter,
        UriIdentity: customerData.UriIdentity,
        VersionCode: customerData.VersionCode,
        keyUpdateAndroid: customerData.keyUpdateAndroid,
        keyUpdateIos: customerData.keyUpdateIos,
        EncAlgorithm: rndChar.join(""),
        QRCode: qrBuffer,
        DateCreate: new Date(),
        DateUpdate: new Date(),
      });

      // Lưu thông tin khách hàng
      const savedCustomer = await this.create(newCustomer);

      // Lưu QR Code vào thư mục
      const qrCodePath = path.join(
        process.cwd(),
        "public",
        "qrcodes",
        `${customerId}.png`
      );
      fs.mkdirSync(path.dirname(qrCodePath), { recursive: true });
      fs.writeFileSync(qrCodePath, qrBuffer);

      // Thêm QRCodeBase64 vào đối tượng trả về
      savedCustomer.QRCodeBase64 = qrCodeBase64;

      return { status: "SUCCESS", data: savedCustomer };
    }
  }

  private async generateQRCode(
    data: string,
    logoPath?: string
  ): Promise<Buffer> {
    try {
      if (!logoPath) {
        // Giữ nguyên cách tạo QR code cũ nếu không có hình
        return await QRCode.toBuffer(data, {
          errorCorrectionLevel: "Q",
          scale: 10,
          margin: 1,
        });
      } else {
        // Sử dụng kết hợp qrcode và canvas trực tiếp
        const canvas = createCanvas(400, 400);
        const tempFile = path.join(process.cwd(), "temp_qr.png");

        // Tạo QR code trước
        await QRCode.toFile(tempFile, data, {
          errorCorrectionLevel: "H", // Mức sửa lỗi cao hơn khi có logo
          scale: 10,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });

        // Đọc QR code và logo
        const ctx = canvas.getContext("2d");

        // Đọc QR code
        const qrImage = await loadImage(tempFile);
        ctx.drawImage(qrImage, 0, 0, 400, 400);

        // Đọc logo và vẽ ở giữa
        try {
          const logo = await loadImage(logoPath);
          // Đặt logo ở giữa QR code, chiếm khoảng 30% kích thước
          const logoSize = 120; // 30% của 400
          const logoX = (400 - logoSize) / 2;
          const logoY = (400 - logoSize) / 2;

          // Vẽ nền trắng cho logo
          ctx.fillStyle = "white";
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

          // Vẽ logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        } catch (logoError) {
          console.warn("Không thể tải logo:", logoError);
          // Tiếp tục nếu không thể tải logo
        }

        // Lưu kết quả vào file
        const out = fs.createWriteStream(tempFile);
        const stream = canvas.createPNGStream();

        await new Promise<void>((resolve, reject) => {
          stream.pipe(out);
          out.on("finish", () => resolve());
          out.on("error", reject);
        });

        // Đọc file QR code và trả về buffer
        const qrBuffer = fs.readFileSync(tempFile);

        // Xóa file tạm
        fs.unlinkSync(tempFile);

        return qrBuffer;
      }
    } catch (error) {
      throw new ErrorResponse({
        name: "QRCodeError",
        message: error.message || "Lỗi khi tạo QR Code",
        errorCode: error.errorCode || "QRCODE_ERROR",
      });
    }
  }

  async deleteQRCode(id: string): Promise<{ status: string }> {
    const rsDelete = await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set({ IsDelete: true })
      .where("ID = :id", { id })
      .andWhere({ IsDelete: IsNull() })
      .execute();

    if (rsDelete.affected === 0) {
      throw new ErrorResponse({
        name: "QRCodeError",
        message: "Không tìm thấy mã QR Code",
        errorCode: "QRCODE_NOT_FOUND",
      });
    }

    return { status: "SUCCESS" };
  }
}
