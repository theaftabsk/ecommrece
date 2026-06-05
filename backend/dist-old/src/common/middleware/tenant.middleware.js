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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TenantMiddleware = class TenantMiddleware {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        const tenantDomain = req.headers['x-tenant-domain'] || req.headers.host;
        if (!tenantDomain) {
            throw new common_1.NotFoundException('Host header or X-Tenant-Domain header missing');
        }
        const hostname = tenantDomain.split(':')[0];
        if (hostname === 'admin.localhost' || hostname.startsWith('admin.')) {
            next();
            return;
        }
        const domainRecord = await this.prisma.shopDomain.findUnique({
            where: { domain: hostname },
            select: { shop_id: true, status: true },
        });
        let shopId = domainRecord?.shop_id;
        if (!shopId && (hostname === 'localhost' || hostname === '127.0.0.1')) {
            const fallbackShop = await this.prisma.shop.findFirst({
                where: { status: 'active' },
                select: { id: true },
            });
            if (fallbackShop) {
                shopId = fallbackShop.id;
            }
        }
        if (!shopId) {
            throw new common_1.NotFoundException(`Store domain mapping for '${hostname}' not found`);
        }
        req.shopId = shopId;
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map