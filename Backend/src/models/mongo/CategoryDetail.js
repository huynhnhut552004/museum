const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategoryDetailSchema = new Schema({
  category_id: { type: String, required: true, unique: true },

  // Chuyển sang Mixed
  three_d_config: { 
    type: Schema.Types.Mixed, 
    default: {
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    }
  },

  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CategoryDetail', CategoryDetailSchema);