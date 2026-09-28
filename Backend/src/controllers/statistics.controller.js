const StatisticsService = require('../services/statistics.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const asyncHandler = require('../utils/asyncHandler');
const SearchService = require('../services/search.service');

const StatisticsController = {
    artwork: {
        getArtworkOverview: asyncHandler(async (req, res) => {
            const result = await StatisticsService.artwork.getArtworkOverview();
            return res.status(HTTP_STATUS.OK).json({ data: result });
        }),

        getArtworkGrowth: asyncHandler(async (req, res) => {
            const { period = 'month' } = req.query;
            const result = await StatisticsService.artwork.getArtworkGrowth(period);
            return res.status(HTTP_STATUS.OK).json({ data: result });
        }),

        getArtworkRanking: asyncHandler(async (req, res) => {
            const { period = 'month' } = req.query;
            const result = await StatisticsService.artwork.getArtworkRanking(period);
            return res.status(HTTP_STATUS.OK).json({ data: result });
        })
    },

    event: {
        getEventOverview: asyncHandler(async (req, res) => {
            const result = await StatisticsService.event.getEventOverview();
            return res.status(HTTP_STATUS.OK).json({ data: result });
        }),

        getEventGrowth: asyncHandler(async (req, res) => {
            const { period = 'month' } = req.query;
            const result = await StatisticsService.event.getEventGrowth(period);
            return res.status(HTTP_STATUS.OK).json({ data: result });
        }),

        getEventRanking: asyncHandler(async (req, res) => {
            const { period = 'month' } = req.query;
            const result = await StatisticsService.event.getEventRanking(period);
            return res.status(HTTP_STATUS.OK).json({ data: result });
        })
    },

    user: {
        getUserOverview: asyncHandler(async (req, res) => {
            const result = await StatisticsService.user.getUserOverview();
            return res.status(HTTP_STATUS.OK).json({ data: result });
        }),

        getUserGrowth: asyncHandler(async (req, res) => {
            const { period = 'month' } = req.query;
            const result = await StatisticsService.user.getUserGrowth(period);
            return res.status(HTTP_STATUS.OK).json({ data: result });
        })
    },

    submission: {
        getSubmissionOverview: asyncHandler(async (req, res) => {
            const result = await StatisticsService.submission.getSubmissionOverview();
            return res.status(HTTP_STATUS.OK).json({ data: result });
        }),

        getSubmissionGrowth: asyncHandler(async (req, res) => {
            const { period = 'month' } = req.query;
            const result = await StatisticsService.submission.getSubmissionGrowth(period);
            return res.status(HTTP_STATUS.OK).json({ data: result });
        })
    },

    search: {
        getSearchRanking: asyncHandler(async (req, res) => {
            const { layout, timeframe, limit } = req.query;
            if (!layout) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Thiếu tham số layout (classic/digital)" });
            const parsedLimit = parseInt(limit, 10);
            const validLimit = (!isNaN(parsedLimit) && parsedLimit > 0) ? parsedLimit : 10;
            const results = await SearchService.getTrendingKeywords(layout, timeframe, validLimit);
            return res.status(HTTP_STATUS.OK).json({ data: results || [] });
        })
    }
};

module.exports = StatisticsController;