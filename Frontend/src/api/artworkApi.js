import apiClient from "./axiosClient";

const artworkApi = {
    create: (formData) => {
        const url = '/artwork/';
        return apiClient.post(url, formData);
    },

    retryAI: (artworkId, media_url, title, artist_name, layout_type, artistId, desc) => {
        const url = `/artwork/retryAI/${artworkId}`;
        return apiClient.post(url, { media_url, title, artist_name, layout_type, artistId, desc });
    },

    recommended: (artworkId, artist_name, layout_type, limit) => {
        const url = `/artwork/recommend/${artworkId}`;
        return apiClient.get(url, { params: { artist_name, layout_type, limit } });
    },

    get: (page, limit, attributes, keyword, artist_name, layout, lang) => {
        const url = "/artwork/";
        return apiClient.get(url, { params: { page, limit, attributes, keyword, artist_name, layout, lang } });
    },

    getByAdmin: (page, limit, layout) => {
        const url = '/artwork/getByAdmin';
        return apiClient.get(url, { params: { page, limit, layout } });
    },

    searchByadmin: (page, limit, keyword) => {
        const url = '/artwork/searchByAdmin';
        return apiClient.get(url, { params: { page, limit, keyword } });
    },

    getById: (id) => {
        const url = `/artwork/getById/${id}`;
        return apiClient.get(url, { id });
    },

    getBySlug: (slug) => {
        const url = `/artwork/${slug}`;
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
        return apiClient.patch(url, { rawdata });
    },

    delete: (id) => {
        const url = `/artwork/${id}`;
        return apiClient.delete(url);
    },

    annotation: (id, rawdata) => {
        const url = `/artwork/$${id}/annotation`;
        return apiClient.post(url, { rawdata });
    }
};

export default artworkApi;