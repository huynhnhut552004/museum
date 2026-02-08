const HTTP_STATUS = require('../constants/httpStatus');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, CONTENT_MESSAGES } = require('../constants/message');
const { UUID } = require('../constants/regex');
const ContentService = require('../services/content.service');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');

const ContentController = {
    get: asyncHandler (async (req, res) => {
        const {page, lang} = req.query;
        if(!page || !lang) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        const result = await ContentService.getPageBlocks(page, lang);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    save: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { page, block_type, language, display_order } = req.body;
        let parsedData = {};
        if (req.body.data) {
            try {
                parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
            } catch (err) {
                throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
            }
        }
        const result = await ContentService.saveBlock({ id: id || 'new', page, block_type, language, data: parsedData, file: req.file || null, display_order: display_order ? parseInt(display_order) : null });
        return res.status(HTTP_STATUS.OK).json(result);
    }),

    delete: asyncHandler(async (req, res) => {
        const {id} = req.params;
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await ContentService.deleteBlock(id);
        return res.status(HTTP_STATUS.OK).json({messgae: SUCCESS_MESSAGES.DELETED});
    }),

    orderUpdate: asyncHandler(async (req, res) => {
        const {page, lang} = req.query;
        const {orderId} = req.body;
        if(!page || !lang) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        const orderedIds = Array.isArray(orderId) ? orderId : typeof orderId === 'string' ? orderId.split(',').map(id => parseInt(id.trim(), 10)) : [];
        if(orderedIds.length === 0) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        await ContentService.reorderBlocks(page, lang, orderId);
        return res.status(HTTP_STATUS.OK).json({message: CONTENT_MESSAGES.ORDER_UPDATED});
    })
};

module.exports = ContentController;