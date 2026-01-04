import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Wallet, // Ícone do Financeiro
  Menu,   // Ícone Hamburger
  X,      // Ícone Fechar
  DollarSign
} from "lucide-react";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Recupera dados do usuário salvo no login
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("dd-token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ShoppingCart, label: "Vendas & PDV", path: "/vendas" },
    { icon: DollarSign, label: "Financeiro", path: "/financeiro" }, // Item Novo
    { icon: Package, label: "Produtos", path: "/produtos" },
    { icon: Users, label: "Clientes", path: "/clientes" },
    { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
    { icon: Settings, label: "Configurações", path: "/configuracoes/importacao" },
  ];

  // Componente interno de Navegação (Para usar no Mobile e Desktop)
  const NavContent = () => (
    <>
      {/* LOGO */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
           {/* Certifique-se que a logo está em /public/logo-ddcosmeticos.png */}
           <img src="/logo-ddcosmeticos.png" alt="DD Cosméticos" className="h-10 w-auto object-contain" />
           <div>
             <span className="font-bold text-lg text-[#34BFBF] block leading-none">DD</span>
             <span className="text-[10px] font-bold text-[#F22998] uppercase tracking-widest">Cosméticos</span>
           </div>
        </div>
      </div>

      {/* USUÁRIO */}
      <div className="px-6 py-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Logado como</p>
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#F22998]/10 flex items-center justify-center text-[#F22998] font-bold text-sm">
                {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">{usuario.nome || "Usuário"}</p>
                <p className="text-[10px] text-slate-400 truncate">{usuario.perfil || "Vendedor"}</p>
            </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[#34BFBF]/10 text-[#34BFBF]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#34BFBF]"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-[#34BFBF]" : "text-slate-400 group-hover:text-[#34BFBF]"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* SAIR */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair do Sistema
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* --- MENU MOBILE (DRAWER) --- */}
      {/* Overlay Escuro */}
      {mobileMenuOpen && (
        <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
                <X className="h-6 w-6" />
            </button>
            <NavContent />
        </div>
      </div>

      {/* --- SIDEBAR DESKTOP (FIXA) --- */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-30">
        <NavContent />
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col md:pl-72 min-w-0">

        {/* Header Mobile (Só aparece em telas pequenas) */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <img src="/logo-ddcosmeticos.png" alt="Logo" className="h-8 w-auto" />
                <span className="font-bold text-[#34BFBF]">DD Cosméticos</span>
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600">
                <Menu className="h-6 w-6" />
            </button>
        </header>

        {/* Área de Conteúdo das Páginas */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}