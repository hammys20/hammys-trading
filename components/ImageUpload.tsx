"use client";

import { useRef, useState } from "react";
import { uploadData, getUrl } from "aws-amplify/storage";

export default function ImageUpload(props: {
  itemId: string;
  // Current stored key (ex: "cards/abc/xyz.png") if you want to show it
  currentKey?: string;
  // Called with the *key* we stored and a *fresh preview url*
  onUploaded: (key: string, previewUrl: string) => void;
}) {
  const { itemId, currentKey, onUploaded } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function pick() {
    inputRef.current?.click();
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setMsg("");

    try {
      // Store a durable key (NOT the signed URL)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `cards/${itemId}/${Date.now()}-${safeName}`;

      await uploadData({
        path: key,
        data: file,
        options: {
          // Helps browsers render the image correctly
          contentType: file.type || "application/octet-stream",
        },
      }).result;

      // Get a preview URL for immediate UI display (this URL expires later)
      const urlRes = await getUrl({ path: key });
      const previewUrl = urlRes.url.toString();

      onUploaded(key, previewUrl);
      setMsg("Uploaded ✅");
    } catch (err: any) {
      console.error("Upload failed:", err);
      setMsg(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        style={{ display: "none" }}
      />

      <button
        onClick={pick}
        disabled={busy}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.14)",
          background: busy ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
          color: "rgba(255,255,255,0.92)",
          cursor: busy ? "not-allowed" : "pointer",
          fontWeight: 800,
        }}
      >
        {busy ? "Uploading…" : "Upload Image"}
      </button>

      {currentKey ? (
        <div style={{ fontSize: 12, opacity: 0.7, wordBreak: "break-all" }}>
          Stored key: {currentKey}
        </div>
      ) : null}

      {msg ? (
        <div style={{ fontSize: 12, opacity: 0.85 }}>{msg}</div>
      ) : null}
    </div>
  );
}
