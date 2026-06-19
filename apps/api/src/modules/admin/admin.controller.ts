import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@techstore/db';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class SetRoleDto {
  @IsEnum(Role) role: Role;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('orders')
  listOrders(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.listOrders(status, Number(page) || 1, Number(limit) || 30);
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: number) {
    return this.adminService.getLowStock(Number(threshold) || 5);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get('users')
  listUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.listUsers(Number(page) || 1, Number(limit) || 30);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get('users/:id/orders')
  getUserOrders(
    @Param('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUserOrders(userId, Number(page) || 1, Number(limit) || 20);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch('users/:id/role')
  setUserRole(@CurrentUser() actor: any, @Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.adminService.setUserRole(actor.id, actor.role, id, dto.role);
  }
}
