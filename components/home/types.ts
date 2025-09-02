export type Cta = { label: string; href: string };
export type Brand = { 
  name: string; 
  logoText?: string;
  logoUrl?: string;
  href?: string  };
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

export type TestimonialItem = {
  quote: string;
  author: string;      // e.g., "Ritwik ’16"
  role?: string;       // e.g., "SDE @ Microsoft"
  avatar?: string | null; 
  href: string;// /public/avatars/ritwik.jpg (optional)
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