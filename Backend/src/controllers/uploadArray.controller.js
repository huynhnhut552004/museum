const asyncHandler = require('../utils/asyncHandler');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');

const UploadController = {
    uploadImages: asyncHandler(async (req, res) => {
        const files = req.files;
        if (!files || files.length === 0) return res.status(400).json({ message: "Không có file nào được tải lên" });
        const results = files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));
        return res.status(200).json({ message: "Upload thành công", data: results });
    }),

    deleteImage: asyncHandler(async (req, res) => {
        const { public_id, resource_type } = req.body;
        if (!public_id) return res.status(400).json({ message: "Thiếu public_id để xóa" });
        await deleteFromCloudinary(public_id, resource_type || 'image');
        return res.status(200).json({ message: "Đã xóa ảnh trên Cloudinary thành công" });
    })
};

module.exports = UploadController;