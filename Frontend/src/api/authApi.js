import apiClient from './axiosClient';

const authApi = {
    login: (email, password) => {
        const url = '/auth/login';
        return apiClient.post(url, { email, password }, { withCredentials: true });
    },

    register: (email, password, full_name) => {
        const url = '/auth/signup';
        return apiClient.post(url, { email, password, full_name });
    },

    logout: () => {
        const url = '/auth/logout';
        return apiClient.post(url, { withCredentials: true });
    },

    forgotPassword: (email) => {
        const url = '/auth/forgot-password';
        return apiClient.post(url,{}, { email });
    },

    resetPassword: (email, otp, newPassword) => {
        const url = '/auth/reset-password';
        return apiClient.post(url, { email, otp, newPassword });
    }
};

export default authApi;