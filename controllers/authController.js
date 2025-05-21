import User from '../models/User.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  // Validation des entrées
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Créer un nouvel utilisateur (le rôle admin doit être attribué manuellement)
    const role = req.body.role || 'client';
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: role,
      phone: req.body.phone
    });
    
    await user.save();
    
    // Générer un token JWT
    const token = user.generateAuthToken();
    
    res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  // Validation des entrées
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer un token JWT
    const token = user.generateAuthToken();
    
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rafraîchir le token d'authentification
// @route   POST /api/auth/refresh
// @access  Public (avec refresh token)
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }
    
    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_in_production');
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    // Générer un nouveau token JWT
    const token = user.generateAuthToken();
    
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// @desc    Déconnexion d'un utilisateur
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  // Dans un système sans état comme JWT, le client doit simplement supprimer le token
  res.json({ message: 'Déconnexion réussie' });
};

// @desc    Demander la réinitialisation du mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cet email' });
    }
    
    // Générer un token de réinitialisation (expiration 1 heure)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET || 'reset_secret_change_in_production',
      { expiresIn: '1h' }
    );
    
    // En production: envoyer un email avec le lien de réinitialisation
    // Pour cet exemple, on renvoie simplement le token
    res.json({ 
      message: 'Instructions de réinitialisation envoyées à votre email',
      resetToken // À supprimer en production
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Réinitialiser le mot de passe avec un token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    // Vérifier le token de réinitialisation
    const decoded = jwt.verify(req.params.token, process.env.JWT_RESET_SECRET || 'reset_secret_change_in_production');
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    // Mettre à jour le mot de passe
    user.password = req.body.password;
    await user.save();
    
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Le lien de réinitialisation a expiré' });
    }
    res.status(500).json({ message: error.message });
  }
};
