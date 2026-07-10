import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import envConfig from '@/shared/config'
import { PRESIGNED_URL_EXPIRES_IN_SECONDS } from '@/shared/constants/media.constant'

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name)

  private readonly s3Client = new S3Client({
    region: envConfig.S3_REGION,
    credentials: {
      accessKeyId: envConfig.S3_ACCESS_KEY_ID,
      secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY,
    },
  })

  private buildPublicUrl(key: string): string {
    return `https://${envConfig.S3_BUCKET_NAME}.s3.${envConfig.S3_REGION}.amazonaws.com/${key}`
  }

  async uploadFile(params: { key: string; body: Buffer; contentType: string }): Promise<string> {
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: envConfig.S3_BUCKET_NAME,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
        },
        tags: [],
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
      })

      await upload.done()

      return this.buildPublicUrl(params.key)
    } catch (error) {
      this.logger.error(`Failed to upload file "${params.key}" to S3`, (error as Error).stack)
      throw new InternalServerErrorException('Failed to upload file')
    }
  }

  async createPresignedUploadUrl(params: { key: string; contentType: string }) {
    try {
      const command = new PutObjectCommand({
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: params.key,
        ContentType: params.contentType,
      })

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
      })

      return { presignedUrl, url: this.buildPublicUrl(params.key) }
    } catch (error) {
      this.logger.error(`Failed to create presigned upload URL for "${params.key}"`, (error as Error).stack)
      throw new InternalServerErrorException('Failed to create presigned upload URL')
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return
    }

    try {
      await this.s3Client.send(
        new DeleteObjectsCommand({
          Bucket: envConfig.S3_BUCKET_NAME,
          Delete: { Objects: keys.map((key) => ({ Key: key })) },
        }),
      )
    } catch (error) {
      this.logger.error(`Failed to delete S3 objects [${keys.join(', ')}]`, (error as Error).stack)
    }
  }
}
