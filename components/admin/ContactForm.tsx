"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContact } from "@/app/admin/actions";
import {
  btnPrimary,
  btnSecondary,
  hintClass,
  inputClass,
  labelClass,
} from "./styles";
import type { ContactContent, SocialLink } from "@/types";

const newSocial = (): SocialLink => ({
  id: `social-${Date.now()}`,
  label: "",
  href: "",
});

export function ContactForm({ initial }: { initial: ContactContent }) {
  const router = useRouter();
  const [values, setValues] = useState<ContactContent>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ContactContent>(
    key: K,
    value: ContactContent[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateSocial = (id: string, patch: Partial<SocialLink>) =>
    set(
      "socials",
      values.socials.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveContact(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-12">
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Message</legend>

        <div>
          <label htmlFor="availability" className={labelClass}>
            Availability
          </label>
          <input
            id="availability"
            value={values.availability}
            onChange={(e) => set("availability", e.target.value)}
            aria-describedby="avail-hint"
            className={inputClass}
          />
          <p id="avail-hint" className={hintClass}>
            The small line with the accent dot. Leave empty to hide it.
          </p>
        </div>

        <div>
          <label htmlFor="message" className={labelClass}>
            Message
          </label>
          <textarea
            id="message"
            rows={2}
            required
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            aria-describedby="msg-hint"
            className={inputClass}
          />
          <p id="msg-hint" className={hintClass}>
            The large sentence. Two lines reads best.
          </p>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Links</legend>

        {values.socials.length === 0 && (
          <p className="text-sm text-muted">No links yet.</p>
        )}

        {values.socials.map((social) => (
          <div
            key={social.id}
            className="grid gap-4 rounded-sm border border-border p-5 sm:grid-cols-[10rem_1fr]"
          >
            <div>
              <label htmlFor={`label-${social.id}`} className={labelClass}>
                Name
              </label>
              <input
                id={`label-${social.id}`}
                placeholder="LinkedIn"
                value={social.label}
                onChange={(e) =>
                  updateSocial(social.id, { label: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`href-${social.id}`} className={labelClass}>
                Link
              </label>
              <input
                id={`href-${social.id}`}
                type="url"
                placeholder="https://"
                value={social.href}
                onChange={(e) =>
                  updateSocial(social.id, { href: e.target.value })
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "socials",
                    values.socials.filter((item) => item.id !== social.id),
                  )
                }
                className="mt-2 text-sm text-muted transition-colors hover:text-fg"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => set("socials", [...values.socials, newSocial()])}
          className={btnSecondary}
        >
          Add link
        </button>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="rounded-sm border border-accent/40 p-4 text-sm text-accent"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href="/admin" className={btnSecondary}>
          Back to projects
        </Link>
        <span aria-live="polite" className="text-sm text-muted">
          {saved && !pending ? "Saved." : ""}
        </span>
      </div>
    </form>
  );
}
