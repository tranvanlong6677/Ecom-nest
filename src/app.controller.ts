import { Controller, Get } from '@nestjs/common'
import { AppService } from '@/app.service'
import { Auth } from '@/shared/decorators/auth.decorator'
import { AuthType } from '@/shared/enums/auth-type.enum'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Auth(AuthType.None)
  getHello(): string {
    return this.appService.getHello()
  }
}
