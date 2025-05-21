import Example from '../models/Example.js';

// @desc    Récupérer tous les exemples
// @route   GET /api/examples
// @access  Public
export const getExamples = async (req, res) => {
  try {
    // Vous pouvez ajouter la logique pour récupérer les exemples depuis MongoDB ici
    // Pour l'instant, nous retournons simplement un message de bienvenue
    res.json({ message: 'Bienvenue sur l\'API Node.js !' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un exemple par son ID
// @route   GET /api/examples/:id
// @access  Public
export const getExampleById = async (req, res) => {
  try {
    const example = await Example.findById(req.params.id);
    
    if (!example) {
      return res.status(404).json({ message: 'Exemple non trouvé' });
    }
    
    res.json(example);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un nouvel exemple
// @route   POST /api/examples
// @access  Public
export const createExample = async (req, res) => {
  try {
    const example = new Example({
      name: req.body.name
    });
    
    const savedExample = await example.save();
    res.status(201).json(savedExample);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
