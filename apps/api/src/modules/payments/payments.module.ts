import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider } from './providers/click.provider';
import { CashProvider } from './providers/cash.provider';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [PaymentsService, PaymeProvider, ClickProvider, CashProvider],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
