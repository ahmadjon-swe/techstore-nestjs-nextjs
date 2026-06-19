import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus } from '@techstore/db';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/address.dto';

/** Order statuses that block account deletion (money/fulfilment in flight). */
const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
];

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true, phone: true, email: true, name: true, role: true,
        locale: true, googleId: true, passwordHash: true, createdAt: true,
      },
    }).then((u) => ({
      ...u,
      hasPassword: !!u.passwordHash,
      isGoogleLinked: !!u.googleId,
      passwordHash: undefined,
      googleId: undefined,
    }));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.phone) {
      const clash = await this.prisma.user.findFirst({
        where: { phone: dto.phone, id: { not: userId }, deletedAt: null },
      });
      if (clash) throw new ConflictException('Phone number already in use');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, phone: true, email: true, name: true, role: true, locale: true },
    });
  }

  /** Soft-delete: refuse while orders are in flight, then anonymize & detach sessions. */
  async deleteAccount(userId: string) {
    const activeOrders = await this.prisma.order.count({
      where: { userId, status: { in: ACTIVE_ORDER_STATUSES } },
    });
    if (activeOrders > 0) {
      throw new BadRequestException(
        `Cannot delete account with ${activeOrders} active order(s). Wait until they complete or cancel them first.`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
      this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), googleId: null },
      }),
    ]);
    return { success: true };
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.create({ data: { ...dto, userId } });
  }

  async updateAddress(userId: string, addressId: string, dto: Partial<CreateAddressDto>) {
    const address = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');
    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.update({ where: { id: addressId }, data: dto });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id: addressId } });
  }
}
