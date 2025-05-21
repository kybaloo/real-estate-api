import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/register
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
], authController.registerUser);

// @route   POST /api/auth/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post('/login', [
  body('email', 'Veuillez fournir un email valide').isEmail(),
  body('password', 'Le mot de passe est requis').exists()
], authController.loginUser);

// @route   POST /api/auth/refresh
// @desc    Rafraîchir le token d'authentification
// @access  Public (avec refresh token)
router.post('/refresh', authController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Déconnexion d'un utilisateur
// @access  Private
router.post('/logout', authController.logout);

// @route   POST /api/auth/forgot-password
// @desc    Demander la réinitialisation du mot de passe
// @access  Public
router.post('/forgot-password', [
  body('email', 'Veuillez fournir un email valide').isEmail()
], authController.forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Réinitialiser le mot de passe avec un token
// @access  Public
router.post('/reset-password/:token', [
  body('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 })
], authController.resetPassword);

export default router;
