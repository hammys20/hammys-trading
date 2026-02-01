"use client";

import { useRef, useState } from "react";
import { uploadData, getUrl } from "aws-amplify/storage";

export default function MultiImageUpload(props: {
  itemId: string;
  onUploaded: (keys: string[], previewUrls: string[]) => void;
}) {
  const { itemId, onUploaded } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  function pick() {
    inputRef.current?.click();
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setMsg("");

    try {
      const uploadedKeys: string[] = [];
      const previewUrls: string[] = [];

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `cards/${itemId}/${Date.now()}-${safeName}`;

        await uploadData({
          path: key,
          data: file,
          options: {
            contentType: file.type || "application/octet-stream",
          },
        }).result;

        const urlRes = await getUrl({ path: key });
        uploadedKeys.push(key);
        previewUrls.push(urlRes.url.toString());
      }

      onUploaded(uploadedKeys, previewUrls);
      setMsg(`Uploaded ${uploadedKeys.length} image${uploadedKeys.length > 1 ? "s" : ""} ✅`);
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
        multiple
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
        {busy ? "Uploading…" : "Upload Images"}
      </button>

      {msg ? <div style={{ fontSize: 12, opacity: 0.85 }}>{msg}</div> : null}
    </div>
  );
}
