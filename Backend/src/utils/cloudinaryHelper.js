const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    console.log(`Đã xóa file cũ trên Cloudinary [${publicId}]:`, result);
    return result;
  } catch (error) {
    console.error('Lỗi xóa file Cloudinary:', error);
  }
};

module.exports = { deleteFromCloudinary };