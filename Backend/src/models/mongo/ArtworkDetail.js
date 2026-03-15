const mongoose = require('mongoose');

const ArtworkDetailSchema = new mongoose.Schema({
  artwork_id: { type: String, required: true, unique: true, index: true },
    
  attributes: {
    type: Map,
    of: String, 
    default: {}
  },

  specs: {
    type: Map,
    of: String 
  },

  three_d_config: {
     scale: { type: Number, default: 1 }, 
     frame_color: { type: String, default: '#000000' },
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

  annotations: [{
    x: Number,
    y: Number,
    title: String,
    description: String
  }],

  updated_at: { type: Date, default: Date.now }
});

ArtworkDetailSchema.index({ "attributes.$**": 1 });
module.exports = mongoose.model('ArtworkDetail', ArtworkDetailSchema);