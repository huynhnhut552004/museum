const {HTTP_STATUS} = require ('../constants/httpStatus');
const { ERROR_MESSAGES, COMMENT_MESSAGES } = require('../constants/message');
const { UUID } = require('../constants/regex');
const CommentService = require('../services/comment.service');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');

const CommentController = {
    create: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {eId, aId} = req.params;
        const {content, parentId} = req.body;
        if(!content) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(eId && !UUID.test(eId)) throw createError (ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(aId && !UUID.test(aId)) throw createError (ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(parentId && !UUID.test(parentId)) throw createError (ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CommentService.createComment({userId, eventId: eId, artworkId: aId, content, parentId});
        return res.status(HTTP_STATUS.CREATED).json({message: COMMENT_MESSAGES.CREATED, data: result});
    }),

    get: asyncHandler(async (req, res) => {
        const { eId, aId } = req.params;
        const userId = req.user ? req.user.id : null;
        const rawdata = req.query;
        if (eId && !UUID.test(eId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if (aId && !UUID.test(aId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const data = {
            page: parseInt(rawdata.page),
            limit: parseInt(rawdata.limit)
        };
        const result = await CommentService.getComments({ userId, eventId: eId, artworkId: aId, page: data.page, limit: data.limit });
        return res.status(HTTP_STATUS.OK).json({ data: result });
    }),

    getRep: asyncHandler(async (req, res) => {
        const userId = req.user ? req.user.id : null;
        const {id} = req.params;
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CommentService.getReplies({commentId: id ,userId})
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    toggleLikeComment: asyncHandler(async (req, res) =>{
        const userId = req.user.id;
        const {id} = req.params;
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CommentService.toggleLikeComment(userId, id);
        return res.status(HTTP_STATUS.OK).json(result);
    }),

    delete: asyncHandler (async (req, res) =>{
        const userId = req.user.id;
        const {id} = req.params;
        const admin= req.user.role === 'admin';
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await CommentService.deleteComment(userId, id, admin);
        return res.status(HTTP_STATUS.OK).json({message: COMMENT_MESSAGES.DELETED});
    }),

    pin: asyncHandler(async (req, res) => {
        const {id} = req.params;
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await CommentService.pinComment(id);
        return res.status(HTTP_STATUS.OK).json({message: COMMENT_MESSAGES.PINED});
    })
};

module.exports = CommentController;