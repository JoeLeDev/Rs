import { createContext, useContext, useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import  {auth}  from "../Firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [ userRole, setUserRole] = useState("user"); 

  // Écoute les changements d’état de connexion
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Connexion
  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res;
  };

  // Inscription + ajout du username dans le profil
const signUp = async (email, password, firstName, lastName, country = "France") => {
  const fullName = `${firstName} ${lastName}`;
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(res.user, { displayName: fullName });

  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    email: res.user.email,
    firstName,
    lastName,
    fullName,
    country,
    role: "user", // par défaut
    photoURL: "",
    createdAt: serverTimestamp(),
  });

  return res;
};

  // Déconnexion
  const logout = () => {
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
