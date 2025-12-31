import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já tem um login salvo ao abrir o sistema
    const recoveredUser = localStorage.getItem("dd-user");
    if (recoveredUser) {
      setUser(JSON.parse(recoveredUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // SIMULAÇÃO DE BACKEND
    // No futuro, aqui você fará um fetch para o Java
    return new Promise((resolve, reject) => {
        if (email === "admin@dd.com" && password === "123456") {
            const userData = { name: "Administrador", email, role: "admin" };
            localStorage.setItem("dd-user", JSON.stringify(userData));
            setUser(userData);
            resolve(userData);
        } else {
            reject(new Error("E-mail ou senha inválidos."));
        }
    });
  };

  const logout = () => {
    localStorage.removeItem("dd-user");
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