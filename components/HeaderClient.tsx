// components/HeaderClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

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
  const { count } = useCart();

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
        label: "Whatnot",
        items: [{ label: "Whatnot", href: "/whatnot" }],
      },
      {
        label: "Info",
        items: [
          { label: "About", href: "/about" },
          { label: "Terms", href: "/terms" },
          { label: "Contact Us", href: "/contact" },
        ],
      },
    ],
    []
  );

  const desktopLinks = useMemo(
    () => [
      { label: "Inventory", href: "/inventory" },
      { label: "Whatnot", href: "/whatnot" },
      { label: "About", href: "/about" },
      { label: "Terms", href: "/terms" },
      { label: "Contact Us", href: "/contact" },
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
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Hamburger (all sizes) */}
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <span style={{ fontSize: 12, opacity: 0.72, fontWeight: 600 }}>
            Click here if you want to Validate a Certification
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href="https://www.psacard.com/cert?_gl=1*ynpdn*_gcl_au*MTAzODAwNjk2Ny4xNzY0NjA5Njk2*_ga*NTgwMTExMjg2LjE3NjQ2MDk3MDE.*_ga_GGS8NWPYE2*czE3Njc3MzI0OTkkbzE1JGcxJHQxNzY3NzMyNTMyJGoyNyRsMCRoMA..*_ga_1QVXQ1V575*czE3Njc3MzI1MzMkbzUkZzAkdDE3Njc3MzI1MzMkajYwJGwxJGg1NzU2NTc3NDc.&QTM_SID=a3a5c1746adc3bbd29ab7495ada7ec19&QTM_UID=9bacc3752ab6c5354254d8987e77a5d0"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
              aria-label="PSA certification lookup"
            >
              <img
                src="https://www.psacard.com/Content/images/psa-logo-reg.png"
                alt="PSA"
                style={{ height: 20, width: "auto" }}
              />
            </a>
            <a
              href="https://www.cgccards.com/certlookup/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
              aria-label="CGC certification lookup"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Certified_Guaranty_Company.svg/250px-Certified_Guaranty_Company.svg.png"
                alt="CGC"
                style={{ height: 20, width: "auto" }}
              />
            </a>
            <a
              href="https://www.beckett.com/grading/card-lookup"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
              aria-label="Beckett grading card lookup"
            >
              <img
                src="/bgs-logo.png"
                alt="Beckett Grading"
                style={{ height: 20, width: "auto" }}
              />
            </a>
          </div>
        </div>
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
          left: 0,
          height: "100dvh",
          width: "min(92vw, 360px)",
          background: "rgba(12,12,14,0.98)",
          borderRight: "1px solid rgba(255,255,255,0.10)",
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(-105%)",
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image
              src="/hammys-logo.png"
              alt="Hammy's Trading"
              width={28}
              height={28}
            />
            <span style={{ fontWeight: 800, letterSpacing: 0.2 }}>Hammy’s Trading</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isAuthed ? (
              <button
                onClick={() => {
                  closeMenu();
                  signOut();
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.04)",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Sign out
              </button>
            ) : null}
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
        </div>

        <div style={{ padding: 12, overflow: "auto", display: "grid", gap: 10 }}>
          <Link
            href="/"
            onClick={closeMenu}
            style={{
              textDecoration: "none",
              padding: "10px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontWeight: 700,
            }}
          >
            Home
          </Link>
          <Link
            href="/inventory"
            onClick={closeMenu}
            style={{
              textDecoration: "none",
              padding: "10px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontWeight: 700,
            }}
          >
            Inventory
          </Link>
          <Link
            href="/consignment"
            onClick={closeMenu}
            style={{
              textDecoration: "none",
              padding: "10px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontWeight: 700,
            }}
          >
            Consignment
          </Link>
          <Link
            href="/cert-validation"
            onClick={closeMenu}
            style={{
              textDecoration: "none",
              padding: "10px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontWeight: 700,
            }}
          >
            Cert Validation
          </Link>
          <Link
            href="/cart"
            onClick={closeMenu}
            style={{
              textDecoration: "none",
              padding: "10px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span>Cart</span>
            <span
              style={{
                minWidth: 22,
                height: 22,
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {count}
            </span>
          </Link>
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
          {isAuthed ? (
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
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Hamburger is always available; menu renders as slide-over */}
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
