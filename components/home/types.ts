export type IconKey = "user" | "briefcase" | "graduation" | "users" | "handshake";
export type Cta = { label: string; href: string };

export type Brand = {
  name: string;
  logoText?: string;
  logoUrl?: string;
  href?: string;
};

export type ValueItem = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type QuickActionItem = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// export type HighlightItem = {
//   quote: string;
//   author: string;
//   role?: string;
//   icon?: string; // icon-based avatar
//   avatar?: string | null;                                     // optional legacy support
// };

// export type HighlightData = {
//   heading: string;
//   subheading?: string;
//   items: HighlightItem[];
// };

export type TestimonialItem = {
  quote: string;
  author: string;
  role?: string;
  avatar?: string | null;
  href: string;
};



export type FeaturedItem = {
  quote: string;
  author: string;
  role?: string;
  year?: number | string;      // ✅ add this too (if used)
  avatar?: string | null;
};

// If you have a wrapper:
export type FeaturedData = {
  heading: string;
  subheading?: string;
  items: FeaturedItem[];
};

export type SpotlightEvent = {
  title: string;
  blurb: string;
  date: string;
  location: string;
  image?: string | null;
  cta: Cta;
};

export type HowStepItem = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type FooterLink = { label: string; href: string };
