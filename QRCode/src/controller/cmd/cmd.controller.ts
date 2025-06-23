import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Headers
} from "@nestjs/common";
import { CmdService } from "../../service/cmd/cmd.service";

@Controller("cmd")
export class CmdController {
  constructor(private readonly cmdService: CmdService) {}

  @Post("run")
  async runCommand(@Body() body: { command: string }) {
    if (!body.command) {
      throw new HttpException(
        "Vui lòng cung cấp lệnh để chạy",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const result = await this.cmdService.runCommand(body.command);

      return {
        success: result.success,
        message: result.success ? "Đã chạy lệnh thành công" : "Lệnh thất bại",
        result: result.result,
      };
    } catch (error) {
      throw new HttpException(
        `Lỗi khi chạy lệnh: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("update-app")
  async runCommandWithWindow(
    @Body()
    body: {
      iosApp?: string;
      iosDeployment?: string;
      iosDescription?: string;
      androidApp?: string;
      androidDeployment?: string;
      androidDescription?: string;
      branch: string;
      accessKey: string;
    }
  ) {
    try {
      const result = await this.cmdService.runCommandWithVisibleWindow(body);

      return {
        success: result.success,
        message: result.success
          ? "Đã mở cửa sổ terminal và chạy lệnh"
          : "Có lỗi khi mở cửa sổ terminal",
        result: result.result,
      };
    } catch (error) {
      throw new HttpException(
        `Lỗi khi chạy lệnh: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
