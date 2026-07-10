import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { lookup } from 'mime-types'
import { v4 as uuidv4 } from 'uuid'
import { ALLOWED_IMAGE_MIME_TYPES_REGEX, IMAGE_MIME_TYPE_TO_EXTENSION } from '@/shared/constants/media.constant'
import { PresignedUploadFileBodyType } from '@/routes/media/media.model'
import { S3Service } from '@/shared/services/s3.service'

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadImage(image: Express.Multer.File) {
    const extension = IMAGE_MIME_TYPE_TO_EXTENSION[image.mimetype]
    if (!extension) {
      throw new UnprocessableEntityException('Unsupported image type')
    }

    const key = `${uuidv4()}${extension}`
    const url = await this.s3Service.uploadFile({ key, body: image.buffer, contentType: image.mimetype })

    return {
      key,
      url,
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
      await this.s3Service.deleteFiles(succeeded.map((result) => result.value.key))

      const firstError = failed[0].reason
      throw firstError instanceof Error
        ? firstError
        : new UnprocessableEntityException('Failed to upload one or more images')
    }

    return succeeded.map((result) => result.value)
  }

  getPresignedUploadUrl(body: PresignedUploadFileBodyType) {
    const contentType = lookup(body.filename)
    if (!contentType || !ALLOWED_IMAGE_MIME_TYPES_REGEX.test(contentType)) {
      throw new UnprocessableEntityException('Unsupported image type')
    }

    // Extension is derived from the detected content type, never from the
    // client-supplied filename, so the client cannot control the stored key's extension.
    const extension = IMAGE_MIME_TYPE_TO_EXTENSION[contentType]
    const key = `${uuidv4()}${extension}`

    return this.s3Service.createPresignedUploadUrl({ key, contentType })
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
