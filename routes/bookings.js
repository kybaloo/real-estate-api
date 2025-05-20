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
router.post('/:id/feedback', isAuthenticated, bookingController.addFeedback);

export default router;
