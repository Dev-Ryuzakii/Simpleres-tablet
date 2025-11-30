// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tablet';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
}

export interface Table {
  id: string;
  tableNumber: string;
  location: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  subtotal: number;
  specialInstructions?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'completed';
export type PaymentStatus = 'pending' | 'pending_cash' | 'pending_pos' | 'pending_transfer' | 'paid';

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  table: Table;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  assignedTabletId: string | null;
  specialInstructions?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  status: 'confirmed' | 'pending';
  amount: number;
  receiptImageUrl?: string;
  confirmedByTabletId?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('tablet_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json().catch(() => ({
        statusCode: response.status,
        message: response.statusText,
        error: 'Unknown error',
      }));
      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return {} as T;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('tablet_token', token);
    } else {
      localStorage.removeItem('tablet_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Authentication Endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentTablet(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async refreshToken(): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Order Management Endpoints
  async getAllOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders/tablet/orders');
  }

  async acceptOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/orders/tablet/orders/${orderId}/accept`, {
      method: 'PUT',
    });
  }

  async rejectOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/orders/tablet/orders/${orderId}/reject`, {
      method: 'PUT',
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    return this.request<Order>(`/orders/tablet/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Payment Confirmation Endpoints
  async confirmCashPayment(paymentId: string): Promise<Payment> {
    return this.request<Payment>(
      `/tablet/payments/${paymentId}/confirm-cash`,
      {
        method: 'PUT',
      }
    );
  }

  async confirmPosPayment(paymentId: string): Promise<Payment> {
    return this.request<Payment>(`/tablet/payments/${paymentId}/confirm-pos`, {
      method: 'PUT',
    });
  }

  async confirmTransferPayment(paymentId: string): Promise<Payment> {
    return this.request<Payment>(
      `/tablet/payments/${paymentId}/confirm-transfer`,
      {
        method: 'PUT',
      }
    );
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

