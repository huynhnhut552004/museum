const {HTTP_STATUS} = require ('../constants/httpStatus');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');
const {AUTH_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES} = require ('../constants/message');
const UserService = require('../services/user.service');
const { EMAIL, PASSWORD_STRONG, UUID } = require('../constants/regex');

const UserController = {
    get: asyncHandler (async (req, res) => {
        const userId= req.user.id;
        const result= await UserService.getProfile(userId);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    getUser: asyncHandler(async (req, res) =>{
        const {page, limit} = req.query;
        const result = await UserService.getUser(page, limit);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    getByEmail: asyncHandler (async (req, res) => {
        const {email} = req.body;
        if(!email) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!EMAIL.test(email)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await UserService.getUserByEmail(email);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    update: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {full_name} = req.body;
        const result = await UserService.updateProfile(userId, {full_name});
        return res.status(HTTP_STATUS.OK).json({message: AUTH_MESSAGES.UPDATED, data: result});
    }),

    changeEmail: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {newEmail} = req.body;
        if(!newEmail) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!EMAIL.test(newEmail)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await UserService.requestEmailChange(userId, newEmail);
        return res.status(HTTP_STATUS.OK).json({message: SUCCESS_MESSAGES.REQUEST_OK});
    }),

    verifyChangeEmail: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {inputOtp} = req.body;
        if(!inputOtp) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        await UserService.verifyEmailChange(userId, inputOtp);
        return res.status(HTTP_STATUS.OK).json({message: SUCCESS_MESSAGES.VERIFY_OK});
    }),

    changePassword: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {oldPass, newPass} = req.body;
        if(!oldPass || !newPass) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!PASSWORD_STRONG.test(newPass)) throw createError(AUTH_MESSAGES.WEAK_PASS, HTTP_STATUS.BAD_REQUEST);
        await UserService.changePassword(userId, oldPass, newPass);
        return res.status(HTTP_STATUS.OK).json({message: AUTH_MESSAGES.CHANGED_PASS});
    }),

    Ban: asyncHandler(async (req, res) => {
        const {id} = req.params;
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await UserService.toggleBan(id);
        return res.status(HTTP_STATUS.OK).json({message: SUCCESS_MESSAGES.SUCCESS, data: result});
    })
};

module.exports = UserController;