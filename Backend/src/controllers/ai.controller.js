const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants/httpStatus');
const createError = require('../utils/createError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

const AIController = {
    translateCMS: asyncHandler(async (req, res) => {
        const { contentJson } = req.body;
        if (!contentJson) throw createError('Thiếu nội dung!', HTTP_STATUS.BAD_REQUEST);
        const prompt = `
            Bạn là chuyên gia dịch thuật nội dung website nghệ thuật, bảo tàng.
            Hãy dịch các giá trị text trong JSON sau từ Tiếng Việt sang Tiếng Anh.
            Yêu cầu BẮT BUỘC:
            - Giữ nguyên toàn bộ cấu trúc Key của JSON.
            - Trả về duy nhất một object JSON hợp lệ.
            Nội dung cần dịch: ${JSON.stringify(contentJson)}`;
        const result = await model.generateContent(prompt);
        const translatedContent = JSON.parse(result.response.text())
        return res.status(HTTP_STATUS.OK).json({ data: translatedContent });
    })
};

module.exports = AIController;