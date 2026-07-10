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
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { MediaService } from './media.service'
import { PresignedUploadFileBodyDto, PresignedUploadFileResDto } from './media.dto'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import {
  ALLOWED_IMAGE_MIME_TYPES_REGEX,
  MAX_UPLOAD_FILE_SIZE_IN_BYTES,
  MAX_UPLOAD_FILES_COUNT,
} from '@/shared/constants/media.constant'

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

  @Post('images/upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', MAX_UPLOAD_FILES_COUNT, {
      storage: memoryStorage(),
      // Hard ceiling enforced while Multer streams the upload, before it is
      // fully buffered into memory. Without this, an oversized upload would
      // be buffered entirely into RAM before ParseFilePipe gets a chance to reject it.
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE_IN_BYTES },
    }),
  )
  uploadMultipleImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_FILE_SIZE_IN_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_MIME_TYPES_REGEX }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadMultipleImages(files)
  }

  @Post('images/upload/presigned-url')
  @ZodSerializerDto(PresignedUploadFileResDto)
  getPresignedUploadUrl(@Body() body: PresignedUploadFileBodyDto) {
    return this.mediaService.getPresignedUploadUrl(body)
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
