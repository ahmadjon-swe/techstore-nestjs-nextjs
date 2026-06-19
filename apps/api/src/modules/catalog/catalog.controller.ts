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
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'price-asc', 'price-desc', 'discount'] })
  @ApiQuery({ name: 'onSale', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listProducts(@Query() query: Record<string, string>) {
    return this.catalogService.listProducts({
      ...query,
      sort: query.sort as any,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
  }

  @Get('discounted')
  getDiscounted(@Query('limit') limit?: string) {
    return this.catalogService.getDiscounted(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('new-arrivals')
  getNewArrivals(@Query('limit') limit?: string) {
    return this.catalogService.getNewArrivals(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('home-sections')
  getHomeSections() {
    return this.catalogService.getHomeSections();
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getProduct(slug);
  }

  @Get('products/:slug/related')
  getRelated(@Param('slug') slug: string) {
    return this.catalogService.getRelatedProducts(slug);
  }

  @Get('categories')
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Get('nav-categories')
  navCategories() {
    return this.catalogService.getNavCategories();
  }

  @Get('brands')
  listBrands() {
    return this.catalogService.listBrands();
  }
}
