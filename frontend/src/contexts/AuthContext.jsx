import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../Firebase";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  const [userData, setUserData] = useState(null);

  // Écoute les changements d’état de connexion Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const { data } = await axios.get(
            "http://localhost:5000/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUserRole(data.role);
          setUserData(data);
        } catch (error) {
          console.error("Erreur récupération user Mongo :", error);
        }
      } else {
        setUserRole("user");
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Connexion
  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res;
    } catch (error) {
      throw error;
    }
  };

  //  Inscription + synchronisation vers MongoDB
  const signUp = async (email, password, firstName, lastName, country) => {
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, { displayName: fullName });

      const token = await res.user.getIdToken();

      await axios.post(
        "http://localhost:5000/api/auth/sync",
        {
          firebaseUid: res.user.uid,
          email: res.user.email,
          username: fullName,
          imageUrl: res.user.photoURL || "",
          country,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res;
    } catch (error) {
      throw error;
    }
  };

  //  Déconnexion
  const logout = () => {
    signOut(auth);
    setUser(null);
    setUserRole("user");
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        userData,
        login,
        signUp,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
