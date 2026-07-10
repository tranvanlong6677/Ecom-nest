import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'

// file này ví dụ thôi, dùng ParseFilePipe cho tiện
@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const oneKb = 1000
    return value.size < oneKb
  }
}
