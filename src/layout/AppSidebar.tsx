"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxIconLine,
  BoxCubeIcon,
  ChatIcon,
  DocsIcon,
  DollarLineIcon,
  EnvelopeIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const menuItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/user/dashboard",
  },
  {
    icon: <DollarLineIcon />,
    name: "Pricing",
    path: "/user/pricing",
  },
];

const memberItems: NavItem[] = [
  {
    icon: <BoxIconLine />,
    name: "Orders",
    path: "/user/orders",
  },
  {
    icon: <EnvelopeIcon />,
    name: "Notifications",
    path: "/user/notifications",
  },
  {
    icon: <DollarLineIcon />,
    name: "Wallet",
    path: "/user/wallet",
  },
  {
    icon: <GroupIcon />,
    name: "Affiliate",
    path: "/user/affiliate",
  },
  {
    icon: <UserCircleIcon />,
    name: "Profile",
    path: "/user/profile",
  },
];

const proxyItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
    name: "Rotating Residential Proxies",
    path: "/user/rotating-residential-proxies",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Rotating Residential API",
    path: "/user/rotating-residential-api",
  },
];

const supportItems: NavItem[] = [
  {
    icon: <DocsIcon />,
    name: "Help Center",
    path: "/user/help-center",
  },
  {
    icon: <DocsIcon />,
    name: "FAQ",
    path: "/user/faq",
  },
  {
    icon: <ChatIcon />,
    name: "Tickets",
    path: "/user/tickets",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav) => (
        <li key={nav.name}>
          <Link
            href={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`${
                isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
              }`}
            >
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 top-0 left-0 z-50
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/user/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] uppercase text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(menuItems)}
            </div>

            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] uppercase text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Proxy" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(proxyItems)}
            </div>

            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] uppercase text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Member" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(memberItems)}
            </div>

            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] uppercase text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Support" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(supportItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
