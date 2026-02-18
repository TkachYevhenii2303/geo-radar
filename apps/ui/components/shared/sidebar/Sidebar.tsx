"use client";
import Link from "next/link";
import styles from "./sidebar.module.scss";
import { useState } from "react";
import { ShieldCheckIcon, ToolCaseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  icon: React.ReactNode;
  title: string;
  href: string;
}

const sidebarItems: SidebarProps[] = [
  { icon: <ToolCaseIcon />, title: "Domain crawling", href: "/crawling" },
  { icon: <ShieldCheckIcon />, title: "Health", href: "/health" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navigation}>
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(styles.navigation__item)}
            onClick={() => setCurrentPath(item.href)}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
