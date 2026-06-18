import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@techstore/db';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, totalRevenue, lowStock, pendingOrders] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({
        _sum: { totalUzs: true },
        where: { status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] } },
      }),
      this.prisma.productVariant.count({ where: { stock: { lte: 3 } } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    ]);

    return {
      todayOrders,
      totalRevenueUzs: (totalRevenue._sum.totalUzs ?? 0n).toString(),
      lowStockVariants: lowStock,
      pendingOrders,
    };
  }

  async listOrders(status?: string, page = 1, limit = 30) {
    const where = status ? { status: status as OrderStatus } : {};
    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          items: true,
          payment: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, items };
  }

  async getLowStock(threshold = 5) {
    return this.prisma.productVariant.findMany({
      where: { stock: { lte: threshold } },
      include: { product: { select: { id: true, slug: true, titleEn: true } } },
      orderBy: { stock: 'asc' },
    });
  }

  async listUsers(page = 1, limit = 30) {
    const [total, items] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, items };
  }
}
