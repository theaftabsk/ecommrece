import { CatalogService } from './catalog.service';
export declare class PlatformAdminController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    getDashboardStats(): Promise<{
        totalShops: number;
        totalRequests: number;
        pendingRequests: number;
        totalProducts: number;
    }>;
    registerShop(dto: {
        name: string;
        slug: string;
        ownerEmail: string;
        ownerName: string;
        ownerPassword?: string;
    }): Promise<{
        shopId: string;
        shopSlug: string;
        domain: string;
        ownerEmail: string;
        ownerPassword: string;
    }>;
    getShops(): Promise<({
        owner: {
            id: string;
            name: string;
            email: string;
            role: string;
        } | null;
        domains: {
            id: string;
            status: string;
            created_at: Date;
            domain: string;
            shop_id: string;
            type: string;
            is_primary: boolean;
            verified_at: Date | null;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        owner_id: string | null;
        plan: string;
        status: string;
        logo_url: string | null;
        description: string | null;
        currency: string;
        timezone: string;
        created_at: Date;
        updated_at: Date;
    })[]>;
    getShopDetail(id: string): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
            password_hash: string;
            password: string | null;
            role: string;
            is_active: boolean;
        } | null;
        domains: {
            id: string;
            status: string;
            created_at: Date;
            domain: string;
            shop_id: string;
            type: string;
            is_primary: boolean;
            verified_at: Date | null;
        }[];
        categories: {
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
        }[];
        products: ({
            category: {
                name: string;
            } | null;
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
        product_sections: {
            id: string;
            created_at: Date;
            shop_id: string;
            type: string;
            is_active: boolean;
            sort_order: number;
            title: string;
            config: import("@prisma/client/runtime/client").JsonValue;
        }[];
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
    } & {
        id: string;
        slug: string;
        name: string;
        owner_id: string | null;
        plan: string;
        status: string;
        logo_url: string | null;
        description: string | null;
        currency: string;
        timezone: string;
        created_at: Date;
        updated_at: Date;
    }>;
    updateShop(id: string, dto: {
        name?: string;
        plan?: string;
        status?: string;
        description?: string;
    }): Promise<{
        id: string;
        slug: string;
        name: string;
        owner_id: string | null;
        plan: string;
        status: string;
        logo_url: string | null;
        description: string | null;
        currency: string;
        timezone: string;
        created_at: Date;
        updated_at: Date;
    }>;
    deleteShop(id: string): Promise<{
        message: string;
    }>;
    seedDemoData(id: string): Promise<{
        message: string;
        productsAdded: number;
    }>;
    getTenantRequests(): Promise<{
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
    }[]>;
    approveTenantRequest(id: string): Promise<{
        credentials: {
            email: string;
            password: string;
            loginUrl: string;
            domain: string;
        };
        shopId: string;
        shopSlug: string;
        domain: string;
        ownerEmail: string;
        ownerPassword: string;
        message: string;
    }>;
    rejectTenantRequest(id: string): Promise<{
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
    deleteTenantRequest(id: string): Promise<{
        message: string;
    }>;
}
