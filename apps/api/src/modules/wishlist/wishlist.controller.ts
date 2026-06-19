import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: any) {
    return this.wishlist.getWishlist(user.id);
  }

  @Post(':productId/toggle')
  toggle(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlist.toggle(user.id, productId);
  }

  @Get('ids')
  getSavedIds(@CurrentUser() user: any) {
    return this.wishlist.getSavedIds(user.id);
  }
}
