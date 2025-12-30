import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout() {
  const isAuthenticated = localStorage.getItem("dd-token");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Sidebar Fixa (Desktop) */}
      <Sidebar />

      {/* Conteúdo Principal (Com margem à esquerda no Desktop) */}
      <div className="flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        <Header />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}