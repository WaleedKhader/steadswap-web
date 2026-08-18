/*
 * steadswap.com — motion.
 *
 * One first-party file, no dependencies, ~2 KB gzipped. The register is the
 * page's subject: a dog asleep in its own bed. Unhurried settling — long
 * deceleration, small distances, entrances only. Nothing animates away, and
 * nothing slides in from off-screen.
 *
 * ## How the no-JS and reduced-motion guarantees work
 *
 * This script *adds* `data-reveal` attributes; the stylesheet's hidden
 * initial states select on that attribute, inside a
 * `prefers-reduced-motion: no-preference` media query. So:
 *
 *   - No JavaScript      → no attributes → the page renders complete, static.
 *   - Reduced motion on  → attributes present, but every hidden state and
 *                          keyframe sits inside the media query → complete,
 *                          static. (The observers below also never start, so
 *                          the browser does no work either.)
 *   - Otherwise          → entrances play once per element, on arrival or on
 *                          scroll into view, and the element is unobserved.
 *
 * Composited properties only — transform, opacity, and one 0.9 s blur on the
 * h1 at load. The SVG stroke draws animate `stroke-dashoffset` after every
 * shape is normalised to `pathLength="1"`, so one rule fits every icon.
 */

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  /* The hero's hidden initial state selects on this class, so a visitor
     without JavaScript — who never reaches this line — gets the finished
     hero, not a blank one. */
  document.documentElement.classList.add('motion');

  /* Scroll reveals: selected by structure rather than by markup, so the HTML
     stays clean and a new band gets motion by matching a pattern, not by
     remembering an attribute. Order inside a group sets its stagger. */
  const GROUPS = [
    ['.band-head', 90],
    ['.steps', 110],
    ['.swap', 150],
    ['.screens', 130],
    ['.points', 90],
    ['.faq-list', 70],
    ['.price-lines', 60],
    ['.entity', 90],
    ['.problem .wrap', 150],
    ['.statement .wrap', 120],
    ['.closing .wrap', 130],
    ['.quiet-band .wrap', 90],
  ];
  const SINGLES = ['.split > figure', '.swap-note', '.price-note'];

  for (const [selector, step] of GROUPS) {
    for (const group of document.querySelectorAll(selector)) {
      [...group.children].forEach((child, i) => {
        child.setAttribute('data-reveal', '');
        child.style.setProperty('--d', `${i * step}ms`);
      });
    }
  }
  for (const selector of SINGLES) {
    for (const el of document.querySelectorAll(selector)) {
      el.setAttribute('data-reveal', '');
    }
  }

  /* The exchange diagram is a scene, not a list — its card, arrow, traveller
     and stay-chip timings are choreographed in the stylesheet against one
     `.in` class on the container. */
  const swap = document.querySelector('.swap');
  if (swap) swap.setAttribute('data-scene', '');

  /* Normalise every shape in a drawn icon to pathLength 1, so a single
     dasharray rule draws circles, lines and paths alike. The traveller's
     person glyph is deliberately absent: it slides, it does not draw. */
  for (const shape of document.querySelectorAll(
    '.points svg :is(path, circle, rect, line), .swap-cross .leg > svg path',
  )) {
    shape.setAttribute('pathLength', '1');
  }

  /* Reveal on entry, once. A generous bottom margin starts the entrance just
     before the element would be read, never after. */
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
  );
  for (const el of document.querySelectorAll('[data-reveal], [data-scene]')) {
    observer.observe(el);
  }

  /* The hero resolves on load rather than on scroll — its delays live in the
     stylesheet. Double-rAF so initial styles are committed first and the
     transition actually runs. */
  requestAnimationFrame(() =>
    requestAnimationFrame(() => document.body.classList.add('arrived')),
  );
})();
