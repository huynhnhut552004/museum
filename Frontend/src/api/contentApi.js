import apiClient from "./axiosClient";

const contentApi = {
    get: (page) => {
        const url = '/content/';
        return apiClient.get(url, { params: { page } });
    },

    save: (id, formData) => {
        const url = `/content/${id}`;
        return apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    delete: (id) => {
        const url = `/content/${id}`;
        return apiClient.delete(url);
    },

    order: (page, orderId) => {
        const url = '/content/';
        return apiClient.patch(url, { orderId: orderId }, { params: { page } });
    },

    uploadArray: (formData) => {
        const url = '/uploadArray/images';
        return apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    deleteImage: (public_id, resource_type = "image") => {
        const url = `/upload/deleteImage`;
        return apiClient.post(url, { public_id, resource_type });
    }
};

export default contentApi;