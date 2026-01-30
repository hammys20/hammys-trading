"use client";

import { uploadData, getUrl } from "aws-amplify/storage";
import { useState } from "react";

export default function AdminImageUpload({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const key = `cards/${crypto.randomUUID()}-${file.name}`;

      await uploadData({
        key,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result;

      const { url } = await getUrl({ key });

      onUploaded(url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label style={{ display: "block" }}>
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
        disabled={uploading}
      />
      <button type="button" disabled={uploading}>
        {uploading ? "Uploading…" : "Upload Image"}
      </button>
    </label>
  );
}
