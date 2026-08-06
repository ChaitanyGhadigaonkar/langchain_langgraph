import {
  Cancel01Icon,
  ChatAddIcon,
  EllipsisIcon,
  LibraryIcon,
  Search01Icon,
  User02FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Button } from "./ui/button";

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="mb-4 h-14 justify-center">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <Link href={"/"}>
              <h1 className="font-sans text-xl font-bold">ChatGPT</h1>
            </Link>
            <div className="flex gap-2">
              <Button size={"icon"} variant={"ghost"}>
                <HugeiconsIcon icon={Search01Icon} />
              </Button>
              <Button variant={"ghost"} size={"icon"} className={"md:hidden"}>
                <HugeiconsIcon icon={Cancel01Icon} />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href={"/"} className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon icon={ChatAddIcon} strokeWidth={2} />
                  New Chat
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href={"/"} className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon icon={LibraryIcon} strokeWidth={2} />
                  Library
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="gap-2">
          <SidebarGroupLabel>Pinned</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sm">Pinned chat 1</SidebarMenuButton>
              <SidebarMenuAction showOnHover>
                <HugeiconsIcon icon={EllipsisIcon} strokeWidth={2} />
              </SidebarMenuAction>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sm">Pinned chat 2</SidebarMenuButton>
              <SidebarMenuAction showOnHover>
                <HugeiconsIcon icon={EllipsisIcon} strokeWidth={2} />
              </SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="gap-2">
          <SidebarGroupLabel>Recent Convesations</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sm">Implement ISR in Next js</SidebarMenuButton>
              <SidebarMenuAction showOnHover>
                <HugeiconsIcon icon={EllipsisIcon} strokeWidth={2} />
              </SidebarMenuAction>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sm">Revalidate path in next js</SidebarMenuButton>
              <SidebarMenuAction showOnHover>
                <HugeiconsIcon icon={EllipsisIcon} strokeWidth={2} />
              </SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <HugeiconsIcon icon={User02FreeIcons} strokeWidth={2} />
              Username
            </SidebarMenuButton>
            <SidebarMenuAction>
              <HugeiconsIcon icon={EllipsisIcon} strokeWidth={2} />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
