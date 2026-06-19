import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ImageService } from '../media/image.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpsertVariantDto,
  StockAdjustDto,
  ReorderImagesDto,
} from './dto/product.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const { variants, specs, ...productData } = dto;
    return this.prisma.product.create({
      data: {
        ...productData,
        specs: specs === undefined ? undefined : (specs as object),
        variants: {
          create: variants.map((v) => ({
            sku: v.sku,
            storage: v.storage,
            color: v.color,
            priceUzs: BigInt(v.priceUzs),
            compareAtUzs: v.compareAtUzs ? BigInt(v.compareAtUzs) : null,
            stock: v.stock ?? 0,
          })),
        },
      },
      include: { variants: true, images: true },
    });
  }

  async listProducts(page = 1, limit = 20) {
    const [total, items] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, brand: true, images: { take: 1 }, variants: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, items };
  }

  async getProduct(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true, images: { orderBy: { position: 'asc' } }, variants: true },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.getProduct(id);
    const { specs, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: { ...rest, specs: specs === undefined ? undefined : (specs as object) },
    });
  }

  async deleteProduct(id: string) {
    await this.getProduct(id);
    for (const img of await this.prisma.productImage.findMany({ where: { productId: id } })) {
      await this.imageService.deleteByUrl(img.url);
    }
    return this.prisma.product.delete({ where: { id } });
  }

  async togglePublish(id: string, publish: boolean) {
    await this.getProduct(id);
    return this.prisma.product.update({ where: { id }, data: { isPublished: publish } });
  }

  async upsertVariant(productId: string, dto: UpsertVariantDto) {
    await this.getProduct(productId);
    const data = {
      productId,
      sku: dto.sku,
      storage: dto.storage,
      color: dto.color,
      priceUzs: BigInt(dto.priceUzs),
      compareAtUzs: dto.compareAtUzs ? BigInt(dto.compareAtUzs) : null,
      stock: dto.stock ?? 0,
    };
    if (dto.id) {
      return this.prisma.productVariant.update({ where: { id: dto.id }, data });
    }
    return this.prisma.productVariant.create({ data });
  }

  async adjustStock(variantId: string, dto: StockAdjustDto) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: dto.delta } },
    });
  }

  async deleteVariant(variantId: string) {
    return this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  async attachImage(productId: string, url: string, alt?: string) {
    const count = await this.prisma.productImage.count({ where: { productId } });
    return this.prisma.productImage.create({ data: { productId, url, alt, position: count } });
  }

  async reorderImages(productId: string, dto: ReorderImagesDto) {
    await Promise.all(
      dto.imageIds.map((id, position) =>
        this.prisma.productImage.update({ where: { id }, data: { position } }),
      ),
    );
  }

  async deleteImage(imageId: string) {
    const img = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!img) throw new NotFoundException('Image not found');
    await this.imageService.deleteByUrl(img.url);
    await this.prisma.productImage.delete({ where: { id: imageId } });
  }
}
