const { HTTP_STATUS } = require('../constants/httpStatus');
const SearchService = require('../services/search.service');
const asyncHandler = require('../utils/asyncHandler');

const SearchController = {
    Click: asyncHandler(async (req, res) => {
        const { keyword, layout } = req.body;
        if (!keyword) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Thiếu keyword" });
        if (!layout) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Thiếu tham số layout (classic/digital)" });
        await SearchService.trackSearchClick(keyword, layout);
        return res.status(HTTP_STATUS.OK).json({ message: "Lưu từ khóa thành công" });
    }),

    getHot: asyncHandler(async (req, res) => {
        const { layout } = req.query;
        if (!layout) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Thiếu tham số layout (classic/digital)" });
        const results = await SearchService.getTrendingKeywords(layout);
        return res.status(HTTP_STATUS.OK).json({ data: results || [] });
    })
};

module.exports = SearchController;