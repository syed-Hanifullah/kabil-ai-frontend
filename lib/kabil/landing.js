/**
 * Landing (marketing) page content + config.
 *
 * Everything the public landing page renders lives here as constants — routes,
 * nav links, the logo, and the exact typography specs from design — so the page
 * components stay declarative and nothing is hard-coded inline. Copy itself is
 * kept in `lib/i18n/translations.js` (EN + AR) and referenced here by key.
 */

/** Where the landing page sends users. */
export const LANDING_ROUTES = {
  login: "/login",
  // "Book a Demo" takes the user to the login route.
  bookDemo: "/login",
};

/** Brand logo (raster embedded in an SVG wrapper); intrinsic ratio 76×53. */
export const LANDING_LOGO = {
  src: "/Qabil_logo.svg",
  alt: "Qabil",
  width: 100,
  height: 70,
  href: "/",
};

/**
 * Primary header nav. `labelKey` resolves through `t()` so the label swaps
 * between English and Arabic; `href` targets the matching in-page section.
 */
export const LANDING_NAV_LINKS = [
  { id: "problem", labelKey: "nav.problem", href: "#problem" },
  { id: "solution", labelKey: "nav.solution", href: "#solution" },
  { id: "preview", labelKey: "nav.preview", href: "#preview" },
  { id: "features", labelKey: "nav.features", href: "#features" },
  { id: "pricing", labelKey: "nav.pricing", href: "#pricing" },
  { id: "contact", labelKey: "nav.contact", href: "#contact" },
];

/**
 * Exact typography from design (Figma spec). Values are shared by desktop and
 * mobile; the header hides the horizontal nav below `md` and moves the links
 * into a drawer, but the type styles stay identical.
 */
export const HEADER_TYPOGRAPHY = {
  // Nav links — Plus Jakarta Sans / Bold 700 / 18px / 120% / black.
  navLink: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.2,
    letterSpacing: 0,
    color: "rgba(0, 0, 0, 1)",
  },
  // Language selector ("EN") — Inter / Medium 500 / 13px / 13px / 0.4px.
  langSelector: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 500,
    fontSize: 13,
    lineHeight: "13px",
    letterSpacing: "0.4px",
    textAlign: "center",
    color: "rgba(44, 44, 42, 1)",
  },
  // "Book a Demo" button — Plus Jakarta Sans / Bold 700 / 16px / 24px / 70% black.
  bookDemo: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: 0,
    textAlign: "center",
    color: "rgba(0, 0, 0, 0.7)",
  },
};

/** Header layout constants (kept out of the component body). */
export const HEADER_LAYOUT = {
  heightDesktop: 88,
  heightMobile: 64,
  bg: "#FFFFFF",
  bookDemoBorder: "rgba(15, 110, 86, 1)",
  bookDemoRadius: 10,
  navGap: { xs: 3, md: 4, lg: 5 },
};

/* ------------------------------------------------------------------ */
/* Hero section                                                        */
/* ------------------------------------------------------------------ */

/** All hero colors (from design spec). */
export const HERO_COLORS = {
  bg: "rgba(15, 110, 86, 1)",
  eyebrow: "rgba(239, 159, 39, 1)",
  headingLight: "rgba(248, 250, 252, 1)",
  headingAccent: "rgba(239, 159, 39, 1)",
  subtext: "rgba(226, 220, 206, 1)",
  bookDemoBg: "rgba(29, 158, 117, 1)",
  bookDemoText: "rgba(255, 255, 255, 1)",
  watchBorder: "rgba(239, 159, 39, 1)",
  watchText: "rgba(255, 255, 255, 1)",
};

/** Exact hero typography (Figma spec). */
export const HERO_TYPOGRAPHY = {
  // "BUILT FOR THE GCC" — Inter / Bold 700 / 14px / 21px / 1.4px / UPPERCASE.
  eyebrow: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "21px",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
  },
  // Headline — Plus Jakarta Sans / Bold 700 / 38px / 55px / 0.19px / capitalize.
  heading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 38,
    lineHeight: "55px",
    letterSpacing: "0.19px",
    textTransform: "capitalize",
  },
  // Sub-copy — Plus Jakarta Sans / Medium 500 / 20px / 32px / 0.14px / capitalize.
  subtext: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 500,
    fontSize: 20,
    lineHeight: "32px",
    letterSpacing: "0.14px",
    textTransform: "capitalize",
  },
  // "Book a demo" — Plus Jakarta Sans / Bold 700 / 16px / 24px.
  bookDemo: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: 0,
  },
  // "Watch Overview" — Inter / Medium 500 / 16px / 24px.
  watch: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 500,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: 0,
  },
};

/** Hero layout constants. */
export const HERO_LAYOUT = {
  height: 750,
  contentMaxWidth: 640,
  bookDemoRadius: 10,
  bookDemoShadow:
    "0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
  watchRadius: 8,
  watchBorderWidth: 3,
  // Gap between the two CTA buttons (Book a demo ↔ Watch Overview).
  ctaGap: 24, // px
};

/**
 * Hero image (right side). Clipped to a right triangle — right angle at the
 * bottom-right, hypotenuse running from the top-right vertex down to the
 * bottom-left. A soft gold glow hugs the bottom + right legs (the diagonal
 * stays clean). Hidden on mobile.
 */
export const HERO_IMAGE = {
  src: "/hero1.png",
  altKey: "hero.imageAlt",
  clipPath: "polygon(100% 0%, 100% 100%, 0% 100%)",
  glowColor: "rgba(239, 159, 39, 0.5)",
  glowBlur: 10, // px, matches backdrop blur(10px) from spec
  // Fixed size on the right of the hero (desktop only). The image is
  // bottom-aligned with the CTA buttons via the row layout in Hero.js.
  width: 400, // px
  height: 450, // px
  // Nudge toward the inline-end edge (right in LTR, mirrored in RTL).
  offsetEnd: 48, // px
};

/** Hero copy keys + button targets (labels resolve via t()). */
export const HERO_CONTENT = {
  eyebrowKey: "hero.eyebrow",
  headingLine1Key: "hero.headingLine1",
  headingLine2LeadKey: "hero.headingLine2Lead",
  headingLine2AccentKey: "hero.headingLine2Accent",
  subtextKey: "hero.subtext",
  bookDemo: { labelKey: "hero.bookDemo", href: LANDING_ROUTES.bookDemo },
  watch: { labelKey: "hero.watch", href: "#watch-overview" },
};

/* ------------------------------------------------------------------ */
/* Problem → Solution section                                          */
/* ------------------------------------------------------------------ */

/**
 * Decorative contour graphic (247×646). Sits to the left of the first
 * Problem card, aligned to the top of the items; its right edge stops just
 * short of the card and the left part bleeds off-screen (section clips it).
 */
export const PS_LEFT_IMAGE = {
  src: "/hero2LeftSide.png",
  alt: "", // decorative
  width: 210, // px (bigger)
  top: -150, // px relative to the Problem column top (pill top = 0) — nudged up
  gap: -30, // px between the image's right edge and the card's left edge — nudged right
};

/**
 * Decorative contour graphic (557×1184) on the LEFT edge, beside the Problem
 * card of item 03. Same anchoring as PS_LEFT_IMAGE: right edge stops `gap` px
 * short of the card's left edge; the rest bleeds off-screen (section clips it).
 */
export const PS_LEFT_IMAGE_2 = {
  src: "/hero4LeftImage.png",
  alt: "", // decorative
  width: 240, // px
  top: -120, // px relative to the Problem column top
  gap: -30, // px between the image's right edge and the card's left edge
};

/**
 * Decorative contour graphic (231×614) on the RIGHT edge, beside the Solution
 * card of item 04. Same anchoring as PS_RIGHT_IMAGE.
 */
export const PS_RIGHT_IMAGE_2 = {
  src: "/hero5RightImage.png",
  alt: "", // decorative
  width: 240, // px
  top: -120, // px relative to the Solution column top
  gap: -30, // px between the image's left edge and the card's right edge
};

/**
 * Decorative contour graphic (561×1245) mirrored on the RIGHT edge, beside the
 * Solution card of item 02. Its left edge stops `gap` px short of the Solution
 * card's right edge; the rest bleeds off-screen (section clips it).
 */
export const PS_RIGHT_IMAGE = {
  src: "/hero3RightImage.png",
  alt: "", // decorative
  width: 240, // px
  top: -120, // px relative to the Solution column top
  gap: -50, // px between the image's left edge and the card's right edge
};

/** Colors (from design spec). */
export const PS_COLORS = {
  eyebrow: "rgba(239, 159, 39, 1)",
  heading: "rgba(95, 94, 90, 1)",
  cardBg: "rgba(244, 240, 232, 1)",
  problemBorder: "rgba(239, 68, 68, 1)",
  solutionBorder: "rgba(15, 110, 86, 1)",
  pillText: "rgba(95, 94, 90, 1)",
  cardTitle: "rgba(44, 44, 42, 1)",
  cardDesc: "rgba(95, 94, 90, 1)",
  subheading: "rgba(95, 94, 90, 1)",
  // Outlined number stroke.
  numberStroke: "rgba(10, 10, 10, 0.5)",
};

/** Typography (Figma spec). */
export const PS_TYPOGRAPHY = {
  // "THE FIX ON THE SAME DESK" — Inter / 700 / 14 / 18 / 1.4px / UPPERCASE.
  eyebrow: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "18px",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
  },
  // Heading — Plus Jakarta Sans / 600 / 35 / 40 / 0.
  heading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 600,
    fontSize: 35,
    lineHeight: "40px",
    letterSpacing: 0,
  },
  // "Problem" / "Solution" pill + card title — Plus Jakarta Sans / 700 / 24 / 34 / 0.
  pillLabel: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 24,
    lineHeight: "34px",
    letterSpacing: 0,
  },
  cardTitle: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 24,
    lineHeight: "34px",
    letterSpacing: 0,
  },
  // Card description — Plus Jakarta Sans / 400 / 18 / 26 / 0.
  cardDesc: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 400,
    fontSize: 18,
    lineHeight: "26px",
    letterSpacing: 0,
  },
  // Sub-heading — Plus Jakarta Sans / 400 / 20 / 32 / 0 / center.
  subheading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 400,
    fontSize: 20,
    lineHeight: "32px",
    letterSpacing: 0,
  },
  // Outlined number — Space Grotesk / 500 / 100 / 80 / -0.32px. Rendered as a
  // 1.5px stroke with transparent fill (see PS_COLORS.numberStroke).
  number: {
    fontFamily: "var(--font-space-grotesk), sans-serif",
    fontWeight: 500,
    fontSize: 100,
    lineHeight: "80px",
    letterSpacing: "-0.32px",
  },
};

/** Layout constants for pills + cards (Figma spec). */
export const PS_LAYOUT = {
  pill: { width: 361, height: 66, radius: 20, borderWidth: 2 },
  card: {
    width: 377,
    minHeight: 206, // was fixed 206; min so copy can grow
    radius: 24,
    borderWidth: 1,
    shadow: "0px 10px 15px -3px rgba(239, 159, 39, 0.1)",
  },
};

/** Section header copy keys. */
export const PS_HEADER = {
  eyebrowKey: "ps.eyebrow",
  headingLine1Key: "ps.headingLine1",
  headingLine2Key: "ps.headingLine2",
  subheadingKey: "ps.subheading",
  problemLabelKey: "ps.problemLabel",
  solutionLabelKey: "ps.solutionLabel",
};

/**
 * Problem→Solution pairs. Only item 01 is specced so far; more are added as
 * the client provides them. `side` is which side the Problem sits on for that
 * row (alternation pattern to be confirmed).
 */
export const PS_ITEMS = [
  {
    number: "01",
    side: "left",
    problem: { titleKey: "ps.item1.problemTitle", descKey: "ps.item1.problemDesc" },
    solution: { titleKey: "ps.item1.solutionTitle", descKey: "ps.item1.solutionDesc" },
  },
  {
    number: "02",
    side: "left",
    problem: { titleKey: "ps.item2.problemTitle", descKey: "ps.item2.problemDesc" },
    solution: { titleKey: "ps.item2.solutionTitle", descKey: "ps.item2.solutionDesc" },
  },
  {
    number: "03",
    side: "left",
    problem: { titleKey: "ps.item3.problemTitle", descKey: "ps.item3.problemDesc" },
    solution: { titleKey: "ps.item3.solutionTitle", descKey: "ps.item3.solutionDesc" },
  },
  {
    number: "04",
    side: "left",
    problem: { titleKey: "ps.item4.problemTitle", descKey: "ps.item4.problemDesc" },
    solution: { titleKey: "ps.item4.solutionTitle", descKey: "ps.item4.solutionDesc" },
  },
];

/* ------------------------------------------------------------------ */
/* Product Preview section                                             */
/* ------------------------------------------------------------------ */

/** Colors (from design spec). */
export const PREVIEW_COLORS = {
  // Diagonal deep-navy → teal → green gradient (exact Figma stops).
  bg: "linear-gradient(135deg, #0F172A 0%, #112331 7.14%, #132E37 14.29%, #143B3D 21.43%, #154744 28.57%, #14544A 35.71%, #126150 42.86%, #0F6E56 50%, #14614F 57.14%, #165449 64.29%, #174742 71.43%, #173B3B 78.57%, #152F35 85.71%, #14232E 92.86%, #111827 100%)",
  eyebrow: "rgba(239, 159, 39, 1)",
  heading: "rgba(255, 255, 255, 1)",
  subheading: "rgba(255, 255, 255, 0.7)",
};

/** Layout constants (Figma spec). */
export const PREVIEW_LAYOUT = {
  height: 623, // px — fixed section height
};

/** Typography (Figma spec). */
export const PREVIEW_TYPOGRAPHY = {
  // "PRODUCT PREVIEW" — Inter / 700 / 14 / 18 / 1.4px / UPPERCASE / center.
  eyebrow: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "18px",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    textAlign: "center",
  },
  // "The platform, live." — Plus Jakarta Sans / 600 / 35 / 40 / 0 / center.
  heading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 600,
    fontSize: 35,
    lineHeight: "40px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // Sub-copy — Plus Jakarta Sans / 400 / 20 / 32 / 0 / center.
  subheading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 400,
    fontSize: 20,
    lineHeight: "32px",
    letterSpacing: 0,
    textAlign: "center",
  },
};

/**
 * Laptop dashboard mockup shown under the header. Asset pending from client —
 * point `src` at it once provided.
 */
export const PREVIEW_IMAGE = {
  src: "", // TODO: laptop mockup asset (client to provide)
  altKey: "preview.imageAlt",
  maxWidth: 1000, // px — placeholder until spec'd
};

/** Section copy keys. */
export const PREVIEW_CONTENT = {
  eyebrowKey: "preview.eyebrow",
  headingKey: "preview.heading",
  subheadingKey: "preview.subheading",
};

/* ------------------------------------------------------------------ */
/* Features ("Built for the Gulf") section                             */
/* ------------------------------------------------------------------ */

/** Colors (from design spec). */
export const FEATURES_COLORS = {
  eyebrow: "rgba(239, 159, 39, 1)",
  heading: "rgba(95, 94, 90, 1)",
  cardBg: "rgba(239, 159, 39, 0.05)",
  cardBorder: "rgba(232, 222, 200, 1)",
  cardTitle: "rgba(15, 110, 86, 1)",
  cardValue: "rgba(44, 44, 42, 1)",
  // Icon + its rounded chip (chip specs are ours; icon color = card title green).
  icon: "rgba(15, 110, 86, 1)",
  iconChipBg: "rgba(201, 168, 76, 0.16)",
};

/** Typography (Figma spec). */
export const FEATURES_TYPOGRAPHY = {
  // "BUILT FOR THE GULF…" — Inter / 700 / 14 / 18 / 1.4px / UPPERCASE / center.
  eyebrow: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "18px",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    textAlign: "center",
  },
  // Heading — Plus Jakarta Sans / 600 / 35 / 40 / 0 / center.
  heading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 600,
    fontSize: 35,
    lineHeight: "40px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // Card title — Plus Jakarta Sans / 700 / 17 / 26.35 / 0.
  cardTitle: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 17,
    lineHeight: "26.35px",
    letterSpacing: 0,
  },
  // Card value — Plus Jakarta Sans / 400 / 14 / 21.7 / 0.
  cardValue: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "21.7px",
    letterSpacing: 0,
  },
};

/** Layout constants (Figma spec + confirmed values). */
export const FEATURES_LAYOUT = {
  card: {
    width: 530, // px
    height: 160, // px
    radius: 14, // px
    borderWidth: 1, // px
  },
  iconChip: { size: 44, radius: 12, iconSize: 22 }, // ours (tunable)
  columnGap: 4, // MUI spacing units between the two columns
  rowGap: 4, // between rows
};

/** Section header copy keys. */
export const FEATURES_HEADER = {
  eyebrowKey: "features.eyebrow",
  headingLine1Key: "features.headingLine1",
  headingLine2Key: "features.headingLine2",
};

/**
 * Feature cards (2×2 grid). `icon` maps to a MUI icon in the component; copy
 * resolves via t().
 */
export const FEATURES_ITEMS = [
  { icon: "shield", titleKey: "features.card1.title", valueKey: "features.card1.value" },
  { icon: "language", titleKey: "features.card2.title", valueKey: "features.card2.value" },
  { icon: "assignment", titleKey: "features.card3.title", valueKey: "features.card3.value" },
  { icon: "description", titleKey: "features.card4.title", valueKey: "features.card4.value" },
];

/* ------------------------------------------------------------------ */
/* Pricing (Founding Partner) section                                  */
/* ------------------------------------------------------------------ */

/** Colors (from design spec). */
export const PRICING_COLORS = {
  eyebrow: "rgba(239, 159, 39, 1)",
  heading: "rgba(95, 94, 90, 1)",
  cardBg: "rgba(244, 240, 232, 1)",
  cardBorder: "rgba(0, 0, 0, 0.05)",
  price: "rgba(10, 61, 46, 1)",
  meta: "rgba(95, 107, 99, 1)", // SAR line + description
  seats: "rgba(155, 125, 36, 1)", // "FIVE FOUNDING SEATS…"
};

/** Typography (Figma spec). */
export const PRICING_TYPOGRAPHY = {
  // "FOUNDING PARTNER PROGRAMME" — Inter / 700 / 14 / 18 / 1.4px / UPPERCASE / center.
  eyebrow: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "18px",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    textAlign: "center",
  },
  // Heading — Plus Jakarta Sans / 600 / 35 / 40 / 0 / center.
  heading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 600,
    fontSize: 35,
    lineHeight: "40px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // "AED 2,000" — Fraunces / 400 / 50 / 50 / 0 / center.
  price: {
    fontFamily: "var(--font-fraunces), serif",
    fontWeight: 400,
    fontSize: 50,
    lineHeight: "50px",
    letterSpacing: 0,
  },
  // "/month" — Fraunces / 300 / 20 / 50 / 0 / center.
  priceUnit: {
    fontFamily: "var(--font-fraunces), serif",
    fontWeight: 300,
    fontSize: 20,
    lineHeight: "50px",
    letterSpacing: 0,
  },
  // "≈ SAR 2,040 · for KSA agencies" — Plus Jakarta Sans / 600 / 15 / 23.25 / 0 / center.
  sar: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 600,
    fontSize: 15,
    lineHeight: "23.25px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // Description — Plus Jakarta Sans / 400 / 15 / 23.25 / 0 / center.
  description: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 400,
    fontSize: 15,
    lineHeight: "23.25px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // "FIVE FOUNDING SEATS · BY INVITATION" — Plus Jakarta Sans / 800 / 11.5 / 17.83 / 0.8px / UPPERCASE / center.
  seats: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 800,
    fontSize: 11.5,
    lineHeight: "17.83px",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    textAlign: "center",
  },
};

/** Layout constants (Figma spec). */
export const PRICING_LAYOUT = {
  card: {
    width: 728, // px
    height: 407, // px
    radius: 24, // px
    borderWidth: 1, // px
    shadow: "0px 10px 15px -3px rgba(239, 159, 39, 0.1)",
  },
};

/** Section copy keys. */
export const PRICING_CONTENT = {
  eyebrowKey: "pricing.eyebrow",
  headingLine1Key: "pricing.headingLine1",
  headingLine2Key: "pricing.headingLine2",
  priceKey: "pricing.price",
  priceUnitKey: "pricing.priceUnit",
  sarKey: "pricing.sar",
  // Description is split so the duration can be emphasised (bold + green).
  descLeadKey: "pricing.descLead",
  descEmphasisKey: "pricing.descEmphasis",
  descTailKey: "pricing.descTail",
  seatsKey: "pricing.seats",
};

/* ------------------------------------------------------------------ */
/* Contact ("Book a demo") section                                     */
/* ------------------------------------------------------------------ */

/** Colors (from design spec + confirmed values). */
export const CONTACT_COLORS = {
  eyebrow: "rgba(239, 159, 39, 1)",
  heading: "rgba(95, 94, 90, 1)",
  subheading: "rgba(95, 94, 90, 1)",
  cardBg: "linear-gradient(180deg, #F4F0E8 0%, #DCFADE 50%, #E1F5EE 100%)",
  label: "rgba(44, 44, 42, 1)",
  fieldBg: "rgba(255, 255, 255, 1)",
  fieldBorder: "rgba(0, 0, 0, 0.1)",
  fieldText: "rgba(44, 44, 42, 1)",
  fieldPlaceholder: "rgba(44, 44, 42, 0.45)",
  buttonBg: "rgba(15, 110, 86, 1)",
  buttonText: "rgba(255, 255, 255, 1)",
};

/** Typography (Figma spec). */
export const CONTACT_TYPOGRAPHY = {
  // "GET IN TOUCH" — Inter / 700 / 14 / 18 / 1.4px / UPPERCASE / center.
  eyebrow: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "18px",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    textAlign: "center",
  },
  // Heading — Plus Jakarta Sans / 600 / 35 / 40 / 0 / center.
  heading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 600,
    fontSize: 35,
    lineHeight: "40px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // Sub-copy — Plus Jakarta Sans / 400 / 20 / 32 / 0 / center.
  subheading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 400,
    fontSize: 20,
    lineHeight: "32px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // Field label — Plus Jakarta Sans / 500 / 14 / 21 / 0.
  label: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "21px",
    letterSpacing: 0,
  },
  // Input text — Plus Jakarta Sans / 400 / 15 (ours; not spec'd separately).
  field: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 400,
    fontSize: 15,
    letterSpacing: 0,
  },
  // Button — Plus Jakarta Sans / 700 / 16 / 24 / 0 / center.
  button: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: 0,
    textAlign: "center",
  },
};

/** Layout constants (Figma spec + confirmed values). */
export const CONTACT_LAYOUT = {
  cardHeight: 630, // px — full-width gradient card
  field: { height: 45, radius: 10, borderWidth: 1 },
  textareaMinHeight: 220, // px (Comment box; sized from the design)
  button: {
    radius: 10,
    shadow:
      "0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
};

/** Section header copy keys. */
export const CONTACT_HEADER = {
  eyebrowKey: "contact.eyebrow",
  headingKey: "contact.heading",
  subheadingKey: "contact.subheading",
  submitKey: "contact.submit",
};

/**
 * Form fields. `full: true` spans both columns. `multiline` renders a textarea.
 * Labels + placeholders resolve via t().
 */
export const CONTACT_FIELDS = [
  { id: "fullName", labelKey: "contact.fullName.label", placeholderKey: "contact.fullName.placeholder", type: "text" },
  { id: "jobTitle", labelKey: "contact.jobTitle.label", placeholderKey: "contact.jobTitle.placeholder", type: "text" },
  { id: "company", labelKey: "contact.company.label", placeholderKey: "contact.company.placeholder", type: "text" },
  { id: "workEmail", labelKey: "contact.workEmail.label", placeholderKey: "contact.workEmail.placeholder", type: "email" },
  { id: "comment", labelKey: "contact.comment.label", placeholderKey: "contact.comment.placeholder", type: "text", full: true, multiline: true },
];

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

/** Colors (from design spec + confirmed values). */
export const FOOTER_COLORS = {
  bg: "rgba(15, 110, 86, 1)",
  heading: "rgba(255, 255, 255, 1)",
  buttonBorder: "rgba(239, 159, 39, 1)",
  buttonText: "rgba(255, 255, 255, 1)",
  link: "rgba(255, 255, 255, 0.7)",
  divider: "rgba(255, 255, 255, 0.15)", // ours (not spec'd)
  copyright: "rgba(255, 255, 255, 0.4)",
};

/** Typography (Figma spec + confirmed values). */
export const FOOTER_TYPOGRAPHY = {
  // "See Qabil run…" — Plus Jakarta Sans / 500 / 25 / 35 / 0.
  heading: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 500,
    fontSize: 25,
    lineHeight: "35px",
    letterSpacing: 0,
  },
  // "Chat With Us" — Plus Jakarta Sans / 700 / 16 / 24 / 0 / center.
  button: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: 0,
    textAlign: "center",
  },
  // Nav link — Inter / 500 / 14 / 21 / 0.
  link: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "21px",
    letterSpacing: 0,
  },
  // Copyright — Inter / 400 / 14 / 21 / 0 / center.
  copyright: {
    fontFamily: "var(--font-sans), sans-serif",
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "21px",
    letterSpacing: 0,
  },
};

/** Layout constants (Figma spec + confirmed values). */
export const FOOTER_LAYOUT = {
  height: 336, // px — full-width band
  logoWidth: 120, // px (ours; forced white via CSS filter)
  button: { width: 165, height: 46, radius: 10, borderWidth: 2 },
};

/** Footer copy keys + the chat CTA target. */
export const FOOTER_CONTENT = {
  headingKey: "footer.heading",
  buttonLabelKey: "footer.chat",
  buttonHref: "#contact",
  copyrightKey: "footer.copyright",
};

/**
 * Footer nav, grouped into the columns shown in the design. Each entry's label
 * resolves via t(); href targets the matching in-page section.
 */
export const FOOTER_LINK_COLUMNS = [
  [
    { labelKey: "footer.nav.problems", href: "#problem" },
    { labelKey: "footer.nav.solutions", href: "#solution" },
  ],
  [
    { labelKey: "footer.nav.features", href: "#features" },
    { labelKey: "footer.nav.pricing", href: "#pricing" },
  ],
  [{ labelKey: "footer.nav.contact", href: "#contact" }],
];
