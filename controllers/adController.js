import Ad from '../models/Ad.js';
import Property from '../models/Property.js';

// @desc    Récupérer toutes les annonces avec filtres
// @route   GET /api/ads
// @access  Public
export const getAds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construction des filtres
    const filter = { status: 'active' }; // Par défaut: annonces actives uniquement
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.minPrice) filter.price = { $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) {
      if (filter.price) {
        filter.price.$lte = parseInt(req.query.maxPrice);
      } else {
        filter.price = { $lte: parseInt(req.query.maxPrice) };
      }
    }
    
    // Filtres liés aux propriétés
    const propertyFilter = {};
    if (req.query.city) {
      propertyFilter['address.city'] = { $regex: req.query.city, $options: 'i' };
    }
    if (req.query.propertyType) {
      propertyFilter['type'] = req.query.propertyType;
    }
    if (req.query.minSurface) {
      propertyFilter['surface'] = { $gte: parseInt(req.query.minSurface) };
    }
    if (req.query.maxSurface) {
      if (propertyFilter.surface) {
        propertyFilter.surface.$lte = parseInt(req.query.maxSurface);
      } else {
        propertyFilter.surface = { $lte: parseInt(req.query.maxSurface) };
      }
    }
    
    // Si des filtres de propriété sont présents, rechercher d'abord les propriétés
    let propertyIds = [];
    if (Object.keys(propertyFilter).length > 0) {
      const properties = await Property.find(propertyFilter).select('_id');
      propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    }
    
    // Exécution de la requête principale
    const ads = await Ad.find(filter)
      .populate('property')
      .populate('owner', 'firstName lastName email phone')
      .skip(skip)
      .limit(limit)
      .sort({ highlighted: -1, createdAt: -1 });
    
    // Comptage pour pagination
    const total = await Ad.countDocuments(filter);
    
    res.json({
      ads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer une annonce par son ID
// @route   GET /api/ads/:id
// @access  Public
export const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('property')
      .populate('owner', 'firstName lastName email phone');
    
    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    
    // Incrémenter le compteur de vues
    ad.viewCount += 1;
    await ad.save();
    
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer une nouvelle annonce
// @route   POST /api/ads
// @access  Private (propriétaire ou admin)
export const createAd = async (req, res) => {
  try {
    // Vérifier que la propriété existe
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé' });
    }
    
    // Vérifier que l'utilisateur est propriétaire du bien ou admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à créer une annonce pour ce bien' });
    }
    
    const newAd = new Ad({
      ...req.body,
      owner: req.user.id
    });
    
    await newAd.save();
    
    // Mise à jour du statut de la propriété si nécessaire
    if (property.status === 'disponible') {
      property.status = newAd.type === 'vente' ? 'à vendre' : 'à louer';
      await property.save();
    }
    
    res.status(201).json(newAd);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mettre à jour une annonce
// @route   PUT /api/ads/:id
// @access  Private (propriétaire de l'annonce ou admin)
export const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    
    // Vérifier que l'utilisateur est propriétaire de l'annonce ou admin
    if (ad.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Empêcher la modification du propriétaire
    if (req.body.owner && req.body.owner !== ad.owner.toString()) {
      delete req.body.owner;
    }
    
    // Empêcher la modification du bien immobilier
    if (req.body.property && req.body.property !== ad.property.toString()) {
      delete req.body.property;
    }
    
    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.json(updatedAd);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer une annonce
// @route   DELETE /api/ads/:id
// @access  Private (propriétaire de l'annonce ou admin)
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    
    // Vérifier que l'utilisateur est propriétaire de l'annonce ou admin
    if (ad.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    await Ad.findByIdAndDelete(req.params.id);
    
    // Mettre à jour le statut de la propriété si nécessaire
    const property = await Property.findById(ad.property);
    if (property) {
      // Vérifier s'il reste d'autres annonces actives pour cette propriété
      const activeAds = await Ad.find({ 
        property: ad.property, 
        status: 'active',
        _id: { $ne: ad._id }
      });
      
      if (activeAds.length === 0) {
        property.status = 'disponible';
        await property.save();
      }
    }
    
    res.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer toutes les annonces d'un bien immobilier
// @route   GET /api/ads/property/:propertyId
// @access  Public
export const getAdsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const ads = await Ad.find({ property: propertyId, status: 'active' })
      .populate('property')
      .populate('owner', 'firstName lastName email phone')
      .sort({ highlighted: -1, createdAt: -1 });

    if (!ads.length) {
      // Retourner un tableau vide si aucune annonce n'est trouvée, plutôt qu'un 404,
      // car il est possible qu'un bien n'ait simplement pas d'annonces.
      return res.json([]);
    }

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre en avant une annonce
// @route   PUT /api/ads/:id/highlight
// @access  Private (propriétaire de l'annonce ou admin)
export const highlightAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce ou admin
    if (ad.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    ad.highlighted = req.body.highlighted === undefined ? !ad.highlighted : req.body.highlighted;
    ad.updatedAt = Date.now();
    await ad.save();

    res.json(ad);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mettre à jour le statut d'une annonce
// @route   PUT /api/ads/:id/status
// @access  Private (propriétaire de l'annonce ou admin)
export const updateAdStatus = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce ou admin
    if (ad.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { status } = req.body;
    if (!status || !['active', 'inactive', 'sold', 'rented'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    ad.status = status;
    ad.updatedAt = Date.now();
    await ad.save();

    // Optionnel: Mettre à jour le statut de la propriété si l'annonce est marquée comme vendue/louée
    if ((status === 'sold' || status === 'rented') && ad.property) {
        const property = await Property.findById(ad.property);
        if (property) {
            property.status = status === 'sold' ? 'vendu' : 'loué';
            await property.save();
        }
    }


    res.json(ad);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
