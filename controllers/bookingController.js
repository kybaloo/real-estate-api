const Booking = require('../models/Booking');
const Ad = require('../models/Ad');
const Property = require('../models/Property');

// @desc    Récupérer toutes les réservations (propriétaire: ses biens, client: ses demandes, admin: toutes)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let filter = {};
    
    // Filtrage selon le rôle
    if (req.user.role === 'client') {
      filter.client = req.user.id;
    } else if (req.user.role === 'propriétaire') {
      filter.owner = req.user.id;
    }
    // L'admin peut voir toutes les réservations (pas de filtre)
    
    // Filtrage par statut si spécifié
    if (req.query.status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(filter)
      .populate('property')
      .populate('ad')
      .populate('client', 'firstName lastName email phone')
      .populate('owner', 'firstName lastName email phone')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1, createdAt: -1 });
    
    // Comptage pour pagination
    const total = await Booking.countDocuments(filter);
    
    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer une nouvelle demande de visite
// @route   POST /api/bookings
// @access  Private (client)
exports.createBooking = async (req, res) => {
  try {
    // Vérifier que l'annonce existe
    const ad = await Ad.findById(req.body.ad);
    if (!ad || ad.status !== 'active') {
      return res.status(404).json({ message: 'Annonce non trouvée ou inactive' });
    }
    
    // Vérifier que le bien existe
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }
    
    // Vérifier que la propriété et l'annonce correspondent
    if (ad.property.toString() !== property._id.toString()) {
      return res.status(400).json({ message: 'L\'annonce et le bien immobilier ne correspondent pas' });
    }
    
    // Vérifier que la date est dans le futur
    const bookingDate = new Date(req.body.date);
    const now = new Date();
    if (bookingDate <= now) {
      return res.status(400).json({ message: 'La date de visite doit être dans le futur' });
    }
    
    // Vérification que le client ne fait pas de réservation pour son propre bien
    if (req.user.id === property.owner.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas réserver une visite pour votre propre bien' });
    }
    
    // Vérification de disponibilité (pas de réservation au même moment)
    const conflictingBooking = await Booking.findOne({
      property: property._id,
      date: bookingDate,
      'timeSlot.start': req.body.timeSlot.start,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (conflictingBooking) {
      return res.status(400).json({ message: 'Ce créneau horaire est déjà réservé' });
    }
    
    // Création de la réservation
    const newBooking = new Booking({
      property: property._id,
      ad: ad._id,
      client: req.user.id,
      owner: property.owner,
      date: bookingDate,
      timeSlot: req.body.timeSlot,
      message: req.body.message || ''
    });
    
    await newBooking.save();
    
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Récupérer une réservation par son ID
// @route   GET /api/bookings/:id
// @access  Private (propriétaire du bien, client demandeur, admin)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('ad')
      .populate('client', 'firstName lastName email phone')
      .populate('owner', 'firstName lastName email phone');
    
    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    // Vérifier que l'utilisateur est autorisé à voir cette réservation
    if (booking.client.toString() !== req.user.id && 
        booking.owner.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le statut d'une réservation (confirmer/annuler)
// @route   PUT /api/bookings/:id/status
// @access  Private (propriétaire du bien, admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire du bien ou un admin
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    booking.status = status;
    booking.updatedAt = Date.now();
    
    if (req.body.notes) {
      booking.notes = req.body.notes;
    }
    
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Annuler une réservation (client seulement si status=pending)
// @route   DELETE /api/bookings/:id
// @access  Private (client, propriétaire du bien, admin)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    // Le client ne peut annuler que ses propres réservations en statut 'pending'
    if (req.user.role === 'client') {
      if (booking.client.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      if (booking.status !== 'pending') {
        return res.status(400).json({ message: 'Vous ne pouvez annuler que des réservations en attente' });
      }
    } else if (req.user.role === 'propriétaire' && booking.owner.toString() !== req.user.id) {
      // Le propriétaire ne peut annuler que ses propres réservations
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // L'admin peut supprimer n'importe quelle réservation
    
    await Booking.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Réservation annulée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ajouter un avis après une visite
// @route   POST /api/bookings/:id/feedback
// @access  Private (client ayant fait la réservation)
exports.addFeedback = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    // Vérifier que la réservation est terminée
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Vous ne pouvez ajouter un avis que pour une visite terminée' });
    }
    
    // Vérifier que l'utilisateur est le client
    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Ajouter l'avis du client
    booking.feedbackClient = {
      text: req.body.text,
      rating: parseInt(req.body.rating) || 0
    };
    
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
