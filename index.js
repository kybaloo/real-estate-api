require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const errorHandler = require('./middlewares/error');

const app = express();

// Middlewares de sécurité et performance
app.use(helmet());  // Sécurité des en-têtes HTTP
app.use(cors());    // Gestion des CORS pour les API
app.use(compression());  // Compression des réponses
app.use(express.json());  // Analyse du corps des requêtes JSON

// Importation des routes principales
const propertyRoutes = require('./routes/properties');
const adRoutes = require('./routes/ads');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');

// Montage des routes
app.use('/api/properties', propertyRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// Route racine pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Immobilier en ligne',
    version: '1.0.0',
    documentation: '/api/docs' // Pour une future documentation avec Swagger
  });
});

// Middleware pour les routes non trouvées
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware de gestion globale des erreurs
app.use(errorHandler);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate')
  .then(() => {
    console.log('Connecté à MongoDB');
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
