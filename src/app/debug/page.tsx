"use client";

import { useState } from "react";
import { auth } from "@/lib/firebaseClient";

export default function DebugPage() {
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const check = async () => {
    setErr(null);
    setOut(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setErr("Not logged in.");
        return;
      }
      const token = await user.getIdTokenResult(true);
      setOut({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        claims: token.claims,
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to check claims.");
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Debug Claims</h1>
      <button onClick={check} style={{ padding: 10, marginTop: 10 }}>
        Check my claims
      </button>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {out && <pre style={{ marginTop: 16 }}>{JSON.stringify(out, null, 2)}</pre>}
    </main>
  );
}
