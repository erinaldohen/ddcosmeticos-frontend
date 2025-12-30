import { Menu, User } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Clock } from "@/components/ui/clock";

export function Header() {
  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-background/95 backdrop-blur border-b flex items-center justify-between px-4 md:px-6">

      {/* ESQUERDA: Menu Mobile (Só aparece em telas pequenas) */}
      <div className="md:hidden">
         <MobileNav />
      </div>

      {/* CENTRO/DIREITA (Desktop) */}
      <div className="flex-1 flex items-center justify-end md:justify-between">
         {/* Título da Página ou Breadcrumb (Visível só Desktop) */}
         <div className="hidden md:block text-sm text-muted-foreground">
            Painel Administrativo
         </div>

         <div className="flex items-center gap-4">
            <div className="hidden md:block">
               <Clock />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs text-muted-foreground">admin@ddcosmeticos.com</p>
               </div>
               <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                  <User className="h-5 w-5 text-primary" />
               </Button>
            </div>
         </div>
      </div>
    </header>
  );
}