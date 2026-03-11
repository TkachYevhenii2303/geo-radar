"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  GaugeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  RadarIcon,
  ShieldCheckIcon,
  SunIcon,
  ToolCaseIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import styles from "./sidebar.module.scss";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface ActionItem {
  icon: React.ElementType;
  label: string;
  action: () => void;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboardIcon, label: "Dashboard", href: "/" },
  { icon: ToolCaseIcon, label: "Domain Crawling", href: "/crawling" },
  { icon: ShieldCheckIcon, label: "Health", href: "/health" },
  { icon: GaugeIcon, label: "Page Speed", href: "/metrics/page_speed" },
];

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email ?? "GR").slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Start expanded; set to collapsed on small screens after mount (SSR-safe)
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // One-time init: collapse on tablet, load theme preference
  useEffect(() => {
    if (window.innerWidth < 1024) setIsExpanded(false);

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.dataset.theme = dark ? "dark" : "";
  }, []);

  // Lock body scroll while mobile overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleExpanded = useCallback(() => setIsExpanded((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.dataset.theme = next ? "dark" : "";
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    closeMobile();
    await logout();
    router.push("/login");
  }, [closeMobile, logout, router]);

  const bottomActions = useMemo<ActionItem[]>(
    () => [
      {
        icon: isDark ? SunIcon : MoonIcon,
        label: isDark ? "Light mode" : "Dark mode",
        action: toggleTheme,
      },
      {
        icon: LogOutIcon,
        label: "Logout",
        action: handleLogout,
      },
    ],
    [isDark, toggleTheme, handleLogout]
  );

  const initials = getInitials(user?.name, user?.email ?? "GR");

  return (
    <Fragment>
      {/* Mobile hamburger — only visible at ≤767px via CSS */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <MenuIcon size={20} />
      </button>

      {/* Backdrop for mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(styles.sidebar, {
          [styles.collapsed]: !isExpanded,
          [styles.mobileOpen]: mobileOpen,
        })}
        aria-label="Main navigation"
      >
        {/* ── Icon rail (always visible) ── */}
        <div className={styles.rail}>
          <div className={styles.railLogo} aria-hidden="true">
            <RadarIcon size={24} />
          </div>

          <nav className={styles.railNav} aria-label="Main menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(styles.railItem, { [styles.active]: isActive })}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={closeMobile}
                >
                  <Icon size={18} />
                </Link>
              );
            })}
          </nav>

          <div className={styles.railBottom}>
            {bottomActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={styles.railItem}
                  title={item.label}
                  aria-label={item.label}
                  onClick={item.action}
                >
                  <Icon size={18} />
                </button>
              );
            })}

            {/* Avatar */}
            <div
              className={cn(styles.railItem, styles.avatarBtn)}
              title={user?.name ?? user?.email ?? "Profile"}
              aria-label="User profile"
            >
              <span className={styles.avatarCircle}>{initials}</span>
            </div>

            {/* Rail-level expand/collapse toggle — always clickable */}
            <button
              className={cn(styles.railItem, styles.railToggle)}
              onClick={toggleExpanded}
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronLeftIcon
                size={18}
                className={cn(styles.toggleIcon, {
                  [styles.toggleIconRotated]: !isExpanded,
                })}
              />
            </button>
          </div>
        </div>

        {/* ── Expandable text panel ── */}
        <div className={styles.panel} aria-hidden={!isExpanded}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.brandName}>
              <RadarIcon size={18} />
              <span>GEO Radar</span>
            </div>
            <button
              className={styles.collapseBtn}
              onClick={toggleExpanded}
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon size={16} />
            </button>
          </div>

          {/* Menu section */}
          <div className={styles.menuSection}>
            <p className={styles.sectionLabel}>Menu</p>
            <nav className={styles.panelNav} aria-label="Main menu">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(styles.panelItem, {
                      [styles.active]: isActive,
                    })}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMobile}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom utilities */}
          <div className={styles.panelBottom}>
            {bottomActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={styles.panelItem}
                  onClick={item.action}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* User profile */}
            <div className={styles.profile}>
              <div className={styles.avatarCircle}>{initials}</div>
              <div className={styles.profileInfo}>
                <p className={styles.profileName}>{user?.name ?? "User"}</p>
                <p className={styles.profileEmail}>{user?.email ?? ""}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </Fragment>
  );
}
