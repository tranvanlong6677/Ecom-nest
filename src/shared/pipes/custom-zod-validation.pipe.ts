import { UnprocessableEntityException } from '@nestjs/common'
import { ZodValidationPipe, createZodValidationPipe } from 'nestjs-zod'
import { z } from 'zod'

const CustomZodValidationPipe: typeof ZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: z.ZodError) => {
    return new UnprocessableEntityException(
      error.issues.map((error) => {
        return {
          ...error,
          path: error.path.join('.'),
        }
      }),
    )
  },
})

export default CustomZodValidationPipe
