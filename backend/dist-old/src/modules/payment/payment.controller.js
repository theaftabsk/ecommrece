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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async getPublicGateways(req) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.paymentService.getPaymentGateways(shopId, false);
    }
    async getAdminGateways(req) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.paymentService.getPaymentGateways(shopId, true);
    }
    async updateGateway(req, id, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.paymentService.updatePaymentGateway(shopId, id, dto);
    }
    async createOrder(req, amount, currency, receiptId) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        if (!amount || !receiptId) {
            throw new common_1.BadRequestException('Amount and receiptId are required');
        }
        return this.paymentService.createRazorpayOrder(shopId, amount, currency || 'INR', receiptId);
    }
    async initializePayment(req, orderId) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.paymentService.initializePayment(shopId, orderId);
    }
    async verifyPayment(req, dto) {
        const shopId = req.shopId;
        if (!shopId) {
            throw new common_1.BadRequestException('Shop context missing from request');
        }
        return this.paymentService.verifyPayment(shopId, dto);
    }
    async handleWebhook(req, payload, signature) {
        if (!signature) {
            throw new common_1.BadRequestException('Razorpay signature header missing');
        }
        const shopId = req.shopId || '';
        const rawBodyBuffer = req.rawBody;
        const rawBody = Buffer.isBuffer(rawBodyBuffer)
            ? rawBodyBuffer.toString('utf8')
            : typeof rawBodyBuffer === 'string'
                ? rawBodyBuffer
                : JSON.stringify(payload);
        const isValid = await this.paymentService.verifyWebhookSignature(shopId, rawBody, signature);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Razorpay signature');
        }
        return this.paymentService.handleWebhook(shopId, payload);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Get)('gateways'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPublicGateways", null);
__decorate([
    (0, common_1.Get)('admin/gateways'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAdminGateways", null);
__decorate([
    (0, common_1.Patch)('admin/gateways/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updateGateway", null);
__decorate([
    (0, common_1.Post)('razorpay/order'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('currency')),
    __param(3, (0, common_1.Body)('receiptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('razorpay/initialize/:orderId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "initializePayment", null);
__decorate([
    (0, common_1.Post)('razorpay/verify'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('razorpay/webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-razorpay-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('api/v1/payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map