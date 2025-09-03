import type {
  Brand,
  Cta,
  HowStepItem,
  QuickActionItem,
  TestimonialItem,
  ValueItem,
  FooterLink,
  SpotlightEvent,
  HighlightData,
  HighlightItem, // 👈 needed for items satisfies
  FeaturedData,
  FeaturedItem,
} from "./types";

import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  Gift,
  UsersRound,
  Handshake,
  Images,
  LogIn,
  IdCard,
  BadgeCheck,
} from "lucide-react";

export const HOMEPAGE_DATA = {
  announcement: {
    enabled: true,
    text: "Delhi Chapter Meetup • Sept 14 at India Habitat Centre",
    cta: { label: "", href: "" } satisfies Cta,
  },

  hero: {
    headline: "Connect. Collaborate.  Contribute.",
    subtext: "The official NIT Durgapur International Alumni Network.",
    primary: { label: "Join the Network", href: "/auth/signup" } satisfies Cta,
    secondary: { label: "Sign In", href: "/auth/login" } satisfies Cta,
    microProof: "2,143 alumni and growing",
  },

  brands: {
    caption: "Our Alumni are Crafting Future at",
    items: [
      { name: "EY", logoUrl: "/brands/ey-logo.png" },
      { name: "Jal Shakti", logoUrl: "/brands/jal-shakti-logo.png" },
      { name: "Jindal Steel", logoUrl: "/brands/jindal-steel-logo.png" },
      { name: "NTPC", logoUrl: "/brands/ntpc-logo.png" },
      { name: "Microsoft", logoUrl: "/brands/microsoft-logo.png" },
      { name: "Powergrid", logoUrl: "/brands/powergrid-logo.png" },
      { name: "PWC", logoUrl: "/brands/pwc-logo.png" },
      { name: "TechMahindra", logoUrl: "/brands/tech-mahindra-logo.png" },
      { name: "WSP", logoUrl: "/brands/wsp-logo.png" },
      { name: "OTPC", logoUrl: "/brands/otpc-logo.png" },
      { name: "Accenture", logoUrl: "/brands/accenture-logo.png" },
      { name: "HPE", logoUrl: "/brands/hindustan_power_exchange_logo.jpeg" },
      { name: "Samsung", logoUrl: "/brands/samsung-logo.png" },
      { name: "GEM", logoUrl: "/brands/gem-logo.png" },
      { name: "NEA", logoUrl: "/brands/nea-logo.jpg" },
    ] satisfies Brand[],
  },

  valuesSection: {
    heading: "Why Join the Alumni Network?",
    subheading:
      "More than a Alumni directory — it’s opportunities, mentorship, and belonging. You will find your calling here.",
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

  // highlightData: {
  //   heading: "Spotlight",
  //   subheading: "What’s happening now in the alumni community.",
  //   items: [
  //     {
  //       quote:
  //         "Got my next role through an alumni referral. The network made all the difference.",
  //       author: "Ritwik",
  //       role: "SDE @ Microsoft",
  //       icon: BriefcaseBusiness,
  //     },
  //     {
  //       quote:
  //         "Four years of Durgapur — four decades of engineering. Nothing less, nothing more.",
  //       author: "Jaya Sood",
  //       role: "Mech ’87",
  //       icon: GraduationCap,
  //     },
  //     {
  //       quote:
  //         "Mentoring juniors keeps me grounded and inspired to give back to the community.",
  //       author: "Neha Gupta",
  //       role: "CSE ’15",
  //       icon: UsersRound,
  //     },
  //   ] satisfies HighlightItem[], // 👈 FIX: each item is a HighlightItem
  // } satisfies HighlightData, // 👈 the whole object matches HighlightData

  quickActionsSection: {
    heading: "Jump in, fast.",
    subheading: "Your most-used alumni shortcuts — just one click away.",
    items: [
      {
        title: "Alumni Directory",
        description:
          "Browse 280+ NIT Durgapur alumni. Filter by batch, branch, location, or company.",
        href: "/directory",
        cta: "Browse Alumni",
        icon: Users,
      },
      {
        title: "Mentorship Circle",
        description:
          "Find mentors or offer guidance — career advice by alumni, for alumni.",
        href: "/mentorship",
        cta: "Find Mentors",
        icon: GraduationCap,
      },
      {
        title: "Jobs & Internships",
        description:
          "Discover opportunities shared by NITians working at top firms.",
        href: "/jobs",
        cta: "Explore Jobs",
        icon: BriefcaseBusiness,
      },
    ] satisfies QuickActionItem[],
  },

  // spotlightSection: {
  //   heading: "",
  //   subheading: "What’s happening now in the alumni community.",
  //   event: {
  //     title: "Tech & Careers Night — Delhi",
  //     blurb: "Panels, lightning talks, and an alumni hiring hour.",
  //     date: "Sept 14, 6:00–9:00 PM",
  //     location: "India Habitat Centre, New Delhi",
  //     image: "/events/tech-careers-night.jpg",
  //     cta: { label: "Reserve Seat", href: "/events/tech-careers-night" },
  //   } satisfies SpotlightEvent,
  // },

  testimonialsSection: {
    heading: "Message from The Leaders",
    subheading: "",
    items: [
      {
        quote:
          "The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates",
        author: "Arvind Choubey",
        role: "Chairperson, NIT Durgapur",
        avatar: "/members/director.jpg",
        href: "/stories/arvind-choubey",
      },
      {
        quote:
          "The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates.The alumni network helped me land my next role and reconnect with old batchmates",
        author: "Sandeep Kapoor",
        role: "President, NITDIAN",
        avatar: "/members/sandeepkapoor.jpg",
        href: "/stories/arvind-choubey",
      },
      {
        quote:
          "Four years of Durgapur - Four decades of Engineering. Nothing less, Nothing more. Four years of Durgapur - Four decades of Engineering. Nothing less, Nothing more.",
        author: "Tarun Kumar Dutta",
        role: "President, NITDAA - West Bengal",
        avatar: "/members/nitdaa.png",
        href: "/stories/sandeep-kapoor",
      },
    ] satisfies TestimonialItem[],
  },

  featuredData: {
    heading: "Loved by Alumni across Batches",
    subheading: "Appreciation, Motivation, and Encouragement.",
    items: [
      {
        quote:
          "Building products with fellow NITians is still my favourite kind of collaboration. Building products with fellow NITians is still my favourite kind of collaboration.Building products with fellow NITians is still my favourite kind of collaboration.",
        author: "Ananya Roy",
        role: "PM @ Stripe",
        avatar: "",
      },
      {
        quote:
          "Chapter meetups helped me hire fast and right. The trust factor is real.",
        author: "Rohit Verma",
        role: "Founder, Axiom Labs",
        avatar: "",
      },
      {
        quote:
          "Building products with fellow NITians is still my favourite kind of collaboration. Building products with fellow NITians is still my favourite kind of collaboration.Building products with fellow NITians is still my favourite kind of collaboration",
        author: "Aditi Singh",
        role: "ML Engineer @ NVIDIA",
        avatar: "",
      },
      {
        quote:
          "The alumni network opened doors across continents when I relocated.",
        author: "Vikram Kapoor",
        role: "Director @ AWS",
        avatar: "",
      },
    ] satisfies FeaturedItem[],
  } satisfies FeaturedData,

  howSection: {
    heading: "How it works",
    subheading: "Three simple steps to unlock jobs, mentorship, and events.",
    steps: [
      {
        title: "Sign Up",
        description: "Create your account with email or LinkedIn.",
        icon: LogIn,
      },
      {
        title: "Complete Profile",
        description: "Add batch, branch, role, and interests.",
        icon: IdCard,
      },
      {
        title: "Get Approved",
        description: "Access jobs, mentorship, and chapter events.",
        icon: BadgeCheck,
      },
    ] satisfies HowStepItem[],
  },

  joinSection: {
    headline: "Be part of the alumni advantage.",
    subheading: "Unlock memories, opportunities, and community.",
    cta: { label: "Join the Network", href: "/auth/signup" } satisfies Cta,
  },

  footer: {
    linksLeft: [
      { label: "Terms and conditions", href: "/terms" },
  
    ] satisfies FooterLink[],
    linksRight: [
      { label: "Privacy Policy & Data Policy", href: "/privacy" },
     
    ] satisfies FooterLink[],
    socials: [
      { label: "Contact us", href: "/" },
    ] satisfies FooterLink[],
    note: "© 2025 NIT Durgapur International Alumni Network.",
  },
} as const;
