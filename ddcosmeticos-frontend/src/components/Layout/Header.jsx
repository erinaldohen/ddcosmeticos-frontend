import { NavLink, Link } from "react-router-dom";
import { User } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Clock } from "@/components/ui/clock"; // <--- Importamos o Relógio
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Produtos", path: "/produtos" },
  { name: "Vendas", path: "/vendas" },
  { name: "Clientes", path: "/clientes" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">

        {/* ESQUERDA: Logo + Navegação */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/dashboard" className="flex items-center gap-2">
            {/* INSERÇÃO DA LOGO AQUI */}
            <img
              src="/logo-ddcosmeticos.png"
              alt="DD Cosméticos"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "transition-colors hover:text-primary relative py-1",
                    isActive
                      ? "text-primary font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary"
                      : "text-muted-foreground"
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* DIREITA: Relógio + Ações */}
        <div className="flex items-center gap-2">

          {/* O Relógio aparece aqui (Visível desktop/tablet) */}
          <div className="hidden sm:block">
            <Clock />
          </div>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full border border-gray-200">
            <User className="h-5 w-5 text-primary" />
            <span className="sr-only">Perfil</span>
          </Button>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}