import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  LogOut,
  BarChart3,
  Settings,
  DollarSign // <--- Importe o ícone
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingBag, label: "Vendas / PDV", href: "/vendas" }, // Reorganizei a ordem
  { icon: DollarSign, label: "Financeiro", href: "/financeiro" }, // <--- Novo Item
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes/importacao" },
];

export function Sidebar() {
    // ... (o restante do código permanece igual)
    // Apenas certifique-se de substituir a constante menuItems
    return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-6 border-b">
        <img src="/logo-ddcosmeticos.png" alt="Logo" className="h-8 w-auto object-contain mr-2" />
        <span className="font-bold text-lg text-primary">DD Cosméticos</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => {
             localStorage.removeItem("dd-token");
             window.location.href = "/";
          }}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}