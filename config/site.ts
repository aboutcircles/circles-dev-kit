export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Circles Dev Kit",
  description: "All in one kit for all developers building on Circles",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Avatars",
      href: "/avatars",
    },
    {
      label: "Groups",
      href: "/groups",
    },
    {
      label: "API",
      href: "/api",
    },
  ],
  navMenuItems: [
    {
      label: "Avatars",
      href: "/avatars",
    },
    {
      label: "Groups",
      href: "/groups",
    },
    {
      label: "API",
      href: "/api",
    },
  ],
  links: {
    github: "https://github.com/aboutcircles/circles-dev-kit",
  },
};
