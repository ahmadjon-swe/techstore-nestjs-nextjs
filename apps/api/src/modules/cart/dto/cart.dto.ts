import { IsInt, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsString() variantId: string;
  @IsInt() @Min(1) quantity: number;
}

export class UpdateCartItemDto {
  @IsInt() @Min(0) quantity: number;
}
