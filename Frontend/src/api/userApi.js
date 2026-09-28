import apiClient from "./axiosClient";

const userApi = {
    get: () => {
        const url = '/user/';
        return apiClient.get(url);
    },

    getByEmail: (email) => {
        const url = '/user/getByEmail';
        return apiClient.post(url, { email });
    },

    getByTag: (userName) => {
        const url = '/user/getByTag';
        return apiClient.get(url, { params: { userName } });
    },

    update: (full_name) => {
        const url = '/user/update';
        return apiClient.patch(url, { full_name });
    },

    updateInfo: (data) => {
        const url = '/user/updateInfo';
        return apiClient.patch(url, { data });
    },

    changeEmail: (newEmail) => {
        const url = '/user/changeEmail';
        return apiClient.post(url, { newEmail });
    },

    verifyEmail: (inputOtp) => {
        const url = '/user/verifyEmail';
        return apiClient.post(url, { inputOtp });
    },

    changePassword: (oldPass, newPass) => {
        const url = '/user/changePassword';
        return apiClient.post(url, { oldPass, newPass });
    },

    getUser: (page, limit) => {
        const url = '/user/getAll';
        return apiClient.get(url, { params: { page, limit } });
    },

    searchByAdmin: (page, limit, keyword) => {
        const url = '/user/searchByAdmin';
        return apiClient.get(url, { params: { page, limit, keyword } });
    },

    createUser: (email, password, full_name, role, ban) => {
        const url = '/user/createUser';
        return apiClient.post(url, { email, password, full_name, role, ban });
    },

    ban: (id) => {
        const url = `/user/ban/${id}`;
        return apiClient.patch(url);
    }
}

export default userApi;