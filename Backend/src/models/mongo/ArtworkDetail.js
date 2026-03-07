const mongoose = require('mongoose');
const { Schema } = mongoose;

const ArtworkDetailSchema = new Schema({
  artwork_id: { type: String, required: true, unique: true, index: true },
    
  // 1. attributes & specs: Giữ nguyên là Mixed
  attributes: { type: Schema.Types.Mixed, default: {} },
  specs: { type: Schema.Types.Mixed, default: {} },

  // 2. three_d_config: Chuyển sang Mixed để tránh lỗi parse Schema con
  // AdminJS sẽ hiển thị ô nhập JSON cho phần này
  three_d_config: { 
    type: Schema.Types.Mixed, 
    default: {
      scale: 1,
      frame_color: '#000000',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    }
  },

  // 3. annotations: Chuyển sang Mixed (Mảng JSON)
  annotations: { 
    type: Schema.Types.Mixed, 
    default: [] 
  },

  updated_at: { type: Date, default: Date.now }
});

ArtworkDetailSchema.index({ "attributes.$**": 1 });
module.exports = mongoose.model('ArtworkDetail', ArtworkDetailSchema);