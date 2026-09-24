"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { session } from "@/lib/session";
import type { ContactContent } from "@/types";

const linkClass =
  "rounded-sm underline decoration-fg/35 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-300 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function Contact({ contact }: { contact: ContactContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [service, setService] = useState<string | null>(() => session.selectedService);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onSelect = (e: Event) => setService((e as CustomEvent<string>).detail);
    window.addEventListener("site:service", onSelect);
    return () => {
      window.removeEventListener("site:service", onSelect);
      clearTimeout(copyTimer.current);
    };
  }, []);

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = SplitText.create(".contact-message", {
        type: "lines",
        mask: "lines",
      });

      gsap
        .timeline({
          defaults: { ease: "power4.out" },
          scrollTrigger: { trigger: ".contact-message", start: "top 80%" },
        })
        .from(".contact-status", {
          y: 16,
          autoAlpha: 0,
          duration: 0.7,
          clearProps: "opacity,visibility,transform",
        })
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.1 }, "<0.1");

      gsap.from(".contact-foot > *", {
        y: 16,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform",
        scrollTrigger: { trigger: ".contact-foot", start: "top 95%" },
      });
    },
    { scope: sectionRef, dependencies: [contact.message, contact.socials.length] }
  );

  const subject = service ? `${service} project inquiry` : "Project inquiry";
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      window.prompt("Copy my email address:", contact.email);
      return;
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-title"
      className="flex min-h-[75svh] flex-col pt-16 md:pt-20 lg:pt-24"
    >
      <div className="site-grid flex-1 content-center py-16">
        <div className="col-span-full md:col-span-6 lg:col-span-6 lg:col-start-4">
          <h2 id="contact-title" className="sr-only">
            Contact
          </h2>

          {contact.availability && (
            <p className="contact-status flex items-center gap-3 text-muted">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent" />
              {contact.availability}
            </p>
          )}

          <p className="contact-message mt-3 max-w-[24ch] text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.15] font-medium tracking-[-0.02em]">
            {contact.message}
          </p>
        </div>
      </div>

      <footer className="site-grid pb-32 lg:pb-12">
        <div className="contact-foot col-span-full flex flex-col gap-8 lg:col-span-9 lg:col-start-4 lg:flex-row lg:items-end lg:justify-between">
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-4 text-lg">
            <li className="flex items-center gap-3">
              <a href={mailto} className={linkClass}>
                {contact.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="rounded-sm text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <span aria-live="polite" className="sr-only">
                {copied ? "Email address copied to clipboard" : ""}
              </span>
            </li>

            {contact.socials.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {social.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="text-sm text-muted">© {new Date().getFullYear()} Milan Moktan</p>
        </div>
      </footer>
    </section>
  );
}