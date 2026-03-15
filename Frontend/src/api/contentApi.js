import apiClient from "./axiosClient";

const contentApi = {
    get: (page, lang) => {
        const url = '/content/';
        return apiClient.get(url, {params: {page, lang}});
    },

    save: (id, page, block_type, language, display_order) => {
        const url = `/content/${id}`;
        return apiClient.post(url, {page, block_type, language, display_order});
    },

    delete: (id) => {
        const url = `/content/${id}`;
        return apiClient.delete(url);
    },

    order: (page, lang, orderId) => {
        const url = '/content/';
        return apiClient.patch(url, { orderId: orderId }, { params: { page, lang } });
    }
};

export default contentApi;