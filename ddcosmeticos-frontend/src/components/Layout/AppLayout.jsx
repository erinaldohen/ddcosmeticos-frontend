import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* O Header só aparece aqui, dentro do Layout do App */}
      <Header />

      <main className="flex-1 container py-6">
        {/* O Outlet renderiza a página filha (Dashboard, Produtos, etc) */}
        <Outlet />
      </main>
    </div>
  );
}