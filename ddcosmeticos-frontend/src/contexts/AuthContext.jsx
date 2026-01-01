import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api"; // Certifique-se que o caminho está correto

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredUser = localStorage.getItem("dd-user");
    const recoveredToken = localStorage.getItem("dd-token");

    if (recoveredUser && recoveredToken) {
      setUser(JSON.parse(recoveredUser));
      api.defaults.headers.Authorization = `Bearer ${recoveredToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // AQUI ESTÁ A MUDANÇA: Chamada real ao Java
      const response = await api.post("/api/v1/auth/login", {
        login: email,    // Backend espera "login"
        senha: password  // Backend espera "senha"
      });

      const { token, nome, perfil } = response.data;

      const userData = {
        email,
        name: nome,
        role: perfil
      };

      localStorage.setItem("dd-user", JSON.stringify(userData));
      localStorage.setItem("dd-token", token);

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);

      return true;

    } catch (error) {
      console.error("Erro no login:", error);
      // Pega a mensagem de erro do backend ou define uma padrão
      const msg = error.response?.data?.message || "Erro ao conectar com o servidor.";
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem("dd-user");
    localStorage.removeItem("dd-token");
    api.defaults.headers.Authorization = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}