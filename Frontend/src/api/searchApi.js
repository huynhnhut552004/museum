import apiClient from "./axiosClient";

const searchApi = {
    click: (keyword) => {
        const url = '/search/';
        return apiClient.post(url, {keyword});
    },

    getHot: () => {
        const url = '/search/';
        return apiClient.get(url);
    }
};

export default searchApi;