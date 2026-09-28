import apiClient from "./axiosClient";

const statisticsApi = {
    artwork: {
        overviewArtwork: () => {
            const url = '/statistics/artwork/overview';
            return apiClient.get(url);
        },

        growthArtwork: (period) => {
            const url = '/statistics/artwork/growth';
            return apiClient.get(url, { params: { period } });
        },

        rankingArtwork: (period) => {
            const url = '/statistics/artwork/ranking';
            return apiClient.get(url, { params: { period } });
        }
    },

    event: {
        overviewEvent: () => {
            const url = '/statistics/event/overview';
            return apiClient.get(url);
        },

        growthEvent: (period) => {
            const url = '/statistics/event/growth';
            return apiClient.get(url, { params: { period } });
        },

        rankingEvent: (period) => {
            const url = '/statistics/event/ranking';
            return apiClient.get(url, { params: { period } });
        }
    },

    user: {
        overviewUser: () => {
            const url = '/statistics/user/overview';
            return apiClient.get(url);
        },

        growthUser: (period) => {
            const url = '/statistics/user/growth';
            return apiClient.get(url, { params: { period } });
        }
    },

    submission: {
        overviewSubmission: () => {
            const url = '/statistics/submission/overview';
            return apiClient.get(url);
        },

        growthSubmission: (period) => {
            const url = '/statistics/submission/growth';
            return apiClient.get(url, { params: { period } });
        }
    },

    search: {
        rankingSearch: (layout, period, limit) => {
            const url = '/statistics/search/ranking';
            return apiClient.get(url, { params: { layout, period, limit } });
        }
    }
};
export default statisticsApi;