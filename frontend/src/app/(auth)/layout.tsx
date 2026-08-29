import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen className="h-dvh overflow-hidden">
        <AppSidebar />
        <div className="flex h-dvh flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex h-full">{children}</main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AuthenticatedLayout;
