const mongoose = require('mongoose');

const CategoryDetailSchema = new mongoose.Schema({
  category_id: { type: String, required: true, unique: true },
  
  three_d_config: {
     scale: { type: Number, default: 1 },
     position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
     },
     rotation: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
     }
  },

  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CategoryDetail', CategoryDetailSchema);