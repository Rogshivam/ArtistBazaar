const API_URL = import.meta.env.VITE_API_URL as string;

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      ...(token && { 'auth-token': token }),
    } as Record<string, string>;
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (data?.authToken && data?.refreshToken) {
        localStorage.setItem('auth-token', data.authToken);
        localStorage.setItem('refresh-token', data.refreshToken);
        if (data.user) localStorage.setItem('user-data', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const baseHeaders: Record<string, string> = this.getAuthHeaders();
    const contentTypeHeader = !isFormData ? { 'Content-Type': 'application/json' } : {};
    const config: RequestInit = {
      ...options,
      headers: {
        ...contentTypeHeader,
        ...baseHeaders,
        ...options.headers,
      },
    };

    let response = await fetch(url, config);

    // If unauthorized, attempt a token refresh once and retry
    if (response.status === 401) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        const retryHeaders = this.getAuthHeaders();
        const retryConfig: RequestInit = {
          ...options,
          headers: {
            ...contentTypeHeader,
            ...retryHeaders,
            ...options.headers,
          },
        };
        response = await fetch(url, retryConfig);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string; role?: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: { email: string; name: string; password: string; role: string }) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async googleLogin(code: string, role?: string) {
    return this.request('/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, role }),
    });
  }

  // Product endpoints
  async getProducts(params: {
    q?: string;
    category?: string;
    tags?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    limit?: string;
    sort?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    return this.request(`/api/products?${searchParams.toString()}`);
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getSellerProducts() {
    // return this.request('/api/products/seller/products');
    return this.request('/api/seller/products');
  }

  // Artisan detail (profile + overview + trust + catalog)
  async getArtisanDetail(id: string, params: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    limit?: string;
    sort?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    const query = searchParams.toString();
    const suffix = query ? `?${query}` : "";
    return this.request(`/api/artisans/${id}${suffix}`);
  }

  async getCategories() {
    return this.request('/api/products/categories');
  }

  // Cart endpoints
  async getCart() {
    return this.request('/api/cart');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request('/api/cart/update', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async clearCart() {
    return this.request('/api/cart/clear', {
      method: 'POST',
    });
  }

  // Wishlist endpoints
  async getWishlist() {
    return this.request('/api/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request('/api/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async checkWishlistStatus(productId: string) {
    return this.request(`/api/wishlist/check/${productId}`);
  }

  // Admin endpoints
  async getAdminOverview() {
    return this.request('/api/admin/overview');
  }

  async getSellers() {
    return this.request('/api/admin/sellers');
  }

  async getCustomers() {
    return this.request('/api/admin/customers');
  }

  // Profile endpoints
  async getProfile() {
    return this.request('/api/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request('/api/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it with boundary
        'auth-token': this.getAuthHeaders()['auth-token'] || '',
      },
    });
  }

  async uploadShopBanner(file: File) {
    const formData = new FormData();
    formData.append('banner', file);
    return this.request('/api/profile/banner', {
      method: 'POST',
      body: formData,
      headers: {
        'auth-token': this.getAuthHeaders()['auth-token'] || '',
      },
    });
  }

  async getSellersList(params: {
    page?: string;
    limit?: string;
    search?: string;
    location?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    return this.request(`/api/profile/sellers?${searchParams.toString()}`);
  }

  async getSellerById(id: string) {
    return this.request(`/api/profile/seller/${id}`);
  }

  // Upload endpoints
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.request('/api/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        'auth-token': this.getAuthHeaders()['auth-token'] || '',
      },
    });
  }

  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    return this.request('/api/upload/images', {
      method: 'POST',
      body: formData,
      headers: {
        'auth-token': this.getAuthHeaders()['auth-token'] || '',
      },
    });
  }

  async deleteImage(publicId: string) {
    return this.request(`/api/upload/image/${publicId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
