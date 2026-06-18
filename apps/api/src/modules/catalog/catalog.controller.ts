import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'brandSlug', required: false })
  @ApiQuery({ name: 'condition', required: false, enum: ['NEW', 'USED'] })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listProducts(@Query() query: Record<string, string>) {
    return this.catalogService.listProducts(query);
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getProduct(slug);
  }

  @Get('categories')
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Get('brands')
  listBrands() {
    return this.catalogService.listBrands();
  }
}
