import { createContext, useState, useEffect, useContext } from "react";
import api from "@/services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao iniciar, recupera o token e usuário salvos
    const recoveredUser = localStorage.getItem("dd-user");
    const recoveredToken = localStorage.getItem("dd-token");

    if (recoveredUser && recoveredToken) {
      setUser(JSON.parse(recoveredUser));
      // Configura o token no Axios para as próximas requisições
      api.defaults.headers.Authorization = `Bearer ${recoveredToken}`;
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Chamada real ao Backend Java
      const response = await api.post("/auth/login", {
        login: email,  // Backend espera "login" (ou email)
        senha: password // Backend espera "senha"
      });

      const { token, nome, perfil } = response.data;

      // Cria objeto do usuário
      const userData = {
        email,
        name: nome || "Usuário",
        role: perfil || "CAIXA"
      };

      // Salva no navegador
      localStorage.setItem("dd-user", JSON.stringify(userData));
      localStorage.setItem("dd-token", token);

      // Configura token para requisições futuras
      api.defaults.headers.Authorization = `Bearer ${token}`;

      setUser(userData);

    } catch (error) {
      console.error("Erro no login:", error);
      // Retorna o erro para ser exibido no formulário (Toast)
      throw new Error(error.response?.data?.message || "E-mail ou senha incorretos.");
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}