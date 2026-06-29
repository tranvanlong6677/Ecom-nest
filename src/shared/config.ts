import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, validateSync } from 'class-validator';
import fs from 'fs';
import path from 'path';

// Kiểm tra xem có file .env chưa
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env');
  process.exit(1);
}

class ConfigSchema {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  SECRET_API_KEY: string;
}

export const config: ConfigSchema = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? '',
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? '',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '',
  SECRET_API_KEY: process.env.SECRET_API_KEY ?? '',
};

const configServer = plainToInstance(ConfigSchema, process.env);
const errorsServer = validateSync(configServer);

if (errorsServer.length) {
  console.log('Các giá trị trong .env không hợp lệ');
  const errors: any = errorsServer?.map((item) => {
    return {
      property: item.property,
      value: item.value,
      constraints: item.constraints,
    };
  });

  throw errors;
}

const envConfig = configServer;

export default envConfig;
