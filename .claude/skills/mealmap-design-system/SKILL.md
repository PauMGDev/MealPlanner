---
name: mealmap-design-system
description: The MealMap visual language (lp-* token family) for designing or restyling any UI surface in this project, public or authenticated. Use whenever a task touches the look of the landing, the auth screens or the app shell: layout, colour, type, spacing, radii, motion, imagery, navigation, the weekly matrix, or a new section or screen. Also use before adding a token, a component class, or an animation to apps/frontend/src/styles.css, and when reviewing UI work for visual consistency.
---

# MealMap design system (lp-*)

The source of truth for values is `apps/frontend/src/styles.css`. This file explains
roles, ratios and rules. Never duplicate hex values here; read the token block.

## Scope

Governs the `lp-*` visual family, which is now the whole product: the landing
(`apps/frontend/src/app/landing/`), the auth screens (`apps/frontend/src/app/auth/`:
login, register and the OAuth callback) and the authenticated shell
(`apps/frontend/src/app/shell/`). Light only everywhere, including inside `/app`.

The old `mm-*` dark app palette is gone: the tokens were deleted from `styles.css` and
every shell component migrated. Do not reintroduce it. A dark variant of the product,
if it happens, will be a variant of `lp-*` and not a second family.

The `hk-*` set is legacy and unused by any component. Nothing in the `lp-*` family may
reference it.

The application surface adds roles and components the landing never needed. They live in
their own chapter at the end of this file, "Application surface".

## Design read and dials

Consumer SaaS landing that doubles as a portfolio piece, for mobile heavy home cooks plus
recruiters skimming craft, in a clean warm premium calm product first language: warm off
white base, one warm accent, centred hero plus bento tray structure, reveal only motion,
no animation libraries.

- `DESIGN_VARIANCE: 6`. Variance lives in tile sizes and section rhythm, not in broken
  grids. The hero is centred and the trays are symmetric on purpose.
- `MOTION_INTENSITY: 5`. One motivated device (entry reveal) plus hover and active
  feedback. No scroll hijack, no parallax, no perpetual loops.
- `VISUAL_DENSITY: 3`. Large section padding, one message per section, the product
  capture carries the information load instead of the copy.

## Tokens: roles and combination rules

Semantic roles in the `@theme` block of `styles.css`:

| Token | Role |
|---|---|
| `lp-base` | Page background. Also the fill of nested blocks that sit inside a card. |
| `lp-tray` | Outer bento tray only. One step darker than the page, never a text background. |
| `lp-card` | Cards, framed captures, nav pill panel, chips on a base background. |
| `lp-ink` | Headlines, card titles, primary button background, high emphasis body. |
| `lp-ink-soft` | Body copy, descriptions, nav links, any small text. Default text colour. |
| `lp-ink-faint` | Lowest emphasis: the muted first hero line, field labels, footer legal line. |
| `lp-line` | Hairlines, card and input borders, dividers. Never text. |
| `lp-accent` | Fills and graphics only: icon glyph in the brand mark, checkbox fill, timeline node, focus ring, active borders. |
| `lp-accent-ink` | The accent when it carries text: badge tile glyph, tags, out of stock chips, the today pill background. |
| `lp-accent-soft` | Accent tint background: icon tiles, tags, the tinted bento cell, the final CTA panel. |
| `lp-danger` | Field errors and the alert icon. Text only, never a fill. |
| `lp-danger-soft` | Background of the inline error alert. Text over it is `lp-ink`. |
| `lp-hover` | Hover fill for a control sitting on `base` or `card`. One step between the two. App surface only. |
| `lp-ok` | Availability semaphore, green. Dot fill only, never text. App surface only. |
| `lp-warn` | Availability semaphore, amber. Dot fill only, never text. App surface only. |

### Combination rules

- Surface stacking goes `base` then `tray` then `card`, one step at a time. A card never
  sits directly on a card. A block nested inside a card uses `base`, not `tray`.
- `lp-accent` is never used for body text and never as the primary button background. The
  primary CTA is `lp-ink` background with `lp-base` label.
- Any text over `lp-accent-soft` is `lp-ink` or `lp-accent-ink`, never `lp-accent`.
- `lp-ink-faint` is only legible over `lp-base` and `lp-card`. Do not place it over
  `lp-tray`.
- One accent for the whole page. If a surface needs a second colour, it needs a reason
  written into this file first. There is exactly one such exception, the availability
  semaphore, and it is bounded: see "Application surface".

### Contrast floors (measured, WCAG AA)

Body and small text needs 4.5:1, large text (18px bold or 24px regular and up) needs 3:1,
non text graphics need 3:1.

- `ink` over `base` 15.1, over `card` 16.3, over `tray` 13.8, over `accent-soft` 13.8.
- `ink-soft` over `base` 5.2, over `card` 5.7, over `tray` 4.8, over `accent-soft` 4.8.
- `ink-faint` over `base` 4.6, over `card` 5.0. Over `tray` it drops to 4.2, hence the rule
  above.
- `accent-ink` over `accent-soft` 5.4, over `base` 5.9, over `card` 6.4.
- `danger` over `base` 6.0, over `card` 6.4, over `danger-soft` 5.5. `ink` over
  `danger-soft` 13.9.
- `base` over `ink` 15.1 (the primary button).
- White over `accent-ink` 6.5 (the today pill). White over `accent` is only 3.8, which is
  why text on a raw accent fill is banned and only graphics are allowed there.
- `ink` over `hover` 14.3, `ink-soft` over `hover` 5.0, `ink-faint` over `hover` 4.4.
- `ok` over `base` 4.6, over `card` 5.0, over `tray` 4.2. `warn` over `base` 4.1, over
  `card` 4.4, over `tray` 3.7. Both clear the 3:1 non text floor on every surface and
  `warn` misses the 4.5 text floor, which is why the semaphore is dot only.

Recompute before changing any token value. A token change that drops a pair below its
floor is not shippable.

## Typography

One family: `--font-sans` (Plus Jakarta Sans), already loaded in `index.html`. Hierarchy
comes from weight and size, never from a second family. No serif. No italic display type.

| Level | Size | Weight | Use |
|---|---|---|---|
| Hero headline | `text-4xl` to `md:text-6xl`, leading 1.08, tracking tight | 600 | Two lines, first line `ink-faint`, second line `ink`. |
| Section headline (`lp-h2`) | `text-3xl` to `md:text-[2.6rem]`, leading 1.12 | 600 | One per section. |
| Step title | `text-2xl` to `md:text-[1.75rem]` | 600 | Timeline rows. |
| Card title (`lp-cell__title`) | `text-xl` | 600 | Bento cells. |
| Lead (`lp-lead`) | `text-base` to `md:text-lg` | 400 | Section subtext, max 25 words. |
| Body | `text-[0.95rem]` to `text-base` | 400 | Card descriptions, FAQ answers, max 62ch. |
| Meta | `text-xs` to `text-sm` | 500 to 600 | Labels, day names, footer. |

Never use `uppercase` with wide `tracking` as a section label. Categorisation comes from
position on the page, or from a pill badge.

## Rhythm

- Container: `lp-container`, max width 1120px, padding 20px mobile and 32px from `md`.
  The nav pill is narrower on purpose (1080px) so it reads as floating.
- Vertical: `lp-section` is `py-20` mobile and `py-28` desktop. Inside a section, header to
  content is `mt-12` mobile and `mt-16` desktop. Do not add ad hoc section padding.
- Radii, outer larger than inner, no exceptions:
  interactive elements are full pills, tray and the CTA panel 34px, card, media frame and
  mobile nav panel 20px, icon tile, text input and inline alert 14px, checkbox 5px.
  Text inputs are the one interactive exception to the pill rule: a full pill on a text
  field reads as a search box.
- Shadows are warm and low contrast, tinted with the ink hue at 4 to 10 percent alpha, and
  only on elements that genuinely float: the nav pill, framed captures, the meal card, the
  mobile nav panel. Bento cells use a hairline border and a 2px hover lift instead.
- Borders: `lp-line` for elements on `base`, or the ink at 6 percent for cards inside a
  tray so the edge reads softer against the tray.

## Component patterns

**Floating glass nav** (`lp-nav`, `lp-nav__pill`). Fixed, detached 14px from the top edge,
60px tall, max 1080px, full pill. Background is the base colour at 72 percent with an 18px
blur and 150 percent saturation, a 1px ink border at 8 percent, and a soft drop shadow.
Logo left, links centred, actions right. Below `md` it collapses to logo plus burger, and
the links plus both CTAs move into a 20px radius panel underneath. Glass is used here and
nowhere else on the page. There is a solid fallback under
`prefers-reduced-transparency: reduce`.

**Hero** (`lp-hero`). Centred stack, max 4 text elements: badge, two line headline, subtext
of at most 20 words, one primary plus one secondary CTA. Top padding is capped at 96px.
The background carries a single near flat radial glow of accent at 11 percent, whose only
job is to give the glass nav something to blur at scroll position 0. It must never read as
a feature gradient. The product capture sits below in `lp-frame`, square bottom corners,
no bottom border, clipped at 40vh mobile and 56vh desktop so it is cut by the fold.

**Bento tray** (`lp-tray` wrapping `lp-bento`). Tray in the tray colour with 12 to 20px of
padding, holding 20px radius cards. Two columns from `md`, one below. Cell count equals
item count, never leave an empty cell. Give the grid rhythm by mixing widths, for example
wide, half, half, wide. At least half the cells carry real visual variation: a product
capture, chips, a checklist, or the tinted background.

**Card with icon tile** (`lp-cell`, `lp-tile`). 48px tile, 14px radius, accent soft
background with an accent ink glyph, then title, then description. On a tinted cell the
tile switches to the card colour (`lp-tile--plain`) so it stays legible.

**CTA pair** (`lp-btn`). Always a filled primary plus an outlined secondary, both full
pills, `whitespace-nowrap`, labels of at most 3 words. Primary is ink on base with a
forward arrow, secondary is ink on card with a hairline border. Hover lifts 1px, active
scales to 0.98. One label per intent across the whole page: signup is always the same
string, login is always the same string.

**Badge pill** (`lp-badge`). Card background, hairline border, a 28px round accent soft
tile on the left, sentence case label. This is the only allowed section eyebrow, and at
most one per three sections.

**FAQ accordion** (`lp-faq`). Native `<details>` and `<summary>` inside a tray, no
JavaScript state. The marker is hidden and replaced by a round `+` that rotates 45 degrees
when open.

**Product capture slot**. Two frames: `lp-frame` for the hero (fold cut, square bottom
corners) and `lp-shot` for in section captures (fully rounded, bordered, soft shadow).
Both take a swappable placeholder from `apps/frontend/public/`. Always set `width` and
`height` attributes to reserve space, `fetchpriority="high"` for the hero image and
`loading="lazy"` for the rest, and write a real Spanish `alt` describing the screen.

**Auth split** (`lp-auth`). Public surface, same tokens and same light only rule. A 64px
micro bar replaces the pill nav: back link left, brand centred, help link right, with a
hairline under it. Below that a two column split: the form column is centred with a 400px
maximum, the right panel carries the product capture floating and cropped by the panel
edge (`lp-auth__shot`, offset from the left, 128 percent wide). From `lg` down the panel
disappears and the form becomes a single centred column. Form order is title, subtitle,
fields, error alert, full width solid submit, an "o" divider, the single Google button,
then the cross link to the other form.

**Form fields** (`lp-field`, `lp-label`, `auth-input`). Label always above the input, never
placeholder as label, even when the reference does it. Input is card background, hairline
border, 14px radius, with an accent border plus a soft accent ring on focus. Error text
sits below the input in `lp-danger`. The inline alert is `lp-danger-soft` with ink text
and a danger coloured icon.

## Motion

One recipe, implemented in `landing/scroll-reveal.directive.ts` plus the `.lp-reveal`
rules in `styles.css`. No animation libraries, ever.

- The directive adds `.lp-reveal` in the constructor, before first paint, so nothing
  flashes in and back out.
- An `IntersectionObserver` at threshold 0.15 adds `.is-in` once, then disconnects. It also
  disconnects through `DestroyRef`.
- The transition is opacity plus `translateY(10px)` to zero, 600ms on
  `cubic-bezier(0.16, 1, 0.3, 1)`, and it runs once. No reverse on scroll up.
- Stagger comes from `[appRevealIndex]`, which writes `--lp-reveal-delay` as index times
  120ms. Restart the index at 0 for each group.
- Under `prefers-reduced-motion: reduce` the directive skips entirely and the CSS forces
  the final state, so content is visible from first paint. Both paths are unconditional.
- `window.addEventListener('scroll')` is banned. Use `IntersectionObserver`.
- Everything else is limited to hover and active feedback plus the FAQ marker rotation.

## Images

- Product areas use a swappable placeholder file in `apps/frontend/public/`, never a
  hand built fake UI made of divs.
- Adding a product area means adding a placeholder file. Do not point at an asset that
  does not exist.
- Decorative imagery may only come from Picsum seeds, and only where an arbitrary subject
  cannot mislead. In practice this almost never holds on this product, see anti patterns.
- Food stock photography is banned outright.
- Icons come from Material Symbols, already loaded project wide. One family, no hand
  drawn SVG paths. This deviates from the generic taste skill, which prefers Phosphor, and
  the deviation is deliberate: reuse the installed system instead of adding a dependency.
- One exception to the no inline SVG rule: the Google brand mark on the OAuth button,
  inlined in `auth-shell.component.html` because Google requires its own logo and a
  CDN request would fail offline. Do not add a second inline SVG without the same kind of
  reason.

## Anti patterns

What this design deliberately does not do:

- No feature gradient. The only gradient on the page is the near flat hero glow.
- No glass outside the nav pill.
- No dark mode anywhere. `lp-*` are defined on `:root` with no dark override, and no
  `dark:` variant appears in `landing/`, `auth/` or `shell/`. The old dark app theme was
  removed on purpose; a dark variant, if it ever ships, is a variant of these tokens.
- No purple or blue SaaS gradient, no neon, no outer glows.
- No three column equal icon card rows, no emoji as iconography.
- No recognisable but irrelevant photography. A seeded Picsum texture was tried behind the
  final CTA and removed: the seed returned the Statue of Liberty, which is worse than no
  image on a meal planner.
- No uppercase wide tracking eyebrows, no numbered section labels, no scroll cues, no
  version stamps, no locale or weather strips, no decorative status dots.
- No em dash or en dash anywhere in user facing copy. Use a hyphen, a comma, or two
  sentences. This holds for Spanish copy too.
- No accent coloured primary button. The primary CTA is ink.
- No repeated layout family. Each section uses a different one. The landing currently runs
  ten: glass pill nav, centred hero with fold cut media, hairline value band, bento tray,
  horizontal scroll snap rail, asymmetric split, vertical timeline, accordion stack,
  centred tinted panel, footer grid.
- No `h-screen`. Use `min-h-[100dvh]` or explicit padding.
- No utility class fighting an `lp-*` class. Classes defined here are unlayered and beat
  Tailwind utilities, so `hidden` or `px-5` on an `lp-btn` silently loses. Add a modifier
  class written as plain CSS instead, as `lp-nav__cta` does.

## Copy rules

All user facing copy is Spanish, code and comments English. Sentence case for headlines.
Concrete verbs, no filler ("Elevate", "Seamless"). Numbers only when they come from the
product or the brief, never invented precision.

## Maintenance

Any new design decision taken in a future session gets added to this file in the same
commit that implements it. That includes new tokens, new component classes, a changed
radius or spacing rule, a new motion behaviour, and rejected options with the reason they
were rejected. A commit that changes the visual language without updating this file is
incomplete.

## Application surface

The authenticated shell (`apps/frontend/src/app/shell/`) runs on this same family. It is
denser than the landing, so it adds roles and components, but it never adds a second
palette, a second font or a dark variant. `VISUAL_DENSITY` rises from 3 to about 6 inside
`/app`: tighter padding, more elements per screen, but the same radii and the same type
scale.

### Tokens the app added

Three, all listed in the token table above: `lp-hover`, `lp-ok`, `lp-warn`.

`lp-hover` exists because the landing only ever needed `base` then `tray` then `card`,
while a control on a card needs a hover fill that is not a full surface step.

`lp-ok` and `lp-warn` are the documented exception to the one accent rule. The reason: the
availability semaphore encodes three ordered states and the accent alone cannot carry
order. The exception is bounded by three rules:

- The semaphore is a **dot only**. `lp-ok` and `lp-warn` never colour text, never fill a
  surface, never colour a border. `lp-warn` measures 4.1 over `base`, below the small text
  floor, so text next to it stays `lp-ink-soft`.
- Every dot is paired with a label or a `title`, so colour is never the only signal.
- The fourth state, `none` (a recipe with no linked ingredients), is `lp-line`, not a
  fourth colour.

Class shape: `.lp-dot` plus one of `--ok`, `--warn`, `--danger`, `--none`. The mapping
functions (`dotClass` in `weekly-calendar.types.ts` and `recipes.types.ts`) return complete
class literals, never concatenated fragments, because Tailwind only sees whole names.

### Navigation

Two shapes, one component (`shell/shell-nav/`). No screen knows how navigation works; the
layout renders `<app-shell-nav />` and nothing else does.

**From `md` up: the pill** (`lp-shell-nav`, `lp-shell-nav__pill`). Same 60px glass pill as
the landing nav, same blur, same reduced transparency fallback. Differences: the four
destinations are centred as pills rather than plain links, the active one gets an
`accent-soft` fill with `accent-ink` label, and the right slot is the account avatar
instead of two CTAs. It is fixed, and `.lp-app__main` reserves `92px` of top padding so it
never overlaps anything interactive.

**Below `md`: a 56px mini header plus a bottom tab bar** (`lp-shell-topbar`, `lp-tabbar`).
The header carries only the brand and the avatar. The tab bar carries the same four
destinations as icon plus label, the active one in `accent-ink` with a filled icon.
`.lp-app__main` reserves `96px` at the bottom, and the bar respects
`env(safe-area-inset-bottom)`. **There is no burger on any breakpoint.** A four
destination app does not need a drawer, and a burger would hide the whole product.

**The account menu** (`lp-avatar`, `lp-menu`) is the only dropdown in the shell. It holds
what used to live in the sidebar foot: name and email, the settings section, and logout. It
closes on outside click and on `Escape`. The same markup is rendered inside the pill and
inside the mobile header; only one is ever visible.

### The weekly matrix

Anatomy, top to bottom (`shell/dashboard/components/calendar-grid.component.*`):

- One 34px radius `card` panel, the largest radius in the app, because it is the largest
  object on the screen.
- A CSS grid of `6.5rem repeat(7, 1fr)`: a row label column plus seven day columns.
- A day header row of full pills. Today's pill is `accent-soft` with `accent-ink`.
- Three to five slot rows, one per active meal type, in the fixed chronological order of
  the enum. Never a row per day, never a scrollable body.
- Filled cell (`lp-meal`): `tray` fill, 16px radius, recipe name clamped to two lines, then
  the availability dot. It floats 2px on hover and reveals a remove button.
- Empty cell (`lp-empty`): a dashed `lp-line` border and a centred `+`. On hover it turns
  into an accent affordance.
- Today's column gets a 4 percent accent wash behind every cell, and the filled cells in it
  take an accent border.

**Cell height is computed, not fixed.** The whole matrix has to sit above the fold on a
900px viewport with five rows, so `.lp-matrix` sets
`--lp-slot-h: clamp(56px, calc((100vh - 470px) / var(--lp-rows)), 116px)` and the component
writes `--lp-rows`. Adding a row shortens every cell instead of adding a scrollbar. If a
future change makes the matrix taller, adjust the `470px` chrome allowance, do not add
`overflow`.

Reassignment is native HTML5 drag and drop between cells. Dropping on an occupied cell
swaps the two meals, dropping on an empty one moves. Both are optimistic with snapshot
rollback. The drop target is marked by `.lp-slot--over`, which turns the target's border
dashed and accent. No drag and drop library.

### Mobile: the day view

Below `md` the matrix is replaced, not squeezed (`day-view.component.*`): a horizontal day
selector of seven round pills (today in `accent-ink`, the selected one filled with
`accent-soft`), the long date in sentence case, and the active slots of that day stacked as
`tray` cards. Drag and drop does not apply on touch, so each card carries its own reassign,
remove and open actions.

Rules for the shell below `md`: no horizontal scrolling of primary content, no data table
squeezed into a phone, and no interaction that needs a pointer without a tap equivalent.

### Dashboard module

A row of three `lp-module` cards under the matrix: 20px radius, `card` fill, hairline
border, title, one line of subtext, a short list, and a single action pinned to the bottom
with `lp-module__foot` so the three cards line up. At most three list rows plus a
"+ N más" line. The action is a full width `lp-btn`, solid for the primary module and
outlined for the rest, so a row of three never shows three solid buttons.

With five meal rows the module row can fall below the fold. That is correct: the matrix is
the screen's job and the modules are secondary.

### Page chrome

Every shell screen opens with `lp-page-head` inside `lp-container`: title in
`lp-page-title`, one line of context in `lp-page-sub`, and at most one action on the right.
No full bleed coloured header bands, no border under the title. The week control
(`lp-week-nav`) is a segmented pill of previous, "Hoy", next, and "Hoy" is disabled when
the current week is already shown.

Other primitives the app uses: `lp-panel` (a plain card container), `lp-icon-btn` (round
36px icon button, with a `--danger` variant), `lp-btn--sm`, `lp-app-alert` (inline error on
`danger-soft`), `lp-skel` (the only loading shimmer; it pulses opacity and stops under
reduced motion), `lp-modal` plus `lp-modal-backdrop`, and `lp-pick` for the recipe picker.

### Motion in the app

Same recipe as the landing and the same directive, now at
`apps/frontend/src/app/shared/scroll-reveal.directive.ts` because both families use it.
The matrix staggers by row index, not by cell, so a full week never runs 35 delays. The
modules stagger 0, 1, 2. Everything else is hover and active feedback plus the drag state.
No animation library, and `prefers-reduced-motion` disables the reveal, the cell lift, the
picker lift and the skeleton pulse.

### Meal slot settings

The rows of the matrix are the user's `activeMealTypes`, stored on the profile
(`PATCH /api/users/me/settings`, minimum 3, maximum 5, default breakfast, lunch, dinner).
They are edited from the account menu and nowhere else.

Turning a slot off never deletes meals. If the hidden slot still holds meals in the visible
week, its row comes back and the page says so in one sentence. Hiding data the user
created is worse than an extra row.

### Pitfalls found while building this

- **Class names are one global namespace.** `.lp-cell` already meant "bento cell" on the
  landing, so the matrix cell had to be renamed `.lp-slot`. Grep `styles.css` before
  claiming a new `lp-` name.
- **`lp-*` classes are unlayered and beat Tailwind utilities.** `lg:hidden` on an element
  that also carries `.lp-dot` loses, because `.lp-dot` sets `display` outright. Same trap
  the landing hit with `.lp-btn`. Write a modifier class instead of fighting it.
- **`[class]="expr"` replaces the whole class attribute in Angular.** Static classes on the
  same element are silently dropped. Put everything in the expression or use `[class.x]`.
