const AuthService = require ('../services/auth.service');
const {HTTP_STATUS} = require ('../constants/httpStatus');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');
const {AUTH_MESSAGES, ERROR_MESSAGES} = require ('../constants/message');
const { EMAIL, PASSWORD_STRONG } = require('../constants/regex');
const jwt = require('jsonwebtoken');

const AuthController = {
    register: asyncHandler(async (req, res) => {
        const { email, password, full_name } = req.body;
        if (!email || !password || !full_name) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!EMAIL.test(email)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(!PASSWORD_STRONG.test(password)) throw createError(AUTH_MESSAGES.WEAK_PASS, HTTP_STATUS.BAD_REQUEST);
        const result = await AuthService.register({email, password, full_name});
        return res.status(HTTP_STATUS.CREATED).json({ message: AUTH_MESSAGES.REGISTER_SUCCESS, data: result });
    }),

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        const result = await AuthService.login({ email, password });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const { refreshToken, ...loginData } = result;
        return res.status(HTTP_STATUS.OK).json({ message: AUTH_MESSAGES.LOGIN_SUCCESS, data: loginData });
    }),

    logout: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        await AuthService.logout(userId);
        return res.status(HTTP_STATUS.OK).json({message: AUTH_MESSAGES.LOGOUT_SUCCESS});
    }),

    refreshToken: asyncHandler(async (req, res) => {
        const refreshToken = req.cookies?.refreshToken || req.body?.token || req.body?.refreshToken;        
        if (!refreshToken) throw createError(AUTH_MESSAGES.INVALID_SESSION, HTTP_STATUS.UNAUTHORIZED);
        const decoded = jwt.decode(refreshToken);
        if (!decoded || !decoded.id) throw createError(AUTH_MESSAGES.INVALID_SESSION ,HTTP_STATUS.UNAUTHORIZED);
        const result = await AuthService.refreshToken(decoded.id, refreshToken);
        return res.status(HTTP_STATUS.OK).json({ message: AUTH_MESSAGES.REFRESH_TOKEN, data: result });
    }),

    forgotPassword: asyncHandler (async (req, res) => {
        const {email} = req.body;
        if (!email) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!EMAIL.test(email)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await AuthService.forgotPassword(email);
        return res.status(HTTP_STATUS.OK).json({message: AUTH_MESSAGES.OTP_SEND});
    }),

    resetPassword: asyncHandler (async (req, res) => {
        const {email, otp, newPassword} = req.body;
        if (!email || !otp || !newPassword) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!PASSWORD_STRONG.test(newPassword)) throw createError(AUTH_MESSAGES.WEAK_PASS, HTTP_STATUS.BAD_REQUEST);
        if(!EMAIL.test(email)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await AuthService.resetPassword({email, otp, newPassword});
        return res.status(HTTP_STATUS.OK).json({message: AUTH_MESSAGES.RESET_PASSWORD});
    })
};

module.exports = AuthController;