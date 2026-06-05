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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const payment_service_1 = require("../payment/payment.service");
let CatalogService = class CatalogService {
    prisma;
    paymentService;
    constructor(prisma, paymentService) {
        this.prisma = prisma;
        this.paymentService = paymentService;
    }
    async getHomepageData(shopId) {
        const banners = await this.prisma.banner.findMany({
            where: { shop_id: shopId, is_active: true },
            orderBy: { sort_order: 'asc' },
        });
        const rawSections = await this.prisma.productSection.findMany({
            where: { shop_id: shopId, is_active: true },
            orderBy: { sort_order: 'asc' },
        });
        const sections = await Promise.all(rawSections.map(async (section) => {
            const config = (section.config || {});
            let products = [];
            if (config.product_ids && Array.isArray(config.product_ids) && config.product_ids.length > 0) {
                products = await this.prisma.product.findMany({
                    where: {
                        id: { in: config.product_ids },
                        shop_id: shopId,
                        status: 'active',
                    },
                    include: {
                        gallery: { where: { is_cover: true } },
                        variants: { where: { is_active: true } },
                        category: { select: { id: true, name: true, slug: true, parent_id: true } },
                    },
                });
            }
            else if (config.category_id) {
                products = await this.prisma.product.findMany({
                    where: {
                        category_id: config.category_id,
                        shop_id: shopId,
                        status: 'active',
                    },
                    take: config.limit || 8,
                    include: {
                        gallery: { where: { is_cover: true } },
                        variants: { where: { is_active: true } },
                        category: { select: { id: true, name: true, slug: true, parent_id: true } },
                    },
                });
            }
            else {
                products = await this.prisma.product.findMany({
                    where: {
                        is_featured: true,
                        shop_id: shopId,
                        status: 'active',
                    },
                    take: config.limit || 8,
                    include: {
                        gallery: { where: { is_cover: true } },
                        variants: { where: { is_active: true } },
                        category: { select: { id: true, name: true, slug: true, parent_id: true } },
                    },
                });
            }
            return {
                id: section.id,
                title: section.title,
                type: section.type,
                sort_order: section.sort_order,
                products,
            };
        }));
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: {
                name: true,
                logo_url: true,
                description: true
            }
        });
        return { shop, banners, sections };
    }
    async getProductBySlug(shopId, slug) {
        const product = await this.prisma.product.findFirst({
            where: { shop_id: shopId, slug },
            include: {
                gallery: { orderBy: { sort_order: 'asc' } },
                variants: {
                    where: { is_active: true },
                    include: {
                        attributes: { orderBy: { sort_order: 'asc' } },
                    },
                    orderBy: { sort_order: 'asc' },
                },
                faqs: { orderBy: { sort_order: 'asc' } },
                reviews: {
                    where: { status: 'approved' },
                    orderBy: { created_at: 'desc' },
                },
                category: { select: { id: true, name: true, slug: true } },
                brand: { select: { id: true, name: true, slug: true } },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with slug '${slug}' not found`);
        }
        let relatedProducts = [];
        if (product.category_id) {
            relatedProducts = await this.prisma.product.findMany({
                where: {
                    category_id: product.category_id,
                    shop_id: shopId,
                    status: 'active',
                    id: { not: product.id },
                },
                take: 4,
                include: {
                    gallery: { where: { is_cover: true } },
                    variants: { where: { is_active: true } },
                },
            });
        }
        return { product, relatedProducts };
    }
    async getProducts(shopId, query) {
        const limit = Number(query.limit) || 12;
        const page = Number(query.page) || 1;
        const skip = (page - 1) * limit;
        const whereClause = {
            shop_id: shopId,
            status: 'active',
        };
        if (query.category_slug) {
            const category = await this.prisma.category.findFirst({
                where: { shop_id: shopId, slug: query.category_slug, is_active: true },
            });
            if (category) {
                const allCategories = await this.prisma.category.findMany({
                    where: { shop_id: shopId, is_active: true },
                });
                const getDescendantIds = (parentId) => {
                    const children = allCategories.filter((c) => c.parent_id === parentId);
                    return [parentId, ...children.flatMap((c) => getDescendantIds(c.id))];
                };
                const categoryIds = getDescendantIds(category.id);
                whereClause.category_id = { in: categoryIds };
            }
            else {
                whereClause.category_id = '00000000-0000-0000-0000-000000000000';
            }
        }
        if (query.brand_slug) {
            whereClause.brand = { slug: query.brand_slug };
        }
        if (query.min_price !== undefined || query.max_price !== undefined) {
            whereClause.price = {};
            if (query.min_price !== undefined) {
                whereClause.price.gte = Number(query.min_price);
            }
            if (query.max_price !== undefined) {
                whereClause.price.lte = Number(query.max_price);
            }
        }
        if (query.search) {
            whereClause.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { short_desc: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        let orderBy = { created_at: 'desc' };
        if (query.sort) {
            if (query.sort === 'price_asc')
                orderBy = { price: 'asc' };
            if (query.sort === 'price_desc')
                orderBy = { price: 'desc' };
            if (query.sort === 'popular')
                orderBy = { total_sold: 'desc' };
        }
        const [products, totalCount] = await Promise.all([
            this.prisma.product.findMany({
                where: whereClause,
                orderBy,
                skip,
                take: limit,
                include: {
                    gallery: { where: { is_cover: true } },
                    variants: { where: { is_active: true } },
                    category: { select: { id: true, name: true, slug: true, parent_id: true } },
                },
            }),
            this.prisma.product.count({ where: whereClause }),
        ]);
        return {
            products,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit,
            },
        };
    }
    async getCategories(shopId) {
        const rawCategories = await this.prisma.category.findMany({
            where: { shop_id: shopId, is_active: true },
            orderBy: { sort_order: 'asc' },
            include: {
                _count: { select: { products: true } },
            },
        });
        const map = new Map();
        const roots = [];
        rawCategories.forEach((cat) => {
            map.set(cat.id, { ...cat, product_count: cat._count?.products ?? 0, children: [] });
        });
        rawCategories.forEach((cat) => {
            const mapped = map.get(cat.id);
            if (cat.parent_id) {
                const parent = map.get(cat.parent_id);
                if (parent) {
                    parent.children.push(mapped);
                }
                else {
                    roots.push(mapped);
                }
            }
            else {
                roots.push(mapped);
            }
        });
        return roots;
    }
    async getBrands(shopId) {
        return this.prisma.brand.findMany({
            where: { shop_id: shopId, is_active: true },
            orderBy: { name: 'asc' },
        });
    }
    async createProduct(shopId, dto) {
        const { custom_sections, ...rest } = dto;
        return this.prisma.product.create({
            data: {
                ...rest,
                shop_id: shopId,
                custom_sections: custom_sections || [],
            },
        });
    }
    async createBanner(shopId, dto) {
        return this.prisma.banner.create({
            data: {
                ...dto,
                shop_id: shopId,
            },
        });
    }
    async createSection(shopId, dto) {
        return this.prisma.productSection.create({
            data: {
                ...dto,
                shop_id: shopId,
            },
        });
    }
    async getProductById(shopId, productId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, shop_id: shopId },
            include: {
                gallery: { orderBy: { sort_order: 'asc' } },
                variants: {
                    include: {
                        attributes: { orderBy: { sort_order: 'asc' } },
                    },
                    orderBy: { sort_order: 'asc' },
                },
                faqs: { orderBy: { sort_order: 'asc' } },
                reviews: {
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID '${productId}' not found`);
        }
        return product;
    }
    async updateProduct(shopId, productId, dto) {
        const { custom_sections, gallery, faqs, category, brand, tax, variants, reviews, id, shop_id, created_at, updated_at, ...rest } = dto;
        await this.prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id: productId, shop_id: shopId },
                data: {
                    ...rest,
                    custom_sections: custom_sections !== undefined ? custom_sections : undefined,
                },
            });
            if (gallery !== undefined && Array.isArray(gallery)) {
                await tx.productGallery.deleteMany({
                    where: { product_id: productId, shop_id: shopId }
                });
                if (gallery.length > 0) {
                    await tx.productGallery.createMany({
                        data: gallery.map((g, index) => ({
                            shop_id: shopId,
                            product_id: productId,
                            url: g.url,
                            alt_text: g.alt_text || null,
                            sort_order: g.sort_order !== undefined ? g.sort_order : index,
                            is_cover: !!g.is_cover
                        }))
                    });
                }
            }
            if (faqs !== undefined && Array.isArray(faqs)) {
                await tx.productFaq.deleteMany({
                    where: { product_id: productId, shop_id: shopId }
                });
                if (faqs.length > 0) {
                    await tx.productFaq.createMany({
                        data: faqs.map((f, index) => ({
                            shop_id: shopId,
                            product_id: productId,
                            question: f.question,
                            answer: f.answer,
                            sort_order: f.sort_order !== undefined ? f.sort_order : index
                        }))
                    });
                }
            }
        });
        return this.prisma.product.findFirst({
            where: { id: productId, shop_id: shopId },
            include: {
                gallery: { orderBy: { sort_order: 'asc' } },
                variants: {
                    include: { attributes: { orderBy: { sort_order: 'asc' } } },
                    orderBy: { sort_order: 'asc' },
                },
                faqs: { orderBy: { sort_order: 'asc' } },
                category: { select: { id: true, name: true, slug: true } },
                brand: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    async deleteProduct(shopId, productId) {
        return this.prisma.product.delete({
            where: { id: productId, shop_id: shopId },
        });
    }
    async getProductReviews(shopId, productId) {
        return this.prisma.review.findMany({
            where: { shop_id: shopId, product_id: productId },
            orderBy: { created_at: 'desc' },
        });
    }
    async createReview(shopId, productId, dto) {
        return this.prisma.review.create({
            data: {
                shop_id: shopId,
                product_id: productId,
                rating: dto.rating,
                title: dto.title || null,
                body: dto.body || null,
                status: dto.status || 'approved',
            },
        });
    }
    async deleteReview(shopId, reviewId) {
        return this.prisma.review.delete({
            where: { id: reviewId, shop_id: shopId },
        });
    }
    async updateReviewStatus(shopId, reviewId, status) {
        return this.prisma.review.update({
            where: { id: reviewId, shop_id: shopId },
            data: { status },
        });
    }
    async getProductVariants(shopId, productId) {
        return this.prisma.productVariant.findMany({
            where: { shop_id: shopId, product_id: productId },
            include: { attributes: { orderBy: { sort_order: 'asc' } } },
            orderBy: { sort_order: 'asc' },
        });
    }
    async createVariant(shopId, productId, dto) {
        const { label, sku, price, compare_price, cost_price, stock_qty, low_stock_at, image_url, is_active, sort_order, } = dto;
        const existingCount = await this.prisma.productVariant.count({
            where: { shop_id: shopId, product_id: productId },
        });
        const finalSku = sku?.trim()
            ? sku.trim()
            : `${productId.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const variant = await this.prisma.productVariant.create({
            data: {
                shop_id: shopId,
                product_id: productId,
                label: label || null,
                sku: finalSku,
                price: parseFloat(price) || 0,
                compare_price: compare_price ? parseFloat(compare_price) : null,
                cost_price: cost_price ? parseFloat(cost_price) : null,
                stock_qty: parseInt(stock_qty) || 0,
                low_stock_at: parseInt(low_stock_at) || 5,
                image_url: image_url || null,
                is_active: is_active !== false,
                sort_order: sort_order !== undefined ? sort_order : existingCount,
            },
        });
        await this.prisma.product.update({
            where: { id: productId, shop_id: shopId },
            data: { has_variants: true },
        });
        return variant;
    }
    async updateVariant(shopId, variantId, dto) {
        const { label, price, compare_price, cost_price, low_stock_at, image_url, is_active, sort_order, } = dto;
        return this.prisma.productVariant.update({
            where: { id: variantId, shop_id: shopId },
            data: {
                ...(label !== undefined && { label }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(compare_price !== undefined && { compare_price: compare_price ? parseFloat(compare_price) : null }),
                ...(cost_price !== undefined && { cost_price: cost_price ? parseFloat(cost_price) : null }),
                ...(low_stock_at !== undefined && { low_stock_at: parseInt(low_stock_at) }),
                ...(image_url !== undefined && { image_url }),
                ...(is_active !== undefined && { is_active }),
                ...(sort_order !== undefined && { sort_order }),
            },
        });
    }
    async deleteVariant(shopId, variantId) {
        return this.prisma.productVariant.delete({
            where: { id: variantId, shop_id: shopId },
        });
    }
    async adjustStock(shopId, variantId, dto) {
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, shop_id: shopId },
        });
        if (!variant)
            throw new common_1.NotFoundException(`Variant not found`);
        const newQty = Math.max(0, variant.stock_qty + dto.adjustment);
        await this.prisma.productVariant.update({
            where: { id: variantId },
            data: { stock_qty: newQty },
        });
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { shop_id: shopId },
        });
        if (warehouse) {
            await this.prisma.inventoryLog.create({
                data: {
                    shop_id: shopId,
                    variant_id: variantId,
                    warehouse_id: warehouse.id,
                    type: dto.type || 'manual',
                    qty_change: dto.adjustment,
                    qty_after: newQty,
                    note: dto.note || null,
                },
            });
        }
        return { variantId, previousQty: variant.stock_qty, newQty, adjustment: dto.adjustment };
    }
    async getStockLogs(shopId, productId) {
        const variants = await this.prisma.productVariant.findMany({
            where: { shop_id: shopId, product_id: productId },
            select: { id: true, label: true, sku: true },
        });
        const variantIds = variants.map((v) => v.id);
        if (variantIds.length === 0)
            return [];
        const logs = await this.prisma.inventoryLog.findMany({
            where: { shop_id: shopId, variant_id: { in: variantIds } },
            orderBy: { created_at: 'desc' },
            take: 60,
        });
        const variantMap = new Map(variants.map((v) => [v.id, v]));
        return logs.map((log) => ({
            ...log,
            variant: variantMap.get(log.variant_id) || null,
        }));
    }
    async getInventoryOverview(shopId) {
        const products = await this.prisma.product.findMany({
            where: { shop_id: shopId },
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                gallery: { where: { is_cover: true }, select: { url: true }, take: 1 },
                variants: {
                    orderBy: { sort_order: 'asc' },
                    select: {
                        id: true,
                        label: true,
                        sku: true,
                        price: true,
                        stock_qty: true,
                        low_stock_at: true,
                        is_active: true,
                        sort_order: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return products.map((p) => {
            const totalStock = p.variants.reduce((sum, v) => sum + v.stock_qty, 0);
            const outOfStock = p.variants.filter((v) => v.stock_qty === 0).length;
            const lowStock = p.variants.filter((v) => v.stock_qty > 0 && v.stock_qty <= v.low_stock_at).length;
            return { ...p, totalStock, outOfStock, lowStock };
        });
    }
    async createCategory(shopId, dto) {
        return this.prisma.category.create({
            data: {
                ...dto,
                shop_id: shopId,
            },
        });
    }
    async updateCategory(shopId, categoryId, dto) {
        return this.prisma.category.update({
            where: { id: categoryId, shop_id: shopId },
            data: dto,
        });
    }
    async deleteCategory(shopId, categoryId) {
        return this.prisma.category.delete({
            where: { id: categoryId, shop_id: shopId },
        });
    }
    async deleteBanner(shopId, bannerId) {
        return this.prisma.banner.delete({
            where: { id: bannerId, shop_id: shopId },
        });
    }
    async getOrders(shopId) {
        return this.prisma.order.findMany({
            where: { shop_id: shopId },
            include: {
                items: true,
                status_logs: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async updateOrderStatus(shopId, orderId, status, note) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId, shop_id: shopId },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status },
            });
            await tx.orderStatusLog.create({
                data: {
                    shop_id: shopId,
                    order_id: orderId,
                    from_status: order.status,
                    to_status: status,
                    note: note || `Order status updated to ${status}`,
                },
            });
            return updatedOrder;
        });
    }
    async registerShop(dto) {
        const password = dto.ownerPassword || `${dto.slug}@OakSol2026`;
        const shop = await this.prisma.shop.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                plan: 'starter',
                status: 'active',
                currency: 'INR',
                timezone: 'Asia/Kolkata',
            }
        });
        await this.prisma.shopDomain.create({
            data: {
                shop_id: shop.id,
                domain: `${dto.slug}.localhost`,
                type: 'subdomain',
                is_primary: true,
                status: 'active',
                verified_at: new Date()
            }
        });
        const owner = await this.prisma.user.create({
            data: {
                shop_id: shop.id,
                name: dto.ownerName,
                email: dto.ownerEmail,
                password_hash: '$2b$10$placeholder_hash_value',
                password: password,
                role: 'owner',
            }
        });
        await this.prisma.shop.update({
            where: { id: shop.id },
            data: { owner_id: owner.id }
        });
        const category = await this.prisma.category.create({
            data: {
                shop_id: shop.id,
                name: 'General Cleansers',
                slug: 'cleansers',
                is_active: true
            }
        });
        const brand = await this.prisma.brand.create({
            data: {
                shop_id: shop.id,
                name: dto.name.toUpperCase(),
                slug: dto.slug,
                is_active: true
            }
        });
        await this.prisma.product.create({
            data: {
                shop_id: shop.id,
                category_id: category.id,
                brand_id: brand.id,
                name: 'Demo Herbal Cleanser',
                slug: 'demo-cleanser',
                short_desc: 'Sample product automatically provisioned for your demo store.',
                description: 'This is a sample product description seeded automatically to help you test the OakSol Commerce platform.',
                price: 299.00,
                compare_price: 399.00,
                status: 'active',
                is_featured: true,
                custom_sections: [
                    {
                        id: 'benefits',
                        title: 'Benefits',
                        type: 'bullets',
                        content: [
                            '100% natural and skin-friendly.',
                            'Cleanses dirt, pollutants, and sebum.',
                            'Restores natural skin hydration.'
                        ]
                    }
                ]
            }
        });
        await this.prisma.banner.create({
            data: {
                shop_id: shop.id,
                title: `Welcome to ${dto.name}`,
                image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1000',
                link_url: `/products/demo-cleanser`,
                is_active: true
            }
        });
        await this.prisma.productSection.create({
            data: {
                shop_id: shop.id,
                title: 'Featured Collections',
                type: 'grid',
                is_active: true,
                sort_order: 1,
                config: { limit: 4 }
            }
        });
        return {
            shopId: shop.id,
            shopSlug: shop.slug,
            domain: `${dto.slug}.localhost`,
            ownerEmail: dto.ownerEmail,
            ownerPassword: password,
        };
    }
    async createTenantRequest(dto) {
        const existingShop = await this.prisma.shop.findUnique({
            where: { slug: dto.slug }
        });
        if (existingShop) {
            throw new common_1.BadRequestException('Shop slug is already registered');
        }
        const existingReq = await this.prisma.tenantRequest.findUnique({
            where: { slug: dto.slug }
        });
        if (existingReq) {
            throw new common_1.BadRequestException('Shop slug is already requested');
        }
        return this.prisma.tenantRequest.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                owner_name: dto.ownerName,
                owner_email: dto.ownerEmail,
                phone: dto.phone || null,
                category: dto.category || null,
                status: 'pending'
            }
        });
    }
    async getTenantRequests() {
        return this.prisma.tenantRequest.findMany({
            orderBy: { created_at: 'desc' }
        });
    }
    async approveTenantRequest(id) {
        const request = await this.prisma.tenantRequest.findUnique({
            where: { id }
        });
        if (!request) {
            throw new common_1.NotFoundException('Tenant request not found');
        }
        if (request.status === 'approved') {
            throw new common_1.BadRequestException('Tenant request already approved');
        }
        const generatedPassword = `${request.slug}@OakSol2026`;
        const result = await this.registerShop({
            name: request.name,
            slug: request.slug,
            ownerEmail: request.owner_email,
            ownerName: request.owner_name,
            ownerPassword: generatedPassword
        });
        await this.prisma.tenantRequest.update({
            where: { id },
            data: { status: 'approved' }
        });
        return {
            message: 'Shop successfully provisioned',
            ...result,
            credentials: {
                email: request.owner_email,
                password: generatedPassword,
                loginUrl: `http://${request.slug}.localhost:3000/admin`,
                domain: `http://${request.slug}.localhost:3000`
            }
        };
    }
    async getShops() {
        return this.prisma.shop.findMany({
            include: {
                domains: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }
    async getShopDetail(idOrSlug) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        const shop = await this.prisma.shop.findFirst({
            where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
            include: {
                domains: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        password: true,
                        password_hash: true,
                        role: true,
                        is_active: true
                    }
                },
                products: {
                    include: {
                        category: { select: { name: true } }
                    },
                    orderBy: { created_at: 'desc' }
                },
                categories: {
                    orderBy: { sort_order: 'asc' }
                },
                banners: {
                    orderBy: { sort_order: 'asc' }
                },
                product_sections: {
                    orderBy: { sort_order: 'asc' }
                }
            }
        });
        if (!shop) {
            throw new common_1.NotFoundException('Shop details not found');
        }
        return shop;
    }
    async updateShop(id, dto) {
        const shop = await this.prisma.shop.findUnique({ where: { id } });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        return this.prisma.shop.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.plan && { plan: dto.plan }),
                ...(dto.status && { status: dto.status }),
                ...(dto.description !== undefined && { description: dto.description }),
            }
        });
    }
    async deleteShop(id) {
        const shop = await this.prisma.shop.findUnique({ where: { id } });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        await this.prisma.shop.delete({ where: { id } });
        return { message: `Shop "${shop.name}" (${shop.slug}) deleted successfully` };
    }
    async rejectTenantRequest(id) {
        const request = await this.prisma.tenantRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Tenant request not found');
        return this.prisma.tenantRequest.update({
            where: { id },
            data: { status: 'rejected' }
        });
    }
    async deleteTenantRequest(id) {
        const request = await this.prisma.tenantRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Tenant request not found');
        await this.prisma.tenantRequest.delete({ where: { id } });
        return { message: 'Tenant request deleted successfully' };
    }
    async seedDemoData(shopId) {
        const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        const demoProducts = [
            { name: 'Rose Water Toner', slug: `rose-toner-${Date.now()}`, price: 349, desc: 'Soothing pure rose water toner for all skin types.' },
            { name: 'Kumkumadi Face Oil', slug: `kumkumadi-oil-${Date.now() + 1}`, price: 599, desc: 'Ayurvedic face oil with saffron and 16 herbs.' },
            { name: 'Neem Tulsi Face Wash', slug: `neem-facewash-${Date.now() + 2}`, price: 249, desc: 'Anti-bacterial herbal face wash for acne-prone skin.' },
        ];
        const cat = await this.prisma.category.upsert({
            where: { shop_id_slug: { shop_id: shopId, slug: 'demo-products' } },
            update: {},
            create: { shop_id: shopId, name: 'Demo Collection', slug: 'demo-products', is_active: true }
        });
        const created = [];
        for (const p of demoProducts) {
            const prod = await this.prisma.product.upsert({
                where: { shop_id_slug: { shop_id: shopId, slug: p.slug } },
                update: {},
                create: {
                    shop_id: shopId,
                    category_id: cat.id,
                    name: p.name,
                    slug: p.slug,
                    short_desc: p.desc,
                    description: p.desc,
                    price: p.price,
                    compare_price: Math.round(p.price * 1.3),
                    status: 'active',
                    is_featured: true,
                    custom_sections: [
                        { id: 'benefits', title: 'Benefits', type: 'bullets', content: ['100% Natural', 'Dermatologist tested', 'Chemical-free formula'] }
                    ]
                }
            });
            created.push(prod.name);
        }
        const bannerCount = await this.prisma.banner.count({ where: { shop_id: shopId } });
        if (bannerCount === 0) {
            await this.prisma.banner.create({
                data: {
                    shop_id: shopId,
                    title: `Welcome to ${shop.name}`,
                    image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1000',
                    link_url: '/products',
                    is_active: true
                }
            });
        }
        return { message: `Demo data seeded: ${created.join(', ')}`, productsAdded: created.length };
    }
    async getDashboardStats() {
        const [totalShops, totalRequests, pendingRequests, totalProducts] = await Promise.all([
            this.prisma.shop.count({ where: { status: 'active' } }),
            this.prisma.tenantRequest.count(),
            this.prisma.tenantRequest.count({ where: { status: 'pending' } }),
            this.prisma.product.count(),
        ]);
        return { totalShops, totalRequests, pendingRequests, totalProducts };
    }
    async placeOrder(shopId, dto) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item');
        }
        const variantIds = dto.items.map(item => item.variant_id);
        const variants = await this.prisma.productVariant.findMany({
            where: { id: { in: variantIds }, shop_id: shopId },
            include: { product: true }
        });
        if (variants.length !== dto.items.length) {
            throw new common_1.BadRequestException('Some product variants were not found');
        }
        const variantMap = new Map(variants.map(v => [v.id, v]));
        for (const item of dto.items) {
            const variant = variantMap.get(item.variant_id);
            if (!variant)
                continue;
            if (variant.stock_qty < item.qty) {
                throw new common_1.BadRequestException(`Insufficient stock for ${variant.label || variant.sku}. Available: ${variant.stock_qty}`);
            }
        }
        let subtotal = 0;
        for (const item of dto.items) {
            const variant = variantMap.get(item.variant_id);
            if (variant) {
                subtotal += Number(variant.price) * item.qty;
            }
        }
        const shippingFee = subtotal >= 500 ? 0 : 50;
        const total = subtotal + shippingFee;
        const orderNumber = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    shop_id: shopId,
                    order_number: orderNumber,
                    status: 'pending',
                    subtotal: subtotal,
                    discount_amount: 0,
                    shipping_amount: shippingFee,
                    tax_amount: 0,
                    total: total,
                    shipping_address: dto.shipping_address,
                    notes: dto.notes || null,
                    items: {
                        create: dto.items.map(item => {
                            const variant = variantMap.get(item.variant_id);
                            return {
                                shop_id: shopId,
                                variant_id: item.variant_id,
                                qty: item.qty,
                                unit_price: variant.price,
                                line_total: Number(variant.price) * item.qty,
                                product_snap: {
                                    name: variant.product.name,
                                    sku: variant.sku,
                                    label: variant.label,
                                    image_url: variant.image_url || null,
                                }
                            };
                        })
                    }
                },
                include: {
                    items: true
                }
            });
            await tx.orderStatusLog.create({
                data: {
                    shop_id: shopId,
                    order_id: order.id,
                    from_status: null,
                    to_status: 'pending',
                    note: `Order submitted via storefront (${dto.payment_method.toUpperCase()})`,
                }
            });
            if (dto.payment_method === 'cod') {
                const confirmedOrder = await tx.order.update({
                    where: { id: order.id },
                    data: { status: 'confirmed' }
                });
                await tx.orderStatusLog.create({
                    data: {
                        shop_id: shopId,
                        order_id: order.id,
                        from_status: 'pending',
                        to_status: 'confirmed',
                        note: 'Order confirmed under Cash on Delivery (COD) terms',
                    }
                });
                for (const item of dto.items) {
                    const variant = variantMap.get(item.variant_id);
                    if (variant) {
                        const newQty = Math.max(0, variant.stock_qty - item.qty);
                        await tx.productVariant.update({
                            where: { id: item.variant_id },
                            data: { stock_qty: newQty }
                        });
                        const warehouse = await tx.warehouse.findFirst({
                            where: { shop_id: shopId, is_active: true }
                        });
                        if (warehouse) {
                            await tx.inventoryLog.create({
                                data: {
                                    shop_id: shopId,
                                    variant_id: item.variant_id,
                                    warehouse_id: warehouse.id,
                                    type: 'sale',
                                    qty_change: -item.qty,
                                    qty_after: newQty,
                                    ref_id: order.id,
                                    note: `COD Order sale deduction: ${orderNumber}`
                                }
                            });
                        }
                    }
                }
                return { order: confirmedOrder, paymentRequired: false, gatewayOrder: null };
            }
            let gatewayOrder = null;
            if (dto.payment_method === 'razorpay') {
                gatewayOrder = await this.paymentService.createRazorpayOrder(shopId, total, 'INR', order.order_number);
            }
            return { order, paymentRequired: true, gatewayOrder };
        });
    }
    async getPublicOrderById(shopId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, shop_id: shopId },
            include: {
                items: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        return {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            subtotal: order.subtotal,
            shipping_amount: order.shipping_amount,
            discount_amount: order.discount_amount,
            tax_amount: order.tax_amount,
            total: order.total,
            shipping_address: order.shipping_address,
            notes: order.notes,
            created_at: order.created_at,
            items: order.items.map((item) => ({
                id: item.id,
                qty: item.qty,
                unit_price: item.unit_price,
                line_total: item.line_total,
                product_snap: item.product_snap,
            })),
        };
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_service_1.PaymentService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map