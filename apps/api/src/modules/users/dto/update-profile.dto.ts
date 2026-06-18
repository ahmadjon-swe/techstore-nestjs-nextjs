import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() locale?: string;
  @IsOptional() @IsString() @Matches(/^\+998\d{9}$/) phone?: string;
}
