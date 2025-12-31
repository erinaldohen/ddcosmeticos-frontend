import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  Menu, // Ícone do Menu
  X     // Ícone Fechar
} from "lucide-react";

export function AppLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Estado do menu mobile

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ShoppingCart, label: "Vendas & PDV", path: "/vendas" },
    { icon: Package, label: "Produtos", path: "/produtos" },
    { icon: Users, label: "Clientes", path: "/clientes" },
    { icon: Wallet, label: "Financeiro", path: "/financeiro" },
    { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  // Componente de Navegação (Reutilizável para Desktop e Mobile)
  const NavContent = () => (
    <>
        <div className="p-6 border-b border-[#F2F2F2] flex items-center gap-3">
          <div className="h-10 w-10 bg-[#34BFBF] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#34BFBF]/30">
            D
          </div>
          <div className="leading-tight">
            <span className="font-bold text-xl text-[#34BFBF] tracking-tight block">DD</span>
            <span className="text-[10px] font-bold text-[#F26BB5] uppercase tracking-widest block -mt-1">Cosméticos</span>
          </div>
        </div>

        <div className="px-6 pt-6 pb-2">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Logado como</p>
            <p className="text-sm font-bold text-slate-700 truncate">{user?.name || "Administrador"}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)} // Fecha o menu ao clicar (Mobile)
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#F22998]/10 text-[#F22998]"
                    : "text-slate-500 hover:bg-[#F2F2F2] hover:text-[#F26BB5]"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-[#F22998]" : "text-slate-400 group-hover:text-[#F26BB5]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#F2F2F2]">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-[#F22998]/10 hover:text-[#F22998] transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair do Sistema
          </button>
        </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col md:flex-row font-sans text-slate-800">

      {/* --- MENU MOBILE (CABEÇALHO) --- */}
      <div className="md:hidden bg-white border-b border-[#E5E5E5] p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#34BFBF] rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-[#34BFBF]/30">D</div>
            <span className="font-bold text-[#34BFBF] tracking-tight">DD <span className="text-[#F26BB5]">Cosméticos</span></span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600 hover:text-[#34BFBF]">
            <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* --- MENU MOBILE (DRAWER/OVERLAY) --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Fundo Escuro */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            {/* Menu Deslizante */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                    <X className="h-6 w-6" />
                </button>
                <NavContent />
            </div>
        </div>
      )}

      {/* --- SIDEBAR DESKTOP (FIXA) --- */}
      <aside className="w-64 bg-white border-r border-[#E5E5E5] hidden md:flex flex-col fixed h-full z-10">
        <NavContent />
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 animate-in fade-in duration-500 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}