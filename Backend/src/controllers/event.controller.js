const HTTP_STATUS = require('../constants/httpStatus');
const { ERROR_MESSAGES, EVENT_MESSAGES } = require('../constants/message');
const { SLUG, UUID } = require('../constants/regex');
const EventService = require('../services/event.service');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');
const parseDateSafe = require('../utils/parseDateHepler');
const parseJSONSafe = require('../utils/parseJSONhelper');

const EventController = {
    get: asyncHandler (async (req, res) => {
        const {type, page, limit} = req.query;
        const data = {
            type: type ? (['happening', 'upcoming', 'ended'].includes(type) ? type : undefined) : undefined,
            page: parseInt(page),
            limit: parseInt(limit)
        };
        const result = await EventService.getEvents({type: data.type, page: data.page, limit: data.limit});
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    getBySlug: asyncHandler (async (req, res) => {
        const {slug} = req.params;
        if(!slug) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!SLUG.test(slug)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await EventService.getEventDetail(slug);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    create: asyncHandler (async (req, res) => {
        if (!req.file) throw createError(EVENT_MESSAGES.MISSING_FILE, HTTP_STATUS.BAD_REQUEST);
        const rawdata = req.body;
        if(!rawdata.start_time || !rawdata.end_time || !rawdata.title) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        const startTimeISO = parseDateSafe(rawdata.start_time);
        const endTimeISO = parseDateSafe(rawdata.end_time);
        const content = rawdata.content ? parseJSONSafe(rawdata.content, {}) : {};
        if(!startTimeISO || !endTimeISO) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const data = {
            title: rawdata.title,
            slug:  rawdata.slug,
            description: rawdata.description,
            content: content,
            banner_url: req.file.path,
            public_id: req.file.filename,
            start_time: startTimeISO,
            end_time: endTimeISO
        };
        const result = await EventService.createEvent(data);
        return res.status(HTTP_STATUS.CREATED).json({message: EVENT_MESSAGES.CREATED, data: result});
    }),

    update: asyncHandler (async (req, res) => {
        const {id} = req.params;
        const rawdata = req.body;
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const startTimeISO = rawdata.start_time ? parseDateSafe(rawdata.start_time) : undefined;
        const endTimeISO = rawdata.end_time ? parseDateSafe(rawdata.end_time) : undefined;
        const data = {
            title: rawdata.title,
            description: rawdata.description,
            content: rawdata.content,
            start_time: startTimeISO,
            end_time: endTimeISO,
            file: req.file || undefined
        };
        const result = await EventService.updateEvent(id, data);
        return res.status(HTTP_STATUS.OK).json({message: EVENT_MESSAGES.UPDATED, data: result});
    }),

    delete: asyncHandler (async (req, res) => {
        const {id} = req.params;
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await EventService.deleteEvent(id);
        return res.status(HTTP_STATUS.OK).json({message: EVENT_MESSAGES.DELETED});
    })
};

module.exports = EventController;