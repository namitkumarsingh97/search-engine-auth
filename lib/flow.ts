/**
 * The sign-in handoff, from this app's side.
 *
 * 1. The main app sends the user here:  /login?return=<its /auth/callback address>&state=<random>
 * 2. The user signs in. We ask the API for a one-time code for that return address
 *    (we never receive or store a token).
 * 3. We send the user back to  <return>?code=<code>&state=<state>  and the main app exchanges the code.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DEFAULT_RETURN = process.env.NEXT_PUBLIC_DEFAULT_RETURN_URL ?? "";

/** Where the user will be sent after signing in, or null if there is no usable address. */
export function resolveReturnUrl(param: string | null): URL | null {
  for (const candidate of [param, DEFAULT_RETURN]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      // Only web addresses. (The API still checks the address against its own allowlist.)
      if (url.protocol === "http:" || url.protocol === "https:") return url;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

/**
 * Where the Nexa logo links to: the home page of the main app, taken from this app's own
 * configuration (NEXT_PUBLIC_DEFAULT_RETURN_URL), never from the ?return= in the page address,
 * so a crafted link can't turn the logo into a link to another site. Null if not configured.
 */
export function homeUrl(): string | null {
  try {
    const url = new URL(DEFAULT_RETURN);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export interface SignInInput {
  mode: "login" | "register";
  returnUrl: URL;
  email: string;
  password: string;
  name?: string;
  /** Register only: the part before @nexa.com. Left empty, the API makes one from the name. */
  handle?: string;
}

/** Signs in (or up) and resolves to the address to send the user back to, with the one-time code attached. */
export async function signIn(input: SignInInput, state: string | null): Promise<string> {
  const body: Record<string, string> = {
    email: input.email,
    password: input.password,
    redirectUri: input.returnUrl.toString(),
  };
  if (input.mode === "register") {
    body.name = input.name ?? "";
    if (input.handle?.trim()) body.handle = input.handle.trim();
  }

  const res = await fetch(`${API_URL}/auth/${input.mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`);
  if (typeof data.code !== "string") throw new Error("The server didn't return a sign-in code.");

  const target = new URL(input.returnUrl.toString());
  target.searchParams.set("code", data.code);
  if (state) target.searchParams.set("state", state);
  return target.toString();
}

/** The part after @ in Nexa addresses (display only: the API decides what is valid). */
export const MAIL_DOMAIN = process.env.NEXT_PUBLIC_MAIL_DOMAIN ?? "nexa.com";

export interface HandleCheck {
  available: boolean;
  error?: string | null;
}

/** Asks the API whether a Nexa address name is valid and free. */
export async function checkHandle(handle: string): Promise<HandleCheck> {
  const res = await fetch(`${API_URL}/auth/handle-available?handle=${encodeURIComponent(handle)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { available: false, error: data.error ?? "Couldn't check that name right now." };
  return { available: Boolean(data.available), error: data.error ?? null };
}

/** A starting suggestion for the address from someone's name: "Ada Lovelace" -> "ada.lovelace". */
export function suggestHandle(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 24);
}
