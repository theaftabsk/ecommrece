/* @oaksol/api-client - Fetch API Client Configuration */

const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';

// Base Request Helper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  // Resolve host context from browser to identify current tenant subdomain/domain
  const tenantDomain = typeof window !== 'undefined' ? window.location.host : '';

  const headers = {
    'Content-Type': 'application/json',
    ...(tenantDomain ? { 'X-Tenant-Domain': tenantDomain } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText };
      }
      throw new Error(errorJson.message || `HTTP error! Status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    console.error(`API Request failed on ${url}:`, error.message);
    throw error;
  }
}

// ─── Storefront / Catalog APIs ───────────────────────────────────────────────
export const catalogApi = {
  // 1. Homepage banners & sections
  getHomepage: async () => request<any>('/catalog/homepage'),

  // 2. Products list
  getProducts: async (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/catalog/products?${query}`);
  },

  // 3. Single product detail
  getProduct: async (slug: string) => request<any>(`/catalog/products/${slug}`),

  // 4. Categories
  getCategories: async () => request<any>('/catalog/categories'),

  // 5. Brands
  getBrands: async () => request<any>('/catalog/brands'),

  // ─── Merchant Admin (write operations, scoped to current tenant) ───────────
  createProduct: async (productData: any, token?: string) =>
    request<any>('/catalog/admin/products', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(productData),
    }),

  createBanner: async (bannerData: any, token?: string) =>
    request<any>('/catalog/admin/banners', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(bannerData),
    }),

  createSection: async (sectionData: any, token?: string) =>
    request<any>('/catalog/admin/sections', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(sectionData),
    }),

  getProductById: async (id: string, token?: string) =>
    request<any>(`/catalog/admin/products/${id}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  updateProduct: async (id: string, productData: any, token?: string) =>
    request<any>(`/catalog/admin/products/${id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(productData),
    }),

  deleteProduct: async (id: string, token?: string) =>
    request<any>(`/catalog/admin/products/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  createCategory: async (categoryData: any, token?: string) =>
    request<any>('/catalog/admin/categories', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(categoryData),
    }),

  updateCategory: async (id: string, categoryData: any, token?: string) =>
    request<any>(`/catalog/admin/categories/${id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(categoryData),
    }),

  deleteCategory: async (id: string, token?: string) =>
    request<any>(`/catalog/admin/categories/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  deleteBanner: async (id: string, token?: string) =>
    request<any>(`/catalog/admin/banners/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  getOrders: async (token?: string) =>
    request<any>('/catalog/admin/orders', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  updateOrderStatus: async (id: string, status: string, note?: string, token?: string) =>
    request<any>(`/catalog/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ status, note }),
    }),

  // ── Review Management ──────────────────────────────────────────────────────
  getProductReviews: async (productId: string, token?: string) =>
    request<any>(`/catalog/admin/products/${productId}/reviews`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  createReview: async (productId: string, reviewData: {
    reviewer_name?: string;
    rating: number;
    title?: string;
    body?: string;
    status?: string;
  }, token?: string) =>
    request<any>(`/catalog/admin/products/${productId}/reviews`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(reviewData),
    }),

  updateReviewStatus: async (reviewId: string, status: string, token?: string) =>
    request<any>(`/catalog/admin/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ status }),
    }),

  deleteReview: async (reviewId: string, token?: string) =>
    request<any>(`/catalog/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  // ── Variant & Stock Management ─────────────────────────────────────────────
  getProductVariants: async (productId: string) =>
    request<any>(`/catalog/admin/products/${productId}/variants`),

  createVariant: async (productId: string, dto: {
    label?: string; sku?: string; price: number;
    compare_price?: number; cost_price?: number;
    stock_qty?: number; low_stock_at?: number;
    image_url?: string; is_active?: boolean;
  }) =>
    request<any>(`/catalog/admin/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateVariant: async (variantId: string, dto: {
    label?: string; price?: number; compare_price?: number;
    cost_price?: number; low_stock_at?: number;
    image_url?: string; is_active?: boolean; sort_order?: number;
  }) =>
    request<any>(`/catalog/admin/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  deleteVariant: async (variantId: string) =>
    request<any>(`/catalog/admin/variants/${variantId}`, { method: 'DELETE' }),

  adjustStock: async (variantId: string, data: {
    adjustment: number; type?: string; note?: string;
  }) =>
    request<any>(`/catalog/admin/variants/${variantId}/stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStockLogs: async (productId: string) =>
    request<any>(`/catalog/admin/products/${productId}/stock-logs`),

  getInventoryOverview: async () =>
    request<any>('/catalog/admin/inventory'),

  // ─── Public tenant signup ──────────────────────────────────────────────────
  submitTenantRequest: async (requestData: {
    name: string; slug: string; ownerName: string; ownerEmail: string; phone?: string; category?: string
  }) => request<any>('/catalog/tenant-requests', { method: 'POST', body: JSON.stringify(requestData) }),

  // ─── Platform Super Admin APIs ────────────────────────────────────────────
  // Dashboard stats
  getAdminStats: async () => request<any>('/catalog/admin/stats'),

  // Shops
  getShops: async () => request<any>('/catalog/admin/shops'),
  getShopDetail: async (id: string) => request<any>(`/catalog/admin/shops/${id}`),

  updateShop: async (id: string, dto: { name?: string; plan?: string; status?: string; description?: string }) =>
    request<any>(`/catalog/admin/shops/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

  deleteShop: async (id: string) =>
    request<any>(`/catalog/admin/shops/${id}`, { method: 'DELETE' }),

  seedDemoData: async (shopId: string) =>
    request<any>(`/catalog/admin/shops/${shopId}/seed-demo`, { method: 'POST' }),

  registerShop: async (shopData: {
    name: string; slug: string; ownerEmail: string; ownerName: string; ownerPassword?: string
  }) => request<any>('/catalog/register-shop', { method: 'POST', body: JSON.stringify(shopData) }),

  // Tenant requests
  getTenantRequests: async () => request<any>('/catalog/admin/tenant-requests'),

  approveTenantRequest: async (id: string) =>
    request<any>(`/catalog/admin/tenant-requests/${id}/approve`, { method: 'POST' }),

  rejectTenantRequest: async (id: string) =>
    request<any>(`/catalog/admin/tenant-requests/${id}/reject`, { method: 'POST' }),

  deleteTenantRequest: async (id: string) =>
    request<any>(`/catalog/admin/tenant-requests/${id}`, { method: 'DELETE' }),

  placeOrder: async (orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: any;
    payment_method: string;
    notes?: string;
    items: { variant_id: string; qty: number }[];
  }) => request<any>('/catalog/orders', { method: 'POST', body: JSON.stringify(orderData) }),

  // Get public order details for the payment page (tenant-scoped)
  getPublicOrder: async (orderId: string) =>
    request<any>(`/catalog/orders/${orderId}`),
};

// ─── Payment APIs ─────────────────────────────────────────────────────────────
export const paymentApi = {
  getPaymentGateways: async () =>
    request<any[]>('/payments/gateways'),

  getAdminPaymentGateways: async () =>
    request<any[]>('/payments/admin/gateways'),

  updateAdminPaymentGateway: async (id: string, data: {
    name?: string;
    is_active?: boolean;
    config?: any;
    sort_order?: number;
  }) => request<any>(`/payments/admin/gateways/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  createRazorpayOrder: async (orderData: { amount: number; currency?: string; receiptId: string }) =>
    request<any>('/payments/razorpay/order', { method: 'POST', body: JSON.stringify(orderData) }),

  // Initialize Razorpay payment for an existing pending order
  initializeRazorpayPayment: async (orderId: string) =>
    request<any>(`/payments/razorpay/initialize/${orderId}`, { method: 'POST' }),

  verifyPayment: async (data: {
    orderId: string;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => request<any>('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(data) }),
};
