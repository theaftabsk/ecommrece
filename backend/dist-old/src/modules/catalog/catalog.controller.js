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
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const create_banner_dto_1 = require("./dto/create-banner.dto");
const create_section_dto_1 = require("./dto/create-section.dto");
let CatalogController = class CatalogController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async getHomepage(req) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getHomepageData(shopId);
    }
    async getProducts(req, query) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getProducts(shopId, query);
    }
    async getProduct(req, slug) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getProductBySlug(shopId, slug);
    }
    async getCategories(req) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getCategories(shopId);
    }
    async getBrands(req) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getBrands(shopId);
    }
    async placeOrder(req, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.placeOrder(shopId, dto);
    }
    async getPublicOrder(req, id) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getPublicOrderById(shopId, id);
    }
    async createProduct(req, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.createProduct(shopId, dto);
    }
    async createBanner(req, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.createBanner(shopId, dto);
    }
    async createSection(req, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.createSection(shopId, dto);
    }
    async getProductById(req, id) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getProductById(shopId, id);
    }
    async updateProduct(req, id, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.updateProduct(shopId, id, dto);
    }
    async deleteProduct(req, id) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.deleteProduct(shopId, id);
    }
    async createCategory(req, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.createCategory(shopId, dto);
    }
    async updateCategory(req, id, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.updateCategory(shopId, id, dto);
    }
    async deleteCategory(req, id) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.deleteCategory(shopId, id);
    }
    async deleteBanner(req, id) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.deleteBanner(shopId, id);
    }
    async getOrders(req) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.getOrders(shopId);
    }
    async updateOrderStatus(req, id, body) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.catalogService.updateOrderStatus(shopId, id, body.status, body.note);
    }
    async getProductReviews(req, productId) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.getProductReviews(shopId, productId);
    }
    async createReview(req, productId, dto) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.createReview(shopId, productId, dto);
    }
    async updateReviewStatus(req, id, body) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.updateReviewStatus(shopId, id, body.status);
    }
    async deleteReview(req, id) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.deleteReview(shopId, id);
    }
    async getProductVariants(req, productId) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.getProductVariants(shopId, productId);
    }
    async createVariant(req, productId, dto) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.createVariant(shopId, productId, dto);
    }
    async updateVariant(req, id, dto) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.updateVariant(shopId, id, dto);
    }
    async deleteVariant(req, id) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.deleteVariant(shopId, id);
    }
    async adjustStock(req, id, body) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.adjustStock(shopId, id, body);
    }
    async getStockLogs(req, productId) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.getStockLogs(shopId, productId);
    }
    async getInventoryOverview(req) {
        const shopId = req.shopId;
        if (!shopId)
            throw new common_1.BadRequestException('Shop context missing');
        return this.catalogService.getInventoryOverview(shopId);
    }
    async createTenantRequest(dto) {
        return this.catalogService.createTenantRequest(dto);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('homepage'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getHomepage", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/:slug'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('brands'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "placeOrder", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getPublicOrder", null);
__decorate([
    (0, common_1.Post)('admin/products'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Post)('admin/banners'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_banner_dto_1.CreateBannerDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createBanner", null);
__decorate([
    (0, common_1.Post)('admin/sections'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_section_dto_1.CreateSectionDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createSection", null);
__decorate([
    (0, common_1.Get)('admin/products/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Patch)('admin/products/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('admin/products/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Post)('admin/categories'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('admin/categories/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('admin/categories/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Delete)('admin/banners/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteBanner", null);
__decorate([
    (0, common_1.Get)('admin/orders'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Patch)('admin/orders/:id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('admin/products/:productId/reviews'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProductReviews", null);
__decorate([
    (0, common_1.Post)('admin/products/:productId/reviews'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createReview", null);
__decorate([
    (0, common_1.Patch)('admin/reviews/:id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateReviewStatus", null);
__decorate([
    (0, common_1.Delete)('admin/reviews/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Get)('admin/products/:productId/variants'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProductVariants", null);
__decorate([
    (0, common_1.Post)('admin/products/:productId/variants'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createVariant", null);
__decorate([
    (0, common_1.Patch)('admin/variants/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateVariant", null);
__decorate([
    (0, common_1.Delete)('admin/variants/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteVariant", null);
__decorate([
    (0, common_1.Post)('admin/variants/:id/stock'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)('admin/products/:productId/stock-logs'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getStockLogs", null);
__decorate([
    (0, common_1.Get)('admin/inventory'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getInventoryOverview", null);
__decorate([
    (0, common_1.Post)('tenant-requests'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createTenantRequest", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)('api/v1/catalog'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map