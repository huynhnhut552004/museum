import apiClient from "./axiosClient";

const eventApi = {
    get: (type, page, limit) => {
        const url = '/event/';
        return apiClient.get(url, { params: { type, page, limit } });
    },

    searchByAdmin: (page, limit, keyword, type) => {
        const url = '/event/searchByAdmin';
        return apiClient.get(url, { params: { page, limit, keyword, type } });
    },

    getBySlug: (slug) => {
        const url = `/event/${slug}`;
        return apiClient.get(url);
    },

    create: (data) => {
        const url = '/event/';
        return apiClient.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    update: (id, rawdata) => {
        const url = `/event/${id}`;
        return apiClient.patch(url, rawdata, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    delete: (id) => {
        const url = `/event/${id}`;
        return apiClient.delete(url);
    }
};

export default eventApi;