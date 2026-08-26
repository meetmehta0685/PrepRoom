---
name: "PrepRoom"
description: "A marked rehearsal run sheet for AI and peer mock interviews."
colors:
  bone-paper: "#f2efe5"
  carbon: "#151512"
  electric-blue: "#2e55ff"
  clean-white: "#ffffff"
  chartreuse-tape: "#dfff45"
  worn-paper: "#ded9cb"
  soft-paper: "#e5e0d3"
  graphite: "#4d4b44"
  danger-red: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "League Gothic Variable, sans-serif"
    fontSize: "clamp(4rem, 7.2vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.84
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "League Gothic Variable, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  cue-code:
    fontFamily: "League Gothic Variable, sans-serif"
    fontSize: "clamp(8rem, 16vw, 10rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  title:
    fontFamily: "League Gothic Variable, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono Variable, monospace"
    fontSize: "0.68rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.16em"
  note:
    fontFamily: "Newsreader Variable, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  sheet: "0.125rem"
  circle: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
  2xl: "2rem"
  3xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.electric-blue}"
    textColor: "{colors.clean-white}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "0.75rem 1.25rem"
    height: "3rem"
  button-accent:
    backgroundColor: "{colors.chartreuse-tape}"
    textColor: "{colors.carbon}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    size: "3rem"
  button-ink:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.bone-paper}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "0.75rem 1.25rem"
    height: "3rem"
  button-outline:
    backgroundColor: "{colors.bone-paper}"
    textColor: "{colors.carbon}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  input-room-code:
    backgroundColor: "{colors.bone-paper}"
    textColor: "{colors.carbon}"
    typography: "{typography.label}"
    rounded: "{rounded.sheet}"
    padding: "0.75rem 1rem"
    height: "3rem"
  cue-current:
    backgroundColor: "{colors.bone-paper}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.sheet}"
    padding: "1rem"
---

# Design System: PrepRoom

## Overview

**Creative North Star: "The Marked Rehearsal Run Sheet"**

PrepRoom's landing-page world is a stage manager's working document: bone paper, hard carbon rules, cue numbers, strips of chartreuse tape, and notes added by hand. It presents interview practice as a run to prepare, mark up, and repeat. The material should look handled and useful, never precious.

The page uses editorial scale without becoming a marketing poster. League Gothic makes the promise and cue labels immediate. Manrope carries the practical explanation. JetBrains Mono records run-sheet metadata, while Newsreader supplies the human marks. Electric blue is the clear digital intervention inside the paper world.

This world rejects the floating SaaS dashboard hero. Content belongs to one ruled sheet. AI and peer practice receive equal visual weight, and the adaptive question sequence gives the page its proof.

**Key Characteristics:**

- Bone, lightly grained paper as the continuous page ground.
- Carbon-black rules that organize content without cards or shadows.
- Electric-blue actions and chartreuse taped or marked states.
- Condensed cue type, monospaced metadata, and sparing handwritten notes.
- Square controls, registration marks, punched holes, and connected run cues.

## Colors

The palette reads like a marked production document: warm paper and carbon ink carry the structure, with one electric action color and one highlighter color.

### Primary

- **Electric Action Blue:** The digital action color. Use it for the primary start and create actions, keyboard focus, and other moments that move a candidate into a session.

### Secondary

- **Chartreuse Tape:** The marking color. Use it for tape tabs, selected cue codes, the compact mobile mode prompt, list bullets, and the peer join action.

### Neutral

- **Bone Paper:** The landing page ground and field fill. Keep the generated paper grain visible over large areas.
- **Carbon:** Body text, display type, rules, brackets, scrollbar thumbs, punched holes, and registration marks.
- **Clean White:** Text on electric-blue actions only.
- **Worn Paper:** A darker paper neutral reserved for secondary filled treatment.
- **Soft Paper:** Muted hover fills and subdued structural areas.
- **Graphite:** Supporting copy that needs less weight than carbon.
- **Danger Red:** Validation copy and invalid field states. It is functional, not a brand accent.

**The Action Ink Rule.** Electric blue starts interview sessions. Carbon ink handles account access and authentication. Chartreuse marks, selects, or joins.

## Typography

**Display Font:** League Gothic Variable with a sans-serif fallback

**Body Font:** Manrope Variable with a sans-serif fallback

**Label/Mono Font:** JetBrains Mono Variable with a monospace fallback
**Note Font:** Newsreader Variable with a serif fallback

**Character:** The type system separates the printed run sheet from the marks made on it. Condensed display type carries urgency and scale, while the body and metadata faces stay compact and legible.

### Hierarchy

- **Display** (600, fluid 4rem to 6rem, 0.84 line-height): The landing promise. Keep it tight and no wider than roughly nine characters per line.
- **Headline** (600, up to 3rem, 1 line-height): Interviewer names and other major cue headings, usually uppercase.
- **Title** (600, 1.875rem, 1 line-height): Section titles and the PrepRoom wordmark in the landing header, usually uppercase.
- **Body** (400, 1rem, 1.5 line-height): Explanations, mode details, and field guidance. Keep descriptive mode copy near 31 characters wide.
- **Label** (400, about 0.68rem, 0.16em letter-spacing): Cue metadata, codes, sequence summaries, and footer matter. Set labels in uppercase.
- **Note** (400 italic, 1rem to 1.125rem, 1.25 line-height): Human annotations and cue states. Rotate only a degree or two.

**The Type Has a Job Rule.** League Gothic announces, Manrope explains, JetBrains Mono records, and Newsreader annotates. Do not swap their roles for variety.

## Layout

The product uses one bordered sheet centered in a viewport up to 96rem wide. Thin rules divide the header, the opening promise, two interviewer cues, the five-step run, and the footer. The first desktop landing section uses a 37/63 split. The right side divides into two equal mode fields, so AI and peer practice have the same area and the same visual rank.

Desktop padding moves from 3rem at the main rails to 2rem inside each mode. The cue fields are at least 37rem tall, keeping each primary action at the bottom. The interview run remains a single five-column strip with a 62rem minimum width and scrolls horizontally when the viewport cannot hold it.

Below the medium breakpoint, a two-item mode index appears before the mode fields. Below the large breakpoint, the promise and mode area stack. The reading order stays promise, equal mode index, AI cue, peer cue, adaptive run, footer.

**The Equal Cue Rule.** AI and peer practice keep equal column width and comparable visual weight wherever the viewport can support two columns.

Operational setup screens keep the same 5rem ruled header and use a hard split instead of a floating card. AI setup places carbon candidate context beside the bone-paper form. Meeting check-in places the carbon video stage beside the device form. Both stack the context or preview before the controls on small screens.

## Elevation & Depth

The landing system uses no shadows. Paper grain, one-pixel carbon rules, inset outlines, tape texture, and physical registration marks create depth. Motion is limited to the adaptive note revealing itself as if a mark were being uncovered. Reduced-motion settings remove that reveal.

**The No Float Rule.** Every element belongs to the ruled sheet. Do not lift mode choices into soft shadow cards or detached dashboard panels.

## Shapes

The dominant geometry is square and ruled. Landing controls inherit a very small 0.125rem corner radius, which reads as square at normal size. One-pixel borders define fields and buttons. Two-pixel brackets frame large cue codes, and the active run step uses a two-pixel inset outline.

Circles are exceptions with specific jobs: punched holes, registration targets, and signed-in avatars. Tape tabs rotate slightly and handwritten notes may drift by one or two degrees, but the structural grid stays straight.

**The Square Sheet Rule.** Use square fields, actions, and containers. Reserve circles for physical marks and identity avatars.

## Components

### Buttons

- **Shape:** Nearly square corners with a one-pixel border and a 3rem landing action height.
- **Primary:** Electric-blue fill, clean-white text, medium body weight, and 1.25rem horizontal padding. The AI action spans its cue width and places an arrow at the far edge.
- **Accent:** Chartreuse fill with carbon text and border. The landing page uses the compact 3rem square version for joining a peer room.
- **Ink:** Carbon fill with bone-paper text. Use it for Google sign-in and other account-access actions, never for starting an interview session.
- **Outline:** Bone-paper fill with a carbon border. Hover moves to soft paper; the landing header uses it for sign in.
- **Hover / Focus:** Hover lowers the fill intensity or moves an outline button to soft paper. Keyboard focus draws a three-pixel electric-blue outline with a three-pixel offset. Active buttons move down one pixel. Disabled buttons keep their shape and drop to half opacity.

### Cards / Containers

- **Corner Style:** Square. Mode cues and run steps are ruled fields, not cards.
- **Background:** Bone paper with the page grain continuing through the container.
- **Shadow Strategy:** None.
- **Border:** One-pixel carbon dividers. The current run step adds a two-pixel inset carbon outline.
- **Internal Padding:** Mode cues use 1.5rem on small screens and 2rem from the small breakpoint. Run steps use 1rem.

### Inputs / Fields

- **Style:** A 3rem-high bone-paper field with a one-pixel carbon border, square corners, and monospaced uppercase room-code text.
- **Focus:** A three-pixel electric-blue outline with a three-pixel offset.
- **Error / Disabled:** Invalid fields use danger red for the message and field state. Disabled fields reduce opacity and keep the same geometry.

### Navigation

The desktop header is a 5rem-high ruled strip with the condensed uppercase PrepRoom wordmark and authentication state. On small screens, the interviewer index becomes a two-column navigation row. Each item pairs a compact monospaced code with a condensed uppercase mode name. One vertical carbon rule separates the choices.

### Candidate check-in

The sign-in route is a sibling sheet, not a copy of the landing page. Desktop uses a 47/53 split between destination context and the C01 access cue. Mobile puts C01 and the Google action first, followed by the supporting account context. Do not show database, media-service, or deployment readiness on this user-facing route.

### AI rehearsal setup

The AI setup route uses a carbon context field and a ruled bone-paper form. Interviewer and track selections use chartreuse, never solid blue panels. Electric blue appears only on the final action that starts or creates a session. The active interview keeps the question on carbon and the response workspace on paper.

### Meeting check-in and room

The device check uses a carbon video stage with square device controls and a ruled paper form. The room code is a chartreuse tape mark, and the join action is chartreuse with carbon text. The live room keeps LiveKit's functional controls but maps its theme variables to carbon, bone, and chartreuse with square corners.

### Mode cue

Each mode cue has a chartreuse tape tab, a large uppercase interviewer title, practical body copy, a bracketed alphanumeric cue code, and its action block anchored at the bottom. The AI and peer variants share the same shell; only their content and actions differ.

### Adaptive run cue

The five-step run connects context, question, candidate answer, follow-up, and report. Asked cues receive chartreuse behind their codes. The current answer has an inset carbon outline, and a lightly rotated handwritten note points from that answer toward the next question. The note reveals once and remains static when reduced motion is requested.

**The Honest State Rule.** Marks must explain state or sequence. Do not add tape, handwriting, or highlighter color where it carries no information.

## Do's and Don'ts

### Do:

- **Do** keep the landing page on one continuous bone-paper sheet with visible carbon rules.
- **Do** give AI and peer interviewer modes equal visual weight.
- **Do** use electric blue for the main session action and keyboard focus.
- **Do** use chartreuse to mark selected, current, or join-related moments.
- **Do** keep registration marks, tape, and handwriting sparse and tied to meaning.
- **Do** preserve the promise, mode index, two mode fields, adaptive run, and footer reading order on small screens.

### Don't:

- **Don't** turn the landing page into a floating SaaS dashboard hero.
- **Don't** add rounded cards, ambient shadows, glass effects, or gradient decoration to this world.
- **Don't** let one interview mode read as the default or more important choice.
- **Don't** use League Gothic for body copy or JetBrains Mono for long explanations.
- **Don't** scatter chartreuse tape or handwritten notes as empty decoration.
- **Don't** soften the carbon grid with low-contrast borders.
