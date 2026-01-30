// components/HeaderClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { usePathname } from "next/navigation";

function isAdminFromGroups(groups: unknown): boolean {
  if (!Array.isArray(groups)) return false;
  return groups.includes("Admin");
}

type NavGroup = {
  label: string;
  items: { label: string; href: string }[];
};

export default function HeaderClient() {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMenu() {
    setMobileOpen(false);
  }

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

  // Still keep this — protects you from edge cases (back/forward, etc.)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const groups: NavGroup[] = useMemo(
    () => [
      {
        label: "Shop",
        items: [
          { label: "Inventory", href: "/inventory" },
          { label: "Singles", href: "/singles" },
          { label: "Slabs", href: "/slabs" },
          { label: "Sealed", href: "/sealed" },
        ],
      },
      {
        label: "Whatnot",
        items: [{ label: "Whatnot", href: "/whatnot" }],
      },
      {
        label: "Info",
        items: [
          { label: "About", href: "/about" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
    []
  );

  const desktopLinks = useMemo(
    () => [
      { label: "Inventory", href: "/inventory" },
      { label: "Singles", href: "/singles" },
      { label: "Slabs", href: "/slabs" },
      { label: "Sealed", href: "/sealed" },
      { label: "Whatnot", href: "/whatnot" },
      { label: "About", href: "/about" },
      { label: "Terms", href: "/terms" },
    ],
    []
  );

  const pillStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "transparent",
    color: "inherit",
  };

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
          <Image
            src="/hammys-logo.png"
            alt="Hammy's Trading"
            width={34}
            height={34}
            priority
          />
          <span style={{ fontWeight: 800, letterSpacing: 0.2 }}>Hammy’s Trading</span>
        </Link>

        {/* Desktop nav (hidden on small screens) */}
        <nav
          className="desktopNav"
          style={{
            display: "none",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {desktopLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                opacity: pathname === l.href ? 1 : 0.88,
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}

          {isAdmin ? (
            <Link href="/admin" style={{ textDecoration: "none", opacity: 0.95 }}>
              Admin
            </Link>
          ) : null}

          {!isAuthed ? (
            <Link href="/signin" style={pillStyle}>
              Sign in
            </Link>
          ) : (
            <button
              onClick={() => signOut()}
              style={{
                ...pillStyle,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          )}
        </nav>

        {/* Mobile hamburger (shown on small screens) */}
        <button
          className="mobileHamburger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: 18,
              height: 2,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 999,
              position: "relative",
              display: "inline-block",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: -6,
                width: 18,
                height: 2,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 999,
                display: "block",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 6,
                width: 18,
                height: 2,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 999,
                display: "block",
              }}
            />
          </span>
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen ? (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 49,
          }}
        />
      ) : null}

      {/* Mobile slide-over menu */}
      <aside
        aria-hidden={!mobileOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: "min(92vw, 360px)",
          background: "rgba(12,12,14,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.10)",
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(105%)",
          transition: "transform 180ms ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "14px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontWeight: 800, letterSpacing: 0.2 }}>Menu</span>
          <button
            onClick={closeMenu}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              cursor: "pointer",
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 12, overflow: "auto", display: "grid", gap: 10 }}>
          {/* Accordions */}
          {groups.map((g) => (
            <MobileAccordion
              key={g.label}
              label={g.label}
              items={g.items}
              onNavigate={closeMenu}
            />
          ))}

          {/* Account area */}
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 12,
                opacity: 0.8,
                fontSize: 12,
                letterSpacing: "0.12em",
              }}
            >
              ACCOUNT
            </div>

            <div style={{ padding: "0 12px 12px", display: "grid", gap: 8 }}>
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  style={{
                    textDecoration: "none",
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  Admin
                </Link>
              ) : null}

              {!isAuthed ? (
                <Link
                  href="/signin"
                  onClick={closeMenu}
                  style={{
                    textDecoration: "none",
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  Sign in
                </Link>
              ) : (
                <button
                  onClick={() => {
                    closeMenu();
                    signOut();
                  }}
                  style={{
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.04)",
                    color: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Responsive switch:
          - show desktop nav at >= 900px
          - hide hamburger at >= 900px
        */}
      <style jsx global>{`
        @media (min-width: 900px) {
          .desktopNav {
            display: flex !important;
          }
          .mobileHamburger {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

function MobileAccordion({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: { label: string; href: string }[];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: 0,
          color: "inherit",
          cursor: "pointer",
        }}
      >
        <span style={{ fontWeight: 650 }}>{label}</span>
        <span
          style={{
            opacity: 0.8,
            transform: open ? "rotate(180deg)" : "none",
            transition: "150ms ease",
          }}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div style={{ padding: "0 12px 12px", display: "grid", gap: 8 }}>
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              style={{
                textDecoration: "none",
                padding: "10px 10px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {it.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}