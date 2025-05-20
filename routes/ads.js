import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.js';
import * as adController from '../controllers/adController.js';

const router = express.Router();

// @route   GET /api/ads
// @desc    Récupérer toutes les annonces avec filtres
// @access  Public
router.get('/', adController.getAds);

// @route   GET /api/ads/property/:propertyId
// @desc    Récupérer toutes les annonces d'un bien immobilier
// @access  Public
router.get('/property/:propertyId', adController.getAdsByProperty);

// @route   GET /api/ads/:id
// @desc    Récupérer une annonce par son ID
// @access  Public
router.get('/:id', adController.getAdById);

// @route   POST /api/ads
// @desc    Créer une nouvelle annonce
// @access  Private (propriétaire ou admin)
router.post('/', 
  isAuthenticated, 
  authorizeRoles(['propriétaire', 'admin']), 
  adController.createAd
);

// @route   PUT /api/ads/:id
// @desc    Mettre à jour une annonce
// @access  Private (propriétaire de l'annonce ou admin)
router.put('/:id', 
  isAuthenticated, 
  adController.updateAd
);

// @route   DELETE /api/ads/:id
// @desc    Supprimer une annonce
// @access  Private (propriétaire de l'annonce ou admin)
router.delete('/:id', 
  isAuthenticated, 
  adController.deleteAd
);

export default router;
