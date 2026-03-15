import apiClient from "./axiosClient";

const collectionApi = {
    create: (name, rawPublic) => {
        const url = '/collection';
        return apiClient.post(url, { name, rawPublic });
    },

    getMine: () => {
        const url = '/collection/mine';
        return apiClient.get(url);
    },

    getDetail: (id) => {
        const url = `/colelction/${id}`;
        return apiClient.get(url);
    },

    add: (collectionId, id) => {
        const url = `/colelction/add-art/${id}`;
        return apiClient.post(url, {collectionId});
    },

    remove: (id, artworkId) => {
        const url = `/collection/${id}/remove`;
        return apiClient.delete(url, {data:{artworkId}});
    },

    delete: (id) => {
        const url = `/collection/${id}`;
        return apiClient.delete(url);
    },

    update: (id, name, rawPublic) => {
        const url = `/collection/${id}`;
        return apiClient.patch(url, {name, rawPublic});
    }
};

export default collectionApi;