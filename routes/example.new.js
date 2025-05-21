import express from 'express';
const router = express.Router();

// Exemple de route GET
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Node.js !' });
});

export default router;
