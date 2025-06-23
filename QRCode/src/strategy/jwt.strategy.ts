import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Trả về thông tin từ payload JWT, bao gồm role nếu có
    return {
      accessKey: payload.sub,
      username: payload.username,
      role: payload.role || 'admin' // Mặc định là admin nếu không có trường role
    };
  }
}
