import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginContextProps {
  isLogin: boolean;
  login: ({ email, password }: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const LoginContext = createContext<LoginContextProps | undefined>(undefined);

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
};

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
     const token = Cookies.get('token');
      if (token) {
        try {
          const user = auth.currentUser;
          if (user) {
            const idToken = await user.getIdToken();
                if (idToken === token) {
                  setIsLogin(true);
                } else {
                  Cookies.remove('token');
                  setIsLogin(false);
                }
        } else {
            setIsLogin(false);
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          setIsLogin(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        verifyToken();
      } else {
        setIsLogin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user?.getIdToken();
      if (token) {
        Cookies.set('token', token, { expires: 30, secure:true });
        Swal.fire({
          title: "Login Berhasil",
          text: "Selamat menginput",
          showConfirmButton: false,
          timer: 1500,
          icon: "success"
        })
        setIsLogin(true);
      }
    } catch (error) {
      Swal.fire({
        title: "Login Gagal",
        text: "Pastikan ID & Password benar, atau hub admin",
        icon: "error"
      })
      console.error('Error logging in:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      Cookies.remove('token');
      setIsLogin(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <LoginContext.Provider value={{ isLogin, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};
