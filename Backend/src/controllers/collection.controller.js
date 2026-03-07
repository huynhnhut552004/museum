const CollectionService = require ('../services/collection.service');
const {HTTP_STATUS} = require ('../constants/httpStatus');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');
const {COLLECTION_MESSAGES, ERROR_MESSAGES} = require ('../constants/message');
const { UUID } = require('../constants/regex');

const CollectionController = {
    create: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {name, rawPublic} = req.body;
        const is_public = rawPublic === undefined ? true : String(rawPublic) === 'true';
        if(!name) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        const result = await CollectionService.createCollection(userId, {name, is_public});
        return res.status(HTTP_STATUS.CREATED).json({message: COLLECTION_MESSAGES.CREATED, data: result});
    }),
    
    getMine: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const result = await CollectionService.getMyCollections(userId);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    getDetail: asyncHandler (async (req, res) => {
        const {id} = req.params;
        const userId = req.user ? req.user.id : null;
        if (!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CollectionService.getCollectionDetail(id, userId);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    add: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {collectionId} = req.body;
        const {id} = req.params;
        if (!collectionId || !id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(collectionId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CollectionService.addArtwork(userId, collectionId, id);
        return res.status(HTTP_STATUS.OK).json({message: result});
    }),

    remove: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {id} = req.params;
        const {artworkId} = req.body;
        if(!id || !artworkId) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(artworkId)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CollectionService.removeArtwork(userId, id, artworkId);
        return res.status(HTTP_STATUS.OK).json({message: result});
    }),

    delete: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {id} = req.params;
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CollectionService.deleteCollection(userId, id);
        return res.status(HTTP_STATUS.OK).json({message: result});
    }),

    update: asyncHandler (async (req, res) => {
        const userId = req.user.id;
        const {id} = req.params;
        const {name, rawPublic} = req.body;
        const is_public = rawPublic === undefined ? true : String(rawPublic) === 'true';
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CollectionService.updateCollection(userId, id, {name, is_public});
        return res.status(HTTP_STATUS.OK).json({message: COLLECTION_MESSAGES.UPDATED, data: result});
    })
};

module.exports = CollectionController;