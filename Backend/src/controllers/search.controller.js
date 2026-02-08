const HTTP_STATUS = require('../constants/httpStatus');
const SearchService = require('../services/search.service');
const asyncHandler = require ('../utils/asyncHandle');

const SearchController = {
    Click: asyncHandler(async (req, res) => {
        const {keyword} = req.body;
        await SearchService.trackSearchClick(keyword);
        return res.status(HTTP_STATUS.OK);
    }),

    getHot: asyncHandler(async (req, res) => {
        const results = SearchService.getTrendingKeywords();
        return res.status(HTTP_STATUS.OK).json({data: results});
    })
};

module.exports= SearchController;