const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const propertyController = require('../controllers/propertyController');

// @route   GET /api/properties
// @desc    Récupérer tous les biens immobiliers avec pagination et filtres
// @access  Public
router.get('/', propertyController.getProperties);

// @route   GET /api/properties/:id
// @desc    Récupérer un bien immobilier par son ID
// @access  Public
router.get('/:id', propertyController.getPropertyById);

// @route   POST /api/properties
// @desc    Créer un nouveau bien immobilier
// @access  Private (propriétaires et admins)
router.post('/', 
  isAuthenticated, 
  authorizeRoles(['propriétaire', 'admin']), 
  propertyController.createProperty
);

// @route   PUT /api/properties/:id
// @desc    Mettre à jour un bien immobilier
// @access  Private (propriétaire du bien ou admin)
router.put('/:id', 
  isAuthenticated, 
  propertyController.updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Supprimer un bien immobilier
// @access  Private (propriétaire du bien ou admin)
router.delete('/:id', 
  isAuthenticated, 
  propertyController.deleteProperty
);

module.exports = router;
