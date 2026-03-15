import apiClient from "./axiosClient";

const commentApi = {
    createEvent: (eId, content, parentId) => {
        const url = `/comment/event/${eId}`;
        return apiClient.post(url, {content, parentId});
    },

    createArtwork: (aId, content, parentId) => {
        const url = `/comment/artwork/${aId}`;
        return apiClient.post(url, {content, parentId});
    },

    getEvent: (eId, rawdata) => {
        const url = `/comment/event/${eId}`;
        return apiClient.get(url, {params: {rawdata}});
    },

    getArtwork: (aId, rawdata) => {
        const url = `/comment/artwork/${aId}`;
        return apiClient.get(url, {params: {rawdata}});
    },

    getRep: (id) => {
        const url = `/comment/${id}/replies`;
        return apiClient.get(url);
    },

    likeComment: (id) => {
        const url = `/comment/${id}/like`;
        return apiClient.post(url, {});
    },

    delete: (id) => {
        const url = `/comment/${id}`; 
        return apiClient.delete(url);
    },

    pin: (id) => {
        const url = `/comment/${id}/pin`;
        return apiClient.post(url, {});
    }
};

export default commentApi;