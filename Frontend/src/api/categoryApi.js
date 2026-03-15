import apiClient from "./axiosClient";

const categoryApi = {
    create: (name, layout, three_d_config) => {
        const url = '/category/';
        return apiClient.post(url, {name, layout, three_d_config});
    },

    getAll: () => {
        const url = '/category/';
        return apiClient.get(url);
    },

    getBySlug: (slug) => {
        const url = `/category/${slug}`;
        return apiClient.get(url);
    },

    update: (name, layout, id) => {
        const url = `/category/${id}`;
        return apiClient.patch(url, {name, layout});
    },

    update3D: (id, rawdata) => {
        const url = `/category/${id}/3D-config`;
        return apiClient.patch(url, rawdata);
    },

    delete: (id) => {
        const url = `/category/${id}`;
        return apiClient.delete(url);
    }
};

export default categoryApi;