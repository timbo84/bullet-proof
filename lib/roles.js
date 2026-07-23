export const ROLES = ["Director", "Officer", "Chaplain", "Partner", "Instructor"];

// Role -> URL path segment for that role's section of the site.
export const ROLE_PATH = {
  Director: "admin",
  Officer: "officer",
  Chaplain: "chaplain",
  Partner: "partner",
  Instructor: "instructor",
};

export function roleHome(role) {
  const path = ROLE_PATH[role];
  return path ? `/${path}` : "/login";
}

export function pathRole(pathSegment) {
  return Object.keys(ROLE_PATH).find((role) => ROLE_PATH[role] === pathSegment);
}

// `icon` is a key into components/NavIcon.js's registry, not a component
// reference — keeps lucide-react out of files (like proxy.js) that only need
// the route data, not the icon set.
export const ROLE_NAV = {
  Director: [
    { label: "Home", href: "/admin", exact: true, icon: "home" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Rewards", href: "/admin/rewards", icon: "gift" },
    { label: "Broadcast", href: "/admin/broadcast", icon: "megaphone" },
    { label: "Content", href: "/admin/content", icon: "fileText" },
    { label: "Events", href: "/admin/events", icon: "calendar" },
    { label: "Inbox", href: "/admin/inbox", icon: "inbox" },
    { label: "Help", href: "/admin/help", icon: "helpCircle" },
    { label: "Me", href: "/admin/me", icon: "user" },
  ],
  Officer: [
    { label: "Home", href: "/officer", exact: true, icon: "home" },
    { label: "Training", href: "/officer/training", icon: "graduationCap" },
    { label: "Gauntlet", href: "/officer/gauntlet", icon: "flame" },
    { label: "Events", href: "/officer/events", icon: "calendar" },
    { label: "Inbox", href: "/officer/inbox", icon: "inbox" },
    { label: "Help", href: "/officer/help", icon: "helpCircle" },
    { label: "Me", href: "/officer/me", icon: "user" },
  ],
  Chaplain: [
    { label: "Home", href: "/chaplain", exact: true, icon: "home" },
    { label: "Officers", href: "/chaplain/officers", icon: "shield" },
    { label: "Events", href: "/chaplain/events", icon: "calendar" },
    { label: "Inbox", href: "/chaplain/inbox", icon: "inbox" },
    { label: "Help", href: "/chaplain/help", icon: "helpCircle" },
    { label: "Me", href: "/chaplain/me", icon: "user" },
  ],
  Partner: [
    { label: "Home", href: "/partner", exact: true, icon: "home" },
    { label: "Media", href: "/partner/media", icon: "video" },
    { label: "Events", href: "/partner/events", icon: "calendar" },
    { label: "Inbox", href: "/partner/inbox", icon: "inbox" },
    { label: "Help", href: "/partner/help", icon: "helpCircle" },
    { label: "Me", href: "/partner/me", icon: "user" },
  ],
  Instructor: [
    { label: "Home", href: "/instructor", exact: true, icon: "home" },
    { label: "Content", href: "/instructor/content", icon: "fileText" },
    { label: "Leaderboard", href: "/instructor/leaderboard", icon: "award" },
    { label: "Events", href: "/instructor/events", icon: "calendar" },
    { label: "Inbox", href: "/instructor/inbox", icon: "inbox" },
    { label: "Help", href: "/instructor/help", icon: "helpCircle" },
    { label: "Me", href: "/instructor/me", icon: "user" },
  ],
};
