const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json"); // à récupérer de Firebase

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
