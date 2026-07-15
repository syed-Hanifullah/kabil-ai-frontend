/**
 * Custom in-page smooth scrolling.
 *
 * Native CSS `scroll-behavior: smooth` can't express a duration or easing, and
 * the design calls for an ease-out curve over 1300ms — so we animate the window
 * scroll ourselves with requestAnimationFrame. A sticky header sits on top of
 * the page, so callers pass its height as `offset` to keep the target visible.
 */

export const ANCHOR_SCROLL_DURATION = 1300; // ms (design spec)

// ease-out (matches CSS `ease-out`): fast start, gentle finish.
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Smoothly scroll the window so element `id` sits `offset` px from the top. */
export const smoothScrollToId = (id, { duration = ANCHOR_SCROLL_DURATION, offset = 0 } = {}) => {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const startY = window.scrollY;
  const targetY = Math.max(0, el.getBoundingClientRect().top + startY - offset);
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;

  const finish = () => history.replaceState(null, "", `#${id}`);

  // Respect users who ask for reduced motion — jump instantly.
  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    finish();
    return;
  }

  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + distance * easeOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
    else finish();
  };
  requestAnimationFrame(step);
};

/**
 * Click handler for in-page anchor links (`href="#section"`). Intercepts the
 * jump and runs the smooth scroll instead, offset by the sticky header. Falls
 * through to default behaviour when the href isn't an in-page anchor or the
 * target doesn't exist. `onNavigate` runs after the scroll starts (e.g. to
 * close the mobile drawer).
 */
export const handleAnchorClick = (e, { onNavigate } = {}) => {
  const href = e.currentTarget.getAttribute("href") || "";
  if (!href.startsWith("#") || href === "#") return;

  const id = href.slice(1);
  if (!document.getElementById(id)) return; // no target — leave default alone

  e.preventDefault();
  const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
  smoothScrollToId(id, { offset: headerHeight });
  onNavigate?.();
};
