import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider } from './providers/click.provider';
import { CashProvider } from './providers/cash.provider';
import { PaymentProvider } from './providers/payment-provider.interface';
import { PaymentStatus, OrderStatus } from '@techstore/db';

@Injectable()
export class PaymentsService {
  private readonly providers: Record<string, PaymentProvider>;

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private payme: PaymeProvider,
    private click: ClickProvider,
    private cash: CashProvider,
  ) {
    this.providers = { PAYME: payme, CLICK: click, CASH: cash };
  }

  async initiatePayment(orderId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) throw new BadRequestException('Order not accessible');

    if (payment.provider === 'CASH') {
      return { message: 'Pay on delivery / pickup' };
    }

    const provider = this.providers[payment.provider];
    const result = await provider.initiate(orderId, payment.amountUzs);
    return result;
  }

  async handlePaymeCallback(payload: Record<string, unknown>, authHeader: string) {
    return this.handleCallback('PAYME', { ...payload, _auth: authHeader });
  }

  async handleClickCallback(payload: Record<string, unknown>) {
    return this.handleCallback('CLICK', payload);
  }

  private async handleCallback(providerKey: string, payload: Record<string, unknown>) {
    const provider = this.providers[providerKey];
    const { orderId, success, providerRef } = await provider.verifyCallback(payload);

    if (!orderId) return { error: 'unknown order' };

    const payment = await this.prisma.payment.findFirst({ where: { orderId } });
    if (!payment) return { error: 'payment not found' };

    if (payment.status === PaymentStatus.SUCCEEDED) return { ok: true };

    const newStatus = success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED;

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: newStatus, providerRef, rawPayload: payload as any },
      }),
      ...(success
        ? [this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.PAID } })]
        : []),
    ]);

    if (success) {
      const items = await this.prisma.orderItem.findMany({ where: { orderId } });
      await this.prisma.$transaction(
        items.map((item) =>
          this.prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );
    }

    return { ok: true };
  }
}
