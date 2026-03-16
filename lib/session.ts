// Client-side session ID — persisted in localStorage
// Used for rate limiting + per-user dashboard isolation

const SESSION_KEY = "leadlens_session_id";

function generateId(): string {
  return crypto.randomUUID();
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
