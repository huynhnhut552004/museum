import apiClient from "./axiosClient";

const likeApi = {
    likeEvent: (eId) => {
        const url = `/like/event/${eId}`;
        return apiClient.post(url,{});
    },

    likeArtwork: (aId) => {
        const url = `/like/artwork/${aId}`;
        return apiClient.post(url,{});
    },

    checkLikeEvent: (eId) => {
        const url = `/like/event/${eId}`;
        return apiClient.get(url);
    },

    checkLikeArtwork: (aId) => {
        const url = `/like/artwork/${aId}`;
        return apiClient.get(url);
    }
};

export default likeApi;