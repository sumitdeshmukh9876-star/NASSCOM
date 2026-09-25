import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const financeAPI = {
  getProfile: () => api.get('/finance'),
  updateProfile: (data) => api.put('/finance', data),
  seedDemo: () => api.post('/finance/seed-demo'),
};

export const expenseAPI = {
  getExpenses: (params) => api.get('/expenses', { params }),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
};

export const goalAPI = {
  getGoals: () => api.get('/goals'),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
};

export const aiAPI = {
  getAdvice: (data) => api.post('/ai/advice', data),
};
