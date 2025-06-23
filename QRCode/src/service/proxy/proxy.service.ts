import { Injectable, Controller, Get, Query, Res } from "@nestjs/common";
import axios from "axios";
import { HttpService } from "@nestjs/axios";
import * as xml2js from "xml2js";

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async getConfigDashboard(url: string): Promise<any | null> {
    const response = await axios.get(url);
    return response.data;
  }

  async getLang(
    urlMain: string,
    urlPortal: string,
    type: string
  ): Promise<any | null> {
    try {
      // Thêm đuôi vào URL
      const xmlUrl = `${urlMain}/Settings/lang_vn.xml`;
      const jsonUrl = `${urlPortal}/apps/mobile/lang_vn.json`;

      // Lấy dữ liệu từ cả 2 nguồn song song
      const [xmlResponse, jsonResponse] = await Promise.all([
        axios.get(xmlUrl),
        axios.get(jsonUrl)
      ]);

      // Parse XML data
      const parser = new xml2js.Parser();
      const xmlData = await parser.parseStringPromise(xmlResponse.data);
      
      // Lấy data JSON
      const jsonData = jsonResponse.data;

      // Tạo map từ XML data để tìm kiếm nhanh hơn
      const xmlMap = new Map<string, string>();
      
      // Xử lý XML data - lấy các Language elements
      if (xmlData.NewDataSet && xmlData.NewDataSet.Language) {
        const languages = xmlData.NewDataSet.Language;
        for (const lang of languages) {
          if (lang.$ && lang.$.Name && lang.$.Value) {
            xmlMap.set(lang.$.Name, lang.$.Value);
          }
        }
      }

      // Merge data - tìm các field có giá trị rỗng trong JSON
      const mergedData = { ...jsonData };
      
      for (const [key, value] of Object.entries(jsonData)) {
        // Kiểm tra nếu value là " " hoặc ""
        if (value === " " || value === "") {
          // Tìm trong XML map
          if (xmlMap.has(key)) {
            mergedData[key] = xmlMap.get(key);
          }
        }
      }

      return mergedData;
    } catch (error) {
      console.error("Error in getLang:", error);
      throw new Error(`Failed to get language data: ${error.message}`);
    }
  }
}
