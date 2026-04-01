import {
  LayoutDashboard,
  Home,
  CheckSquare,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Bell,
  UserPlus,
  Settings,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

export const mainNavItems: NavItem[] = [
  {
    titleKey: "nav.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    titleKey: "nav.properties",
    href: "/properties",
    icon: Home,
  },
  {
    titleKey: "nav.tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    titleKey: "nav.contacts",
    href: "/contacts",
    icon: Users,
  },
  {
    titleKey: "nav.calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    titleKey: "nav.messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    titleKey: "nav.documents",
    href: "/documents",
    icon: FileText,
  },
  {
    titleKey: "nav.spending",
    href: "/spending",
    icon: DollarSign,
    permission: "spending:read",
  },
];

export const bottomNavItems: NavItem[] = [
  {
    titleKey: "nav.notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    titleKey: "nav.members",
    href: "/members",
    icon: UserPlus,
  },
  {
    titleKey: "nav.subscription",
    href: "/pricing",
    icon: CreditCard,
  },
  {
    titleKey: "nav.settings",
    href: "/settings/family",
    icon: Settings,
  },
];
