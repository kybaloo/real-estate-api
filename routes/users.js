import express from 'express';
import { body } from 'express-validator';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// @route   GET /api/users/me
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
router.get('/me', isAuthenticated, userController.getUserProfile);

// @route   PUT /api/users/me
// @desc    Mettre à jour le profil de l'utilisateur
// @access  Private
router.put('/me', isAuthenticated, userController.updateUserProfile);

// @route   POST /api/users/favorites/:id
// @desc    Ajouter un bien immobilier aux favoris
// @access  Private (client)
router.post('/favorites/:id', isAuthenticated, userController.addToFavorites);

// @route   DELETE /api/users/favorites/:id
// @desc    Supprimer un bien immobilier des favoris
// @access  Private
router.delete('/favorites/:id', isAuthenticated, userController.removeFromFavorites);

// @route   GET /api/users/favorites
// @desc    Récupérer tous les biens favoris de l'utilisateur
// @access  Private
router.get('/favorites', isAuthenticated, userController.getFavorites);

// @route   GET /api/users
// @desc    Récupérer tous les utilisateurs (admin uniquement)
// @access  Private (admin)
router.get('/', isAuthenticated, authorizeRoles(['admin']), userController.getAllUsers);

export default router;
