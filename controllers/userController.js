import User from '../models/User.js';
import Property from '../models/Property.js';
import { validationResult  } from 'express-validator';

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/users/register
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
// @route   POST /api/users/login
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

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    // Empêcher la modification du rôle ou de l'email
    if (req.body.role || req.body.email) {
      delete req.body.role;
      delete req.body.email;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ajouter un bien immobilier aux favoris
// @route   POST /api/users/favorites/:id
// @access  Private (client)
export const addToFavorites = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Vérifier si le bien est déjà dans les favoris
    if (user.favorites.includes(req.params.id)) {
      return res.status(400).json({ message: 'Ce bien est déjà dans vos favoris' });
    }
    
    user.favorites.push(req.params.id);
    await user.save();
    
    res.json({ message: 'Bien ajouté aux favoris' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un bien immobilier des favoris
// @route   DELETE /api/users/favorites/:id
// @access  Private
export const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Vérifier si le bien est dans les favoris
    if (!user.favorites.includes(req.params.id)) {
      return res.status(400).json({ message: 'Ce bien n\'est pas dans vos favoris' });
    }
    
    // Supprimer le bien des favoris
    user.favorites = user.favorites.filter(fav => fav.toString() !== req.params.id);
    await user.save();
    
    res.json({ message: 'Bien supprimé des favoris' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer tous les biens favoris de l'utilisateur
// @route   GET /api/users/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer tous les utilisateurs (admin uniquement)
// @route   GET /api/users
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
