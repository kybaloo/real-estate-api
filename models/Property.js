import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Le titre est obligatoire"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "La description est obligatoire"]
  },
  type: {
    type: String,
    required: true,
    enum: ['appartement', 'maison', 'terrain', 'commerce', 'bureau', 'garage']
  },
  price: {
    type: Number,
    required: [true, "Le prix est obligatoire"]
  },
  surface: {
    type: Number,
    required: [true, "La surface est obligatoire"]
  },
  rooms: {
    type: Number,
    default: 0
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'France'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  features: [String],
  images: [String],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['disponible', 'vendu', 'loué', 'réservé'],
    default: 'disponible'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexation géospatiale pour les recherches de proximité
propertySchema.index({ "address.location": "2dsphere" });

export default mongoose.model('Property', propertySchema);
