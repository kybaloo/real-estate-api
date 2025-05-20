import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

// Gestion des chemins avec ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import des middlewares
import errorHandler from './middlewares/error.js';

const app = express();

// Middlewares de sécurité et performance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
    },
  }
}));  // Sécurité des en-têtes HTTP avec configuration pour Swagger UI
app.use(cors());    // Gestion des CORS pour les API
app.use(compression());  // Compression des réponses
app.use(express.json());  // Analyse du corps des requêtes JSON

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Importation des routes principales
import propertyRoutes from './routes/properties.js';
import adRoutes from './routes/ads.js';
import userRoutes from './routes/users.js';
import bookingRoutes from './routes/bookings.js';

// Montage des routes
app.use('/api/properties', propertyRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// Route racine pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({
    success: true,    message: 'API Immobilier en ligne',
    version: '1.0.0',
    documentation: '/docs' // Documentation avec Swagger UI
  });
});

// Configuration de Swagger UI pour la documentation de l'API
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs/openapi-complete.json'), 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Immobilier - Documentation",
  customfavIcon: '/favicon.ico'
}));

// Route pour servir le fichier OpenAPI
app.get('/docs/openapi-complete.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs/openapi-complete.json'));
});

// Middleware pour les routes non trouvées
app.use((req, res, next) => {
  // Ignorer les requêtes des outils de développement Chrome
  if (req.originalUrl.includes('/.well-known/appspecific') || 
      req.originalUrl.includes('/favicon.ico')) {
    return res.status(204).end();
  }
  
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