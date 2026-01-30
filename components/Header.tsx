"use client";

import { Hub } from "aws-amplify/utils";
import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  async function loadUser() {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadUser();

    const sub = Hub.listen("auth", () => {
      loadUser();
    });

    return () => sub();
  }, []);

  return (
    <header style={{ padding: 16, borderBottom: "1px solid #333" }}>
      {user ? (
        <span>Admin</span>
      ) : (
        <a href="/signin">Sign In</a>
      )}
    </header>
  );
}
