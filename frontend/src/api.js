import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем перехватчик для добавления токена к запросам
api.interceptors.request.use(
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

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: (credentials) => api.post('/auth/token/', credentials),
    register: (userData) => api.post('/auth/register/', userData),
    getCurrentUser: () => api.get('/auth/user/'),
    refreshToken: (token) => api.post('/auth/token/refresh/', { refresh: token }),
};

export const projects = {
    getAll: () => api.get('/projects/'),
    getById: (id) => api.get(`/projects/${id}/`),
    create: (data) => api.post('/projects/', data),
    update: (id, data) => api.put(`/projects/${id}/`, data),
    delete: (id) => api.delete(`/projects/${id}/`),
};

export const tasks = {
    getAll: () => api.get('/tasks/'),
    getById: (id) => api.get(`/tasks/${id}/`),
    create: (data) => api.post('/tasks/', data),
    update: (id, data) => api.put(`/tasks/${id}/`, data),
    delete: (id) => api.delete(`/tasks/${id}/`),
};

export default {
    auth,
    projects,
    tasks,
}; 