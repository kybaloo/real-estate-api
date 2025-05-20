# Documentation de l'API Immobilier

Cette API REST permet de gérer un système complet de gestion immobilière, incluant biens, annonces, utilisateurs et réservations.

## Points d'entrée principaux

### Authentification
- **POST /api/users/register** - Inscription d'un utilisateur
- **POST /api/users/login** - Connexion et récupération du token JWT

### Biens immobiliers
- **GET /api/properties** - Liste de tous les biens avec filtres
- **GET /api/properties/:id** - Détails d'un bien
- **POST /api/properties** - Créer un nouveau bien (authentification requise)
- **PUT /api/properties/:id** - Modifier un bien (authentification requise)
- **DELETE /api/properties/:id** - Supprimer un bien (authentification requise)

### Annonces
- **GET /api/ads** - Liste de toutes les annonces avec filtres
- **GET /api/ads/:id** - Détails d'une annonce
- **GET /api/ads/property/:propertyId** - Annonces pour un bien spécifique
- **POST /api/ads** - Créer une nouvelle annonce (authentification requise)
- **PUT /api/ads/:id** - Modifier une annonce (authentification requise)
- **DELETE /api/ads/:id** - Supprimer une annonce (authentification requise)

### Utilisateurs
- **GET /api/users/me** - Profil de l'utilisateur connecté
- **PUT /api/users/me** - Mettre à jour le profil utilisateur
- **GET /api/users/favorites** - Liste des biens favoris
- **POST /api/users/favorites/:id** - Ajouter aux favoris
- **DELETE /api/users/favorites/:id** - Retirer des favoris

### Réservations (demandes de visite)
- **GET /api/bookings** - Liste des réservations (selon le rôle de l'utilisateur)
- **POST /api/bookings** - Créer une demande de visite
- **GET /api/bookings/:id** - Consulter une réservation
- **PUT /api/bookings/:id/status** - Changer le statut (confirmer/annuler) d'une réservation
- **DELETE /api/bookings/:id** - Supprimer une réservation
- **POST /api/bookings/:id/feedback** - Ajouter un avis après visite

## Modèles de données

### Biens immobiliers (Property)
```json
{
  "title": "Appartement T3 lumineux",
  "description": "Bel appartement rénové...",
  "type": "appartement",
  "price": 250000,
  "surface": 75,
  "rooms": 3,
  "address": {
    "street": "123 rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France",
    "location": {
      "type": "Point",
      "coordinates": [2.3488, 48.8534]
    }
  },
  "features": ["balcon", "ascenseur", "parking"],
  "images": ["url1.jpg", "url2.jpg"],
  "status": "disponible"
}
```

### Annonces (Ad)
```json
{
  "title": "T3 lumineux à vendre",
  "description": "Ne manquez pas cette opportunité...",
  "type": "vente",
  "price": 250000,
  "property": "61a1c2d35c2e4a3e7a8b4567", 
  "status": "active",
  "rentalDetails": {
    "duration": "annuel",
    "depositAmount": 1000
  },
  "highlighted": true
}
```

### Utilisateurs (User)
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "role": "client", // ou "propriétaire", "admin"
  "phone": "+33612345678",
  "favorites": ["61a1c2d35c2e4a3e7a8b4567"]
}
```

### Réservations (Booking)
```json
{
  "property": "61a1c2d35c2e4a3e7a8b4567",
  "ad": "61a1c2d35c2e4a3e7a8b4569",
  "client": "61a1c2d35c2e4a3e7a8b4570",
  "owner": "61a1c2d35c2e4a3e7a8b4571",
  "date": "2023-06-15T00:00:00.000Z", 
  "timeSlot": {
    "start": "14:00",
    "end": "15:00"
  },
  "status": "pending",
  "message": "Je suis intéressé par ce bien..."
}
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Après connexion, incluez le token dans tous les endpoints protégés via un header Authorization :

```
Authorization: Bearer <votre_token_jwt>
```
