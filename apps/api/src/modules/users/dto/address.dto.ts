import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsOptional() @IsString() label?: string;
  @IsString() line1: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
