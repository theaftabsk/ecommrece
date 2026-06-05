"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
let PaymentService = class PaymentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRazorpayOrder(shopId, amount, currency = 'INR', receiptId) {
        try {
            const gateway = await this.prisma.paymentGateway.findFirst({
                where: { shop_id: shopId, slug: 'razorpay', is_active: true }
            });
            const config = (gateway?.config || {});
            const keyId = config?.key_id || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
            const keySecret = config?.key_secret || process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
            const client = new razorpay_1.default({
                key_id: keyId,
                key_secret: keySecret,
            });
            const options = {
                amount: Math.round(amount * 100),
                currency,
                receipt: receiptId,
            };
            const order = await client.orders.create(options);
            return order;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Razorpay order creation failed: ${error.message}`);
        }
    }
    async verifyWebhookSignature(shopId, payload, signature) {
        const gateway = await this.prisma.paymentGateway.findFirst({
            where: { shop_id: shopId, slug: 'razorpay', is_active: true }
        });
        const config = (gateway?.config || {});
        const secret = config?.webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(payload);
        const digest = shasum.digest('hex');
        return digest === signature;
    }
    async handleWebhook(shopId, payload) {
        const event = payload.event;
        const paymentEntity = payload.payload?.payment?.entity;
        if (!paymentEntity) {
            throw new common_1.BadRequestException('Webhook payload missing payment entity');
        }
        if (event === 'payment.captured') {
            const transactionId = paymentEntity.id;
            const amount = paymentEntity.amount / 100;
            await this.prisma.$transaction(async (tx) => {
                const order = await tx.order.findUnique({
                    where: { order_number: paymentEntity.receipt },
                });
                if (!order) {
                    throw new Error(`Order receipt ${paymentEntity.receipt} not found`);
                }
                const gateway = await tx.paymentGateway.findFirst({ where: { shop_id: shopId, slug: 'razorpay' } });
                if (!gateway) {
                    throw new Error('Payment gateway config for Razorpay not found');
                }
                await tx.payment.create({
                    data: {
                        shop_id: shopId,
                        order_id: order.id,
                        gateway_id: gateway.id,
                        amount,
                        currency: paymentEntity.currency || 'INR',
                        status: 'paid',
                        transaction_id: transactionId,
                        gateway_resp: paymentEntity,
                        paid_at: new Date(),
                    },
                });
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: 'confirmed' },
                });
                await tx.orderStatusLog.create({
                    data: {
                        shop_id: shopId,
                        order_id: order.id,
                        from_status: order.status,
                        to_status: 'confirmed',
                        note: 'Razorpay webhook payment captured successfully',
                    },
                });
                const orderItems = await tx.orderItem.findMany({
                    where: { order_id: order.id },
                    select: { variant_id: true, qty: true },
                });
                for (const item of orderItems) {
                    const variant = await tx.productVariant.findUnique({
                        where: { id: item.variant_id },
                        select: { stock_qty: true },
                    });
                    const warehouse = await tx.warehouse.findFirst({
                        where: { shop_id: shopId, is_active: true },
                        select: { id: true },
                    });
                    if (variant && warehouse) {
                        const newStock = Math.max(0, variant.stock_qty - item.qty);
                        await tx.productVariant.update({
                            where: { id: item.variant_id },
                            data: { stock_qty: newStock },
                        });
                        await tx.inventoryLog.create({
                            data: {
                                shop_id: shopId,
                                variant_id: item.variant_id,
                                warehouse_id: warehouse.id,
                                type: 'sale',
                                qty_change: -item.qty,
                                qty_after: newStock,
                                ref_id: order.id,
                                note: `Order sale deduction: ${order.order_number}`,
                            },
                        });
                    }
                }
            });
        }
        return { status: 'success' };
    }
    async verifyPayment(shopId, dto) {
        const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = dto;
        const gateway = await this.prisma.paymentGateway.findFirst({
            where: { shop_id: shopId, slug: 'razorpay', is_active: true }
        });
        if (!gateway) {
            throw new common_1.BadRequestException('Razorpay payment gateway is not active or configured');
        }
        const config = gateway.config;
        const keySecret = config?.key_secret || process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
            .createHmac('sha256', keySecret)
            .update(text)
            .digest('hex');
        if (generated_signature !== razorpay_signature) {
            throw new common_1.BadRequestException('Payment signature verification failed');
        }
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId, shop_id: shopId },
            });
            if (!order) {
                throw new common_1.BadRequestException('Order not found');
            }
            if (order.status === 'confirmed') {
                return { success: true, message: 'Payment already verified' };
            }
            const shop = await tx.shop.findUnique({
                where: { id: shopId },
                select: { currency: true }
            });
            await tx.payment.create({
                data: {
                    shop_id: shopId,
                    order_id: order.id,
                    gateway_id: gateway.id,
                    amount: order.total,
                    currency: shop?.currency || 'INR',
                    status: 'paid',
                    transaction_id: razorpay_payment_id,
                    gateway_resp: dto,
                    paid_at: new Date(),
                },
            });
            await tx.order.update({
                where: { id: order.id },
                data: { status: 'confirmed' },
            });
            await tx.orderStatusLog.create({
                data: {
                    shop_id: shopId,
                    order_id: order.id,
                    from_status: order.status,
                    to_status: 'confirmed',
                    note: 'Payment verified and captured via storefront client callback',
                },
            });
            const orderItems = await tx.orderItem.findMany({
                where: { order_id: order.id },
                select: { variant_id: true, qty: true },
            });
            for (const item of orderItems) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variant_id },
                    select: { stock_qty: true },
                });
                const warehouse = await tx.warehouse.findFirst({
                    where: { shop_id: shopId, is_active: true },
                    select: { id: true },
                });
                if (variant && warehouse) {
                    const newStock = Math.max(0, variant.stock_qty - item.qty);
                    await tx.productVariant.update({
                        where: { id: item.variant_id },
                        data: { stock_qty: newStock },
                    });
                    await tx.inventoryLog.create({
                        data: {
                            shop_id: shopId,
                            variant_id: item.variant_id,
                            warehouse_id: warehouse.id,
                            type: 'sale',
                            qty_change: -item.qty,
                            qty_after: newStock,
                            ref_id: order.id,
                            note: `Order sale deduction: ${order.order_number}`,
                        },
                    });
                }
            }
            return { success: true };
        });
    }
    async initializePayment(shopId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, shop_id: shopId },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found for this shop');
        }
        if (order.status === 'confirmed') {
            throw new common_1.BadRequestException('This order has already been paid');
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException(`Order is in status '${order.status}' and cannot be paid`);
        }
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: { currency: true },
        });
        const gateway = await this.prisma.paymentGateway.findFirst({
            where: { shop_id: shopId, slug: 'razorpay', is_active: true },
        });
        if (!gateway) {
            throw new common_1.BadRequestException('Razorpay payment gateway is not configured or active');
        }
        const config = (gateway.config || {});
        const keyId = config?.key_id || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
        const razorpayOrder = await this.createRazorpayOrder(shopId, Number(order.total), shop?.currency || 'INR', order.order_number);
        return {
            order_id: order.id,
            order_number: order.order_number,
            total: order.total,
            currency: shop?.currency || 'INR',
            razorpay_order_id: razorpayOrder.id,
            razorpay_key_id: keyId,
        };
    }
    async getPaymentGateways(shopId, isAdmin) {
        let gateways = await this.prisma.paymentGateway.findMany({
            where: { shop_id: shopId },
            orderBy: { sort_order: 'asc' },
        });
        if (gateways.length === 0) {
            await this.prisma.paymentGateway.createMany({
                data: [
                    {
                        shop_id: shopId,
                        name: 'Cash on Delivery',
                        slug: 'cod',
                        is_active: true,
                        sort_order: 1,
                        config: {},
                    },
                    {
                        shop_id: shopId,
                        name: 'Razorpay Online Payment',
                        slug: 'razorpay',
                        is_active: true,
                        sort_order: 2,
                        config: {
                            key_id: 'rzp_test_placeholder_key_id',
                            key_secret: 'placeholder_secret',
                        },
                    },
                ],
            });
            gateways = await this.prisma.paymentGateway.findMany({
                where: { shop_id: shopId },
                orderBy: { sort_order: 'asc' },
            });
        }
        if (!isAdmin) {
            return gateways.map((g) => {
                const conf = (g.config || {});
                const publicConfig = { ...conf };
                delete publicConfig.key_secret;
                return {
                    ...g,
                    config: publicConfig,
                };
            });
        }
        return gateways;
    }
    async updatePaymentGateway(shopId, id, dto) {
        const gateway = await this.prisma.paymentGateway.findFirst({
            where: { id, shop_id: shopId },
        });
        if (!gateway) {
            throw new common_1.BadRequestException('Payment gateway not found');
        }
        const existingConfig = (gateway.config || {});
        const mergedConfig = dto.config ? { ...existingConfig, ...dto.config } : existingConfig;
        return this.prisma.paymentGateway.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.is_active !== undefined && { is_active: dto.is_active }),
                ...(dto.config !== undefined && { config: mergedConfig }),
                ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
            },
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map