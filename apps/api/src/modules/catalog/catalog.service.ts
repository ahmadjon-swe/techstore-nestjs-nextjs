import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@techstore/db';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProductFilter {
  categorySlug?: string;
  brandSlug?: string;
  condition?: 'NEW' | 'USED';
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const VARIANT_SELECT = {
  id: true, sku: true, storage: true, color: true,
  priceUzs: true, compareAtUzs: true, stock: true, attributes: true,
};

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listProducts(filter: ProductFilter) {
    const { categorySlug, brandSlug, condition, minPrice, maxPrice, search, page = 1, limit = 20 } = filter;

    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      ...(condition && { condition }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(brandSlug && { brand: { slug: brandSlug } }),
      ...(search && {
        OR: [
          { titleUz: { contains: search, mode: 'insensitive' } },
          { titleRu: { contains: search, mode: 'insensitive' } },
          { titleEn: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(minPrice || maxPrice
        ? { variants: { some: { priceUzs: { ...(minPrice && { gte: BigInt(minPrice) }), ...(maxPrice && { lte: BigInt(maxPrice) }) } } } }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        select: {
          id: true, slug: true, titleUz: true, titleRu: true, titleEn: true,
          condition: true, grade: true, isPublished: true, createdAt: true,
          category: { select: { slug: true, nameUz: true, nameRu: true, nameEn: true } },
          brand: { select: { slug: true, name: true, logoUrl: true } },
          images: { orderBy: { position: 'asc' }, take: 1 },
          variants: { select: VARIANT_SELECT },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, page, limit, items };
  }

  async getProduct(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { position: 'asc' } },
        variants: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async listCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { slug: 'asc' },
    });
  }

  async listBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }
}
