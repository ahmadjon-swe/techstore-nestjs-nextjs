import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true, slug: true, titleEn: true, titleUz: true, titleRu: true,
            condition: true, grade: true,
            images: { orderBy: { position: 'asc' }, take: 1 },
            variants: { select: { id: true, priceUzs: true, compareAtUzs: true, stock: true }, take: 1 },
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((i) => ({ ...i.product, wishlistId: i.id, savedAt: i.createdAt }));
  }

  async toggle(userId: string, productId: string): Promise<{ saved: boolean }> {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await this.prisma.wishlistItem.create({ data: { userId, productId } });
    return { saved: true };
  }

  async isSaved(userId: string, productId: string): Promise<boolean> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  }

  async getSavedIds(userId: string): Promise<string[]> {
    const items = await this.prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } });
    return items.map((i) => i.productId);
  }
}
