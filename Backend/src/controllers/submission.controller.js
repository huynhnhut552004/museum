const {HTTP_STATUS} = require('../constants/httpStatus');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../constants/message');
const { EMAIL, UUID } = require('../constants/regex');
const SubmissionService = require('../services/submission.service');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');

const SubmissionController = {
    create: asyncHandler (async (req, res) => {
        const data = req.body;
        if (!data.name || !data.email || !data.desc || !data.purpose || !data.status) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!EMAIL.test(data.email)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(!['rule', 'contact', 'feedback'].includes(data.status)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await SubmissionService.postSubmission(data);
        return res.status(HTTP_STATUS.OK).json({message: SUCCESS_MESSAGES.POST_OK});
    }),

    get: asyncHandler (async (req, res) => {
        const {page, limit, status, email} = req.query;
        if(email && !EMAIL.test(email)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(status && !['rule', 'contact', 'feedback'].includes(status)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await SubmissionService.getSubmission({page: parseInt(page), limit: parseInt(limit), status, email});
        return res.status(HTTP_STATUS.OK).json(result);
    }),

    Readed: asyncHandler (async (req, res) => {
        const {id} = req.params;
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await SubmissionService.markAsRead(id);
        return res.status(HTTP_STATUS.OK);
    }),

    delete: asyncHandler (async (req, res) => {
        const {id} = req.params;
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await SubmissionService.deleteSubmission(id);
        return res.status(HTTP_STATUS.OK).json({message: SUCCESS_MESSAGES.DELETED});
    })
};

module.exports = SubmissionController;