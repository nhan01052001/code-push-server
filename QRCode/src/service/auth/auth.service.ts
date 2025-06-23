import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import * as jwt from "jsonwebtoken";
import { ErrorResponse } from "../../util/error/error-response.error";
import { decryptData } from "../../util/crypto-utils";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateJwtFromAccessKey(accessKey: string): Promise<string> {
    const decryptAccessKey = decryptData(accessKey);
    
    // 🟡 (Optional) Gọi API đến CodePush để xác thực accessKey
    // Hoặc nếu bạn tin tưởng accessKey được frontend gửi đúng thì skip bước này
    const isValid = await this.verifyAccessKeyWithCodePush(decryptAccessKey);
    if (!isValid) {
      throw new ErrorResponse({
        ...new BadRequestException("Invalid access key"),
        errorCode: "FAIL",
      });
    }

    // ✅ Tạo JWT
    const payload = { sub: decryptAccessKey };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  }

  private async verifyAccessKeyWithCodePush(
    accessKey: string
  ): Promise<boolean> {
    try {
      // Lấy URL từ biến môi trường hoặc dùng URL mặc định
      const apiUrl = process.env.CODE_PUSH_API_URL || 'https://codepush.vnresource.net:2080';
      
      // Gọi đến CodePush API bảo vệ bởi accessKey
      const response = await axios.get(`${apiUrl}/apps`, {
        headers: {
          Authorization: `Bearer ${accessKey}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
