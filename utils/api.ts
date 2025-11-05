// API utility functions for frontend

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed');
  }

  return data;
}

// Auth API functions
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, fullName?: string, phone?: string) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone }),
    }),

  logout: () =>
    apiRequest('/api/auth/login', {
      method: 'DELETE',
    }),

  getCurrentUser: () =>
    apiRequest('/api/auth/me'),
};

// User API functions
export const userApi = {
  getProfile: () =>
    apiRequest('/api/users/profile'),

  updateProfile: (updates: any) =>
    apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  getUser: (userId: string) =>
    apiRequest(`/api/users/${userId}`),
};

// Deal API functions
export const dealApi = {
  getDeals: (role?: 'seller' | 'buyer' | 'all') => {
    const params = role ? `?role=${role}` : '';
    return apiRequest(`/api/deals${params}`);
  },

  createDeal: (dealData: any) =>
    apiRequest('/api/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    }),

  getDeal: (dealId: string) =>
    apiRequest(`/api/deals/${dealId}`),

  updateDeal: (dealId: string, updates: any) =>
    apiRequest(`/api/deals/${dealId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteDeal: (dealId: string) =>
    apiRequest(`/api/deals/${dealId}`, {
      method: 'DELETE',
    }),

  acceptDeal: (dealId: string) =>
    apiRequest(`/api/deals/${dealId}/accept`, {
      method: 'POST',
    }),

  updateDealStatus: (dealId: string, status: string) =>
    apiRequest(`/api/deals/${dealId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getDealByCode: (dealCode: string) =>
    apiRequest(`/api/deals/code/${dealCode}`),
};

// Transaction API functions
export const transactionApi = {
  getTransactions: (dealId?: string) => {
    const params = dealId ? `?dealId=${dealId}` : '';
    return apiRequest(`/api/transactions${params}`);
  },

  createTransaction: (transactionData: any) =>
    apiRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    }),

  getTransaction: (transactionId: string) =>
    apiRequest(`/api/transactions/${transactionId}`),

  updateTransaction: (transactionId: string, updates: any) =>
    apiRequest(`/api/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// Message API functions
export const messageApi = {
  getMessages: (dealId: string) =>
    apiRequest(`/api/messages?dealId=${dealId}`),

  sendMessage: (messageData: any) =>
    apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),

  markAsRead: (messageId: string) =>
    apiRequest(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    }),
};

// Review API functions
export const reviewApi = {
  getReviews: (userId?: string, dealId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (dealId) params.append('dealId', dealId);
    const queryString = params.toString();
    return apiRequest(`/api/reviews${queryString ? `?${queryString}` : ''}`);
  },

  createReview: (reviewData: any) =>
    apiRequest('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};

// Support API functions
export const supportApi = {
  getTickets: () =>
    apiRequest('/api/support'),

  createTicket: (ticketData: any) =>
    apiRequest('/api/support', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  getTicket: (ticketId: string) =>
    apiRequest(`/api/support/${ticketId}`),

  updateTicket: (ticketId: string, updates: any) =>
    apiRequest(`/api/support/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};
