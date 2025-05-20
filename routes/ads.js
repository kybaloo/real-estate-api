const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const adController = require('../controllers/adController');

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

module.exports = router;
