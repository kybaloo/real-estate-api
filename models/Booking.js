import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, "La date de visite est obligatoire"]
  },
  timeSlot: {
    start: {
      type: String,
      required: [true, "L'heure de début est obligatoire"]
    },
    end: {
      type: String,
      required: [true, "L'heure de fin est obligatoire"]
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ""
  },
  notes: {
    type: String
  },
  feedbackClient: {
    text: String,
    rating: {
      type: Number,
      min: 0,
      max: 5
    }
  },
  feedbackOwner: {
    text: String
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

// Indices pour les recherches
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ client: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ property: 1 });

export default mongoose.model('Booking', bookingSchema);
