# PrepRoom product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

PrepRoom is for software-engineering candidates preparing for job interviews. A candidate can practise alone with an AI interviewer or invite a peer interviewer into a live session.

## Product purpose

PrepRoom runs realistic mock interviews and gives candidates concrete feedback they can use before a real interview. AI interviews should test the candidate's own experience, target role, technical judgment, communication, and coding ability.

## Positioning

The AI interviewer uses the candidate's resume, target role, interview track, experience level, previous answers, and submitted code to decide what to ask next. The interview is not a fixed quiz.

## Operating context

Candidates sign in with Google, configure an interview, upload a resume for AI interviews, answer by voice or text, and receive an interview report. Coding questions use an embedded multi-language editor. Peer interviews use a shared LiveKit room.

## Capabilities and constraints

- AI interviews require a PDF resume.
- PrepRoom extracts private text from the PDF for interview context. It does not need to retain the original file after extraction.
- AI questions adapt to the resume, selected target role, interview track, experience level, previous answers, and remaining interview time.
- Coding questions support multiple programming languages in one editor.
- The initial coding workspace submits code for AI assessment. Executing untrusted code requires a separate isolated runner and remains an open infrastructure decision.
- A candidate can join only one meeting at a time.
- AI interviews have bounded usage to protect free service limits.

## Brand commitments

The product name is PrepRoom. Product language uses the terms interview session, candidate, interviewer type, peer interviewer, interview track, and interview report as defined in `CONTEXT.md`.

## Evidence on hand

The repository contains working Google authentication, Neon persistence, LiveKit peer rooms, Groq-powered AI questions and reports, voice transcription, and the existing PrepRoom visual system. There are no testimonials, customer claims, or performance benchmarks to present.

## Product principles

- Ask questions about the candidate, not a generic question bank.
- Make each interview visibly match the selected role and track.
- Treat resumes and answers as private interview material.
- Prefer realistic practice over gamified trivia.
- Keep unsafe code execution outside the web application process.

## Accessibility & inclusion

Candidates can answer by voice or text. Controls must remain keyboard accessible, and the coding workspace needs a plain-text fallback for assistive technology.
