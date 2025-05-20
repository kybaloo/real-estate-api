// Middleware global de gestion d'erreurs
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Erreur pour les ID Mongoose mal formatés
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Ressource introuvable';
    statusCode = 404;
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }
  
  // Erreur de clé dupliquée (par exemple email déjà utilisé)
  if (err.code === 11000) {
    message = `La valeur '${Object.values(err.keyValue)[0]}' pour le champ '${Object.keys(err.keyValue)[0]}' est déjà utilisée`;
    statusCode = 400;
  }

  // Erreur JSON Web Token
  if (err.name === 'JsonWebTokenError') {
    message = 'Token d\'authentification invalide';
    statusCode = 401;
  }

  // Token expiré
  if (err.name === 'TokenExpiredError') {
    message = 'Session expirée, veuillez vous reconnecter';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export default errorHandler;
