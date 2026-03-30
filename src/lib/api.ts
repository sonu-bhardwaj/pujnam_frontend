// API configuration for MongoDB backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const REQUEST_TIMEOUT_MS = 15000;

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

interface ApiCallOptions extends RequestInit {
    suppressErrorStatuses?: number[];
    cacheTtlMs?: number;
    skipCache?: boolean;
}

const AUTH_SESSION_HINT_KEY = 'pujnam-auth-session';
const GET_CACHE_TTL_BY_PREFIX: Array<[string, number]> = [
    ['/settings', 5 * 60_000],
    ['/categories', 5 * 60_000],
    ['/products', 60_000],
    ['/banners', 60_000],
    ['/promo-blocks', 60_000],
    ['/section-videos', 60_000],
    ['/festivals', 60_000],
    ['/panchang/today', 10 * 60_000],
    ['/coupons/active', 60_000],
];

const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const inflightGetRequests = new Map<string, Promise<ApiResponse<unknown>>>();

function getStoredAuthHint(): boolean {
    try {
        return window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === '1';
    } catch {
        return false;
    }
}

function setStoredAuthHint(): void {
    try {
        window.localStorage.setItem(AUTH_SESSION_HINT_KEY, '1');
    } catch {
        // Ignore storage issues in restricted environments.
    }
}

function clearStoredAuthHint(): void {
    try {
        window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
    } catch {
        // Ignore storage issues in restricted environments.
    }
}

function sanitizeForConsole(value: unknown): unknown {
    const sensitiveKeys = new Set([
        'token',
        'password',
        'newPassword',
        'confirmPassword',
        'otp',
        'code',
        'authorization',
        'auth_token',
        'api_secret',
        'secret',
    ]);

    if (Array.isArray(value)) {
        return value.map(sanitizeForConsole);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
                key,
                sensitiveKeys.has(key) ? '[redacted]' : sanitizeForConsole(entryValue),
            ]),
        );
    }

    return value;
}

function getCacheKey(endpoint: string, options: RequestInit): string {
    const method = (options.method || 'GET').toUpperCase();
    return `${method}:${endpoint}`;
}

function getDefaultCacheTtl(endpoint: string): number {
    for (const [prefix, ttl] of GET_CACHE_TTL_BY_PREFIX) {
        if (endpoint.startsWith(prefix)) {
            return ttl;
        }
    }
    return 0;
}

function invalidateResponseCache() {
    responseCache.clear();
}

// Helper function for API calls
async function apiCall<T>(
    endpoint: string,
    options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
    const method = (options.method || 'GET').toUpperCase();
    const cacheTtlMs = options.cacheTtlMs ?? getDefaultCacheTtl(endpoint);
    const cacheKey = getCacheKey(endpoint, options);
    const shouldDeduplicateGet = method === 'GET' && !options.skipCache;
    const shouldUseCache = shouldDeduplicateGet && cacheTtlMs > 0;

    if (shouldDeduplicateGet) {
        const cachedEntry = responseCache.get(cacheKey);
        if (shouldUseCache && cachedEntry && cachedEntry.expiresAt > Date.now()) {
            return cachedEntry.value as ApiResponse<T>;
        }

        const inflightRequest = inflightGetRequests.get(cacheKey);
        if (inflightRequest) {
            return inflightRequest as Promise<ApiResponse<T>>;
        }
    }

    const requestPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const fullUrl = `${API_BASE_URL}${endpoint}`;
            const { suppressErrorStatuses = [], cacheTtlMs: _cacheTtlMs, skipCache: _skipCache, ...requestOptions } = options;

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...requestOptions.headers,
            };

            const response = await fetch(fullUrl, {
                ...requestOptions,
                headers,
                credentials: 'include',
                signal: controller.signal,
            });

            // Handle non-JSON responses
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { error: text || 'Invalid response format' };
                }
            }

            if (!response.ok) {
                if (!suppressErrorStatuses.includes(response.status)) {
                    console.error('API Error:', endpoint, response.status, sanitizeForConsole(data));
                }
                const errorMessage = data?.error || data?.message || 'An error occurred';
                return { error: errorMessage };
            }

            return { data };
        } catch (error) {
            const errorMessage =
                error instanceof DOMException && error.name === 'AbortError'
                    ? 'Request timeout. Please try again.'
                    : error instanceof Error
                        ? error.message
                        : 'Network error';
            console.error('API call failed:', endpoint, errorMessage);
            return { error: errorMessage };
        } finally {
            clearTimeout(timeoutId);
            if (shouldDeduplicateGet) {
                inflightGetRequests.delete(cacheKey);
            }
        }
    })();

    if (shouldDeduplicateGet) {
        inflightGetRequests.set(cacheKey, requestPromise as Promise<ApiResponse<unknown>>);
    } else if (method !== 'GET') {
        invalidateResponseCache();
    }

    const result = await requestPromise;
    if (shouldUseCache && result.data) {
        responseCache.set(cacheKey, {
            expiresAt: Date.now() + cacheTtlMs,
            value: result,
        });
    }

    return result;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();
// Auth API
export const authApi = {
    async login(email: string, password: string) {
        const response = await apiCall<{ user: any; requiresVerification?: boolean; email?: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email), password }),
        });
        if (response.data?.user) {
            setStoredAuthHint();
        }
        return response;
    },

    async register(email: string, password: string, name: string, phone?: string) {
        const response = await apiCall<{ user: any; requiresVerification?: boolean }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email), password, name, phone }),
        });
        if (response.data?.user) {
            setStoredAuthHint();
        }
        return response;
    },

    async getProfile() {
        if (!getStoredAuthHint()) {
            return { error: 'Not authenticated' };
        }

        const response = await apiCall<{ user: any }>('/auth/me', {
            suppressErrorStatuses: [401],
        });
        if (response.data?.user) {
            setStoredAuthHint();
        } else if (response.error) {
            clearStoredAuthHint();
        }
        return response;
    },

    async updateProfile(data: { name?: string; phone?: string; address?: any }) {
        return apiCall<{ user: any }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async sendVerificationCode(email: string) {
        return apiCall<{ message: string }>('/auth/send-verification-code', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email) }),
        });
    },

    async verifyEmail(email: string, code: string) {
        const response = await apiCall<{ user: any }>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email), code }),
        });
        if (response.data?.user) {
            setStoredAuthHint();
        }
        return response;
    },

    async forgotPassword(email: string) {
        return apiCall<{ message: string; email?: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email) }),
        });
    },

    async verifyPasswordResetOTP(email: string, otp: string) {
        return apiCall<{ message: string }>('/auth/verify-password-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email), otp: otp.trim() }),
        });
    },

    async resetPassword(email: string, otp: string, newPassword: string) {
        return apiCall<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email), otp: otp.trim(), newPassword }),
        });
    },

    async resendPasswordResetOTP(email: string) {
        return apiCall<{ message: string }>('/auth/resend-password-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email: normalizeEmail(email) }),
        });
    },

    // Address Management
    async getAddresses() {
        return apiCall<{ addresses: any[] }>('/auth/addresses');
    },

    async addAddress(address: any) {
        return apiCall<{ address: any }>('/auth/addresses', {
            method: 'POST',
            body: JSON.stringify(address),
        });
    },

    async updateAddress(addressId: string, address: any) {
        return apiCall<{ address: any }>(`/auth/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(address),
        });
    },

    async deleteAddress(addressId: string) {
        return apiCall<void>(`/auth/addresses/${addressId}`, { method: 'DELETE' });
    },

    async setDefaultAddress(addressId: string) {
        return apiCall<{ addresses: any[] }>(`/auth/addresses/${addressId}/default`, {
            method: 'PUT',
        });
    },

    async logout() {
        const response = await apiCall<{ message: string }>('/auth/logout', {
            method: 'POST',
        });
        clearStoredAuthHint();
        return response;
    },
};

// Products API
export const productsApi = {
    async getAll(params?: {
        category?: string;
        featured?: boolean;
        bestseller?: boolean;
        search?: string;
        page?: number;
        limit?: number;
        sort?: string;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    // Convert boolean to string for featured and bestseller
                    if ((key === 'featured' || key === 'bestseller') && typeof value === 'boolean') {
                        searchParams.append(key, value ? 'true' : 'false');
                    } else {
                        searchParams.append(key, String(value));
                    }
                }
            });
        }
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return apiCall<{ products: any[]; pagination: any }>(`/products${query}`);
    },

    async getById(id: string) {
        return apiCall<{ product: any }>(`/products/${id}`);
    },

    async create(product: any) {
        return apiCall<{ product: any }>('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    },

    async bulkCreate(products: any[], options?: { updateStockOnDuplicate?: boolean }) {
        return apiCall<{ results: any[]; message?: string }>('/products/bulk', {
            method: 'POST',
            body: JSON.stringify({
                products,
                updateStockOnDuplicate: options?.updateStockOnDuplicate === true,
            }),
        });
    },

    async update(id: string, product: any) {
        return apiCall<{ product: any }>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product),
        });
    },

    async delete(id: string) {
        return apiCall<void>(`/products/${id}`, { method: 'DELETE' });
    },
};

// Categories API
export const categoriesApi = {
    async getAll() {
        return apiCall<{ categories: any[] }>('/categories');
    },

    async getById(id: string) {
        return apiCall<{ category: any }>(`/categories/${id}`);
    },

    async create(category: any) {
        return apiCall<{ category: any }>('/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
    },

    async update(id: string, category: any) {
        return apiCall<{ category: any }>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category),
        });
    },

    async delete(id: string) {
        return apiCall<void>(`/categories/${id}`, { method: 'DELETE' });
    },
};

// Orders API
export const ordersApi = {
    async getAll() {
        return apiCall<{ orders: any[] }>('/orders');
    },

    async getById(id: string) {
        return apiCall<{ order: any }>(`/orders/${id}`);
    },

    async create(orderData: { items?: any[]; shippingAddress: any; paymentMethod: string; notes?: string; couponCode?: string | null; couponDiscount?: number }) {
        return apiCall<{ order: any; message?: string }>('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    async cancel(id: string) {
        return apiCall<{ order: any }>(`/orders/${id}/cancel`, { method: 'PUT' });
    },

    // Admin endpoints
    async getAllAdmin(params?: { status?: string; page?: number; limit?: number }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return apiCall<{ orders: any[]; pagination: any }>(`/orders/admin/all${query}`);
    },

    async updateStatus(id: string, status: { orderStatus?: string; paymentStatus?: string }) {
        return apiCall<{ order: any }>(`/orders/admin/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(status),
        });
    },
};

// Refunds API
export const refundsApi = {
    async create(orderId: string, amount: number, reason: string) {
        return apiCall<{ refundRequest: any }>('/refunds', {
            method: 'POST',
            body: JSON.stringify({ orderId, amount, reason }),
        });
    },
    async getAllAdmin() {
        return apiCall<{ refunds: any[] }>('/refunds/admin/all');
    },
    async updateStatus(refundId: string, status: string, adminNote?: string) {
        return apiCall<{ refund: any }>(`/refunds/admin/${refundId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, adminNote }),
        });
    },
};

// Payments API
export const paymentsApi = {
    async create(payload: { amount: number; currency: string; customer: any; orderId: string }) {
        return apiCall<{ payment_session_id: string; orderId: string }>(`/payments/create`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async confirm(payload: { orderId: string; paymentId?: string; paymentStatus?: string }) {
        return apiCall<{ message: string; order: any; gateway?: any }>(`/payments/confirm`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
};

// Cart API
export const cartApi = {
    async get() {
        return apiCall<{ cart: any }>('/cart');
    },

    async addItem(productId: string, quantity: number = 1) {
        return apiCall<{ cart: any }>('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    async updateQuantity(productId: string, quantity: number) {
        return apiCall<{ cart: any }>('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    async removeItem(productId: string) {
        return apiCall<{ cart: any }>(`/cart/remove/${productId}`, { method: 'DELETE' });
    },

    async clear() {
        return apiCall<void>('/cart/clear', { method: 'DELETE' });
    },
};

// Banners API
export const bannersApi = {
    async getAll(params?: { position?: string; active?: boolean }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return apiCall<{ banners: any[] }>(`/banners${query}`);
    },

    async getById(id: string) {
        return apiCall<{ banner: any }>(`/banners/${id}`);
    },

    async create(banner: any) {
        return apiCall<{ banner: any }>('/banners', {
            method: 'POST',
            body: JSON.stringify(banner),
        });
    },

    async update(id: string, banner: any) {
        return apiCall<{ banner: any }>(`/banners/${id}`, {
            method: 'PUT',
            body: JSON.stringify(banner),
        });
    },

    async delete(id: string) {
        return apiCall<void>(`/banners/${id}`, { method: 'DELETE' });
    },
};

// Promo Blocks API (Poojan Booking, Astro Consulting, etc.)
export const promoBlocksApi = {
    async getAll(params?: { active?: boolean }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return apiCall<{ blocks: any[] }>(`/promo-blocks${query}`);
    },

    async getById(id: string) {
        return apiCall<{ block: any }>(`/promo-blocks/${id}`);
    },

    async create(block: any) {
        return apiCall<{ block: any }>('/promo-blocks', {
            method: 'POST',
            body: JSON.stringify(block),
        });
    },

    async update(id: string, block: any) {
        return apiCall<{ block: any }>(`/promo-blocks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(block),
        });
    },

    async delete(id: string) {
        return apiCall<void>(`/promo-blocks/${id}`, { method: 'DELETE' });
    },
};

// Section Videos API (full-width video section, auto-play sequence)
export const sectionVideosApi = {
    async getAll(params?: { active?: boolean }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return apiCall<{ videos: any[] }>(`/section-videos${query}`);
    },

    async getById(id: string) {
        return apiCall<{ video: any }>(`/section-videos/${id}`);
    },

    async create(video: any) {
        return apiCall<{ video: any }>('/section-videos', {
            method: 'POST',
            body: JSON.stringify(video),
        });
    },

    async update(id: string, video: any) {
        return apiCall<{ video: any }>(`/section-videos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(video),
        });
    },

    async delete(id: string) {
        return apiCall<void>(`/section-videos/${id}`, { method: 'DELETE' });
    },
};

// Panchang API
export const panchangApi = {
    async getToday() {
        return apiCall<{ panchang: any }>('/panchang/today');
    },

    async getByDate(date: string) {
        return apiCall<{ panchang: any }>(`/panchang/date/${date}`);
    },

    async fetchFromAPI(latitude: number, longitude: number, timezone?: number) {
        const now = new Date();
        return apiCall<{ panchang: any }>('/panchang/fetch', {
            method: 'POST',
            body: JSON.stringify({
                latitude,
                longitude,
                timezone: timezone || now.getTimezoneOffset() / -60,
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                date: now.getDate(),
                hours: now.getHours(),
                minutes: now.getMinutes(),
                seconds: now.getSeconds(),
            }),
        });
    },

    async getAll() {
        return apiCall<{ panchang: any[] }>('/panchang');
    },

    async create(panchang: any) {
        return apiCall<{ panchang: any }>('/panchang', {
            method: 'POST',
            body: JSON.stringify(panchang),
        });
    },

    async update(id: string, panchang: any) {
        return apiCall<{ panchang: any }>(`/panchang/${id}`, {
            method: 'PUT',
            body: JSON.stringify(panchang),
        });
    },

    async delete(id: string) {
        return apiCall<void>(`/panchang/${id}`, { method: 'DELETE' });
    },
};

// Coupons API
export const couponsApi = {
    async getActive() {
        return apiCall<{ coupons: any[] }>('/coupons/active');
    },

    async validate(code: string) {
        return apiCall<{ coupon: any }>('/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },

    async getAll() {
        return apiCall<{ coupons: any[] }>('/coupons');
    },

    async getById(id: string) {
        return apiCall<{ coupon: any }>(`/coupons/${id}`);
    },

    async create(coupon: any) {
        return apiCall<{ coupon: any }>('/coupons', {
            method: 'POST',
            body: JSON.stringify(coupon),
        });
    },

    async update(id: string, coupon: any) {
        return apiCall<{ coupon: any }>(`/coupons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(coupon),
        });
    },

    async delete(id: string) {
        return apiCall<void>(`/coupons/${id}`, { method: 'DELETE' });
    },
};

// Customers API
export const customersApi = {
    async getAll() {
        return apiCall<{ customers: any[] }>('/customers');
    },

    async getById(id: string) {
        return apiCall<{ customer: any; orders: any[] }>(`/customers/${id}`);
    },
};

// Settings API
export const settingsApi = {
    async get() {
        return apiCall<{ settings: any }>('/settings');
    },

    async update(settings: any) {
        return apiCall<{ settings: any; message?: string }>('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },
};

// Festivals API
export const festivalsApi = {
    async getAll() {
        return apiCall<{ festivals: any[] }>('/festivals');
    },
    async getById(id: string) {
        return apiCall<{ festival: any }>(`/festivals/${id}`);
    },
    async create(festival: any) {
        return apiCall<{ festival: any }>('/festivals', {
            method: 'POST',
            body: JSON.stringify(festival),
        });
    },
    async update(id: string, festival: any) {
        return apiCall<{ festival: any }>(`/festivals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(festival),
        });
    },
    async delete(id: string) {
        return apiCall<void>(`/festivals/${id}`, { method: 'DELETE' });
    },
};

// Health check
export async function checkApiHealth() {
    return apiCall<{ status: string; message: string }>('/health');
}

export default {
    auth: authApi,
    products: productsApi,
    categories: categoriesApi,
    orders: ordersApi,
    cart: cartApi,
    banners: bannersApi,
    panchang: panchangApi,
    coupons: couponsApi,
    customers: customersApi,
    settings: settingsApi,
    festivals: festivalsApi,
    checkHealth: checkApiHealth,
};
