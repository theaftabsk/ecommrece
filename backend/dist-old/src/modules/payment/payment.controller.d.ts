import { Request } from 'express';
import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    getPublicGateways(req: Request & {
        shopId?: string;
    }): Promise<{
        config: any;
        id: string;
        slug: string;
        name: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        sort_order: number;
    }[]>;
    getAdminGateways(req: Request & {
        shopId?: string;
    }): Promise<{
        config: any;
        id: string;
        slug: string;
        name: string;
        created_at: Date;
        shop_id: string;
        is_active: boolean;
        sort_order: number;
    }[]>;
    updateGateway(req: Request & {
        shopId?: string;
    }, id: string, dto: {
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
    createOrder(req: Request & {
        shopId?: string;
    }, amount: number, currency: string, receiptId: string): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    initializePayment(req: Request & {
        shopId?: string;
    }, orderId: string): Promise<{
        order_id: string;
        order_number: string;
        total: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        razorpay_order_id: string;
        razorpay_key_id: any;
    }>;
    verifyPayment(req: Request & {
        shopId?: string;
    }, dto: {
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
    handleWebhook(req: Request & {
        shopId?: string;
    }, payload: any, signature: string): Promise<{
        status: string;
    }>;
}
