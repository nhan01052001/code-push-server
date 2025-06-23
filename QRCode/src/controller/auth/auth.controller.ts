import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { AuthService } from '../../service/auth/auth.service';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { exec } from "child_process";

@Controller("auth")
export class AuthController {
    constructor(
      private jwtService: JwtService,
      private authService: AuthService
    ) {}
    
    @Get("helloword")
    async helloword() {
      // const script = 'cd "D:\NHAN\NewApp\HRM-AppPortal" && D: && git checkout 081248'
      // exec(`start cmd /c "${script}"`, (error, stdout, stderr) => {
      //   if (error) {
      //     console.error(`Lỗi: ${error.message}`);
      //     return;
      //   }
      //   if (stderr) {
      //     console.error(`stderr: ${stderr}`);
      //     return;
      //   }
      //   console.log(`stdout: ${stdout}`);
      // });
      return "Hello Word";
    }

    @Post('github')
    async loginWithGithub(@Body() body: { access_token: string }) {
      const { access_token } = body;

      const userRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const githubUser = userRes.data;

      // Optionally: Lưu user vào DB

      const payload = {
        sub: githubUser.id,
        username: githubUser.login,
        avatar: githubUser.avatar_url,
      };

      const jwt = this.jwtService.sign(payload);

      return { token: jwt };
    }

    @Post("github-token")
    async exchangeAccessKey(@Body("accessKey") accessKey: string) {
      const jwt = await this.authService.generateJwtFromAccessKey(accessKey);
      return { jwt };
    }

    @Post("pe-login")
    async loginWithPE(@Body() credentials: { username: string; password: string }) {
      // Kiểm tra thông tin đăng nhập PE
      if (credentials.username === "pe_vnr" && credentials.password === "vnr@@123") {
        // Tạo payload với thông tin PE và quyền hạn
        const payload = {
          sub: "pe_user",
          username: credentials.username,
          role: "pe"
        };

        // Tạo JWT với thời hạn 1 giờ
        const jwt = this.jwtService.sign(payload, { expiresIn: "1h" });

        return { 
          jwt,
          role: "pe",
          message: "Đăng nhập thành công"
        };
      }

      // Nếu thông tin đăng nhập không đúng
      return {
        error: "UNAUTHORIZED",
        message: "Tài khoản hoặc mật khẩu không chính xác"
      };
    }
}
