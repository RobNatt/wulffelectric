# Wulff Electric: homepage concept (handoff)

Client: **Wulff Electric**, an electrical contractor in Omaha / Metro. Agency: N-Tech Digital Solutions (Rob Nattrass).
Status: approved visual concept. This folder is a working static prototype: plain HTML/CSS/JS, no build step.
Your job: turn it into the production site (stack is Rob's call; ask if it isn't stated), keeping the design decisions below unless Rob says otherwise.

## Run it
```
npx serve .        # or: python3 -m http.server 8080
```
Open over http(s), not file://, so the video and fonts load.

## Files
| Path | What it is |
|---|---|
| `index.html` | All markup: concept bar, hero, From Ground to Power, close, footer |
| `styles.css` | Design tokens at top of file, then sections in page order |
| `main.js` | Hero load sequence, video playback, loop-synced trace glow, Ground to Power scroll staging |
| `assets/hero.webm` | Hero loop, VP9, 1920w, ~1.2 MB (primary) |
| `assets/hero.mp4` | Hero loop, H.264, 1920w, ~2.7 MB (fallback, Safari/older) |
| `assets/hero-poster.jpg` | First frame of the loop, 2400w (poster + reduced-motion still) |
| `assets/source-hero-2944.webm` | Original client-approved render, 2944×1248, 15.9s. Re-encode from this, never from the 1920 copies |

## Creative direction (from the brief)
- Core idea **"Built to Handle It."** One contractor, every electrical scope. The jobsite is the hero, not electricity.
- Hero composition: jobsite on the left, dark negative space on the right for huge editorial type.
- Load sequence: site appears → small logo → thin blueprint lines trace service → distribution → conduit → lighting → headline → scope line.
- Section after hero: **FROM GROUND / TO POWER**, 4 stages: 01 Ground (service, trenching) · 02 Distribution (panels, wiring) · 03 Installation (conduit, equipment) · 04 Finish (lighting, controls). The visual moves from raw construction to a finished building as you scroll.

## Design tokens (keep these)
- Colors: Carbon `#0A0B0B`, Iron `#24282A`, Concrete `#737777`, Bone `#E8E6DE`, Safety Amber `#D98A32`, Signal White `#F5F4EF`. Derived: `--amber-ink #A9661C` (amber for lines/text on Bone, which needs more contrast), `--iron-ink #3A3F41`.
- Amber should read as **construction safety lighting, not neon electricity**. No glows beyond the trace lines, no electric blue, no lightning bolts.
- Type: **Archivo** variable (display; heavy 860, condensed `wdth` 70–80, uppercase, tight leading ~.84), **Geist** (body), **IBM Plex Mono** (all metadata/labels, uppercase, letter-spacing .12–.16em). Loaded from Google Fonts. Self-host in production.

## Decisions already made (and why)
1. **The hero video loops in full, ping-pong as delivered.** Rob explicitly chose this. Do not trim it to a play-once clip. The ground-floor switchgear room is lit for roughly the first and last ~2.4s of each 15.9s cycle. `main.js` watches `currentTime` and adds `.energized` to `#stage` during those windows, which brightens the service/distribution trace (`.svc` elements). If the video is re-rendered, re-measure those windows.
2. **Trace overlay is pinned to the footage.** `#stage` is a box with the video's exact aspect ratio (2400:1018 = 2.3587) sized to cover the hero via container query units (`--W:max(100cqw, 100cqh*2.3587)`), cropping at most 16% off the left. The SVG uses `viewBox="0 0 1472 624"`, the same aspect, so coordinates map 1:1 to the frame. Key points in viewBox units: main switchboard ~(308–440, 445–535); level-2 panels ~(315–380, 265–320); cable tray bend ~(346,164)→(440,162)→(722,252); light fixtures at (283,287) (607,298) (788,358) (577,426) (763,450). **If you change the video framing, crop, or `object-fit`, the overlay will drift. Re-check alignment at 1440×900, 1920×1080, 2560×1080 and phone.**
3. **Operational-artifact motifs instead of contractor clichés.** The scope list is styled as a **panel schedule** (odd circuit numbers 01/03/05/07/09, like the left side of a real schedule). The trace is a **one-line diagram**. Ground to Power is an **electrical drawing sheet** (E-001, title block, "NTS" = not to scale). Keep that vocabulary for new sections, e.g. a project list styled like a permit/inspection card, not generic service cards.
4. **Dark is reserved for the hero and the close.** Ground to Power sits on Bone like a drawing sheet. Don't make the whole site dark by default.
5. **Ground to Power is one cumulative drawing, not 4 images.** Each stage adds a layer (`.l1`–`.l4`) on top of the previous ones. The current layer draws in amber-ink and earlier layers settle to Iron. The section is `380svh` tall with a sticky pin, and scroll progress maps to stages 1–4. The step buttons also scroll to their stage. On phones (≤760px) the viewBox is cropped to `50 80 1000 430` and the drawing labels are hidden.
6. **No invented facts.** The brief's sample metadata ("STATUS: IN PROGRESS", etc.) was dropped because there's no real project behind it. Everything shown is either from the brief (Omaha / Metro service area, scope list) or a **dashed amber placeholder** (`.ph`).

## Open items / TODO before launch
- [ ] Get from Wulff: phone, Nebraska electrical contractor license #, year established, address, logo files (the current wordmark is set in type as a stand-in), and real project photos/names.
- [ ] Replace every `.ph` placeholder; then delete the `.ph` styles.
- [ ] **Remove the "Design concept · Not the live site" bar** (`.concept`) only when going to production on Wulff's domain.
- [ ] Nav links currently all point to `#g2p`. Build the Commercial / Residential / Projects / Service pages (or sections) and wire them up. "Start a project" needs a real contact form with a backend (none exists yet).
- [ ] Mobile nav: links are hidden under 1100px. Add a menu button.
- [ ] Self-host fonts (Archivo variable subset with `wdth`+`wght` axes, Geist, Plex Mono) with `font-display: swap`.
- [ ] Performance: keep the poster as the LCP image (preloaded). Consider serving a ~1280w video to phones (`<source media>` or JS swap). Verify the video doesn't block LCP.
- [ ] Accessibility pass: the video is decorative (`aria-hidden`). Consider a pause control for the looping hero (WCAG 2.2.2 applies to motion over 5s). Check focus order and that the Ground to Power steps announce the current stage (`aria-current="step"`).
- [ ] SEO: title/meta description, LocalBusiness/Electrician JSON-LD once the real NAP (name, address, phone) is known.

## Behaviors to preserve when porting (e.g. to React/Next/Astro)
- `html.js` is added inline in `<head>` **before** CSS paints. Hidden initial states only apply under `.js`, so with no JS everything is visible.
- `.go` on `<html>` starts the load sequence. Each element's delay is the inline `--d` custom property. `.settled` (at 4.6s) dims the trace to 42% so it doesn't compete with the headline.
- `prefers-reduced-motion: reduce`: no autoplay (poster still only), the trace is shown complete, Ground to Power is not pinned and shows all 4 layers.
- Autoplay fallbacks: muted + playsinline + `play()` on load, on `canplay`, and on the first pointer/key/scroll/touch, plus a retry on `visibilitychange`.
- Ground to Power drawing uses `pathLength="1"` + `stroke-dasharray:1` for the draw-on. Keep `pathLength` on any new paths.
