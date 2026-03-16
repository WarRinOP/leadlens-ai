// Client-side session ID + remaining count — persisted in localStorage
// Used for rate limiting + per-user dashboard isolation

const SESSION_KEY = "leadlens_session_id";
const REMAINING_KEY = "leadlens_remaining";
const MAX_ANALYSES = 5;

function generateId(): string {
  return crypto.randomUUID();
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(SESSION_KEY, id);
    // Fresh session — reset remaining
    localStorage.setItem(REMAINING_KEY, String(MAX_ANALYSES));
  }
  return id;
}

export function getStoredRemaining(): number {
  if (typeof window === "undefined") return MAX_ANALYSES;
  const stored = localStorage.getItem(REMAINING_KEY);
  if (stored === null) return MAX_ANALYSES;
  return parseInt(stored, 10);
}

export function setStoredRemaining(count: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMAINING_KEY, String(count));
}
