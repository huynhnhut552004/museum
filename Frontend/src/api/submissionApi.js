import apiClient from "./axiosClient";

const submissionApi = {
    create: (data) => {
        const url = '/submission/';
        return apiClient.post(url, data);
    },

    get: (page, limit, status, email) => {
        const url = '/submission/';
        return apiClient.get(url, { params: { page, limit, status, email } });
    },

    searchByAdmin: (page, limit, status, email, keyword) => {
        const url = '/submission/searchByAdmin';
        return apiClient.get(url, { params: { page, limit, status, email, keyword } });
    },

    readed: (id) => {
        const url = `/submission/${id}`;
        return apiClient.post(url, {});
    },

    delete: (id) => {
        const url = `/submission/${id}`;
        return apiClient.delete(url);
    }
};

export default submissionApi;