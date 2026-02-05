"use client";

import { useMemo, useRef, useState } from "react";

type CarouselImage = {
  src: string;
  alt?: string;
};

export default function ImageCarousel(props: {
  images: CarouselImage[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  allowOpenInNewTab?: boolean;
  imageFit?: "contain" | "cover";
}) {
  const {
    images,
    initialIndex = 0,
    onIndexChange,
    allowOpenInNewTab = true,
    imageFit = "contain",
  } = props;
  const [index, setIndex] = useState(() => Math.min(Math.max(initialIndex, 0), images.length - 1));
  const touchStartX = useRef<number | null>(null);

  const safeImages = useMemo(() => images.filter((i) => i?.src), [images]);
  const current = safeImages[index] ?? safeImages[0];

  function setIdx(next: number) {
    if (safeImages.length === 0) return;
    const clamped = Math.min(Math.max(next, 0), safeImages.length - 1);
    setIndex(clamped);
    onIndexChange?.(clamped);
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) setIdx(index + 1);
    if (delta > 0) setIdx(index - 1);
  }

  if (safeImages.length === 0) {
    return <div style={{ padding: 24, opacity: 0.7 }}>No image</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 14,
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        {allowOpenInNewTab ? (
          <a
            href={current.src}
            target="_blank"
            rel="noreferrer"
            style={{ position: "absolute", inset: 0 }}
            aria-label="Open full size"
          >
            <img
              src={current.src}
              alt={current.alt ?? "Image"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: imageFit,
                objectPosition: "center",
              }}
            />
          </a>
        ) : (
          <img
            src={current.src}
            alt={current.alt ?? "Image"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: imageFit,
              objectPosition: "center",
            }}
          />
        )}

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setIdx(index - 1)}
              aria-label="Previous image"
              style={{
                position: "absolute",
                top: "50%",
                left: 8,
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(0,0,0,0.4)",
                color: "white",
                cursor: "pointer",
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIdx(index + 1)}
              aria-label="Next image"
              style={{
                position: "absolute",
                top: "50%",
                right: 8,
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(0,0,0,0.4)",
                color: "white",
                cursor: "pointer",
              }}
            >
              ›
            </button>
            <div
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.45)",
                fontSize: 12,
              }}
            >
              {index + 1}/{safeImages.length}
            </div>
          </>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "64px",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {safeImages.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              style={{
                padding: 0,
                border: i === index ? "2px solid rgba(255,255,255,0.9)" : "1px solid rgba(255,255,255,0.14)",
                borderRadius: 8,
                background: "transparent",
                overflow: "hidden",
                width: 64,
                height: 64,
                cursor: "pointer",
              }}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.alt ?? "Thumbnail"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
