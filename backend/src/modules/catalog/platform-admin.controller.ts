import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('api/v1/catalog')
export class PlatformAdminController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  @Get('admin/stats')
  async getDashboardStats() {
    return this.catalogService.getDashboardStats();
  }

  // ── SHOPS ─────────────────────────────────────────────────────────────────
  @Post('register-shop')
  async registerShop(
    @Body() dto: { name: string; slug: string; ownerEmail: string; ownerName: string; ownerPassword?: string }
  ) {
    return this.catalogService.registerShop(dto);
  }

  @Get('admin/shops')
  async getShops() {
    return this.catalogService.getShops();
  }

  @Get('admin/shops/:id')
  async getShopDetail(@Param('id') id: string) {
    return this.catalogService.getShopDetail(id);
  }

  @Patch('admin/shops/:id')
  async updateShop(
    @Param('id') id: string,
    @Body() dto: { name?: string; plan?: string; status?: string; description?: string }
  ) {
    return this.catalogService.updateShop(id, dto);
  }

  @Delete('admin/shops/:id')
  async deleteShop(@Param('id') id: string) {
    return this.catalogService.deleteShop(id);
  }

  @Post('admin/shops/:id/seed-demo')
  async seedDemoData(@Param('id') id: string) {
    return this.catalogService.seedDemoData(id);
  }

  // ── TENANT REQUESTS ───────────────────────────────────────────────────────
  @Get('admin/tenant-requests')
  async getTenantRequests() {
    return this.catalogService.getTenantRequests();
  }

  @Post('admin/tenant-requests/:id/approve')
  async approveTenantRequest(@Param('id') id: string) {
    return this.catalogService.approveTenantRequest(id);
  }

  @Post('admin/tenant-requests/:id/reject')
  async rejectTenantRequest(@Param('id') id: string) {
    return this.catalogService.rejectTenantRequest(id);
  }

  @Delete('admin/tenant-requests/:id')
  async deleteTenantRequest(@Param('id') id: string) {
    return this.catalogService.deleteTenantRequest(id);
  }
}
