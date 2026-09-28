import apiClient from "./axiosClient";

const searchApi = {
    click: (keyword, layout) => {
        const url = '/search';
        return apiClient.post(url, {keyword, layout});
    },

    getHot: (layout) => {
        const url = '/search';
        return apiClient.get(url, {params: {layout}});
    }
};

export default searchApi;