import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AppContext = createContext(null);

// ==========================================
// APP PROVIDER
// ==========================================

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] =
    useState(true);

  // ==========================================
  // CHECK SESSION
  // ==========================================

  const checkSession = async () => {
    const token =
      localStorage.getItem("token");

    console.log(
      "CHECK SESSION TOKEN:",
      !!token
    );

    // No token
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      setLoadingUser(true);

      const { data } = await api.get(
        "/auth/me"
      );

      console.log(
        "SESSION RESPONSE:",
        data
      );

      if (!data?.success || !data?.user) {
        throw new Error(
          data?.message ||
            "Session check failed"
        );
      }

      const userData = {
        ...data.user,
        isAdmin:
          data.user?.isAdmin === true,
      };

      setUser(userData);

      console.log(
        "SESSION USER:",
        userData
      );
    } catch (error) {
      console.error(
        "SESSION ERROR:",
        error.response?.data ||
          error.message
      );

      // Only remove token when authentication
      // actually failed
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem(
          "token"
        );

        setUser(null);
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    email,
    password
  ) => {
    try {
      const { data } =
        await api.post(
          "/auth/login",
          {
            email,
            password,
          }
        );

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      if (!data?.token) {
        throw new Error(
          data?.message ||
            "Login successful but token was not received"
        );
      }

      // ======================================
      // SAVE TOKEN
      // ======================================

      localStorage.setItem(
        "token",
        data.token
      );

      console.log(
        "TOKEN SAVED:",
        !!localStorage.getItem(
          "token"
        )
      );

      // ======================================
      // SAVE USER
      // ======================================

      const userData = {
        ...data.user,
        isAdmin:
          data.user?.isAdmin === true,
      };

      setUser(userData);

      console.log(
        "LOGIN USER:",
        userData
      );

      return {
        ...data,
        user: userData,
      };
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

  // ==========================================
  // SIGNUP
  // ==========================================

  const signup = async (
    name,
    email,
    password
  ) => {
    try {
      const { data } =
        await api.post(
          "/auth/signup",
          {
            name,
            email,
            password,
          }
        );

      console.log(
        "SIGNUP RESPONSE:",
        data
      );

      if (!data?.token) {
        throw new Error(
          data?.message ||
            "Signup successful but token was not received"
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      const userData = {
        ...data.user,
        isAdmin:
          data.user?.isAdmin === true,
      };

      setUser(userData);

      return {
        ...data,
        user: userData,
      };
    } catch (error) {
      console.error(
        "SIGNUP ERROR:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    try {
      await api.post(
        "/auth/logout"
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error.response?.data ||
          error.message
      );
    } finally {
      localStorage.removeItem(
        "token"
      );

      setUser(null);
    }
  };

  // ==========================================
  // INITIAL SESSION
  // ==========================================

  useEffect(() => {
    checkSession();
  }, []);

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loadingUser,

        login,
        signup,
        logout,

        checkSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ==========================================
// useApp
// ==========================================

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return context;
}