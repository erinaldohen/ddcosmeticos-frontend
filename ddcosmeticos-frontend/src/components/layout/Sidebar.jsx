import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: ShoppingBag, label: "Vendas", href: "/vendas" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen fixed left-0 top-0 z-30">
      {/* Cabeçalho da Sidebar */}
      <div className="h-16 flex items-center px-6 border-b">
        <img
          src="/logo-ddcosmeticos.png"
          alt="Logo"
          className="h-8 w-auto object-contain mr-2"
        />
        <span className="font-bold text-lg text-primary">DD Cosméticos</span>
      </div>

      {/* Links de Navegação */}
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

      {/* Rodapé da Sidebar */}
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