import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomeController } from "../../controller/home/home.controller";
import { HomeService } from "../../service/home/home.service";
import { entities } from "../../entities.provider";

@Module({
  imports: [TypeOrmModule.forFeature([...entities])],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {} 