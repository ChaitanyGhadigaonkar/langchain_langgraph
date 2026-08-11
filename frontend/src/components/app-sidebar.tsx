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
import { fetchConversations } from "@/services/conversations";

import { Button } from "./ui/button";

const AppSidebar = async () => {
  const conversations = await fetchConversations();
  return (
    <Sidebar>
      <SidebarHeader className="justify-center pb-0!">
        <SidebarMenu className="flex flex-col gap-2.5">
          <SidebarMenuItem className="">
            <div className="flex items-center justify-between pl-2">
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
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link href={"/"} className="flex items-center gap-2 text-sm">
                <HugeiconsIcon icon={ChatAddIcon} strokeWidth={2} />
                New Chat
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
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
            {conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id}>
                <SidebarMenuButton className="text-sm">
                  {conversation.title ?? "Implement ISR in Next js"}
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover>
                  <HugeiconsIcon icon={EllipsisIcon} strokeWidth={2} />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
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
