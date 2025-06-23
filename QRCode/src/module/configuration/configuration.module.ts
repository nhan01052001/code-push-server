import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from '../../entity/configuration.entity';
import { ConfigurationController } from '../../controller/configuration/configuration.controller';
import { ConfigurationService } from '../../service/configuration/configuration.service';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration])],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {} 