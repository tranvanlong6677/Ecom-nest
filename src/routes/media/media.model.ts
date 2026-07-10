import { z } from 'zod'
import { MAX_UPLOAD_FILE_SIZE_IN_BYTES } from '@/shared/constants/media.constant'

export const PresignedUploadFileBodySchema = z
  .object({
    filename: z.string().min(1),
    filesize: z
      .number()
      .int()
      .positive()
      .max(MAX_UPLOAD_FILE_SIZE_IN_BYTES, `File size must not exceed ${MAX_UPLOAD_FILE_SIZE_IN_BYTES} bytes`),
  })
  .strict()

export type PresignedUploadFileBodyType = z.infer<typeof PresignedUploadFileBodySchema>

export const PresignedUploadFileResSchema = z.object({
  presignedUrl: z.string(),
  url: z.string(),
})

export type PresignedUploadFileResType = z.infer<typeof PresignedUploadFileResSchema>
