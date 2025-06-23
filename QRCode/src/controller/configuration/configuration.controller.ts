import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Res,
} from "@nestjs/common";
import { ConfigurationService } from "../../service/configuration/configuration.service";
import { Configuration } from "../../entity/configuration.entity";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";

@Controller("configuration")
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get("configByApp")
  async configByApp(
    @Query("isAndroid") isAndroid: boolean,
    @Query("appName") appName: string
  ) {
    try {
      return await this.configurationService.configByApp(isAndroid, appName);
    } catch (error) {
      return null;
    }
  }

  @Post("update/:id")
  async update(
    @Param("id") id: string,
    @Body() configuration: Partial<Configuration>
  ): Promise<Configuration | null> {
    return await this.configurationService.update(id, configuration);
  }
}
