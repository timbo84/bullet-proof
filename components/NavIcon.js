"use client";

import {
  Home,
  Users,
  Gift,
  Megaphone,
  FileText,
  Calendar,
  Inbox,
  HelpCircle,
  User,
  GraduationCap,
  Flame,
  Shield,
  Video,
  Award,
} from "lucide-react";

const ICONS = {
  home: Home,
  users: Users,
  gift: Gift,
  megaphone: Megaphone,
  fileText: FileText,
  calendar: Calendar,
  inbox: Inbox,
  helpCircle: HelpCircle,
  user: User,
  graduationCap: GraduationCap,
  flame: Flame,
  shield: Shield,
  video: Video,
  award: Award,
};

export function NavIcon({ name, ...props }) {
  const Icon = ICONS[name] || Home;
  return <Icon {...props} />;
}
