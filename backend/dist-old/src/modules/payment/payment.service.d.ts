import { PrismaService } from '../../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    createRazorpayOrder(shopId: string, amount: number, currency: string | undefined, receiptId: string): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    verifyWebhookSignature(shopId: string, payload: string, signature: string): Promise<boolean>;
    handleWebhook(shopId: string, payload: any): Promise<{
        status: string;
    }>;
    verifyPayment(shopId: string, dto: {
        orderId: string;
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    initializePayment(shopId: string, orderId: string): Promise<{
        order_id: string;
        order_number: string;
        total: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        razorpay_order_id: string;
        razorpay_key_id: any;
    }>;
    getPaymentGateways(shopId: string, isAdmin: boolean): Promise<{
        config: any;
        id: string;
        slug: string;
        name: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        sort_order: number;
    }[]>;
    updatePaymentGateway(shopId: string, id: string, dto: {
        name?: string;
        is_active?: boolean;
        config?: any;
        sort_order?: number;
    }): Promise<{
        id: string;
        slug: string;
        name: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        sort_order: number;
        config: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
