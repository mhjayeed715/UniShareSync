const API_URL = 'http://localhost:5000';

class ApiClient {
  async request(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData) {
    return this.request('/api/auth/signup', 'POST', userData, false);
  }

  async login(credentials) {
    return this.request('/api/auth/login', 'POST', credentials, false);
  }

  async verifyOTP(data) {
    return this.request('/api/auth/verify-otp', 'POST', data, false);
  }

  async resendOTP(email) {
    return this.request('/api/auth/resend-otp', 'POST', { email }, false);
  }

  // Notices endpoints
  async getPublicNotices() {
    return this.request('/api/notices/public', 'GET', null, false);
  }

  async getNotices() {
    return this.request('/api/notices', 'GET');
  }

  async createNotice(noticeData) {
    return this.request('/api/notices', 'POST', noticeData);
  }

  async updateNotice(id, noticeData) {
    return this.request(`/api/notices/${id}`, 'PUT', noticeData);
  }

  async deleteNotice(id) {
    return this.request(`/api/notices/${id}`, 'DELETE');
  }

  // Admin endpoints
  async getDashboardStats() {
    return this.request('/api/admin/dashboard/stats', 'GET');
  }

  async getSystemHealth() {
    return this.request('/api/admin/dashboard/health', 'GET');
  }

  async getRecentActivities() {
    return this.request('/api/admin/dashboard/activities', 'GET');
  }

  // Generic GET/POST/PUT/DELETE methods for admin management
  async get(endpoint) {
    return this.request(endpoint, 'GET');
  }

  async post(endpoint, data) {
    return this.request(endpoint, 'POST', data);
  }

  async put(endpoint, data) {
    return this.request(endpoint, 'PUT', data);
  }

  async delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }
}

export default new ApiClient();
