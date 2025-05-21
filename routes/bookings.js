import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Récupérer toutes les réservations (propriétaire: ses biens, client: ses demandes, admin: toutes)
// @access  Private
router.get('/', isAuthenticated, bookingController.getBookings);

// @route   POST /api/bookings
// @desc    Créer une nouvelle demande de visite
// @access  Private (client)
router.post('/', isAuthenticated, bookingController.createBooking);

// @route   GET /api/bookings/:id
// @desc    Récupérer une réservation par son ID
// @access  Private (propriétaire du bien, client demandeur, admin)
router.get('/:id', isAuthenticated, bookingController.getBookingById);

// @route   PUT /api/bookings/:id/status
// @desc    Mettre à jour le statut d'une réservation (confirmer/annuler)
// @access  Private (propriétaire du bien, admin)
router.put('/:id/status', isAuthenticated, bookingController.updateBookingStatus);

// @route   DELETE /api/bookings/:id
// @desc    Annuler une réservation (client seulement si status=pending)
// @access  Private (client, propriétaire du bien, admin)
router.delete('/:id', isAuthenticated, bookingController.deleteBooking);

// @route   POST /api/bookings/:id/feedback
// @desc    Ajouter un avis après une visite
// @access  Private (client ayant fait la réservation)
router.post('/:id/feedback', 
  isAuthenticated,
  authorizeRoles(['client']),
  bookingController.addClientFeedback
);

// @route   POST /api/bookings/:id/owner-feedback
// @desc    Ajouter un commentaire du propriétaire après une visite
// @access  Private (propriétaire du bien)
router.post('/:id/owner-feedback',
  isAuthenticated,
  authorizeRoles(['propriétaire']),
  bookingController.addOwnerFeedback
);

// @route   GET /api/bookings/property/:propertyId
// @desc    Récupérer toutes les réservations d'un bien immobilier
// @access  Private (propriétaire du bien, admin)
router.get('/property/:propertyId',
  isAuthenticated,
  authorizeRoles(['propriétaire', 'admin']),
  bookingController.getBookingsByProperty
);

export default router;
