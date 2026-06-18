import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@techstore/db';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateProductDto, UpdateProductDto, UpsertVariantDto,
  StockAdjustDto, ReorderImagesDto,
} from './dto/product.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  @Roles(Role.OWNER, Role.MANAGER)
  createProduct(@Body() dto: CreateProductDto) {
    return this.inventoryService.createProduct(dto);
  }

  @Get('products')
  listProducts(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.inventoryService.listProducts(Number(page) || 1, Number(limit) || 20);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Patch('products/:id')
  @Roles(Role.OWNER, Role.MANAGER)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.inventoryService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Roles(Role.OWNER)
  deleteProduct(@Param('id') id: string) {
    return this.inventoryService.deleteProduct(id);
  }

  @Patch('products/:id/publish')
  @Roles(Role.OWNER, Role.MANAGER)
  publish(@Param('id') id: string) {
    return this.inventoryService.togglePublish(id, true);
  }

  @Patch('products/:id/unpublish')
  @Roles(Role.OWNER, Role.MANAGER)
  unpublish(@Param('id') id: string) {
    return this.inventoryService.togglePublish(id, false);
  }

  @Post('products/:id/variants')
  @Roles(Role.OWNER, Role.MANAGER)
  upsertVariant(@Param('id') id: string, @Body() dto: UpsertVariantDto) {
    return this.inventoryService.upsertVariant(id, dto);
  }

  @Patch('variants/:variantId/stock')
  adjustStock(@Param('variantId') variantId: string, @Body() dto: StockAdjustDto) {
    return this.inventoryService.adjustStock(variantId, dto);
  }

  @Delete('variants/:variantId')
  @Roles(Role.OWNER, Role.MANAGER)
  deleteVariant(@Param('variantId') variantId: string) {
    return this.inventoryService.deleteVariant(variantId);
  }

  @Post('products/:id/images')
  @Roles(Role.OWNER, Role.MANAGER)
  attachImage(@Param('id') id: string, @Body('url') url: string, @Body('alt') alt?: string) {
    return this.inventoryService.attachImage(id, url, alt);
  }

  @Patch('products/:id/images/reorder')
  @Roles(Role.OWNER, Role.MANAGER)
  reorderImages(@Param('id') id: string, @Body() dto: ReorderImagesDto) {
    return this.inventoryService.reorderImages(id, dto);
  }

  @Delete('images/:imageId')
  @Roles(Role.OWNER, Role.MANAGER)
  deleteImage(@Param('imageId') imageId: string) {
    return this.inventoryService.deleteImage(imageId);
  }
}
