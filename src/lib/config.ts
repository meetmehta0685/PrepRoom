export const hasGoogleAuth = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const hasLiveKit = Boolean(
  process.env.LIVEKIT_URL &&
    process.env.LIVEKIT_API_KEY &&
    process.env.LIVEKIT_API_SECRET,
);

export const hasGroq = Boolean(process.env.GROQ_API_KEY);
