"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdminController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
let PlatformAdminController = class PlatformAdminController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async getDashboardStats() {
        return this.catalogService.getDashboardStats();
    }
    async registerShop(dto) {
        return this.catalogService.registerShop(dto);
    }
    async getShops() {
        return this.catalogService.getShops();
    }
    async getShopDetail(id) {
        return this.catalogService.getShopDetail(id);
    }
    async updateShop(id, dto) {
        return this.catalogService.updateShop(id, dto);
    }
    async deleteShop(id) {
        return this.catalogService.deleteShop(id);
    }
    async seedDemoData(id) {
        return this.catalogService.seedDemoData(id);
    }
    async getTenantRequests() {
        return this.catalogService.getTenantRequests();
    }
    async approveTenantRequest(id) {
        return this.catalogService.approveTenantRequest(id);
    }
    async rejectTenantRequest(id) {
        return this.catalogService.rejectTenantRequest(id);
    }
    async deleteTenantRequest(id) {
        return this.catalogService.deleteTenantRequest(id);
    }
};
exports.PlatformAdminController = PlatformAdminController;
__decorate([
    (0, common_1.Get)('admin/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Post)('register-shop'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "registerShop", null);
__decorate([
    (0, common_1.Get)('admin/shops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getShops", null);
__decorate([
    (0, common_1.Get)('admin/shops/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getShopDetail", null);
__decorate([
    (0, common_1.Patch)('admin/shops/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "updateShop", null);
__decorate([
    (0, common_1.Delete)('admin/shops/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "deleteShop", null);
__decorate([
    (0, common_1.Post)('admin/shops/:id/seed-demo'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "seedDemoData", null);
__decorate([
    (0, common_1.Get)('admin/tenant-requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getTenantRequests", null);
__decorate([
    (0, common_1.Post)('admin/tenant-requests/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "approveTenantRequest", null);
__decorate([
    (0, common_1.Post)('admin/tenant-requests/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "rejectTenantRequest", null);
__decorate([
    (0, common_1.Delete)('admin/tenant-requests/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "deleteTenantRequest", null);
exports.PlatformAdminController = PlatformAdminController = __decorate([
    (0, common_1.Controller)('api/v1/catalog'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], PlatformAdminController);
//# sourceMappingURL=platform-admin.controller.js.map