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

export const ROLE_NAV = {
  Director: [
    { label: "Home", href: "/admin", exact: true },
    { label: "Users", href: "/admin/users" },
    { label: "Rewards", href: "/admin/rewards" },
    { label: "Broadcast", href: "/admin/broadcast" },
    { label: "Content", href: "/admin/content" },
    { label: "Events", href: "/admin/events" },
    { label: "Inbox", href: "/admin/inbox" },
    { label: "Me", href: "/admin/me" },
  ],
  Officer: [
    { label: "Home", href: "/officer", exact: true },
    { label: "Training", href: "/officer/training" },
    { label: "Gauntlet", href: "/officer/gauntlet" },
    { label: "Events", href: "/officer/events" },
    { label: "Inbox", href: "/officer/inbox" },
    { label: "Me", href: "/officer/me" },
  ],
  Chaplain: [
    { label: "Home", href: "/chaplain", exact: true },
    { label: "Officers", href: "/chaplain/officers" },
    { label: "Events", href: "/chaplain/events" },
    { label: "Inbox", href: "/chaplain/inbox" },
    { label: "Me", href: "/chaplain/me" },
  ],
  Partner: [
    { label: "Home", href: "/partner", exact: true },
    { label: "Media", href: "/partner/media" },
    { label: "Events", href: "/partner/events" },
    { label: "Inbox", href: "/partner/inbox" },
    { label: "Me", href: "/partner/me" },
  ],
  Instructor: [
    { label: "Home", href: "/instructor", exact: true },
    { label: "Leaderboard", href: "/instructor/leaderboard" },
    { label: "Events", href: "/instructor/events" },
    { label: "Inbox", href: "/instructor/inbox" },
    { label: "Me", href: "/instructor/me" },
  ],
};
