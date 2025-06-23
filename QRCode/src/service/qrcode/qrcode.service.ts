import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { CustomerService } from "../../service/customer/customer.service";
import { arrayStrReplace } from "../../constant/crypt";

@Injectable()
export class QrcodeService {
  constructor(
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService
  ) {}

  /**
   * Giải mã QR code để lấy ID của customer
   * @param qrCode - Mã QR được mã hóa
   * @returns Mã ID đã được giải mã
   */
  decryptCode(qrCode: string): string {
    try {
      for (const item of arrayStrReplace) {
        qrCode = qrCode.replaceAll(item, "-");
      }

      return qrCode;
    } catch (error) {
      // Trả về chính mã QR nếu giải mã thất bại - có thể thay đổi theo yêu cầu
      return qrCode;
    }
  }

  /**
   * Mã hóa ID thành QR code
   * @param id - ID cần mã hóa
   * @returns Chuỗi mã hóa dùng làm QR code
   */
  encryptCode(guid: string, algorithm: number[]): string {
    try {
      const parts = guid.split("-");
      const length = parts.length - 1;
    
      for (let i = 0; i < length; i++) {
        const val = algorithm[i];
        const replacement = arrayStrReplace[val];
        parts[i] = parts[i] + replacement;
      }
    
      return parts.join("");
    } catch (error) {
      return "";
    }
  }

  /**
   * Tạo QR code cho customer
   * @param customerId - ID của customer
   * @returns Buffer chứa dữ liệu QR code
   */
  async generateQRCodeForCustomer(count: number): Promise<number[]> {
    try {
      const maxVal = arrayStrReplace.length;
      const result: number[] = [];
      for (let i = 0; i < count; i++) {
        const num = Math.floor(Math.random() * maxVal);
        result.push(num);
      }
      return result;
    } catch (error) {
      return null;
    }
  }
}
