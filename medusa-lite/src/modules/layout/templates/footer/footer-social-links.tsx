"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

type SocialLink = {
  label: string
  href: string
  modalImageSrc?: string
  modalImageAlt?: string
}

type ContactModal = {
  label: string
  imageSrc: string
  imageAlt: string
}

function SocialIcon({ label }: { label: string }) {
  const shared = "h-5 w-5"

  switch (label) {
    case "WeChat":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden>
          <path
            d="M8 6.5c-3.314 0-6 2.35-6 5.25 0 1.69.924 3.193 2.36 4.155L3.5 19l2.855-1.428c.528.118 1.08.178 1.645.178 3.314 0 6-2.35 6-5.25S11.314 6.5 8 6.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 10c3.038 0 5.5 2.126 5.5 4.75 0 1.527-.835 2.886-2.134 3.756L19.5 21l-2.585-1.293a6.082 6.082 0 0 1-1.415.168c-3.038 0-5.5-2.126-5.5-4.75s2.462-4.75 5.5-4.75Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="6.5" cy="11.5" r="1" fill="currentColor" />
          <circle cx="9.5" cy="11.5" r="1" fill="currentColor" />
          <circle cx="13.5" cy="14.75" r=".9" fill="currentColor" />
          <circle cx="16.5" cy="14.75" r=".9" fill="currentColor" />
        </svg>
      )
    case "WhatsApp":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden>
          <path
            d="M12 21a8.97 8.97 0 0 0 4.586-1.257L21 21l-1.3-4.263A9 9 0 1 0 12 21Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.9 8.4c-.25-.56-.52-.57-.76-.58h-.65c-.22 0-.58.08-.88.4s-1.15 1.12-1.15 2.73 1.18 3.16 1.35 3.38c.17.22 2.29 3.66 5.66 4.98 2.8 1.1 3.37.88 3.98.83.6-.05 1.95-.8 2.23-1.57.28-.77.28-1.43.2-1.57-.08-.14-.3-.22-.63-.39-.33-.16-1.95-.97-2.25-1.08-.3-.11-.52-.16-.74.17-.22.33-.85 1.08-1.04 1.3-.19.22-.38.25-.71.08-.33-.16-1.38-.5-2.63-1.6-.98-.87-1.65-1.94-1.84-2.27-.19-.33-.02-.5.14-.67.15-.15.33-.39.5-.58.17-.19.22-.33.33-.55.1-.22.05-.41-.03-.58-.08-.16-.71-1.74-.99-2.35Z"
            fill="currentColor"
          />
        </svg>
      )
    case "Facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={shared}
          aria-hidden
        >
          <path d="M13.5 21v-7h2.35l.35-2.75H13.5V9.5c0-.8.22-1.35 1.37-1.35h1.46V5.67A19.61 19.61 0 0 0 14.2 5.5c-2.11 0-3.55 1.29-3.55 3.67v2.08H8.25V14h2.4v7h2.85Z" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="3.75"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      )
  }
}

export default function FooterSocialLinks({ links }: { links: SocialLink[] }) {
  const [contactModal, setContactModal] = useState<ContactModal | null>(null)

  useEffect(() => {
    if (!contactModal) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContactModal(null)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [contactModal])

  return (
    <>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        {links.map((item) =>
          item.modalImageSrc ? (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              onClick={() =>
                setContactModal({
                  label: item.label,
                  imageSrc: item.modalImageSrc as string,
                  imageAlt: item.modalImageAlt || item.label,
                })
              }
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--bg-card)] text-[color:var(--text-strong)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[color:var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[color:var(--accent-strong)] hover:shadow-[0_18px_34px_-24px_rgba(92,72,45,0.22)]"
            >
              <SocialIcon label={item.label} />
            </button>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--bg-card)] text-[color:var(--text-strong)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[color:var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[color:var(--accent-strong)] hover:shadow-[0_18px_34px_-24px_rgba(92,72,45,0.22)] ${
                item.href === "#" ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <SocialIcon label={item.label} />
            </Link>
          )
        )}
      </div>

      {contactModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={contactModal.label}
          onClick={() => setContactModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-[1rem] bg-[var(--bg-surface)] p-4 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                {contactModal.label}
              </p>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-soft)] text-xl leading-none text-[color:var(--text-body)] transition hover:bg-[var(--bg-card)]"
                onClick={() => setContactModal(null)}
                aria-label="Close contact image"
              >
                X
              </button>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[0.75rem] bg-white">
              <Image
                src={contactModal.imageSrc}
                alt={contactModal.imageAlt}
                fill
                sizes="(min-width: 768px) 360px, calc(100vw - 64px)"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
