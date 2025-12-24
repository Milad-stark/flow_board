// API Service Layer - Centralized API calls
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Standard API response format
const formatResponse = (response) => {
  if (response.success !== undefined) {
    return response;
  }
  return {
    success: true,
    data: response,
    message: '',
  };
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return formatResponse(response);
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return formatResponse(response);
  },

  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return formatResponse(response);
  },

  updateMe: async (userData) => {
    const response = await apiClient.put('/auth/me', userData);
    return formatResponse(response);
  },
};

// Entities API
const createEntityAPI = (endpoint) => ({
  list: async (orderBy) => {
    const params = orderBy ? { orderBy } : {};
    const response = await apiClient.get(`/${endpoint}`, { params });
    return formatResponse(response).data || [];
  },

  get: async (id) => {
    const response = await apiClient.get(`/${endpoint}/${id}`);
    return formatResponse(response).data;
  },

  create: async (data) => {
    const response = await apiClient.post(`/${endpoint}`, data);
    return formatResponse(response).data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/${endpoint}/${id}`, data);
    return formatResponse(response).data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/${endpoint}/${id}`);
    return formatResponse(response);
  },

  filter: async (where = {}, orderBy, limit) => {
    const params = { ...where };
    if (orderBy) params.orderBy = orderBy;
    if (limit) params.limit = limit;
    const response = await apiClient.get(`/${endpoint}/filter`, { params });
    return formatResponse(response).data || [];
  },
});

export const entitiesAPI = {
  User: createEntityAPI('users'),
  Project: createEntityAPI('projects'),
  Task: createEntityAPI('tasks'),
  Comment: createEntityAPI('comments'),
  TimeEntry: createEntityAPI('time-entries'),
  Notification: createEntityAPI('notifications'),
  Achievement: createEntityAPI('achievements'),
  Challenge: createEntityAPI('challenges'),
  ChallengeSubmission: createEntityAPI('challenge-submissions'),
};

// Map collection keys to entity names
const entityMap = {
  users: 'User',
  projects: 'Project',
  tasks: 'Task',
  comments: 'Comment',
  timeLogs: 'TimeEntry',
  timeEntries: 'TimeEntry',
  notifications: 'Notification',
  achievements: 'Achievement',
  challenges: 'Challenge',
  challengeSubmissions: 'ChallengeSubmission',
};

// Functions API
export const functionsAPI = {
  transitionTaskStatus: async ({ taskId, status }) => {
    const response = await apiClient.post('/functions/transition-task-status', {
      taskId,
      status,
    });
    return formatResponse(response);
  },

  generateReport: async ({ user_id, language }) => {
    const response = await apiClient.post(
      '/functions/generate-report',
      { user_id, language },
      { responseType: 'blob' }
    );
    return { data: response };
  },
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: async (message, context = {}) => {
    const response = await apiClient.post('/chatbot/message', {
      message,
      context,
    });
    return formatResponse(response);
  },

  getHistory: async (userId) => {
    const response = await apiClient.get(`/chatbot/history/${userId}`);
    return formatResponse(response).data || [];
  },
};

// Export default API object for backward compatibility
export default {
  auth: authAPI,
  entities: entitiesAPI,
  functions: functionsAPI,
  chatbot: chatbotAPI,
};

