const HTTP_STATUS = require('../constants/httpStatus');
const { ERROR_MESSAGES } = require('../constants/message');
const { UUID } = require('../constants/regex');
const LikeService = require('../services/like.service');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');

const LikeController = {
    toggleLike: asyncHandler(async (req, res) => {
        const userId = req.user.id; 
        const {eId, aId} = req.params;
        if(!eId && !aId) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(eId && !UUID.test(eId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(aId && !UUID.test(aId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await LikeService.toggleLike(userId, {eventId: eId, artworkId: aId});
        return res.status(HTTP_STATUS.OK).json(result);
    }),

    checkLike: asyncHandler(async (req, res) =>{
        const userId = req.user.id; 
        const {eId, aId} = req.params;
        if(!eId && !aId) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(eId && !UUID.test(eId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(aId && !UUID.test(aId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await LikeService.checkIsLiked(userId, {eventId: eId, artworkId: aId});
        return res.status(HTTP_STATUS.OK).json(result);
    })
};

module.exports= LikeController;