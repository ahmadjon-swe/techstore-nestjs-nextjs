import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, Role } from '@techstore/db';

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
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, items };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id, deletedAt: null },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        locale: true, googleId: true, createdAt: true,
        addresses: true,
        _count: { select: { orders: true } },
      },
    });
    return { ...user, isGoogleLinked: !!user.googleId, googleId: undefined };
  }

  async getUserOrders(userId: string, page = 1, limit = 20) {
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

  /**
   * Assign a team role. OWNER can set any role; MANAGER may only toggle the
   * STAFF ↔ CUSTOMER pair (they can't touch owners/managers or mint admins).
   */
  async setUserRole(actorId: string, actorRole: Role, targetId: string, role: Role) {
    if (!Object.values(Role).includes(role)) throw new BadRequestException('Invalid role');
    if (actorId === targetId) throw new ForbiddenException('You cannot change your own role');

    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.deletedAt) throw new NotFoundException('User not found');

    // Managers are limited to granting/revoking the Staff role.
    if (actorRole === Role.MANAGER) {
      const managerScope: Role[] = [Role.STAFF, Role.CUSTOMER];
      if (!managerScope.includes(role) || !managerScope.includes(target.role)) {
        throw new ForbiddenException('Managers can only grant or revoke the Staff role');
      }
    }

    // Never leave the store without an owner.
    if (target.role === Role.OWNER && role !== Role.OWNER) {
      const owners = await this.prisma.user.count({ where: { role: Role.OWNER, deletedAt: null } });
      if (owners <= 1) throw new BadRequestException('Cannot demote the last owner');
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}
