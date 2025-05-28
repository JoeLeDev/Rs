const admin = require("firebase-admin");
const serviceAccount = require("../config/myicconline-firebase-adminsdk-fbsvc-caeee6bf8e.json"); // à récupérer de Firebase



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
    console.log("✅ Token Firebase décodé :", decodedToken);

    // 📌 Injection dans req.user pour utilisation ultérieure
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Token invalide :", error.message);
    return res.status(401).json({ message: "Token invalide" });
  }
};