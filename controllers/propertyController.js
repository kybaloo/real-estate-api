import Property from '../models/Property.js';

// @desc    Récupérer tous les biens immobiliers avec pagination et filtres
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres de recherche
    const filter = {};
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.minPrice) filter.price = { $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) {
      if (filter.price) {
        filter.price.$lte = parseInt(req.query.maxPrice);
      } else {
        filter.price = { $lte: parseInt(req.query.maxPrice) };
      }
    }
    if (req.query.city) filter['address.city'] = { $regex: req.query.city, $options: 'i' };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.minSurface) filter.surface = { $gte: parseInt(req.query.minSurface) };
    if (req.query.maxSurface) {
      if (filter.surface) {
        filter.surface.$lte = parseInt(req.query.maxSurface);
      } else {
        filter.surface = { $lte: parseInt(req.query.maxSurface) };
      }
    }
    if (req.query.rooms) filter.rooms = parseInt(req.query.rooms);
    
    // Création de la requête
    const properties = await Property.find(filter)
      .populate('owner', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Comptage total pour la pagination
    const total = await Property.countDocuments(filter);
    
    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un bien immobilier par son ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone');
    
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }
    
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un nouveau bien immobilier
// @route   POST /api/properties
// @access  Private (propriétaires et admins)
export const createProperty = async (req, res) => {
  try {
    const newProperty = new Property({
      ...req.body,
      owner: req.user.id
    });
    
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mettre à jour un bien immobilier
// @route   PUT /api/properties/:id
// @access  Private (propriétaire du bien ou admin)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Empêcher la modification du propriétaire
    if (req.body.owner && req.body.owner !== property.owner.toString()) {
      delete req.body.owner;
    }
    
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer un bien immobilier
// @route   DELETE /api/properties/:id
// @access  Private (propriétaire du bien ou admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Note: Dans une application réelle, vous devriez également supprimer les annonces et 
    // réservations associées à ce bien, ou les marquer comme inactives
    
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bien immobilier supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les images d'un bien immobilier
// @route   GET /api/properties/:id/images
// @access  Public
export const getPropertyImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }
    res.json(property.images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ajouter des images à un bien immobilier
// @route   POST /api/properties/:id/images
// @access  Private (propriétaire du bien ou admin)
export const addPropertyImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier ce bien' });
    }

    // Vérifier que req.body.images est un tableau d'URLs d'images
    if (!Array.isArray(req.body.images)) {
      return res.status(400).json({ message: 'Le format des images est invalide' });
    }

    property.images.push(...req.body.images);
    await property.save();

    res.json(property.images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une image d'un bien immobilier
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private (propriétaire du bien ou admin)
export const deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier ce bien' });
    }

    const imageIndex = property.images.findIndex(img => img === req.params.imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image non trouvée' });
    }

    property.images.splice(imageIndex, 1);
    await property.save();

    res.json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
