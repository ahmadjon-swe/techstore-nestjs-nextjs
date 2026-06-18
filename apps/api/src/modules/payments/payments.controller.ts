import { Body, Controller, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('orders/:orderId/initiate')
  initiate(@Param('orderId') orderId: string, @CurrentUser() user: any) {
    return this.paymentsService.initiatePayment(orderId, user.id);
  }

  @Post('webhooks/payme')
  paymeWebhook(@Body() body: Record<string, unknown>, @Headers('authorization') auth: string) {
    return this.paymentsService.handlePaymeCallback(body, auth);
  }

  @Post('webhooks/click')
  clickWebhook(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleClickCallback(body);
  }
}
