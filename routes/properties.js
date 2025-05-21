import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.js';
import * as propertyController from '../controllers/propertyController.js';

const router = express.Router();

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
  authorizeRoles(['propriétaire', 'admin']),
  propertyController.updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Supprimer un bien immobilier
// @access  Private (propriétaire du bien ou admin)
router.delete('/:id',
  isAuthenticated,
  authorizeRoles(['propriétaire', 'admin']),
  propertyController.deleteProperty
);

// @route   GET /api/properties/:id/images
// @desc    Récupérer les images d'un bien immobilier
// @access  Public
router.get('/:id/images', propertyController.getPropertyImages);

// @route   POST /api/properties/:id/images
// @desc    Ajouter des images à un bien immobilier
// @access  Private (propriétaire du bien ou admin)
router.post('/:id/images',
  isAuthenticated,
  authorizeRoles(['propriétaire', 'admin']),
  propertyController.addPropertyImages
);

// @route   DELETE /api/properties/:id/images/:imageId
// @desc    Supprimer une image d'un bien immobilier
// @access  Private (propriétaire du bien ou admin)
router.delete('/:id/images/:imageId',
  isAuthenticated,
  authorizeRoles(['propriétaire', 'admin']),
  propertyController.deletePropertyImage
);

export default router;
