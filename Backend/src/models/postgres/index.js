const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URI;

// 1. CẤU HÌNH KẾT NỐI
// Thay thế thông tin DB của bạn vào đây
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, 
 dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
  },
});

// 2. ĐỊNH NGHĨA MODELS

// --- Table: users ---
const User = sequelize.define('users', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  is_banned: { type: DataTypes.BOOLEAN, defaultValue: false },
  force_password_change: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// --- Table: categories ---
const Category = sequelize.define('categories', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  layout_type: { type: DataTypes.ENUM('classic', 'digital', 'both'), allowNull: false },
}, {
  updatedAt: false, // Bảng này trong SQL của bạn không có updated_at
});

// --- Table: artworks ---
const Artwork = sequelize.define('artworks', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  artist_id: { type: DataTypes.UUID }, // FK
  artist_display_name: { type: DataTypes.STRING },
  media_url: { type: DataTypes.TEXT, allowNull: false },
  media_type: { type: DataTypes.STRING, defaultValue: 'image' },
  public_id: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  year: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('draft', 'published', 'hidden'), defaultValue: 'published' },
  // search_vector: DataTypes.TSVECTOR // AdminJS không hỗ trợ native type này nên ta bỏ qua để tránh lỗi
});

// --- Table: artwork_categories (Bảng trung gian) ---
const ArtworkCategory = sequelize.define('artwork_categories', {
  artwork_id: { type: DataTypes.UUID, primaryKey: true },
  category_id: { type: DataTypes.INTEGER, primaryKey: true },
}, { timestamps: false });

// --- Table: collections ---
const Collection = sequelize.define('collections', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.UUID }, // FK
  name: { type: DataTypes.STRING, defaultValue: 'Yêu thích' },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  updatedAt: false, // SQL của bạn bảng này không có updated_at
});

// --- Table: collection_items (Bảng trung gian) ---
const CollectionItem = sequelize.define('collection_items', {
  collection_id: { type: DataTypes.UUID, primaryKey: true },
  artwork_id: { type: DataTypes.UUID, primaryKey: true },
  added_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false });

// --- Table: events ---
const Event = sequelize.define('events', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT },
  
  // URL để API trả về cho Frontend / App
  banner_url: { type: DataTypes.TEXT }, 
  
  // Định danh gốc trên Cloudinary (Do AdminJS điền)
  public_id: { type: DataTypes.STRING }, 
  
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  total_views: { type: DataTypes.INTEGER, defaultValue: 0 },

  // --- THÊM VIRTUAL COLUMNS ĐỂ HỨNG DATA TỪ ADMINJS MÀ KHÔNG LỖI DB ---
  cloudinary_bucket: { type: DataTypes.VIRTUAL },
  mime_type: { type: DataTypes.VIRTUAL },
  file_size: { type: DataTypes.VIRTUAL },
});

// --- HOOK: TỰ ĐỘNG TẠO FULL URL TỪ PUBLIC_ID ---
Event.beforeSave((instance, options) => {
  // Kiểm tra nếu có public_id mới (khi vừa upload)
  if (instance.changed('public_id') && instance.public_id) {
    // Thay 'YOUR_CLOUD_NAME' bằng tên cloud thật của bạn
    instance.banner_url = `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${instance.public_id}`;
  }
});

// --- Table: comments ---
const Comment = sequelize.define('comments', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.UUID }, // FK
  event_id: { type: DataTypes.UUID }, // FK (Nullable)
  artwork_id: { type: DataTypes.UUID }, // FK (Nullable)
  content: { type: DataTypes.TEXT, allowNull: false },
  parent_id: { type: DataTypes.UUID }, // FK (Self)
  like_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// --- Table: likes ---
const Like = sequelize.define('likes', {
  user_id: { type: DataTypes.UUID, primaryKey: true },
  event_id: { type: DataTypes.UUID }, // Composite key giả lập cho Sequelize đỡ lỗi
  artwork_id: { type: DataTypes.UUID },
}, { 
  updatedAt: false,
  // Sequelize cần ít nhất 1 Primary Key. Trong thực tế AdminJS quản lý bảng junction này hơi khó
  // nên ta chỉ define để code không lỗi.
});

// --- Table: submission (Lưu ý: tên bảng SQL là số ít) ---
const Submission = sequelize.define('submission', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false },
  purpose: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('rule', 'contact', 'feedback'), allowNull: false },
}, { 
  tableName: 'submission', // Định danh chính xác tên bảng số ít
  updatedAt: false 
});

// --- Table: web_contents ---
const WebContent = sequelize.define('web_contents', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  page: { type: DataTypes.STRING, allowNull: false },
  block_type: { type: DataTypes.STRING, allowNull: false },
  is_hidden: { type: DataTypes.BOOLEAN, defaultValue: false },
  content: { type: DataTypes.JSONB, defaultValue: {} }, // AdminJS sẽ hiện JSON Editor xịn
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  language: { type: DataTypes.STRING, defaultValue: 'vi' },
  updated_by: { type: DataTypes.UUID }, // FK
});

// 3. THIẾT LẬP QUAN HỆ (ASSOCIATIONS)
// Phần này giúp AdminJS hiện dropdown chọn User, chọn Category...

// --- User Relationships ---
User.hasMany(Artwork, { foreignKey: 'artist_id' });
User.hasMany(Collection, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
User.hasMany(WebContent, { foreignKey: 'updated_by' });

// --- Artwork Relationships ---
Artwork.belongsTo(User, { foreignKey: 'artist_id', as: 'artist' }); // Hiện tên artist thay vì ID
Artwork.belongsToMany(Category, { through: ArtworkCategory, foreignKey: 'artwork_id', otherKey: 'category_id' });
Artwork.hasMany(Comment, { foreignKey: 'artwork_id' });

// --- Category Relationships ---
Category.belongsToMany(Artwork, { through: ArtworkCategory, foreignKey: 'category_id', otherKey: 'artwork_id' });

// --- Collection Relationships ---
Collection.belongsTo(User, { foreignKey: 'user_id' });
Collection.belongsToMany(Artwork, { through: CollectionItem, foreignKey: 'collection_id', otherKey: 'artwork_id' });

// --- Comment Relationships ---
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Event, { foreignKey: 'event_id' });
Comment.belongsTo(Artwork, { foreignKey: 'artwork_id' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parent_id' }); // Trả lời bình luận
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parent_id' });

// --- WebContent Relationships ---
WebContent.belongsTo(User, { foreignKey: 'updated_by', as: 'editor' });

// 4. EXPORT
module.exports = {
  sequelize,
  User,
  Category,
  Artwork,
  Collection,
  Event,
  Comment,
  Submission,
  WebContent,
  Like
};