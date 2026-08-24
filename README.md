# PrepRoom

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LiveKit](https://img.shields.io/badge/LiveKit-realtime-111827)](https://livekit.io/)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://prepwithpeers.vercel.app)

PrepRoom is a mock-interview platform for software-engineering candidates. A candidate can practise with an AI interviewer that uses their resume and target role, or invite a peer into a private video room.

The AI interview is a five-question session. Questions adapt to the selected track, experience level, resume, previous answers, and submitted code. After the session, PrepRoom produces a question-by-question report and a downloadable PDF.

**Live app:** [prepwithpeers.vercel.app](https://prepwithpeers.vercel.app)  
**Repository:** [github.com/meetmehta0685/PrepRoom](https://github.com/meetmehta0685/PrepRoom)

## What works today

- Google sign-in through Auth.js
- Resume-guided AI interviews
- Full-stack, frontend, backend, DSA, system-design, and behavioral tracks
- Entry, mid-level, and senior interview levels
- Adaptive follow-up questions
- Text and recorded voice answers
- Groq Whisper transcription for recordings
- Monaco coding questions in JavaScript, TypeScript, Python, Java, and C++
- Plain-text code editor fallback for assistive technology
- Peer interviews over LiveKit Cloud
- One active LiveKit meeting per signed-in account
- Neon Postgres persistence through Prisma
- Detailed interview reports with per-question scoring
- Candidate answer and benchmark-answer comparison
- PDF report downloads restricted to the report owner
- Curated fallback questions and baseline reports when AI is unavailable

## How an AI interview works

1. The candidate signs in with Google.
2. They choose a target role, interview track, and experience level.
3. They upload a text-based PDF resume.
4. PrepRoom extracts up to 16,000 characters and creates a resume fingerprint. The original PDF is not stored.
5. The interviewer asks five questions. Technical tracks include a coding question when appropriate.
6. The candidate answers with text, code, or a voice recording.
7. The final report scores technical depth, communication, problem solving, role fit, and resume depth.
8. Each question review preserves the exact submitted answer and adds a benchmark answer, strengths, gaps, and a stronger response approach.
9. The candidate can download the complete report as a multi-page PDF.

"Benchmark answer" means a strong reference response. It is not presented as the only valid answer to an engineering question.

## Architecture

```mermaid
flowchart LR
    Browser[Next.js client] --> App[Next.js App Router]
    App --> Auth[Auth.js and Google OAuth]
    App --> Prisma[Prisma ORM]
    Prisma --> Neon[(Neon Postgres)]
    App --> Groq[Groq chat and Whisper APIs]
    App --> LiveKit[LiveKit Cloud]
    App --> PDF[Server-side PDF generator]

    Groq --> Questions[Adaptive questions]
    Groq --> Reports[Detailed evaluation]
    LiveKit --> Peer[Peer interview rooms]
    PDF --> Download[Owner-only report download]
```

The application uses server-side route handlers for all privileged operations. Browser clients never receive the Google client secret, database URLs, Groq key, or LiveKit API secret.

## Technology

| Area | Implementation |
| --- | --- |
| Web application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui with Base UI |
| Authentication | Auth.js, Google OAuth, Prisma adapter |
| Database | Neon Postgres, Prisma 7 |
| Realtime calls | LiveKit Cloud |
| AI interviewer | Groq OpenAI-compatible chat API |
| Voice transcription | Groq Whisper `whisper-large-v3-turbo` |
| Code editor | Monaco Editor |
| Resume parsing | unpdf |
| Report export | pdf-lib with an embedded Unicode font |
| Validation | Zod |
| Deployment | Vercel |
| Tests | Node test runner through TSX |

## Requirements

- Node.js 20.9 or newer
- npm
- A Google Cloud OAuth client
- A Neon Postgres database
- A LiveKit Cloud project for peer interviews
- A Groq API key for adaptive AI scoring and voice transcription

You can run parts of the app without every external service, but the complete workflow needs all four providers.

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/meetmehta0685/PrepRoom.git
cd PrepRoom
npm install
```

### 2. Create the environment file

```bash
cp .env.example .env.local
```

Fill every value in `.env.local`:

```dotenv
# Auth.js
AUTH_SECRET="replace-with-a-long-random-string"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Neon Postgres
DATABASE_URL="postgresql://user:password@host-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"

# LiveKit Cloud
LIVEKIT_URL="wss://your-project.livekit.cloud"
LIVEKIT_API_KEY=""
LIVEKIT_API_SECRET=""

# Groq
GROQ_API_KEY=""
```

Generate `AUTH_SECRET` locally:

```bash
openssl rand -base64 32
```

Never commit `.env.local` or paste its values into an issue, screenshot, or pull request.

### 3. Configure Google OAuth

Create a Web application OAuth client in Google Cloud Console.

Use these local values:

| Setting | Value |
| --- | --- |
| Authorized JavaScript origin | `http://localhost:3000` |
| Authorized redirect URI | `http://localhost:3000/api/auth/callback/google` |

For the deployed application, add:

| Setting | Value |
| --- | --- |
| Authorized JavaScript origin | `https://prepwithpeers.vercel.app` |
| Authorized redirect URI | `https://prepwithpeers.vercel.app/api/auth/callback/google` |

Copy the OAuth client ID to `AUTH_GOOGLE_ID` and the client secret to `AUTH_GOOGLE_SECRET`. The redirect URI must match exactly, including the protocol and path.

### 4. Configure Neon

Create a Neon project and copy both connection strings:

- Put the pooled connection string in `DATABASE_URL`. The running application uses it.
- Put the direct connection string in `DIRECT_URL`. Prisma CLI commands use it when available.

Push the current schema and regenerate the Prisma client:

```bash
npm run db:push
npm run db:generate
```

`db:push` changes the configured database. Check the target connection string before running it against a shared or production database.

### 5. Configure LiveKit

Create a LiveKit Cloud project and copy its WebSocket URL, API key, and API secret into the three `LIVEKIT_*` variables.

PrepRoom uses the signed-in account ID as the LiveKit participant identity. Before issuing a token, the server checks every active room. If the identity is already connected, the API returns `409 ALREADY_IN_MEETING`.

### 6. Configure Groq

Create an API key in the Groq console and set `GROQ_API_KEY`.

PrepRoom uses Groq for:

- Adaptive interview questions
- Final answer-specific evaluation
- Voice transcription

If the key is missing or an AI request fails, the interview continues with curated questions and a baseline rubric. Voice transcription requires Groq and returns an unavailable message when the key is missing.

### 7. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Used for |
| --- | --- | --- |
| `AUTH_SECRET` | Production | Auth.js cookie and token signing |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `DATABASE_URL` | Yes | Pooled runtime database connection |
| `DIRECT_URL` | Recommended | Direct Prisma CLI connection |
| `LIVEKIT_URL` | Peer mode | LiveKit WebSocket server URL |
| `LIVEKIT_API_KEY` | Peer mode | Server-side token generation |
| `LIVEKIT_API_SECRET` | Peer mode | Server-side token signing |
| `GROQ_API_KEY` | AI features | Questions, reports, and transcription |

Development has a local Auth.js secret fallback. Production does not. Always set `AUTH_SECRET` on Vercel.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm test` | Run the test suite |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:push` | Synchronize the database with `schema.prisma` |
| `npm run db:studio` | Open Prisma Studio |

## Interview rules and limits

| Rule | Current value |
| --- | --- |
| Questions per AI interview | 5 |
| AI interviews per account in 24 hours | 10 |
| Resume file type | Text-based PDF |
| Maximum resume size | 3 MB |
| Maximum resume pages | 10 |
| Resume text sent to interview context | 16,000 characters |
| Maximum answer length | 12,000 characters |
| Maximum recording duration | 2 minutes |
| Maximum recording upload | 3.5 MB |
| LiveKit token lifetime | 2 hours |
| Simultaneous meetings per account | 1 |

Starting a different AI interview marks the candidate's other active AI interviews as abandoned. Starting the same track, level, target role, and resume resumes the matching active session.

## Data model

The Prisma schema lives in [`prisma/schema.prisma`](prisma/schema.prisma).

```mermaid
erDiagram
    User ||--o{ Account : authenticates
    User ||--o{ Session : owns
    User ||--o{ Meeting : creates
    User ||--o{ InterviewSession : practises
    Meeting o|--o| InterviewSession : supports
    InterviewSession ||--o{ InterviewMessage : contains
    InterviewSession ||--o| InterviewReport : produces
    InterviewReport ||--o{ InterviewQuestionReview : contains
```

Resume text and interview answers are private application data. The report download route checks the Auth.js session and interview ownership before generating a PDF.

## API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | Auth.js | Google sign-in and session handling |
| `/api/interviews` | `POST` | Create or resume an AI or peer interview |
| `/api/interviews/[id]/answer` | `POST` | Save an answer and get the next question or final report |
| `/api/interviews/[id]/report` | `GET` | Download an owner-only PDF report |
| `/api/interviews/transcribe` | `POST` | Transcribe a recorded answer |
| `/api/meetings` | `POST` | Create a peer room code |
| `/api/meetings/[code]` | `GET` | Resolve meeting details |
| `/api/livekit-token` | `POST` | Check presence and issue a LiveKit token |

All interview, report, meeting, and token routes require a signed-in account.

## Project structure

```text
PrepRoom/
├── prisma/
│   └── schema.prisma              # Database models and enums
├── src/
│   ├── app/
│   │   ├── api/                   # Auth, interview, report, and LiveKit routes
│   │   ├── interview/             # AI interview setup and session pages
│   │   ├── join/                  # Peer room join flow
│   │   └── room/                  # LiveKit meeting room
│   ├── components/                # Product and shadcn/ui components
│   ├── generated/prisma/          # Generated Prisma client
│   ├── lib/                       # AI, PDF, resume, audio, and database logic
│   └── auth.ts                    # Auth.js configuration
├── tests/                         # Node and integration-oriented source tests
├── .env.example                   # Environment variable template
└── package.json
```

## Testing

Run the full local verification set before pushing:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The current suite covers:

- Curated AI fallback behavior
- Coding-question scheduling
- Role and resume personalization wiring
- Resume upload requirements
- Monaco and plain-text coding paths
- Voice recording format selection
- Groq transcription integration wiring
- Single-meeting LiveKit presence checks
- Detailed PDF contents, page generation, and accented text

## Deployment

The production project runs on Vercel and deploys from `main`.

1. Import the GitHub repository into Vercel.
2. Add every variable from `.env.example` to the Production environment.
3. Confirm `DATABASE_URL` uses the Neon pooled connection.
4. Add the production Google OAuth origin and callback URI shown above.
5. Deploy.

`postinstall` runs `prisma generate`, so Vercel creates the Prisma client during installation. Schema changes still need `npm run db:push` or a migration workflow against the intended database before the new deployment handles requests.

## Security and privacy notes

- Secrets stay in server-side environment variables.
- Route handlers check authentication before reading or writing interview data.
- Report downloads verify interview ownership.
- Resume files must have a PDF signature and readable text.
- The parser limits file size, page count, and extracted text length.
- Resume content is treated as untrusted data in AI prompts. Instructions inside a resume are ignored.
- The original resume file is not retained. Extracted text is stored with the interview session.
- Voice uploads are limited by MIME type, duration, and byte size.
- LiveKit participant identity comes from the authenticated account, not a client-supplied ID.
- Untrusted code is not executed by the Next.js server. The editor submits code for AI review only.

For a public production launch, add retention controls for stored resume text and interview answers, rate limiting at the edge, structured audit logging, and a documented deletion workflow.

## Known limitations

- Code receives AI review but does not run in an isolated sandbox.
- Voice transcription currently requests English output.
- Peer interviews do not yet produce an automatic AI report.
- AI fallback scoring is a broad practice rubric, not a model-based evaluation.
- Reports created before question-by-question reviews were added remain summary-only.
- `prisma db push` is convenient during development. A team deployment should use checked-in Prisma migrations.

## Roadmap

- Isolated code execution with resource and network limits
- Peer-interview notes and post-call reports
- Interview history and progress charts
- Resume and interview-data deletion controls
- Configurable interview length and time limits
- More transcription languages
- Recruiter-style rubrics by company and role
- Automated browser tests for the full signed-in workflow

## Contributing

1. Create a branch from `main`.
2. Keep secrets out of the repository.
3. Add or update tests with behavior changes.
4. Run the full verification set.
5. Open a pull request that explains the user-visible change and any database impact.

## License

This repository does not currently include an open-source license. Contact the repository owner before copying, redistributing, or using the code outside this project.
