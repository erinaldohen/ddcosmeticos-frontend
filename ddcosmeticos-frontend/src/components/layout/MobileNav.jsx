import { Menu, Package2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// --- AQUI ESTÃO SEUS ITENS RESTAURADOS ---
const navItems = [
  { name: "Dashboard", path: "/dashboard" }, // Geralmente Dashboard não é a Home pública
  { name: "Produtos", path: "/produtos" },
  { name: "Vendas", path: "/vendas" },     // Sugestão para Cosméticos
  { name: "Clientes", path: "/clientes" },  // Sugestão para Cosméticos
];

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
              <SheetHeader className="mb-6">
                  {/* LOGO NO MENU MOBILE */}
                  <img
                    src="/logo-ddcosmeticos.png"
                    alt="DD Cosméticos"
                    className="h-12 w-auto object-contain mx-auto" // Centralizada
                  />
              </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navItems.map((item) => (
            <SheetClose asChild key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 text-sm font-medium transition-colors rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-primary"
                  )
                }
              >
                {item.name}
              </NavLink>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}