import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { TelegramService } from '../telegram/telegram.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, Role } from '@techstore/db';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    @Inject(forwardRef(() => TelegramService))
    private telegram: TelegramService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto, source = 'web') {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    if (!dto.addressId && !dto.address) {
      throw new BadRequestException('Address required');
    }

    let addressSnapshot: object | null = null;
    if (dto.addressId) {
      const addr = await this.prisma.address.findFirst({ where: { id: dto.addressId, userId } });
      if (!addr) throw new NotFoundException('Address not found');
      addressSnapshot = { line1: addr.line1, line2: addr.line2, city: addr.city, region: addr.region, notes: addr.notes };
    } else {
      addressSnapshot = dto.address!;
    }

    const number = await this.generateOrderNumber();
    const totalUzs = cart.items.reduce(
      (sum, item) => sum + item.variant.priceUzs * BigInt(item.quantity),
      0n,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for SKU ${item.variant.sku}`);
        }
      }

      const created = await tx.order.create({
        data: {
          number,
          userId,
          totalUzs,
          address: addressSnapshot,
          source,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              titleSnap: item.variant.product.titleEn,
              priceUzs: item.variant.priceUzs,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.payment.create({
        data: {
          orderId: created.id,
          provider: dto.paymentProvider,
          amountUzs: totalUzs,
        },
      });

      return created;
    });

    await this.cartService.clearCart(userId);

    const customer = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    await this.telegram.notifyNewOrder(order.number, totalUzs.toString(), customer?.name ?? null);

    return this.getOrder(order.id, userId);
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  async listUserOrders(userId: string, page = 1, limit = 20) {
    const [total, items] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, items };
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto, actorRole: Role) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const newStatus = dto.status as OrderStatus;
    const allowed = this.allowedTransitions(order.status, actorRole);
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    if (newStatus === OrderStatus.PAID) {
      await this.decrementStock(orderId);
    }

    return this.prisma.order.update({ where: { id: orderId }, data: { status: newStatus } });
  }

  private async decrementStock(orderId: string) {
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

  private allowedTransitions(current: OrderStatus, role: Role): OrderStatus[] {
    const map: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.REFUNDED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };
    const transitions = map[current] ?? [];
    if (role === Role.STAFF) {
      return transitions.filter((s) => s !== OrderStatus.REFUNDED);
    }
    return transitions;
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.prisma.order.count();
    return `TS-${String(count + 1).padStart(6, '0')}`;
  }
}
