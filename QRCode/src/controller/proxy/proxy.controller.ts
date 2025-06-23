import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Response } from "express";
import { lastValueFrom } from "rxjs";
import { ProxyService } from "../../service/proxy/proxy.service";

@Controller("proxy")
export class ProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly proxyService: ProxyService
  ) {}

  @Get("image-proxy")
  async proxyImage(@Query("url") imageUrl: string, @Res() res: Response) {
    try {
      const response$ = this.httpService.get(imageUrl, {
        responseType: "stream",
      });

      const response = await lastValueFrom(response$);
      res.setHeader("Content-Type", response.headers["content-type"]);
      response.data.pipe(res);
    } catch (error) {
      res.status(500).send("Unable to fetch image");
    }
  }

  @Get("getConfigDashboard")
  async getConfigDashboard(@Query("url") url: string) {
    try {
      return await this.proxyService.getConfigDashboard(url);
    } catch (error) {
      return null;
    }
  }

  @Post("getLang")
  async getLang(
    @Body() data: { urlMain: string; urlPortal: string; type: string }
  ) {
    try {
      return await this.proxyService.getLang(
        data.urlMain,
        data.urlPortal,
        data.type
      );
    } catch (error) {
      return null;
    }
  }
}
