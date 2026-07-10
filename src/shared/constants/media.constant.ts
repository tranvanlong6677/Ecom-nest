import { join } from 'path'

export const UPLOAD_DIR_NAME = 'upload'

export const UPLOAD_DIR_PATH = join(process.cwd(), UPLOAD_DIR_NAME)

export const MAX_UPLOAD_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024 // 5MB

export const MAX_UPLOAD_FILES_COUNT = 10

export const ALLOWED_IMAGE_MIME_TYPES_REGEX = /^image\/(jpeg|png|gif|webp)$/

// Extension is derived from this map (validated against real file content),
// never from the client-supplied original filename.
export const IMAGE_MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
}
