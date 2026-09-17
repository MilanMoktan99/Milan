"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { btnSecondary, hintClass, labelClass } from "./styles";
import { getUploadConfig } from "@/app/admin/actions";

// Match this to the maximum upload size of your Cloudinary plan
const MAX_MB = 10;

const ACCEPT = {
  cover: "image/jpeg,image/png,image/webp,image/avif",
  pdf: "application/pdf",
};

type Uploaded = { url: string; publicId: string };

type Props = {
  kind: "cover" | "pdf";
  slug: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  disabledMessage?: string;
  value: Uploaded | null;
  onChange: (value: Uploaded | null) => void;
  onBusyChange: (busy: boolean) => void;
};

function uploadWithProgress(
  url: string,
  form: FormData,
  onProgress: (percent: number) => void,
) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let body: { error?: { message?: string } } & Record<string, unknown> = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}

      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else
        reject(
          new Error(body.error?.message ?? `Upload failed (${xhr.status}).`),
        );
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(form);
  });
}

export function FileDrop({
  kind,
  slug,
  label,
  hint,
  disabled,
  disabledMessage,
  value,
  onChange,
  onBusyChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = progress !== null;

  const upload = async (file: File) => {
    setError(null);

    const validType =
      kind === "pdf"
        ? file.type === "application/pdf"
        : file.type.startsWith("image/");
    if (!validType) {
      setError(
        kind === "pdf"
          ? "Please choose a PDF file."
          : "Please choose an image (JPG, PNG, WebP, or AVIF).",
      );
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      const size = (file.size / 1024 / 1024).toFixed(1);
      setError(
        `That file is ${size} MB. Compress it to under ${MAX_MB} MB first.`,
      );
      return;
    }

    onBusyChange(true);
    setProgress(0);

    try {
      const config = await getUploadConfig(kind, slug);
      if (!config.ok) throw new Error(config.error);

      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", config.uploadPreset);
      form.append("folder", config.folder);

      const result = await uploadWithProgress(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`,
        form,
        setProgress,
      );

      onChange({
        url: String(result.secure_url),
        publicId: String(result.public_id),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      onBusyChange(false);
    }
  };

  const canUpload = !disabled && !busy;

  return (
    <div>
      <p className={labelClass}>{label}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (canUpload) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && canUpload) upload(file);
        }}
        className={`mt-2 rounded-sm border border-dashed p-5 transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-border"
        }`}
      >
        {value && kind === "cover" && (
          <div className="relative mb-4 aspect-[16/10] max-w-md overflow-clip rounded-sm bg-fg/5">
            <Image
              src={value.url}
              alt="Uploaded cover preview"
              fill
              sizes="448px"
              className="object-cover"
            />
          </div>
        )}

        {value && kind === "pdf" && (
          <p className="mb-4 text-sm">
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              View uploaded PDF
            </a>
          </p>
        )}

        {busy ? (
          <div role="status">
            <div className="h-1 overflow-hidden rounded-full bg-fg/10">
              <div
                className="h-full bg-accent transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">Uploading… {progress}%</p>
          </div>
        ) : disabled ? (
          <p className="text-sm text-muted">{disabledMessage}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={btnSecondary}
            >
              {value ? "Replace file" : "Choose file"}
            </button>
            {value && kind === "pdf" && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-muted transition-colors hover:text-fg"
              >
                Remove
              </button>
            )}
            <span className="text-muted">or drag and drop here</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[kind]}
          tabIndex={-1}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) upload(file);
          }}
        />

        {hint && <p className={hintClass}>{hint}</p>}
        {error && (
          <p role="alert" className="mt-3 text-sm text-accent">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
