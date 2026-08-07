import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="mx-auto h-full max-h-full max-w-6xl overflow-hidden pt-14">{children}</main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AuthenticatedLayout;
