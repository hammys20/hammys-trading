"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [debug, setDebug] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        const session = await fetchAuthSession();
        const idGroups =
          (session.tokens?.idToken?.payload["cognito:groups"] as string[]) || [];
        const accessGroups =
          (session.tokens?.accessToken?.payload["cognito:groups"] as string[]) || [];
        const groups = [...idGroups, ...accessGroups];

        const isAdmin = Array.isArray(groups) && groups.includes("Admin");

        if (!mounted) return;

        if (!isAdmin) {
          const msg = `Not admin. idGroups=${JSON.stringify(
            idGroups
          )} accessGroups=${JSON.stringify(accessGroups)}`;
          setDebug(msg);
          try {
            localStorage.setItem("admin_debug", msg);
          } catch {}
          router.replace("/"); // non-admins go home
          return;
        }

        const okMsg = `Admin OK. idGroups=${JSON.stringify(
          idGroups
        )} accessGroups=${JSON.stringify(accessGroups)}`;
        setDebug(okMsg);
        try {
          localStorage.setItem("admin_debug", okMsg);
        } catch {}
        setAllowed(true);
      } catch (e: any) {
        const errMsg = `No session. ${e?.message ?? "fetchAuthSession failed"}`;
        if (mounted) {
          setDebug(errMsg);
        }
        try {
          localStorage.setItem("admin_debug", errMsg);
        } catch {}
        // not signed in or no session
        router.replace("/signin?next=" + encodeURIComponent(pathname));
      } finally {
        if (mounted) setChecking(false);
      }
    }

    checkAdmin();
    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (checking) {
    return (
      <div style={{ maxWidth: 900, margin: "60px auto", opacity: 0.7 }}>
        Checking admin access…
        {debug ? <div style={{ marginTop: 10 }}>{debug}</div> : null}
      </div>
    );
  }

  if (!allowed) {
    return debug ? (
      <div style={{ maxWidth: 900, margin: "60px auto", opacity: 0.8 }}>
        {debug}
      </div>
    ) : null;
  }

  return <>{children}</>;
}
