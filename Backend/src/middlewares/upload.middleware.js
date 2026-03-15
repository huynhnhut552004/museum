const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const createUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith('video');

      return {
        folder: folderName,
        resource_type: 'auto',
        allowed_formats: isVideo 
          ? ['mp4', 'mov', 'avi', 'webm'] 
          : ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: isVideo 
          ? [] 
          : [{ width: 1500, crop: 'limit' }]
      };
    }
  });
  return multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
  });
};
const uploadArtwork = createUploader('museum_artworks');
const uploadCMS = createUploader('museum_cms');
const uploadEvent = createUploader('museum_event');

module.exports = {
  uploadArtwork,
  uploadCMS,
  uploadEvent
};