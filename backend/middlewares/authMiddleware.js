const admin = require("firebase-admin");
const serviceAccount = require("../config/myicconline-firebase-adminsdk-fbsvc-caeee6bf8e.json"); // à récupérer de Firebase
const User = require("../models/User");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Remplace par ton URL de base de données
  });
}

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  

  // 🛑 Vérification de la présence du header Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ Aucun token Bearer trouvé dans le header.");
    return res.status(401).json({ message: "Non autorisé" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Vérification du token Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
   
    // Recherche de l'utilisateur MongoDB par email
    const userMongo = await User.findOne({ email: decodedToken.email });

    req.user = {
      id: decodedToken.user_id, // Firebase UID
      email: decodedToken.email,
      _id: userMongo ? userMongo._id.toString() : null, // MongoDB _id
      role: userMongo ? userMongo.role : 'user',
    };

    if (!req.user._id) {
      return res.status(400).json({ message: "Utilisateur non reconnu (ID MongoDB manquant)" });
    }

    next();
  } catch (error) {
    console.error("❌ Token invalide ou erreur Mongo :", error.message);
    return res.status(401).json({ message: "Token invalide" });
  }
};