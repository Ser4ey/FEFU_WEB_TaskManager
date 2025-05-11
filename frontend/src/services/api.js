// import axios from 'axios';
//
// const apiClient = axios.create({
//     baseURL: '/api', // Прокси к Django
// });
//
// // Добавить токен в заголовки
// apiClient.interceptors.request.use(config => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });
//
// export default {
//     tasks: {
//         getAll: () => apiClient.get('/tasks/'),
//         getOne: (id) => apiClient.get(`/tasks/${id}`),
//         create: (task) => apiClient.post('/tasks/', task),
//         update: (id, task) => apiClient.put(`/tasks/${id}/`, task),
//         delete: (id) => apiClient.delete(`/tasks/${id}/`),
//     },
//     projects: {
//         getAll: () => apiClient.get('/projects/'),
//         getOne: (id) => apiClient.get(`/projects/${id}`),
//         create: (project) => apiClient.post('/projects/', project),
//     },
//     auth: {
//         login: (username, password) => apiClient.post('/api-auth/login/', { username, password }),
//         register: (user) => apiClient.post('/register/', user),
//     },
// };