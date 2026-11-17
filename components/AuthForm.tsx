"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { resolveReturnUrl, signIn } from "@/lib/flow";

function Form({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const returnParam = params.get("return");
  const state = params.get("state");
  const returnUrl = useMemo(() => resolveReturnUrl(returnParam), [returnParam]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!returnUrl) return;
    setError(null);
    setBusy(true);
    try {
      const target = await signIn({ mode, returnUrl, email, password, name }, state);
      setRedirecting(true);
      window.location.assign(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  // Switching between sign in and sign up keeps the return address and state.
  const otherHref = `${isRegister ? "/login" : "/register"}${params.toString() ? `?${params.toString()}` : ""}`;
  const label = "kicker mb-1.5 block";

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-0 px-5 py-10 sm:px-8 lg:grid-cols-2">
      {/* Color block with the pitch */}
      <div className="flex min-h-[18rem] flex-col justify-between border-2 border-line bg-mustard p-7 lg:border-r-0">
        <p className="kicker">{isRegister ? "New account" : "Members"}</p>
        <div>
          <h1 className="display text-[clamp(3rem,8vw,6rem)]">
            {isRegister ? "Join" : "Sign"}
            <br />
            {isRegister ? "Nexa." : "in."}
          </h1>
          <p className="mt-4 max-w-sm text-sm font-semibold">
            {isRegister
              ? "One account for your Drive, videos, calendar and mail."
              : "One account for everything in Nexa."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 border-2 border-line bg-surface p-7">
        {!returnUrl && (
          <p className="border-2 border-danger px-3 py-2 text-sm font-bold text-danger">
            This page needs to be opened from an app that asks you to sign in, so it knows where to send you afterwards.
          </p>
        )}

        {isRegister && (
          <div>
            <label className={label}>Name</label>
            <input className="input" value={name} required autoComplete="name" onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label className={label}>Email</label>
          <input className="input" type="email" value={email} required autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={label}>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            required
            minLength={isRegister ? 8 : undefined}
            autoComplete={isRegister ? "new-password" : "current-password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isRegister && <p className="mt-1.5 text-xs font-medium text-mute">At least 8 characters.</p>}
        </div>

        {error && <p className="border-2 border-danger px-3 py-2 text-sm font-bold text-danger">{error}</p>}

        <button type="submit" disabled={busy || !returnUrl} className="btn-primary w-full py-3.5">
          {redirecting ? "Taking you back…" : busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>

        {returnUrl && (
          <p className="text-xs font-medium text-mute">
            You&apos;ll be taken back to <span className="font-bold text-ink">{returnUrl.host}</span> afterwards.
          </p>
        )}

        <p className="text-sm font-medium">
          {isRegister ? "Already have an account? " : "No account yet? "}
          <Link href={otherHref} className="link">
            {isRegister ? "Sign in" : "Create one"}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  // useSearchParams needs a Suspense boundary for static prerendering.
  return (
    <Suspense fallback={null}>
      <Form mode={mode} />
    </Suspense>
  );
}
