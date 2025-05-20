const express = require('express');
const router = express.Router();

// Exemple de route GET
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l’API Node.js !' });
});

module.exports = router;
