import type {
  Brand,
  Cta,
  HowStepItem,
  QuickActionItem,
  TestimonialItem,
  ValueItem,
  FooterLink,
  SpotlightEvent, // 👈 needed for items satisfies
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
    primary: { label: "Join the Network", href: "/signup" } satisfies Cta,
    secondary: { label: "Sign In", href: "/login" } satisfies Cta,
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
          "I am delighted to note the inauguration of the website of the NITDian Delhi. This is a commendable initiative that will strengthen the linkage between the Institute and its alumni, while also fostering closer interaction among the members of the Chapter. \n\n  The alumni of NIT Durgapur have consistently brought laurels to their alma mater through their professional achievements and contributions to society. I am confident that this digital platform will further enhance collaboration, knowledge sharing, and networking within the alumni community, and serve as a valuable resource for engaging with the Institute. \n\n  I extend my best wishes to the NITDian Delhi for the successful functioning of this website and for its continued efforts in upholding the values and spirit of NIT Durgapur.",
        author: "Arvind Choubey",
        role: "Director, NIT Durgapur",
        avatar: "/members/director.jpg",
        href: "/stories/arvind-choubey",
      },
      {
        quote:
          "Dear NITDians, NITDIAN Delhi is proud and committed to facilitate a lifetime connection among its alumni members and with our Alma Mater NIT Durgapur and our fraternity across the globe.\n\nThe indelible message of the Nobel Laureate great Rabindranath Tagore - \"Jôdi Tor Dak Shune Keu Naaa...Ase, Tôbe Ekla Chôlo Re\", speaks aloud that nobody can deter you in your determination and daringness if you are out to do selfless service.\n\nI would like to validate that interaction with your fellow alumni and batchmates leads you intrinsically to the best possible opportunity available at every stage of your career. Not only the sharing by seniors helps the junior alumni a lot, the noticeable achievements of the juniors also stimulate seniors in analysing and planning their activities in this lifelong journey.\n\nIt is an honor to connect with each one of you. I seek your support and engagement to take our society forward. Let us stay involved to grow and evolve together.",
        author: "Sandeep Kapoor",
        role: "President, NITDian Delhi",
        avatar: "/members/sandeepkapoor.jpg",
        href: "/stories/arvind-choubey",
      },
      {
        quote: 
          "My Dear Sandeep, It gives me great joy to convey my heartfelt congratulations to you and the entire Delhi Chapter team on the launch of the NITDIAN Delhi Chapter website. \n\n This is a wonderful initiative that will not only keep our alumni associations connected but also open new avenues for collaboration, networking, and friendship among all NITD Alumni in Delhi and beyond. \n\n The Delhi Chapter has always been one of the most energetic and active arms of our alumni family, and this step will surely help carry forward that spirit in a meaningful way. I am excited to see how this platform will bring together experiences, opportunities, and memories, making our community stronger. \n\n Wishing our Associate unit NITDIAN, Delhi Chapter every success in this journey, and looking forward to celebrating many more such milestones together.",
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
        "Dear NIT Durgapur Alumni, I'm thrilled to see our newly launched website! I believe this platform will strengthen our professional networks and also foster meaningful bonds among our fraternity, better halves, and children. Let's reconnect, share experiences, mentor and build a supportive community.  Together, let's make our NITD family even more vibrant and connected.",
      author: "Jaya Mzumder Sood",
      role: "1994 Civil",
      year: "WSP",
      avatar: "",
    },
    {
      quote:
        "...CONGRATULATIONS On the launch of website. I am very happy to be a part ( Chief Patron ) of this NITDIAN DELHI. This website is a bond which will keep all the alumni together and in touch with each other ... One may grow as old or big in life but everyone cherishes his college days... wish those days could comeback. Once again my good wishes to all the alumni members and a big applause for the committee members and the president Sandeep Kapoor ...",
      author: "Rajinder Bagga",
      role: "1970 Mechanical",
      year: "Bagga Link group Delhi",
      avatar: "",
    },
    {
      quote:
        "It is heartening to note that NIITDIAN Delhi Chapter Website is being launched. The NIITD Delhi Chapter was doing a fabulous job of carrying forward the Alumni activities including that of supporting the Alumni members. Now with this Website, it would add new dimension to those efforts and give opportunities for greater reach and deeper engagement...",
      author: "Ratan Kesh",
      role: "1993 Mechanical",
      year: "ED & COO, Bandhan Bank",
      avatar: "",
    },
    {
      quote:
        "Not just a forum, but a treasure trove of Expertise, Enablement, Accomplishments, and Aspirations. One of the most virant Alumni community I have seen. Excited to be part of the family …. Together, let's make a difference to the society, positively influencing lives around us.",
      author: "Ish Kumar",
      role: "1998 Electrical",
      year: "Tech Mahindra",
      avatar: "",
    },
    {
      quote:
        "...Every story shared, every event attended, and every connection made will strengthen the NITDIAN fabric in Delhi and beyond. We invite all alumni to register, participate, and co-create this journey with us… website is not just a digital presence — it’s a commitment to keeping the NITDIAN spirit alive, wherever we are...",
      author: "Prasantha Saha",
      role: "2014 Mechanical",
      year: "EY",
      avatar: "",
    },
    {
      quote:
        "With heartfelt gratitude to our alma mater, NIT Durgapur, for nurturing us with the roots to rise – NITDIAN Delhi now steps into the digital era. This platform will unite alumni and add value through technical exchange, social connect, mentorship, and career growth.",
      author: "Rupak Mandal",
      role: "2011 Mechanical",
      year: "Bharti Real Estate",
      avatar: "",
    },
    {
      quote: "Four years of Durgapur - Four decades of Engineering. Nothing less, nothing more",
      author: "Hitendra Dev Sakya",
      role: "1988 Electrical",
      year: "MD Nepal Electricity Authority",
      avatar: "",
    },
    {
      quote:
        "..It gives me immense pleasure to know the launch of our much awaited official alumni website – a dedicated platform to strengthen the bond between our institution and its proud alumni across the globe.... Let’s visit the website, explore its features, and stay connected with the ever-growing alumni community as our active participation and contributions will make this platform vibrant and meaningful...",
      author: "Harish Saran",
      role: "1987 Electrical",
      year: "MD Hindustan Power Exchange Ltd",
      avatar: "",
    },
    {
      quote:
        "58 years back, scores of wide eyed boys from different states converged to RECD to be exposed to the kaleidiscopic world of friends, fun, frolic and fear. Those were turbulent times. Still we managed to remain afloat and contribute to Nation building",
      author: "Sudhir Adhicary",
      role: "1967 Civil",
      year: "\u00A0",
      avatar: "",
    },
    {
      quote:
        "To me NITDIAN or NIT DGP Alumni Fraternity is my Extended Family and source of Knowledge, Inspiration, Nostalgia and sometimes Courage too, Also a medium to give back(In whatever small ways i can) to the alumni community in particular but society at large.",
      author: "Sumit Pawar",
      role: "2008 CSE",
      year: "\u00A0",
      avatar: "",
    },
    {
      quote:
        "I am proud to be an NITDian.... The biggest contribution of the institute was to build a selfless intimate bonding of Alumnus globally.  Extremely elated to learn New Website launching event by NITDIAN DELHI Alumni Association, who are amongst the most active Alumni Bodies. This launch will make NITDIAN DELHI more visible, specifically for the new Alumnus. My best wishes and regards…",
      author: "Jayanta Biswas",
      role: "1984 Mechanical",
      year: "\u00A0",
      avatar: "",
    },
    {
      quote:
        "RECD/NITD Allumni is  a Great  Body of  Ex _Students  UNIT. Lot of Activities  take place Throughout the Year. I am proud  to be Member of this Allumni.I wish  the best Success of this  Allumni  towards Nation Building.",
      author: "Malay Kisor Lahiri",
      role: "1972 Electrical",
      year: "\u00A0",
      avatar: "",
    },
    {
      quote:
        "The alumni is the pride and strength of our institution. Thank you for staying connected, giving back, and carrying forward the legacy of our community with such grace and distinction",
      author: "Ashish Sharma",
      role: "2011 IT",
      year: "\u00A0",
      avatar: "",
    },
  ] satisfies FeaturedItem[],
},


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
    cta: { label: "Join the Network", href: "/signup" } satisfies Cta,
  },

  footer: {
    linksLeft: [
      { label: "Terms and conditions", href: "/policies/terms" },
  
    ] satisfies FooterLink[],
    linksRight: [
      { label: "Privacy Policy & Data Policy", href: "/policies/privacy" },
     
    ] satisfies FooterLink[],
    socials: [
      { label: "Contact us", href: "mailto:nitdiandelhi@gmail.com" },
    ] satisfies FooterLink[],
    note: "© 2025 NIT Durgapur International Alumni Network.",
  },
} as const;
