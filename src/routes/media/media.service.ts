import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common'
import { mkdir, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { IMAGE_MIME_TYPE_TO_EXTENSION, UPLOAD_DIR_NAME, UPLOAD_DIR_PATH } from '@/shared/constants/media.constant'
import envConfig from '@/shared/config'

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name)

  async uploadImage(image: Express.Multer.File) {
    const extension = IMAGE_MIME_TYPE_TO_EXTENSION[image.mimetype]
    if (!extension) {
      throw new UnprocessableEntityException('Unsupported image type')
    }

    await mkdir(UPLOAD_DIR_PATH, { recursive: true })

    const filename = `${uuidv4()}${extension}`
    await writeFile(join(UPLOAD_DIR_PATH, filename), image.buffer)

    return {
      filename,
      url: `${envConfig.APP_URL}/${UPLOAD_DIR_NAME}/${filename}`,
      size: image.size,
      mimetype: image.mimetype,
    }
  }

  async uploadMultipleImages(files: Array<Express.Multer.File>) {
    const results = await Promise.allSettled(files.map((file) => this.uploadImage(file)))

    const succeeded = results.filter(
      (result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof this.uploadImage>>> =>
        result.status === 'fulfilled',
    )
    const failed = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected')

    if (failed.length > 0) {
      await this.rollbackUploadedFiles(succeeded.map((result) => result.value.filename))

      const firstError = failed[0].reason
      throw firstError instanceof Error
        ? firstError
        : new UnprocessableEntityException('Failed to upload one or more images')
    }

    return succeeded.map((result) => result.value)
  }

  private async rollbackUploadedFiles(filenames: string[]) {
    await Promise.all(
      filenames.map((filename) =>
        unlink(join(UPLOAD_DIR_PATH, filename)).catch((error: unknown) => {
          this.logger.error(
            `Failed to roll back uploaded file "${filename}" after a batch upload failure`,
            error instanceof Error ? error.stack : String(error),
          )
        }),
      ),
    )
  }

  findAll() {
    return `This action returns all media`
  }

  findOne(id: number) {
    return `This action returns a #${id} media`
  }

  update(id: number, updateMediaDto: any) {
    return `This action updates a #${id} media`
  }

  remove(id: number) {
    return `This action removes a #${id} media`
  }
}
