import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Configuration } from "../../entity/configuration.entity";
import axios from "axios";

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>
  ) {}

  async findAll(): Promise<Configuration[]> {
    return this.configurationRepository.find();
  }

  async create(configuration: Configuration): Promise<Configuration> {
    return this.configurationRepository.save(configuration);
  }

  async findOne(id: string): Promise<Configuration | null> {
    return this.configurationRepository.findOne({ where: { ID: id } });
  }

  async update(
    id: string,
    configuration: Partial<Configuration>
  ): Promise<Configuration | null> {
    await this.configurationRepository.update(id, configuration);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.configurationRepository.delete(id);
  }

  async configByApp(
    isAndroid: boolean,
    appName: string
  ): Promise<Configuration | null> {
    if (
      (typeof isAndroid === "boolean" && isAndroid === true) ||
      (typeof isAndroid === "string" && isAndroid === "true")
    ) {
      const configurations: Configuration[] =
        await this.configurationRepository.query(
          `SELECT TOP (1) * FROM Sys_Configuration 
        WHERE NameAppAndroid='${appName}'
        AND IsDelete IS NOT NULL`
        );

      return configurations?.[0];
    } else {
      const configurations: Configuration[] =
        await this.configurationRepository.query(
          `SELECT TOP (1) * FROM Sys_Configuration 
      WHERE NameAppIOS='${appName}'
      AND IsDelete IS NOT NULL`
        );

      return configurations?.[0];
    }
  }

  async getConfigDashboard(url: string): Promise<any | null> {
    const response = await axios.get(url);
    return response.data;
  }
}
