const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// @route   POST /api/users/register
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post('/register', [
  body('firstName', 'Le prénom est requis').notEmpty(),
  body('lastName', 'Le nom est requis').notEmpty(),
  body('email', 'Veuillez fournir un email valide').isEmail(),
  body('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
  body('role').custom(value => {
    if (value && !['client', 'propriétaire'].includes(value)) {
      throw new Error('Rôle invalide');
    }
    return true;
  })
], userController.registerUser);

// @route   POST /api/users/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post('/login', [
  body('email', 'Veuillez fournir un email valide').isEmail(),
  body('password', 'Le mot de passe est requis').exists()
], userController.loginUser);

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

module.exports = router;
