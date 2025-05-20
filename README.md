# Real Estate API

Une API complète pour la gestion des biens immobiliers, incluant annonces, utilisateurs et réservations de visites.

## Fonctionnalités

- **Gestion des biens immobiliers** : ajout, modification, suppression et consultation des propriétés
- **Annonces de vente et location** : publication et gestion d'annonces pour les biens
- **Authentification** : gestion des utilisateurs avec JWT et différents rôles (client, propriétaire, admin)
- **Favoris** : les clients peuvent sauvegarder leurs biens préférés
- **Réservations de visites** : demande de visite par les clients et gestion par les propriétaires/admin

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/kybaloo/real-estate-api.git
   ```
2. Accédez au répertoire du projet :
   ```bash
   cd real-estate-api
   ```
3. Installez les dépendances :
   ```bash
   npm install
   ```
4. Copiez le fichier d'environnement et configurez-le :
   ```bash
   cp .env.example .env
   ```
5. Modifiez le fichier `.env` avec vos paramètres (URI MongoDB, secret JWT...)

## Utilisation

Pour démarrer le serveur en mode développement :
```bash
npm run dev
```

Pour démarrer le serveur en production :
```bash
npm start
```

## Structure du projet

```
├── index.js                 # Point d'entrée de l'application
├── models/                  # Schémas Mongoose
│   ├── Ad.js                # Modèle pour les annonces
│   ├── Booking.js           # Modèle pour les réservations
│   ├── Property.js          # Modèle pour les biens immobiliers
│   └── User.js              # Modèle pour les utilisateurs
├── routes/                  # Routes Express
│   ├── ads.js               # Routes pour les annonces
│   ├── bookings.js          # Routes pour les réservations
│   ├── properties.js        # Routes pour les biens immobiliers
│   └── users.js             # Routes pour les utilisateurs
├── middlewares/             # Middlewares personnalisés
│   ├── auth.js              # Authentification et autorisations
│   └── error.js             # Gestionnaire d'erreurs global
├── .env.example             # Exemple de variables d'environnement
└── API_DOCUMENTATION.md     # Documentation détaillée de l'API
```

## Documentation de l'API

Voir le fichier [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour une documentation détaillée des endpoints.

## Technologies utilisées

- Node.js et Express pour le serveur
- MongoDB avec Mongoose comme ODM
- JWT pour l'authentification
- Autres packages : bcryptjs, cors, helmet, compression, etc.

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction de bogue.

## License

Ce projet est sous licence ISC. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.