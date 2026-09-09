---
name: "PrepRoom"
description: "Focused practice for AI and peer mock interviews."
colors:
  porcelain: "#f4f6f8"
  ink: "#11151b"
  white: "#ffffff"
  cobalt: "#2141d8"
  steel: "#dde3ea"
  mist: "#e9edf2"
  slate: "#596273"
  cobalt-wash: "#dfe6ff"
  deep-cobalt: "#16349f"
  divider: "#cbd2dc"
  input-stroke: "#aeb8c6"
  danger: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "clamp(3rem, 5.6vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  button:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  code:
    fontFamily: "JetBrains Mono Variable, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.05em"
rounded:
  base: "0"
  sm: "0"
  md: "0"
  lg: "0"
  xl: "0"
spacing:
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  "14": "3.5rem"
  "16": "4rem"
  "20": "5rem"
  "24": "6rem"
  "28": "7rem"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.base}"
    padding: "0 1.25rem"
    height: "3rem"
  button-outline:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.cobalt}"
    typography: "{typography.button}"
    rounded: "{rounded.base}"
    padding: "0 1.25rem"
    height: "3rem"
  input-room-code:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.base}"
    padding: "0 1rem"
    height: "3rem"
  proof-item:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "2rem 1.25rem"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.base}"
    padding: "1.5rem"
---

# Design System: PrepRoom

## Overview

**Creative North Star: "The Quiet Practice Desk"**

PrepRoom is a focused practice surface for software-engineering candidates. It feels like a clear desk before a rehearsal: plenty of white space, one strong sentence, and only the controls needed to choose a practice path. The landing page has no product header and no decorative fake session. Its first screen is the promise, two equal actions, and a proof row.

Near-black display type gives the statement weight. Manrope keeps supporting copy and controls readable. Cobalt is reserved for movement and emphasis, while cool grey rules keep the page organized. The proof row uses thin line icons and short, outcome-led copy instead of feature tiles or unsupported claims.

The documented light theme is the visual authority for the landing surface. Shared controls keep the same restrained geometry on sign-in, interview setup, and room entry routes, while those routes retain their existing behavior.

**Key Characteristics:**

- Headerless centered first view with one action pair.
- Cool porcelain canvas, white content frame, and high-contrast ink type.
- Archivo display, Manrope body copy, and JetBrains Mono for room codes.
- Cobalt action color, grey dividers, and a pale cobalt hover surface.
- Flat proof strip with line icons and no synthetic interview timeline.

## Colors

The palette keeps the page quiet and lets one cobalt accent carry action, focus, and product proof.

### Primary

- **Cobalt action** (`colors.cobalt`): Start the AI interview, outline the peer-room action, draw proof icons, and show keyboard focus.

### Secondary

- **Steel fill** (`colors.steel`): A cool supporting fill for shared secondary controls outside the landing action pair.
- **Cobalt wash** (`colors.cobalt-wash`): A light hover and selected-state surface that keeps the accent legible without filling the page.

### Tertiary

- **Validation red** (`colors.danger`): Error copy and invalid field states only. It is not a decorative accent.

### Neutral

- **Porcelain** (`colors.porcelain`): The outer page ground and default control background.
- **White** (`colors.white`): The centered landing frame and proof-item fill.
- **Ink** (`colors.ink`): Display type, body text, and structural contrast.
- **Slate copy** (`colors.slate`): Supporting copy that should recede from the main statement.
- **Mist** (`colors.mist`): Muted supporting surfaces in shared controls.
- **Divider grey** (`colors.divider`): One-pixel rules between the frame, proof items, and footer.
- **Input stroke** (`colors.input-stroke`): The default field border before focus.
- **Deep cobalt** (`colors.deep-cobalt`): Text on pale cobalt surfaces when a stronger contrast treatment is needed.

**The Cobalt Rarity Rule.** Keep large surfaces neutral. Cobalt carries movement, focus, and clear proof, so it stays easy to find.

## Typography

**Display Font:** Archivo Variable with a sans-serif fallback

**Body Font:** Manrope Variable with a sans-serif fallback

**Label/Mono Font:** JetBrains Mono Variable with a monospace fallback

**Character:** Archivo makes the promise direct and compact. Manrope handles the explanation and controls without competing with it. JetBrains Mono is reserved for room-code input and other short machine-like labels.

### Hierarchy

- **Display** (600, `clamp(3rem, 5.6vw, 6rem)`, 0.92 line-height): The centered landing statement. Keep it tight, high-contrast, and no wider than the implemented 19-character measure.
- **Title** (600, 1.25rem, 1.4 line-height): Proof-item headings and compact section labels, with a slight negative tracking.
- **Body** (400, 1rem, 1.5 line-height): Explanatory copy and supporting text. The hero paragraph loosens to a 1.75rem line-height for comfortable reading at its wider measure.
- **Button** (500, 1rem, 1.5 line-height): Action labels with sentence case and a right-aligned arrow when the action advances into a flow.
- **Label** (400, 0.875rem, 0.05em letter-spacing, uppercase): Room-code input and short code-like values only.

**The Two-Voice Rule.** Archivo states the promise and proof headings. Manrope explains and handles controls. JetBrains Mono records codes. Do not swap these jobs for variety.

## Layout

The landing page is a full-height composition centered in a frame with a maximum width of 100rem and one-pixel side borders. The hero centers its statement, supporting paragraph, and one action pair. Its minimum height grows from 34rem on small screens to 42rem on large screens, with top and bottom padding that increases at the same breakpoints.

The statement measures at 19 characters, the supporting paragraph at 48 characters, and the action group at 29rem. Below 640px the two actions stack. From 640px they become equal columns. The proof strip starts with a top rule. Its items stack as readable rows on small screens, then become three equal columns from 1024px with one-pixel vertical dividers. The centered footer sits after the proof strip and has no action of its own.

Use the existing reading order at every width: statement, explanation, AI action, peer-room action, proof items, then the quiet footer. Do not introduce horizontal overflow or a second action section below the proof.

**The One Pair Rule.** On the landing page, the only action pair sits below the statement. Proof explains what a session gives the candidate; it never grows another call to action.

## Elevation & Depth

The landing surface is flat. Depth comes from the white frame against the porcelain page ground, one-pixel grey dividers, and a restrained hover wash. There are no shadows, gradients, glass effects, or floating panels. Focus uses a visible cobalt ring so keyboard state remains clear without adding elevation.

Shared button and input transitions change color, border, and active position over the component's short default transition. The page itself has no decorative entrance animation.

**The Flat Surface Rule.** Keep the landing page at rest without shadows. Use tonal contrast, rules, and focus state to create hierarchy.

## Shapes

Controls and shared cards use the same square corner. Buttons and fields are 3rem high on the landing action row, with one-pixel borders and generous horizontal padding. The proof strip stays rectangular and open, using dividers instead of card shells. Icons are quiet line drawings rather than filled badges or decorative illustrations.

The frame, proof rows, and footer align to the same vertical rules. Avoid extra pills, detached circles, or ornamental clipping. The only shape that changes state is the focus ring around an actionable element.

## Components

### Buttons

Buttons are calm, direct controls. The filled action moves forward; the outlined action offers the peer path at the same size and visual rank.

- **Shape:** 3rem height, square corners, one-pixel border, and 1.25rem horizontal padding on the landing pair.
- **Primary:** Cobalt fill with white text. The AI action centers its label and places a right arrow after it.
- **Outline:** Porcelain fill with cobalt text and border. The peer-room action uses the same width and height as the primary action.
- **Hover / Focus:** The filled action shifts to a lighter cobalt treatment. The outline action shifts to the pale cobalt wash. Both expose a three-pixel cobalt focus ring with a three-pixel offset and move down one pixel while active.
- **Disabled:** Keep the geometry and reduce opacity to 50 percent. The peer create action changes its label to "Creating room" while the request is in progress.

### Cards / Containers

- **Frame:** A white, centered content frame with a maximum width of 100rem and one-pixel side rules. It is a page boundary, not a floating panel.
- **Proof strip:** White flat items with one-pixel grey separators. On large screens, three items share equal width. On small screens, each item becomes a readable row.
- **Generic card:** Shared cards use a white fill, one-pixel border, square corners, and 1.5rem internal padding. The landing proof strip does not wrap its items in cards.
- **Shadow strategy:** None.

### Inputs / Fields

- **Room code:** The shared room-code field is 3rem high, white, one-pixel input-stroke border, square corners, and JetBrains Mono uppercase text. Its placeholder uses slate copy.
- **Focus:** A cobalt border and three-pixel focus ring with a three-pixel offset.
- **Error / Disabled:** Validation uses the functional red token. Disabled fields keep their geometry, mute their surface, and reduce opacity.
- **Landing behavior:** The home page hides room-code joining so the first screen contains only the two equal start actions. Joining remains available on the room-entry route.

### Navigation

The home landing page has no header, wordmark, sign-in link, or navigation chrome. This is part of its focus, not an empty slot. Other routes may use the shared quiet header for account access, but do not bring that header into the landing composition.

### Proof strip

The proof strip is the landing page's evidence layer. Each item pairs a 2rem cobalt Lucide line icon with a short Archivo heading and a compact Manrope explanation. The shipped items are Resume context, Voice or text, and Interview report. Keep the copy tied to actual PrepRoom behavior.

### Footer

The footer is a centered one-line descriptor, separated by a top rule and padded evenly. It reads "AI and peer mock interviews. Private interview material." It has no button, link, or secondary pitch.

**The Proof Must Be Real Rule.** Proof items describe shipped behavior, not a fake timeline, playhead, testimonial, benchmark, or outcome claim.

## Do's and Don'ts

### Do:

- **Do** keep the landing page headerless, centered, and quiet.
- **Do** show one equal pair of upper actions: start an AI interview or create a peer room.
- **Do** use cobalt for actions, proof icons, and keyboard focus while keeping surfaces porcelain or white.
- **Do** use thin grey dividers to separate the frame, proof strip, and footer.
- **Do** make proof copy specific to resume context, voice or text answers, and the interview report.
- **Do** preserve the existing auth, room-creation, and interview routes behind the visible actions.
- **Do** stack the hero actions and proof rows cleanly below 640px without horizontal overflow.

### Don't:

- **Don't** add a product header, duplicate CTA section, or bottom action pair to the landing page.
- **Don't** reintroduce the synthetic interview timeline, blue playhead, waveform, or fake session state as landing proof.
- **Don't** turn proof items into rounded cards, floating dashboard panels, or decorative illustrations.
- **Don't** use shadows, gradients, glass effects, noisy textures, or large colored page backgrounds.
- **Don't** make unsupported customer, benchmark, price, training-policy, or outcome claims.
- **Don't** use JetBrains Mono for long copy or cobalt as a blanket surface color.
