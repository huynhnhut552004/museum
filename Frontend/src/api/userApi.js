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

    update: (full_name) => {
        const url = '/user/update';
        return apiClient.patch(url, { full_name });
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

    getUser: (page) => {
        const url = '/user/getAll';
        return apiClient.get(url, {params: {page}});
    },

    createUser: (email, password, full_name, role, ban) => {
        const url = '/user/createUser';
        return apiClient.post(url, {email, password, full_name, role, ban});
    },

    ban: (id) => {
    const url = `/user/ban/${id}`; 
    return apiClient.patch(url); 
}
}

export default userApi;