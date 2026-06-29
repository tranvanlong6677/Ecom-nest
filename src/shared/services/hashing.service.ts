import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export const saltOrRounds = 10;

@Injectable()
export class HashingService {
  async hash(data: string): Promise<string> {
    return await bcrypt.hash(data, saltOrRounds);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
