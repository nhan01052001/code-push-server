import { Controller, Post, Body, HttpStatus } from "@nestjs/common";
import { LinkDto } from "../../dto/home/link.dto";
import { HomeService } from "../../service/home/home.service";
import { CustomerInfo } from "../../interface/customer-info.interface";

@Controller("Home")
export class HomeController {
  constructor(private homeService: HomeService) {}

  /**
   * API lấy thông tin khách hàng dựa trên các URI
   */
  @Post("getInfoCustomer")
  async getInfoCustomer(@Body() linkDto: LinkDto): Promise<CustomerInfo> {
    return this.homeService.getInfoCustomer(linkDto);
  }
} 