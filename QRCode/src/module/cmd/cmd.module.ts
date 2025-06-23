import { Module } from "@nestjs/common";
import { CmdController } from "../../controller/cmd/cmd.controller";
import { CmdService } from "../../service/cmd/cmd.service";
import { entities } from "../../entities.provider";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([...entities])],
  controllers: [CmdController],
  providers: [CmdService],
  exports: [CmdService],
})
export class CmdModule {}