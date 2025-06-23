// crypto-utils.ts - File này có thể được sử dụng ở cả FE và BE

import * as CryptoJS from "crypto-js";

// Lớp tiện ích để mã hóa và giải mã dữ liệu
export class CryptoUtils {
  private static readonly IV_LENGTH = 16; // Độ dài IV cho AES (16 bytes)

  /**
   * Mã hóa dữ liệu sử dụng thuật toán AES-256
   * @param data Dữ liệu cần mã hóa (chuỗi JSON hoặc chuỗi thông thường)
   * @param secretKey Khóa bí mật dùng để mã hóa
   * @returns Chuỗi đã mã hóa (có thể truyền an toàn qua mạng)
   */
  static encrypt(data: any, secretKey: string): string {
    try {
      // Chuyển đổi dữ liệu sang dạng chuỗi nếu là object
      const dataString =
        typeof data === "object" ? JSON.stringify(data) : String(data);

      // Tạo IV ngẫu nhiên (Initialization Vector)
      const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);

      // Mã hóa dữ liệu
      const encrypted = CryptoJS.AES.encrypt(dataString, secretKey, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });

      // Kết hợp IV và dữ liệu đã mã hóa để có thể giải mã sau này
      // IV phải được lưu cùng với dữ liệu đã mã hóa
      const result = iv.toString(CryptoJS.enc.Hex) + ":" + encrypted.toString();

      return result;
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Could not encrypt data");
    }
  }

  /**
   * Giải mã dữ liệu đã được mã hóa
   * @param encryptedData Chuỗi đã mã hóa
   * @param secretKey Khóa bí mật dùng để giải mã (phải giống với khóa mã hóa)
   * @param parseJson Có chuyển đổi kết quả thành JSON object hay không
   * @returns Dữ liệu đã giải mã
   */
  static decrypt(
    encryptedData: string,
    secretKey: string,
    parseJson: boolean = false
  ): any {
    try {
      // Tách IV và dữ liệu đã mã hóa
      const [ivHex, encryptedText] = encryptedData.split(":");
      if (!ivHex || !encryptedText) {
        throw new Error("Invalid encrypted data format");
      }

      // Chuyển đổi IV từ hex sang WordArray
      const iv = CryptoJS.enc.Hex.parse(ivHex);

      // Giải mã
      const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });

      // Chuyển đổi kết quả thành chuỗi UTF-8
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      // Chuyển đổi thành JSON nếu được yêu cầu và có thể
      if (parseJson) {
        try {
          return JSON.parse(decryptedText);
        } catch (e) {
          // Nếu không thể parse JSON, trả về dạng chuỗi
          return decryptedText;
        }
      }

      return decryptedText;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Could not decrypt data");
    }
  }
}

// Các hàm tiện ích để dễ sử dụng
export function encryptData(data: any): string {
  return CryptoUtils.encrypt(data, process.env.ENCRYPTION_KEY || '');
}

export function decryptData(
  encryptedData: string,
  parseJson: boolean = false
): any {
  return CryptoUtils.decrypt(encryptedData, process.env.ENCRYPTION_KEY || '', parseJson);
}
