import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CatalogModule } from '../catalog/catalog.module';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [CatalogModule, CartModule, forwardRef(() => OrdersModule)],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
