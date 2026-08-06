"use client";

// import { ThirdBracketIcon } from "@hugeicons/core-free-icons";
// import { HugeiconsIcon } from "@hugeicons/react";
// import Link from "next/link";
import { useSidebar } from "./ui/sidebar";

const Header = () => {
  const { open, isMobile } = useSidebar();
  return (
    <header
      className={`bg-sidebar text-sidebar-foreground fixed top-0 flex h-14 flex-col justify-center border px-2 ${open ? "w-[calc(100vw-var(--sidebar-width))]" : "w-full"} ${isMobile ? "w-full!" : ""}`}
    >
      {/* <Link href={"/"} aria-label="logo">
        <HugeiconsIcon icon={ThirdBracketIcon} strokeWidth={2} className="size-4" />
      </Link> */}
    </header>
  );
};

export default Header;
