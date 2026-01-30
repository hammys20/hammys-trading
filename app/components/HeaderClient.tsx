"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

export default function HeaderClient() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  async function refresh() {
    try {
      await getCurrentUser();
      setSignedIn(true);

      const session = await fetchAuthSession();
      const groups =
        ((session.tokens?.idToken?.payload as any)?.["cognito:groups"] as string[]) ?? [];
      setIsAdmin(Array.isArray(groups) && groups.includes("Admin"));
    } catch {
      setSignedIn(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();

    const unsub = Hub.listen("auth", () => {
      refresh();
    });

    return () => {
      unsub();
    };
  }, []);

  const right = useMemo(() => {
    if (loading) return null;

    if (!signedIn) {
      return (
        <Link href="/signin" style={{ opacity: 0.9 }}>
          Sign in
        </Link>
      );
    }

    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {isAdmin ? <Link href="/admin">Admin</Link> : null}
        <button
          onClick={() => signOut()}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Sign out
        </button>
      </div>
    );
  }, [loading, signedIn, isAdmin]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 900 }}>
          Hammy’s Trading
        </Link>
        <Link href="/inventory" style={{ opacity: 0.9 }}>
          Inventory
        </Link>
      </div>

      {right}
    </div>
  );
}


