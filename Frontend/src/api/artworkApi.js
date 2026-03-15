import apiClient from "./axiosClient";

const artworkApi = {
    create: (formData) => {
        const url = '/artwork/'; 
        return apiClient.post(url, formData);
    },

    getAll: (page, limit, category_ids, keyword) => {
        const url = '/artwork/';
        return apiClient.get(url, {params: {page, limit, category_ids, keyword}})
    },

    getByAdmin: (page, limit, layout) => {
        const url = '/artwork/getByAdmin';
        return apiClient.get(url, {params: {page, limit, layout}});
    },

    getById: (id) => {
        const url = `/artwork/getById/${id}`;
        return apiClient.get(url, {id});
    },

    getBySlug: (slug) => {
        const url= `/artwork/${slug}`;
        return apiClient.get(url);
    },

    update: (id, updateData) => {
        const url = `/artwork/${id}`;
        return apiClient.patch(url, updateData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    update3D: (id, rawdata) => {
        const url = `/artwork/${id}/3D-config`;
        return apiClient.patch(url, {rawdata});
    },

    delete: (id) => {
        const url = `/artwork/${id}`;
        return apiClient.delete(url);
    },

    annotation: (id, rawdata) => {
        const url = `/artwork/$${id}/annotation`;
        return apiClient.post(url, {rawdata});
    }
};

export default artworkApi;