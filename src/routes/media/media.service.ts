import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { IMAGE_MIME_TYPE_TO_EXTENSION, UPLOAD_DIR_NAME } from '@/shared/constants/media.constant'
import envConfig from '@/shared/config'

const uploadDirPath = join(process.cwd(), UPLOAD_DIR_NAME)

@Injectable()
export class MediaService {
  async uploadImage(image: Express.Multer.File) {
    const extension = IMAGE_MIME_TYPE_TO_EXTENSION[image.mimetype]
    if (!extension) {
      throw new UnprocessableEntityException('Unsupported image type')
    }

    await mkdir(uploadDirPath, { recursive: true })

    const filename = `${uuidv4()}${extension}`
    await writeFile(join(uploadDirPath, filename), image.buffer)

    return {
      filename,
      url: `${envConfig.APP_URL}/${UPLOAD_DIR_NAME}/${filename}`,
      size: image.size,
      mimetype: image.mimetype,
    }
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
