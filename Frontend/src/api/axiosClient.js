import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

const getAccessToken = () => localStorage.getItem('token'); 

apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post('http://localhost:5000/api/auth/refreshToken', {}, {
                    withCredentials: true
                });
                const newAccessToken = res.data.data.accessToken;
                const newRole = res.data.data.role;
                localStorage.setItem('token', newAccessToken);
                localStorage.setItem('role', newRole);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (err) {
                console.error("LỖI KHI GỌI REFRESH TOKEN:", err);
                console.log("Refresh token expired hoặc Cookie không hợp lệ. Cần đăng nhập lại.");
                localStorage.removeItem('token');
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;