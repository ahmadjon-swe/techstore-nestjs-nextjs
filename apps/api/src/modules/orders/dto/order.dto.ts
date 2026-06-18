import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressSnapshotDto {
  @IsString() line1: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateOrderDto {
  @IsOptional() @IsString() addressId?: string;
  @IsOptional() @ValidateNested() @Type(() => AddressSnapshotDto) address?: AddressSnapshotDto;
  @IsEnum(['PAYME', 'CLICK', 'CASH']) paymentProvider: 'PAYME' | 'CLICK' | 'CASH';
}

export class UpdateOrderStatusDto {
  @IsEnum(['PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED']) status: string;
}
