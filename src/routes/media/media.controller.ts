import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common'
import { MediaService } from './media.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ALLOWED_IMAGE_MIME_TYPES_REGEX, MAX_UPLOAD_FILE_SIZE_IN_BYTES } from '@/shared/constants/media.constant'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      // Hard ceiling enforced while Multer streams the upload, before it is
      // fully buffered into memory. Without this, an oversized upload would
      // be buffered entirely into RAM before ParseFilePipe gets a chance to reject it.
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE_IN_BYTES },
    }),
  )
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_FILE_SIZE_IN_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_MIME_TYPES_REGEX }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.mediaService.uploadImage(image)
  }

  @Get()
  findAll() {
    return this.mediaService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: any) {
    return this.mediaService.update(+id, updateMediaDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(+id)
  }
}
