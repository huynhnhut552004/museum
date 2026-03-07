const { BaseProvider } = require('@adminjs/upload');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cấu hình Cloudinary từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryProvider extends BaseProvider {
  constructor(options) {
    super(options);
    this.folder = options.folder || 'mosaic_uploads';
  }

  // Hàm xử lý upload
  async upload(file, key) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: this.folder,
      resource_type: 'auto', // Tự động nhận diện ảnh hoặc video
      public_id: key.split('/').pop().split('.')[0], // Giữ tên file gốc
    });
    // QUAN TRỌNG: Trả về key chính là URL để lưu vào DB
    return {
      key: result.secure_url, 
      bucket: this.folder,
    };
  }

  async delete(key, bucket) {
    try {
      // key là URL đầy đủ.
      // VD ảnh: .../image/upload/v123/artworks/anh.jpg
      // VD video: .../video/upload/v123/artworks/video.mp4

      // 1. Xác định loại file (image hay video) dựa vào URL
      let resourceType = 'image'; // Mặc định là ảnh
      if (key.includes('/video/upload')) {
        resourceType = 'video';
      } else if (key.includes('/raw/upload')) {
        resourceType = 'raw'; // File khác (zip, txt...)
      }

      // 2. Lấy Public ID bằng Regex
      // Regex này lấy phần sau chữ 'upload/' (bỏ version v123) và trước dấu chấm đuôi file
      const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
      const match = key.match(regex);

      if (match && match[1]) {
        const publicId = match[1];
        console.log(`🗑️ Đang xóa [${resourceType}]: ${publicId}`);

        // 3. Gọi lệnh xóa với đúng loại resource_type
        await cloudinary.uploader.destroy(publicId, { 
          resource_type: resourceType, // <--- QUAN TRỌNG NHẤT LÀ DÒNG NÀY
          invalidate: true 
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Lỗi khi xóa file:', error);
      return true; 
    }
  }
  // Hàm lấy đường dẫn (AdminJS dùng để hiển thị preview)
  async path(key, bucket) {
    return key; // Vì key mình lưu là URL full rồi
  }
}

module.exports = CloudinaryProvider;