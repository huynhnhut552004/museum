const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const AdminJSSequelize = require('@adminjs/sequelize');
const ArtworkDetail = require('../src/models/mongo/ArtworkDetail');
const CategoryDetail = require('../src/models/mongo/CategoryDetail');
const uploadFeature = require('@adminjs/upload');
const CloudinaryProvider = require('../src/utils/cloudinaryProvider');
const {verifyToken, authorize} = require('../src/middlewares/auth.middleware');

const { 
  sequelize, 
  User, 
  Artwork, 
  Category, 
  Event,
  Submission, 
  WebContent 
} = require('../src/models/postgres');

AdminJS.registerAdapter(AdminJSMongoose);
AdminJS.registerAdapter(AdminJSSequelize);

const commonProperties = {
  // Ẩn ID và ngày tháng khi tạo/sửa
  id: { isVisible: { list: true, filter: true, show: true, edit: false, new: false } },
  created_at: { isVisible: { list: true, filter: true, show: true, edit: false, new: false } },
  updated_at: { isVisible: { list: true, filter: true, show: true, edit: false, new: false } },
  // Ẩn khoá ngoại (chỉ hiện dropdown chọn tên)
  artist_id: { isVisible: false }, 
  user_id: { isVisible: false },
};

const setupAdmin = (app) => {
  const adminOptions = {
    // CHỈ GIỮ LẠI CÁC BẢNG QUAN TRỌNG
    resources: [
      // 1. Quản lý Người dùng & Hệ thống
      { 
        resource: User, 
        options: { 
          navigation: { name: 'Hệ thống', icon: 'User' },
          properties: { 
            ...commonProperties,
            password_hash: { isVisible: false }, // Ẩn mật khẩu
            role: { isVisible: { list: true, filter: true, show: true, edit: true } } // Cho phép sửa quyền
          } 
        } 
      },
      { 
        resource: Submission, // Đơn liên hệ/Góp ý
        options: { 
          navigation: { name: 'Hệ thống', icon: 'Mail' }, 
          properties: commonProperties 
        } 
      },
      { 
        resource: WebContent, // Cấu hình trang chủ/footer
        options: { 
          navigation: { name: 'Hệ thống', icon: 'Layout' }, 
          properties: commonProperties 
        } 
      },

      // 2. Quản lý Nội dung chính (Core Content)
      { 
        resource: Artwork, 
        options: { 
          navigation: { name: 'Quản lý Nội dung', icon: 'Image' }, 
          properties: {
            ...commonProperties, // Ẩn ID các thứ
            
            // Ẩn trường media_url đi (vì plugin sẽ thay thế nó bằng nút upload)
            media_url: { isVisible: false },
            
            // Định nghĩa trường ảo 'file' để hiện nút chọn ảnh
            file: { isVisible: { list: false, filter: false, show: true, edit: true } }
          }
        },
        // 2. KÍCH HOẠT TÍNH NĂNG UPLOAD
        features: [
          uploadFeature({
            provider: new CloudinaryProvider({ folder: 'artworks' }),
            properties: {
              key: 'media_url', // Link ảnh sau khi up sẽ lưu vào cột 'media_url'
              file: 'file',     // Trường để hiện nút bấm chọn file
              
              // Các trường này bắt buộc phải map, nhưng DB mình không có
              // nên mình map vào các biến ảo để AdminJS không báo lỗi
              bucket: 'cloudinary_bucket', 
              mimeType: 'mime_type',
              size: 'file_size',
            },
            validation: {
              mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'video/mp4'],
            },
          }),
        ]
      },

      { 
        resource: Category, 
        options: { 
          navigation: { name: 'Quản lý Nội dung', icon: 'Tag' }, 
          properties: commonProperties 
        } 
      },
      { 
        resource: Event, 
        options: { 
          navigation: { name: 'Quản lý Nội dung', icon: 'Calendar' }, 
          properties: {
            ...commonProperties, // Ẩn ID, ngày tạo...
            
            // 1. Ẩn cột chứa link gốc (để khỏi nhập tay)
            // LƯU Ý: Nếu trong DB bạn đặt tên khác 'thumbnail' (vd: banner, image_url) thì sửa dòng này
            banner_url: { isVisible: false }, 
            
            // 2. Hiện nút chọn file
            file: { isVisible: { list: false, filter: false, show: true, edit: true } }
          }
        },
        features: [
  uploadFeature({
    provider: new CloudinaryProvider({ folder: 'events' }),
    properties: {
      // 1. Chỉ định lưu mã định danh của Cloudinary vào cột 'public_id'
      key: 'public_id', 
      file: 'file',
      
      // Tùy phiên bản @adminjs/upload, nếu nó BẮT BUỘC phải có mấy trường này
      // thì bạn phải khai báo VIRTUAL bên Sequelize (xem bước 2). 
      // Nếu không bắt buộc, hãy XÓA luôn 3 dòng dưới để tránh lỗi DB.
      bucket: 'cloudinary_bucket', 
      mimeType: 'mime_type',
      size: 'file_size',
    },
    validation: {
      mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    },
  }),
]
      },

      // 3. Cấu hình 3D (MongoDB)
      { 
        resource: ArtworkDetail, 
        options: { 
          navigation: { name: 'Cấu hình 3D', icon: 'Cube' },
          properties: { ...commonProperties, _id: { isVisible: false } } 
        } 
      },
      { 
        resource: CategoryDetail, 
        options: { 
          navigation: { name: 'Cấu hình 3D', icon: 'Cube' },
          properties: { ...commonProperties, _id: { isVisible: false } }
        } 
      },
    ],

    branding: {
      companyName: 'Bảo Tàng Số Mosaic',
      withMadeWithLove: false,
    },

    locale: {
      language: 'vi',
      translations: {
        labels: {
          MosaicMuseum: 'Mosaic Admin',
        },
        actions: {
          new: 'Thêm mới', edit: 'Sửa', show: 'Xem', delete: 'Xóa', list: 'Danh sách',
        },
        resources: {
          users: 'Người dùng',
          artworks: 'Tác phẩm',
          categories: 'Danh mục',
          events: 'Sự kiện',
          submission: 'Liên hệ khách hàng',
          web_contents: 'Nội dung Website (CMS)',
          ArtworkDetail: 'Chi tiết 3D (Tranh)',
          CategoryDetail: 'Chi tiết 3D (Danh mục)',
        }
      }
    },
    rootPath: '/admin',
  };

  const admin = new AdminJS(adminOptions);
  // (Nếu chưa làm login thì dùng router thường)
  const router = AdminJSExpress.buildRouter(admin);
  app.use(
    admin.options.rootPath,
    router);
};

module.exports = setupAdmin;