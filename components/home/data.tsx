import type {
  Brand,
  Cta,
  HowStepItem,
  QuickActionItem,
  TestimonialItem,
  ValueItem,
  FooterLink,
  SpotlightEvent,
} from "./types";
import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  Gift,
  UsersRound,
  Images,
  LogIn,
  IdCard,
  BadgeCheck,
} from "lucide-react";

export const HOMEPAGE_DATA = {
  announcement: {
    enabled: true,
    text: "Delhi Chapter Meetup • Sept 14 at India Habitat Centre",
    cta: { label: "RSVP Now →", href: "/events/delhi-meetup" } satisfies Cta,
  },
  hero: {
    headline: "Connect. Collaborate.  Contribute.",
    subtext: "The official NIT Durgapur International Alumni Network.",
    primary: { label: "Join the Network", href: "/auth/signup" } satisfies Cta,
    secondary: { label: "Sign In", href: "/auth/login" } satisfies Cta,
    microProof: "2,143 alumni and growing",
  },
  brands: {
    caption: "Our alumni are building at",
    items: [
      { name: "Google" },
      { name: "Microsoft" },
      { name: "Amazon" },
      { name: "McKinsey" },
      { name: "Flipkart" },
      { name: "Adobe" },
      { name: "Atlassian" },
    ] satisfies Brand[],
  },
  valuesSection: {
    heading: "Why Join the Network?",
    subheading: "More than a directory — it’s opportunities, mentorship, and belonging.",
    items: [
      {
        title: "Networking, Business & Services",
        description:
          "Grow professionally—leverage the network, increase business and career prospects, seek references, and offer services.",
        icon: Users,
      },
      {
        title: "Mentorship & Guidance",
        description:
          "Give back as a mentor. Support undergraduates, guide aspiring professionals, or coach peers exploring new passions.",
        icon: GraduationCap,
      },
      {
        title: "Jobs & Internships",
        description:
          "Create opportunities that matter. Share openings from your company or network to help students and fellow alumni.",
        icon: BriefcaseBusiness,
      },
      {
        title: "Exclusive Member Benefits",
        description:
          "Enjoy alumni-only perks—special discounts, offers, and opportunities reserved exclusively for members.",
        icon: Gift,
      },
      {
        title: "Community Activities",
        description:
          "Stay engaged and contribute. Join social, cultural, and community initiatives organized by the alumni association.",
        icon: UsersRound,
      },
      {
        title: "Nostalgia & Updates",
        description:
          "Relive memories through reunions, events, and celebrations, while staying updated on alumni initiatives and achievements.",
        icon: Images,
      },
    ] satisfies ValueItem[],
  },

  quickActionsSection: {
    heading: "Jump in, fast.",
    subheading: "Your most-used alumni shortcuts — just one click away.",
    items: [
      {
        title: "Alumni Directory",
        description: "Browse 280+ NIT Durgapur alumni. Filter by batch, branch, location, or company.",
        href: "/directory",
        cta: "Browse Alumni",
        icon: Users,
      },
      {
        title: "Mentorship Circle",
        description: "Find mentors or offer guidance — career advice by alumni, for alumni.",
        href: "/mentorship",
        cta: "Find Mentors",
        icon: GraduationCap,
      },
      {
        title: "Jobs & Internships",
        description: "Discover opportunities shared by NITians working at top firms.",
        href: "/jobs",
        cta: "Explore Jobs",
        icon: BriefcaseBusiness,
      },
    ] satisfies QuickActionItem[],
  },

  spotlightSection: {
    heading: "Spotlight",
    subheading: "What’s happening now in the alumni community.",
    event: {
      title: "Tech & Careers Night — Delhi",
      blurb: "Panels, lightning talks, and an alumni hiring hour.",
      date: "Sept 14, 6:00–9:00 PM",
      location: "India Habitat Centre, New Delhi",
      image: "/events/tech-careers-night.jpg",
      cta: { label: "Reserve Seat", href: "/events/tech-careers-night" },
    } satisfies SpotlightEvent,
  },

  testimonialsSection: {
    heading: "Loved by alumni across batches",
    subheading: "Referrals, mentorship, and a sense of belonging—straight from the community.",
    items: [
      {
        quote: "Got my next role through an alumni referral here.",
        author: "Ritwik ’16",
        role: "SDE @ Microsoft",
        avatar: "/avatars/ritwik.jpg",
      },
      {
        quote: "Mentoring juniors keeps me connected and inspired.",
        author: "Shruti ’12",
        role: "Product @ Google",
        avatar: "/avatars/shruti.jpg",
      },
    ] satisfies TestimonialItem[],
  },

  howSection: {
    heading: "How it works",
    subheading: "Three simple steps to unlock jobs, mentorship, and events.",
    steps: [
      { title: "Sign Up", description: "Create your account with email or LinkedIn.", icon: LogIn },
      { title: "Complete Profile", description: "Add batch, branch, role, and interests.", icon: IdCard },
      { title: "Get Approved", description: "Access jobs, mentorship, and chapter events.", icon: BadgeCheck },
    ] satisfies HowStepItem[], // <-- uses the imported type (kills the warning)
  },

  joinSection: {
    headline: "Be part of the alumni advantage.",
    subheading: "Unlock mentorship, opportunities, and community today.",
    cta: { label: "Join the Network", href: "/auth/signup" } satisfies Cta,
  },

  footer: {
    linksLeft: [
      { label: "About", href: "/about" },
      { label: "Chapters", href: "/chapters" },
      { label: "Events", href: "/events" },
    ] satisfies FooterLink[],
    linksRight: [
      { label: "Code of Conduct", href: "/coc" },
      { label: "Privacy", href: "/privacy" },
      { label: "Contact", href: "/contact" },
    ] satisfies FooterLink[],
    socials: [
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "X", href: "https://x.com/" },
    ] satisfies FooterLink[],
    note: "© 2025 NIT Durgapur Alumni Network. Built by alumni, for alumni.",
  },
} as const;
