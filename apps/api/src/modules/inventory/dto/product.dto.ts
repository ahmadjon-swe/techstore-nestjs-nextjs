import {
  IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsObject, IsOptional, IsString, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class VariantDto {
  @IsString() sku: string;
  @IsOptional() @IsString() storage?: string;
  @IsOptional() @IsString() color?: string;
  @IsString() priceUzs: string; // BigInt as string
  @IsOptional() @IsString() compareAtUzs?: string;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() attributes?: Record<string, unknown>;
}

export class CreateProductDto {
  @IsString() slug: string;
  @IsString() titleUz: string;
  @IsString() titleRu: string;
  @IsString() titleEn: string;
  @IsOptional() @IsString() descriptionUz?: string;
  @IsOptional() @IsString() descriptionRu?: string;
  @IsOptional() @IsString() descriptionEn?: string;
  @IsString() categoryId: string;
  @IsOptional() @IsString() brandId?: string;
  @IsEnum(['NEW', 'USED']) condition: 'NEW' | 'USED';
  @IsOptional() @IsIn(['A', 'B', 'C']) grade?: 'A' | 'B' | 'C';
  @IsOptional() @IsString() conditionNotes?: string;
  @IsOptional() @IsInt() @Min(0) batteryHealth?: number;
  @IsOptional() @IsInt() releaseYear?: number;
  @IsOptional() @IsString() modelName?: string;
  @IsOptional() @IsString() mpn?: string;
  @IsOptional() @IsInt() @Min(0) warrantyMonths?: number;
  @IsOptional() @IsInt() @Min(0) weightGrams?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) highlights?: string[];
  @IsOptional() @IsObject() specs?: Record<string, unknown>;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsArray() @ValidateNested({ each: true }) @Type(() => VariantDto) variants: VariantDto[];
}

export class UpdateProductDto {
  @IsOptional() @IsString() titleUz?: string;
  @IsOptional() @IsString() titleRu?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() descriptionUz?: string;
  @IsOptional() @IsString() descriptionRu?: string;
  @IsOptional() @IsString() descriptionEn?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsEnum(['NEW', 'USED']) condition?: 'NEW' | 'USED';
  @IsOptional() @IsIn(['A', 'B', 'C']) grade?: 'A' | 'B' | 'C';
  @IsOptional() @IsString() conditionNotes?: string;
  @IsOptional() @IsInt() @Min(0) batteryHealth?: number;
  @IsOptional() @IsInt() releaseYear?: number;
  @IsOptional() @IsString() modelName?: string;
  @IsOptional() @IsString() mpn?: string;
  @IsOptional() @IsInt() @Min(0) warrantyMonths?: number;
  @IsOptional() @IsInt() @Min(0) weightGrams?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) highlights?: string[];
  @IsOptional() @IsObject() specs?: Record<string, unknown>;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpsertVariantDto {
  @IsOptional() @IsString() id?: string;
  @IsString() sku: string;
  @IsOptional() @IsString() storage?: string;
  @IsOptional() @IsString() color?: string;
  @IsString() priceUzs: string;
  @IsOptional() @IsString() compareAtUzs?: string;
  @IsOptional() @IsInt() @Min(0) stock?: number;
}

export class StockAdjustDto {
  @IsInt() delta: number;
}

export class ReorderImagesDto {
  @IsArray() @IsString({ each: true }) imageIds: string[];
}
