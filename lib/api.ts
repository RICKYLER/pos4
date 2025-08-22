const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
  };
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    this.timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');
  }

  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('pos-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  static async register(userData: {
    email: string;
    name: string;
    password: string;
    role: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  static async healthCheck(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.text();
  }

  // Add new methods for product management
  async getProducts(): Promise<any> {
    const response = await fetch(`${this.baseURL}/products`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createProduct(product: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(product),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateProduct(id: string, product: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(product),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }
  }
}