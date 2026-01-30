// components/HeaderClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession, signOut } from "aws-amplify/auth";

function isAdminFromGroups(groups: unknown): boolean {
  if (!Array.isArray(groups)) return false;
  return groups.includes("Admin");
}

export default function HeaderClient() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  async function refresh() {
    try {
      const session = await fetchAuthSession();
      const groups =
        (session.tokens?.idToken?.payload?.["cognito:groups"] as unknown) ?? [];
      setIsAuthed(!!session.tokens?.idToken);
      setIsAdmin(isAdminFromGroups(groups));
    } catch {
      setIsAuthed(false);
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    refresh();

    const unsub = Hub.listen("auth", () => {
      refresh();
    });

    return () => unsub();
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10,10,12,0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/hammys-logo.png" alt="Hammy's Trading" width={34} height={34} />
          <span style={{ fontWeight: 800, letterSpacing: 0.2 }}>Hammy’s Trading</span>
        </Link>

        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href="/inventory">Inventory</Link>

          {isAdmin ? <Link href="/admin">Admin</Link> : null}

          {!isAuthed ? (
            <Link
              href="/signin"
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              Sign in
            </Link>
          ) : (
            <button
              onClick={() => signOut()}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
