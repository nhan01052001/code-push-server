import { IsNotEmpty, IsString } from 'class-validator';

export class LinkDto {
  @IsNotEmpty()
  @IsString()
  UriPor: string;

  @IsNotEmpty()
  @IsString()
  UriHR: string;

  @IsNotEmpty()
  @IsString()
  UriSys: string;

  @IsNotEmpty()
  @IsString() 
  UriMain: string;
} 