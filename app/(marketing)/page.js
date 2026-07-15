"use client";

import Hero from "./_components/Hero";
import ProblemSolution from "./_components/ProblemSolution";
import ProductPreview from "./_components/ProductPreview";
import Features from "./_components/Features";
import Pricing from "./_components/Pricing";
import Contact from "./_components/Contact";

/**
 * Public landing page ("/"). The shared header (logo, nav, language selector,
 * Book a Demo) is rendered by the (marketing) layout. Page sections are added
 * below one at a time as the client provides each design — every section stays
 * driven by constants in lib/kabil/landing.js and copy in
 * lib/i18n/translations.js.
 */
const LandingPage = () => (
  <>
    <Hero />
    <ProblemSolution />
    <ProductPreview />
    <Features />
    <Pricing />
    <Contact />
  </>
);

export default LandingPage;
