import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { id: true, slug: true, titleUz: true, titleRu: true, titleEn: true, images: { take: 1 } } } },
            },
          },
        },
      },
    });

    if (!cart) return { items: [], total: '0' };

    const total = cart.items.reduce(
      (sum, item) => sum + item.variant.priceUzs * BigInt(item.quantity),
      0n,
    );

    return { ...cart, total: total.toString() };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: dto.variantId } },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (variant.stock < newQty) throw new BadRequestException('Insufficient stock');
      await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    } else {
      await this.prisma.cartItem.create({ data: { cartId: cart.id, variantId: dto.variantId, quantity: dto.quantity } });
    }

    await this.prisma.cart.update({ where: { id: cart.id }, data: {} }); // touch updatedAt
    return this.getCart(userId);
  }

  async updateItem(userId: string, variantId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
    } else {
      const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) throw new NotFoundException('Variant not found');
      if (variant.stock < dto.quantity) throw new BadRequestException('Insufficient stock');
      await this.prisma.cartItem.updateMany({
        where: { cartId: cart.id, variantId },
        data: { quantity: dto.quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, variantId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}
