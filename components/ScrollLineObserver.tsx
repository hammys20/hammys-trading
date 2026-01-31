"use client";

import { useEffect } from "react";

export default function ScrollLineObserver() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-line]")
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("scrollLineVisible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
}
