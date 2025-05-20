const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Le titre de l'annonce est obligatoire"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "La description de l'annonce est obligatoire"]
  },
  type: {
    type: String,
    required: true,
    enum: ['vente', 'location']
  },
  price: {
    type: Number,
    required: [true, "Le prix est obligatoire"]
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'completed'],
    default: 'active'
  },
  // Pour les locations uniquement
  rentalDetails: {
    duration: String,  // mensuel, annuel, etc.
    depositAmount: Number,
    availability: Date
  },
  // Informations de contact spécifiques à l'annonce
  contactInfo: {
    useOwnerInfo: {
      type: Boolean,
      default: true
    },
    phone: String,
    email: String
  },
  viewCount: {
    type: Number,
    default: 0
  },
  highlighted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Par défaut, l'annonce expire dans 30 jours
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  }
}, {
  timestamps: true
});

// Indexation pour les recherches
adSchema.index({ type: 1, status: 1 });
adSchema.index({ price: 1 });
adSchema.index({ 'property': 1 });
adSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ad', adSchema);
