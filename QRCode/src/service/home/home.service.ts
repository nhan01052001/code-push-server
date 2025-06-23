import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "../../entity/customer.entity";
import { LinkDto } from "../../dto/home/link.dto";
import { CustomerInfo } from "../../interface/customer-info.interface";

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>
  ) {}

  /**
   * Service lấy thông tin khách hàng dựa trên các URI
   */
  async getInfoCustomer(linkDto: LinkDto): Promise<CustomerInfo> {
    // Khởi tạo đối tượng kết quả trống
    const result: CustomerInfo = {};

    // Kiểm tra model có đầy đủ thông tin không
    if (
      linkDto &&
      linkDto.UriPor &&
      linkDto.UriHR &&
      linkDto.UriSys &&
      linkDto.UriMain
    ) {
      try {
        // Tìm kiếm khách hàng theo các URI
        const customer = await this.customerRepository.findOne({
          where: {
            UriPor: linkDto.UriPor,
            UriHR: linkDto.UriHR,
            UriSys: linkDto.UriSys,
            UriMain: linkDto.UriMain,
          },
        });

        // Nếu tìm thấy khách hàng, lấy thông tin và trả về
        if (customer) {
          return {
            ID: customer.ID,
            UriHR: customer.UriHR,
            UriMain: customer.UriMain,
            UriPor: customer.UriPor,
            UriSys: customer.UriSys,
            UriCenter: customer.UriCenter,
            UriIdentity: customer.UriIdentity,
            CusCode: customer.CusCode,
            CusName: customer.CusName,
            VersionCode: customer.VersionCode,
            keyUpdateIos: customer.keyUpdateIos,
            keyUpdateAndroid: customer.keyUpdateAndroid,
          };
        }
      } catch (error) {
        // Bắt exception và trả về đối tượng rỗng
        return result;
      }
    }

    // Trả về đối tượng rỗng nếu không tìm thấy hoặc không đủ thông tin
    return result;
  }
} 