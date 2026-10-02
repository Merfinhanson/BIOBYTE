/**
 * BIOBYTE — single source of truth for all site content.
 * Editing copy, event logistics or contact people means editing
 * this file only; components stay presentational.
 */

/* ---- Splash timing (shared by JS timer and CSS animation) ---- */
export const SPLASH_MS = 3400;
export const SPLASH_EXIT_MS = 600;

/* ---- Event identity ---- */
export const EVENT = {
  name: "BIOBYTE",
  year: new Date().getFullYear(),
  tagline: "Activate Ideas. Transform Biology.",
  presenter: "Crescent Technocrats Club",
  blurb:
    "A one-day biotech hackathon. Teams build working tools for real problems in bioprocessing, imaging and drug discovery, then demo them the same day.",
  time: "9:00 AM – 4:10 PM",
  /* Event day. null = not announced yet; the countdown falls back to a
     "to be announced" state instead of inventing a deadline.
     Set to e.g. "2026-11-14T09:00:00+05:30" and the countdown goes live. */
  date: null,
  venue: "To be announced",
  teamSize: "2 to 4 members",
  roundOne: "Free registration + PPT submission",
  roundTwo: "₹50 per head if you make Round 2",
};

/* ---- About: mission pillars ---- */
export const PILLARS = [
  {
    key: "explore",
    icon: "compass",
    title: "Explore",
    text: "Scan real biotech frontiers — bioprocess, imaging, fermentation, environmental sensing and drug discovery.",
  },
  {
    key: "decode",
    icon: "dna",
    title: "Decode",
    text: "Turn raw biological and industrial data into signals that a human team can actually read and trust.",
  },
  {
    key: "build",
    icon: "cpu",
    title: "Build",
    text: "Ship a working prototype in a single day. Real pipelines, real models, a real interface.",
  },
  {
    key: "impact",
    icon: "spark",
    title: "Impact",
    text: "Prove the outcome. A solution only counts when it moves yield, safety, cost or lives somewhere measurable.",
  },
];

/* ---- Problem statements (official) ---- */
export const PROBLEMS = [
  {
    id: "CF-01",
    alien: "Upgrade",
    icon: "⎔",
    hue: "#7CFF00",
    hueDeep: "#050A03",
    brief: "Twin the bioreactor and catch a failing batch before it costs you the run.",
    tags: ["Simulation", "Real-time Data", "Optimisation"],
    tech: ["Python", "Simulation models", "IoT / sensor data", "Dashboards"],
    domain: "Bioprocess Engineering",
    title: "Digital Twin for Industrial Bioreactors",
    summary:
      "Build a digital twin that fuses first-principles models, microbial kinetics, live sensor feeds and historical fermentation data to continuously predict biomass growth, substrate use and product formation — then run what-if simulations to cut batch failures.",
    points: [
      "Continuous prediction of growth, oxygen uptake and metabolite output",
      "Early detection of process deviations",
      "What-if simulation for feeding, aeration, agitation and temperature",
    ],
  },
  {
    id: "CF-02",
    alien: "Grey Matter",
    icon: "⌬",
    hue: "#9AA8A0",
    hueDeep: "#101614",
    brief: "Teach a model to spot what a slide under a microscope was missing.",
    tags: ["Image AI", "Cell Counting", "Detection"],
    tech: ["Computer vision", "CNNs", "OpenCV", "PyTorch / TensorFlow"],
    domain: "Computer Vision · Bio-imaging",
    title: "AI-Based Microscopy Analysis",
    summary:
      "Create an AI image-analysis system that automatically detects, counts, classifies and flags abnormal cells from microscopy images, surfacing results through annotated images, graphs or a live dashboard.",
    points: [
      "Detect, count, classify and identify cell abnormalities",
      "Analyse size, shape, morphology and distribution features",
      "Report through annotated output or a dashboard",
    ],
  },
  {
    id: "CF-03",
    alien: "Heatblast",
    icon: "✦",
    hue: "#FF7A00",
    hueDeep: "#180602",
    brief: "Watch the fermenter live and act before the culture drifts out of spec.",
    tags: ["Sensors", "Monitoring", "Control"],
    tech: ["IoT / Arduino", "Data analytics", "Web or mobile app", "ML (optional)"],
    domain: "IoT · Process Control",
    title: "Smart Fermentation Monitoring System",
    summary:
      "Replace periodic manual checks with real-time intelligence. Analyse temperature, pH, dissolved oxygen, agitation, CO₂, optical density and nutrient levels to predict growth and recommend process adjustments.",
    points: [
      "Real-time multi-parameter sensing and fusion",
      "Predict microbial growth and estimate product formation",
      "Recommend adjustments to reduce operator intervention",
    ],
  },
  {
    id: "CF-04",
    alien: "Diamondhead",
    icon: "◆",
    hue: "#2EE6D6",
    hueDeep: "#02171B",
    brief: "Map exactly where heavy metals will settle next, and how sure you are.",
    tags: ["Prediction", "Environment", "Modelling"],
    tech: ["Python / R", "Regression and ML", "GIS / maps", "Data visualisation"],
    domain: "Environmental Science · ML",
    title: "Heavy Metals Sedimentation Predictor",
    summary:
      "Deliver an integrated prediction system that combines grain size and mineral composition, pH, redox potential, dissolved oxygen, organic matter, and human and biological activity to flag areas most susceptible to heavy-metal sedimentation.",
    points: [
      "Fuse soil, chemical and biological signals into one model",
      "Detect high-risk zones from previously collected data",
      "Remain efficient, data-consistent and fully integrated",
    ],
  },
  {
    id: "CF-05",
    alien: "Ghostfreak",
    icon: "◈",
    hue: "#7B3FD4",
    hueDeep: "#0B0418",
    brief: "Rank old drugs for new diseases, and show your reasoning for every pick.",
    tags: ["Drug Discovery", "AI Ranking", "Bioinformatics"],
    tech: ["Machine learning", "Graph analysis", "Bioinformatics databases", "Python"],
    domain: "Computational Biology · AI/ML",
    title: "AI-Assisted Drug Repurposing Candidates",
    summary:
      "Build a computational platform that re-analyses existing drugs for new indications using drug–target interactions, molecular properties and public biological data, producing a ranked shortlist ready for further investigation.",
    points: [
      "Analyse drug–target interactions and molecular properties",
      "Use bioinformatics, docking, network analysis or AI/ML",
      "Output a ranked, prioritised shortlist of candidates",
    ],
  },
];

/* ---- Prize vault ---- */
/* Single place to edit the money if the club revises it. */
export const PRIZES = [
  {
    id: "p1",
    place: "1st Place",
    amount: "₹2,000",
    title: "Champion",
    text: "Strongest working build across all five tracks.",
    podName: "Omnitrix Prime",
  },
  {
    id: "p2",
    place: "2nd Place",
    amount: "₹1,500",
    title: "Runner-Up",
    text: "Best solution with the cleanest execution under time.",
    podName: "Alien Capsule",
  },
  {
    id: "p3",
    place: "3rd Place",
    amount: "₹1,000",
    title: "Second Runner-Up",
    text: "Biggest leap from a rough idea to a working prototype.",
    podName: "Field Canister",
  },
];

/* ---- Rules of engagement ---- */
export const RULES = [
  { icon: "globe", text: "Open to all students across departments and institutions." },
  { icon: "users", text: "Team size must be between 2 and 4 members." },
  { icon: "gift", text: "Round 1 registration is completely free." },
  { icon: "fileText", text: "Round 1 requires a PPT submission from every team." },
  { icon: "advance", text: "Selected teams advance to Round 2." },
  { icon: "wallet", text: "Round 2 fee is ₹50 per head." },
  { icon: "clock", text: "Event runs from 9:00 AM to 4:10 PM." },
];

/* ---- Transformation protocol ---- */
export const PROTOCOL = [
  { step: "01", title: "Register", text: "Verify your Crescent email and register your team." },
  { step: "02", title: "Submit PPT", text: "Present your approach through a Round 1 deck." },
  { step: "03", title: "Shortlisting", text: "Judges select the teams advancing to Round 2." },
  { step: "04", title: "Round 2 Build", text: "Build a working prototype on the challenge track." },
  { step: "05", title: "Final Demo", text: "Demo your solution to the panel and the floor." },
];

/* ---- Frequently asked questions ---- */
export const FAQS = [
  {
    q: "Who can participate?",
    a: "Any student with a Crescent email address. All departments and institutions are welcome.",
  },
  {
    q: "What is the team size?",
    a: "Between 2 and 4 members per team. Register the full team together.",
  },
  {
    q: "Is registration free?",
    a: "Yes. Round 1 registration is free. A ₹50 per head fee applies only if your team advances to Round 2.",
  },
  {
    q: "What is required in Round 1?",
    a: "A PPT submission that explains your approach to the chosen problem statement.",
  },
  {
    q: "What happens in Round 2?",
    a: "Shortlisted teams build a working prototype of their solution, then present it in the final demo.",
  },
  {
    q: "What are the event timings?",
    a: "9:00 AM to 4:10 PM on event day, for both rounds.",
  },
];

/* ---- Command center ---- */
export const COORDINATORS = [
  { name: "Hameed Afsar", role: "CEO", phone: "9489475038" },
  { name: "Mehar Basha", role: "COO", phone: "6379155839" },
  { name: "Merfin Hanson", role: "CTO", phone: "7010416207" },
];

export const CONVENORS = [
  { name: "Dr. Karthikeyan Ramalingam", role: "Dean of Student Affairs" },
  { name: "Dr. Aisha Banu", role: "Club Coordinator" },
];

/* ---- Student core team ----
   Phone numbers are looked up from COORDINATORS so this section and the
   Contact section can never drift apart. */
const CORE_TEAM_META = [
  {
    name: "Merfin Hanson",
    title: "Technical Head",
    handle: "merfinhanson",
    badge: "CTO",
  },
  {
    name: "Hameed Afsar",
    title: "Event Coordinator",
    handle: "hameedafsar",
    badge: "COO",
  },
  {
    name: "Mehar Basha",
    title: "Operations Lead",
    handle: "meharbasha",
    badge: "OPS",
  },
];

export const CORE_TEAM = CORE_TEAM_META.map((member, index) => {
  const match = COORDINATORS.find((person) => person.name === member.name);

  return {
    ...member,
    role: match ? match.role : "",
    phone: match ? match.phone : "",
    hue: ["#7CFF00", "#B6FF5C", "#2EE6D6"][index % 3],
    status: "Online",
  };
});

/* ---- Footer ---- */
export const FOOTER_LINKS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "problems", label: "Problem Statements" },
  { id: "register", label: "Registration" },
  { id: "timeline", label: "Rules & Timeline" },
  { id: "prizes", label: "Prize Vault" },
  { id: "faq", label: "FAQs" },
  { id: "core-team", label: "Core Team" },
  { id: "contact", label: "Contact" },
];
