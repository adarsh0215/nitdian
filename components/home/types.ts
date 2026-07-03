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

export type HowStepItem = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type FooterLink = { label: string; href: string };
