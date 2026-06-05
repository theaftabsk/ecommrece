import { Request } from 'express';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { CreateSectionDto } from './dto/create-section.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    getHomepage(req: Request & {
        shopId?: string;
    }): Promise<{
        shop: {
            name: string;
            logo_url: string | null;
            description: string | null;
        } | null;
        banners: {
            id: string;
            created_at: Date;
            shop_id: string;
            is_active: boolean;
            image_url: string;
            sort_order: number;
            title: string | null;
            link_url: string | null;
        }[];
        sections: {
            id: string;
            title: string;
            type: string;
            sort_order: number;
            products: any[];
        }[];
    }>;
    getProducts(req: Request & {
        shopId?: string;
    }, query: any): Promise<{
        products: ({
            category: {
                id: string;
                slug: string;
                name: string;
                parent_id: string | null;
            } | null;
            gallery: {
                url: string;
                id: string;
                created_at: Date;
                shop_id: string;
                sort_order: number;
                product_id: string;
                alt_text: string | null;
                is_cover: boolean;
            }[];
            variants: {
                id: string;
                created_at: Date;
                updated_at: Date;
                shop_id: string;
                is_active: boolean;
                image_url: string | null;
                sort_order: number;
                price: import("@prisma/client-runtime-utils").Decimal;
                compare_price: import("@prisma/client-runtime-utils").Decimal | null;
                cost_price: import("@prisma/client-runtime-utils").Decimal | null;
                total_sold: number;
                sku: string;
                product_id: string;
                label: string | null;
                stock_qty: number;
                low_stock_at: number;
            }[];
        } & {
            id: string;
            slug: string;
            name: string;
            status: string;
            description: string | null;
            created_at: Date;
            updated_at: Date;
            shop_id: string;
            category_id: string | null;
            brand_id: string | null;
            short_desc: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            cost_price: import("@prisma/client-runtime-utils").Decimal | null;
            master_sku: string | null;
            is_featured: boolean;
            has_variants: boolean;
            tax_id: string | null;
            total_sold: number;
            meta_title: string | null;
            meta_description: string | null;
            custom_sections: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        pagination: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    getProduct(req: Request & {
        shopId?: string;
    }, slug: string): Promise<{
        product: {
            reviews: {
                id: string;
                status: string;
                created_at: Date;
                shop_id: string;
                title: string | null;
                product_id: string;
                customer_id: string | null;
                rating: number;
                body: string | null;
            }[];
            category: {
                id: string;
                slug: string;
                name: string;
            } | null;
            brand: {
                id: string;
                slug: string;
                name: string;
            } | null;
            gallery: {
                url: string;
                id: string;
                created_at: Date;
                shop_id: string;
                sort_order: number;
                product_id: string;
                alt_text: string | null;
                is_cover: boolean;
            }[];
            variants: ({
                attributes: {
                    id: string;
                    shop_id: string;
                    sort_order: number;
                    variant_id: string;
                    attr_key: string;
                    attr_value: string;
                }[];
            } & {
                id: string;
                created_at: Date;
                updated_at: Date;
                shop_id: string;
                is_active: boolean;
                image_url: string | null;
                sort_order: number;
                price: import("@prisma/client-runtime-utils").Decimal;
                compare_price: import("@prisma/client-runtime-utils").Decimal | null;
                cost_price: import("@prisma/client-runtime-utils").Decimal | null;
                total_sold: number;
                sku: string;
                product_id: string;
                label: string | null;
                stock_qty: number;
                low_stock_at: number;
            })[];
            faqs: {
                id: string;
                created_at: Date;
                shop_id: string;
                sort_order: number;
                product_id: string;
                question: string;
                answer: string;
            }[];
        } & {
            id: string;
            slug: string;
            name: string;
            status: string;
            description: string | null;
            created_at: Date;
            updated_at: Date;
            shop_id: string;
            category_id: string | null;
            brand_id: string | null;
            short_desc: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            cost_price: import("@prisma/client-runtime-utils").Decimal | null;
            master_sku: string | null;
            is_featured: boolean;
            has_variants: boolean;
            tax_id: string | null;
            total_sold: number;
            meta_title: string | null;
            meta_description: string | null;
            custom_sections: import("@prisma/client/runtime/client").JsonValue | null;
        };
        relatedProducts: any[];
    }>;
    getCategories(req: Request & {
        shopId?: string;
    }): Promise<any[]>;
    getBrands(req: Request & {
        shopId?: string;
    }): Promise<{
        id: string;
        slug: string;
        name: string;
        logo_url: string | null;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
    }[]>;
    placeOrder(req: Request & {
        shopId?: string;
    }, dto: {
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        shipping_address: any;
        payment_method: string;
        notes?: string;
        items: {
            variant_id: string;
            qty: number;
        }[];
    }): Promise<{
        order: {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            shop_id: string;
            notes: string | null;
            customer_id: string | null;
            order_number: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            discount_amount: import("@prisma/client-runtime-utils").Decimal;
            shipping_amount: import("@prisma/client-runtime-utils").Decimal;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            coupon_id: string | null;
            shipping_rate_id: string | null;
            shipping_address: import("@prisma/client/runtime/client").JsonValue;
            billing_address: import("@prisma/client/runtime/client").JsonValue | null;
        };
        paymentRequired: boolean;
        gatewayOrder: null;
    } | {
        order: {
            items: {
                id: string;
                created_at: Date;
                shop_id: string;
                order_id: string;
                variant_id: string;
                product_snap: import("@prisma/client/runtime/client").JsonValue;
                qty: number;
                unit_price: import("@prisma/client-runtime-utils").Decimal;
                line_total: import("@prisma/client-runtime-utils").Decimal;
            }[];
        } & {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            shop_id: string;
            notes: string | null;
            customer_id: string | null;
            order_number: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            discount_amount: import("@prisma/client-runtime-utils").Decimal;
            shipping_amount: import("@prisma/client-runtime-utils").Decimal;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            coupon_id: string | null;
            shipping_rate_id: string | null;
            shipping_address: import("@prisma/client/runtime/client").JsonValue;
            billing_address: import("@prisma/client/runtime/client").JsonValue | null;
        };
        paymentRequired: boolean;
        gatewayOrder: import("razorpay/dist/types/orders").Orders.RazorpayOrder | null;
    }>;
    getPublicOrder(req: Request & {
        shopId?: string;
    }, id: string): Promise<{
        id: string;
        order_number: string;
        status: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shipping_amount: import("@prisma/client-runtime-utils").Decimal;
        discount_amount: import("@prisma/client-runtime-utils").Decimal;
        tax_amount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        shipping_address: import("@prisma/client/runtime/client").JsonValue;
        notes: string | null;
        created_at: Date;
        items: {
            id: string;
            qty: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            line_total: import("@prisma/client-runtime-utils").Decimal;
            product_snap: import("@prisma/client/runtime/client").JsonValue;
        }[];
    }>;
    createProduct(req: Request & {
        shopId?: string;
    }, dto: CreateProductDto): Promise<{
        id: string;
        slug: string;
        name: string;
        status: string;
        description: string | null;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        category_id: string | null;
        brand_id: string | null;
        short_desc: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        master_sku: string | null;
        is_featured: boolean;
        has_variants: boolean;
        tax_id: string | null;
        total_sold: number;
        meta_title: string | null;
        meta_description: string | null;
        custom_sections: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    createBanner(req: Request & {
        shopId?: string;
    }, dto: CreateBannerDto): Promise<{
        id: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        image_url: string;
        sort_order: number;
        title: string | null;
        link_url: string | null;
    }>;
    createSection(req: Request & {
        shopId?: string;
    }, dto: CreateSectionDto): Promise<{
        id: string;
        created_at: Date;
        shop_id: string;
        type: string;
        is_active: boolean;
        sort_order: number;
        title: string;
        config: import("@prisma/client/runtime/client").JsonValue;
    }>;
    getProductById(req: Request & {
        shopId?: string;
    }, id: string): Promise<{
        reviews: {
            id: string;
            status: string;
            created_at: Date;
            shop_id: string;
            title: string | null;
            product_id: string;
            customer_id: string | null;
            rating: number;
            body: string | null;
        }[];
        gallery: {
            url: string;
            id: string;
            created_at: Date;
            shop_id: string;
            sort_order: number;
            product_id: string;
            alt_text: string | null;
            is_cover: boolean;
        }[];
        variants: ({
            attributes: {
                id: string;
                shop_id: string;
                sort_order: number;
                variant_id: string;
                attr_key: string;
                attr_value: string;
            }[];
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            shop_id: string;
            is_active: boolean;
            image_url: string | null;
            sort_order: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            cost_price: import("@prisma/client-runtime-utils").Decimal | null;
            total_sold: number;
            sku: string;
            product_id: string;
            label: string | null;
            stock_qty: number;
            low_stock_at: number;
        })[];
        faqs: {
            id: string;
            created_at: Date;
            shop_id: string;
            sort_order: number;
            product_id: string;
            question: string;
            answer: string;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        status: string;
        description: string | null;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        category_id: string | null;
        brand_id: string | null;
        short_desc: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        master_sku: string | null;
        is_featured: boolean;
        has_variants: boolean;
        tax_id: string | null;
        total_sold: number;
        meta_title: string | null;
        meta_description: string | null;
        custom_sections: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateProduct(req: Request & {
        shopId?: string;
    }, id: string, dto: any): Promise<({
        category: {
            id: string;
            slug: string;
            name: string;
        } | null;
        brand: {
            id: string;
            slug: string;
            name: string;
        } | null;
        gallery: {
            url: string;
            id: string;
            created_at: Date;
            shop_id: string;
            sort_order: number;
            product_id: string;
            alt_text: string | null;
            is_cover: boolean;
        }[];
        variants: ({
            attributes: {
                id: string;
                shop_id: string;
                sort_order: number;
                variant_id: string;
                attr_key: string;
                attr_value: string;
            }[];
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            shop_id: string;
            is_active: boolean;
            image_url: string | null;
            sort_order: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            cost_price: import("@prisma/client-runtime-utils").Decimal | null;
            total_sold: number;
            sku: string;
            product_id: string;
            label: string | null;
            stock_qty: number;
            low_stock_at: number;
        })[];
        faqs: {
            id: string;
            created_at: Date;
            shop_id: string;
            sort_order: number;
            product_id: string;
            question: string;
            answer: string;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        status: string;
        description: string | null;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        category_id: string | null;
        brand_id: string | null;
        short_desc: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        master_sku: string | null;
        is_featured: boolean;
        has_variants: boolean;
        tax_id: string | null;
        total_sold: number;
        meta_title: string | null;
        meta_description: string | null;
        custom_sections: import("@prisma/client/runtime/client").JsonValue | null;
    }) | null>;
    deleteProduct(req: Request & {
        shopId?: string;
    }, id: string): Promise<{
        id: string;
        slug: string;
        name: string;
        status: string;
        description: string | null;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        category_id: string | null;
        brand_id: string | null;
        short_desc: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        master_sku: string | null;
        is_featured: boolean;
        has_variants: boolean;
        tax_id: string | null;
        total_sold: number;
        meta_title: string | null;
        meta_description: string | null;
        custom_sections: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    createCategory(req: Request & {
        shopId?: string;
    }, dto: any): Promise<{
        id: string;
        slug: string;
        name: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        parent_id: string | null;
        image_url: string | null;
        sort_order: number;
        show_in_menu: boolean;
    }>;
    updateCategory(req: Request & {
        shopId?: string;
    }, id: string, dto: any): Promise<{
        id: string;
        slug: string;
        name: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        parent_id: string | null;
        image_url: string | null;
        sort_order: number;
        show_in_menu: boolean;
    }>;
    deleteCategory(req: Request & {
        shopId?: string;
    }, id: string): Promise<{
        id: string;
        slug: string;
        name: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        parent_id: string | null;
        image_url: string | null;
        sort_order: number;
        show_in_menu: boolean;
    }>;
    deleteBanner(req: Request & {
        shopId?: string;
    }, id: string): Promise<{
        id: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        image_url: string;
        sort_order: number;
        title: string | null;
        link_url: string | null;
    }>;
    getOrders(req: Request & {
        shopId?: string;
    }): Promise<({
        items: {
            id: string;
            created_at: Date;
            shop_id: string;
            order_id: string;
            variant_id: string;
            product_snap: import("@prisma/client/runtime/client").JsonValue;
            qty: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            line_total: import("@prisma/client-runtime-utils").Decimal;
        }[];
        status_logs: {
            id: string;
            created_at: Date;
            shop_id: string;
            order_id: string;
            from_status: string | null;
            to_status: string;
            note: string | null;
            changed_by: string | null;
        }[];
    } & {
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        notes: string | null;
        customer_id: string | null;
        order_number: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        discount_amount: import("@prisma/client-runtime-utils").Decimal;
        shipping_amount: import("@prisma/client-runtime-utils").Decimal;
        tax_amount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        coupon_id: string | null;
        shipping_rate_id: string | null;
        shipping_address: import("@prisma/client/runtime/client").JsonValue;
        billing_address: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    updateOrderStatus(req: Request & {
        shopId?: string;
    }, id: string, body: {
        status: string;
        note?: string;
    }): Promise<{
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        notes: string | null;
        customer_id: string | null;
        order_number: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        discount_amount: import("@prisma/client-runtime-utils").Decimal;
        shipping_amount: import("@prisma/client-runtime-utils").Decimal;
        tax_amount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        coupon_id: string | null;
        shipping_rate_id: string | null;
        shipping_address: import("@prisma/client/runtime/client").JsonValue;
        billing_address: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getProductReviews(req: Request & {
        shopId?: string;
    }, productId: string): Promise<{
        id: string;
        status: string;
        created_at: Date;
        shop_id: string;
        title: string | null;
        product_id: string;
        customer_id: string | null;
        rating: number;
        body: string | null;
    }[]>;
    createReview(req: Request & {
        shopId?: string;
    }, productId: string, dto: {
        reviewer_name?: string;
        rating: number;
        title?: string;
        body?: string;
        status?: string;
    }): Promise<{
        id: string;
        status: string;
        created_at: Date;
        shop_id: string;
        title: string | null;
        product_id: string;
        customer_id: string | null;
        rating: number;
        body: string | null;
    }>;
    updateReviewStatus(req: Request & {
        shopId?: string;
    }, id: string, body: {
        status: string;
    }): Promise<{
        id: string;
        status: string;
        created_at: Date;
        shop_id: string;
        title: string | null;
        product_id: string;
        customer_id: string | null;
        rating: number;
        body: string | null;
    }>;
    deleteReview(req: Request & {
        shopId?: string;
    }, id: string): Promise<{
        id: string;
        status: string;
        created_at: Date;
        shop_id: string;
        title: string | null;
        product_id: string;
        customer_id: string | null;
        rating: number;
        body: string | null;
    }>;
    getProductVariants(req: Request & {
        shopId?: string;
    }, productId: string): Promise<({
        attributes: {
            id: string;
            shop_id: string;
            sort_order: number;
            variant_id: string;
            attr_key: string;
            attr_value: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        is_active: boolean;
        image_url: string | null;
        sort_order: number;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        total_sold: number;
        sku: string;
        product_id: string;
        label: string | null;
        stock_qty: number;
        low_stock_at: number;
    })[]>;
    createVariant(req: Request & {
        shopId?: string;
    }, productId: string, dto: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        is_active: boolean;
        image_url: string | null;
        sort_order: number;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        total_sold: number;
        sku: string;
        product_id: string;
        label: string | null;
        stock_qty: number;
        low_stock_at: number;
    }>;
    updateVariant(req: Request & {
        shopId?: string;
    }, id: string, dto: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        is_active: boolean;
        image_url: string | null;
        sort_order: number;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        total_sold: number;
        sku: string;
        product_id: string;
        label: string | null;
        stock_qty: number;
        low_stock_at: number;
    }>;
    deleteVariant(req: Request & {
        shopId?: string;
    }, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        shop_id: string;
        is_active: boolean;
        image_url: string | null;
        sort_order: number;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        cost_price: import("@prisma/client-runtime-utils").Decimal | null;
        total_sold: number;
        sku: string;
        product_id: string;
        label: string | null;
        stock_qty: number;
        low_stock_at: number;
    }>;
    adjustStock(req: Request & {
        shopId?: string;
    }, id: string, body: {
        adjustment: number;
        type?: string;
        note?: string;
    }): Promise<{
        variantId: string;
        previousQty: number;
        newQty: number;
        adjustment: number;
    }>;
    getStockLogs(req: Request & {
        shopId?: string;
    }, productId: string): Promise<{
        variant: {
            id: string;
            sku: string;
            label: string | null;
        } | null;
        id: string;
        created_at: Date;
        shop_id: string;
        type: string;
        note: string | null;
        variant_id: string;
        qty_change: number;
        qty_after: number;
        ref_id: string | null;
        warehouse_id: string;
        created_by: string | null;
    }[]>;
    getInventoryOverview(req: Request & {
        shopId?: string;
    }): Promise<{
        totalStock: number;
        outOfStock: number;
        lowStock: number;
        id: string;
        slug: string;
        name: string;
        status: string;
        gallery: {
            url: string;
        }[];
        variants: {
            id: string;
            is_active: boolean;
            sort_order: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            sku: string;
            label: string | null;
            stock_qty: number;
            low_stock_at: number;
        }[];
    }[]>;
    createTenantRequest(dto: {
        name: string;
        slug: string;
        ownerName: string;
        ownerEmail: string;
        phone?: string;
        category?: string;
    }): Promise<{
        id: string;
        slug: string;
        name: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        category: string | null;
        owner_name: string;
        owner_email: string;
        phone: string | null;
    }>;
}
