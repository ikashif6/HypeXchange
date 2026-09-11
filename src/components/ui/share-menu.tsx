"use client";

import * as React from "react";
import { Check, ChevronDown, Copy, Mail, Share2 } from "lucide-react";
import {
  buildShareUrl,
  type ShareContent,
  type ShareTarget,
  cn,
} from "@/lib/utils";

type IconProps = { className?: string };

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function RedditIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.769-3.209 5.002-7.14 5.002-3.93 0-7.14-2.233-7.14-5.002 0-.175.012-.346.037-.514-.591-.27-1.014-.893-1.014-1.62 0-.968.786-1.754 1.754-1.754.442 0 .84.185 1.125.481 1.222-.855 2.913-1.418 4.774-1.485l.885-4.152a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.051l2.914.614a1.25 1.25 0 0 1 1.24-.941zM9.25 12.5c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm-5.408 3.75a.625.625 0 0 0-.625.625.63.63 0 0 0 .172.43c.55.55 1.445.88 2.611.88s2.061-.33 2.611-.88a.63.63 0 0 0 .172-.43.625.625 0 0 0-1.076-.425c-.276.276-.795.45-1.707.45s-1.431-.174-1.707-.45a.625.625 0 0 0-.451-.2z" />
    </svg>
  );
}

function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

const CHANNELS: {
  id: ShareTarget;
  label: string;
  Icon: React.ComponentType<IconProps>;
}[] = [
  { id: "x", label: "X / Twitter", Icon: XIcon },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon },
  { id: "reddit", label: "Reddit", Icon: RedditIcon },
  { id: "telegram", label: "Telegram", Icon: TelegramIcon },
  { id: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon },
  { id: "email", label: "Email", Icon: Mail },
];

export interface ShareMenuProps {
  content: ShareContent;
  className?: string;
  /** inline = all buttons; dropdown = one Share button with a menu */
  variant?: "inline" | "dropdown";
  buttonLabel?: string;
  description?: string;
}

function useCopyShare(content: ShareContent) {
  const [copied, setCopied] = React.useState(false);

  async function copyMessage() {
    const clipboardText = `${content.text.trim()}\n\n${content.url}`;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      try {
        await navigator.clipboard.writeText(content.url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } catch {
        // ignore
      }
    }
  }

  return { copied, copyMessage };
}

function ShareChannelList({
  content,
  onPick,
  layout = "wrap",
}: {
  content: ShareContent;
  onPick?: () => void;
  layout?: "wrap" | "menu";
}) {
  const { copied, copyMessage } = useCopyShare(content);

  if (layout === "menu") {
    return (
      <ul className="py-1">
        {CHANNELS.map(({ id, label, Icon }) => (
          <li key={id}>
            <a
              href={buildShareUrl(id, content)}
              target={id === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              onClick={onPick}
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </a>
          </li>
        ))}
        <li className="border-t border-hx-border">
          <button
            type="button"
            onClick={async () => {
              await copyMessage();
            }}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
          >
            {copied ? (
              <Check className="size-4 shrink-0 text-hx-positive" />
            ) : (
              <Copy className="size-4 shrink-0" />
            )}
            {copied ? "Copied" : "Copy message"}
          </button>
        </li>
      </ul>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CHANNELS.map(({ id, label, Icon }) => (
        <a
          key={id}
          href={buildShareUrl(id, content)}
          target={id === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className="hx-chip gap-2"
        >
          <Icon className="size-4 shrink-0" />
          <span>{label === "X / Twitter" ? "Post" : label}</span>
        </a>
      ))}
      <button
        type="button"
        onClick={copyMessage}
        aria-label={copied ? "Message copied" : "Copy message and link"}
        className="hx-chip gap-2"
      >
        {copied ? (
          <Check className="size-4 shrink-0 text-hx-positive" aria-hidden />
        ) : (
          <Copy className="size-4 shrink-0" aria-hidden />
        )}
        <span>{copied ? "Copied" : "Copy message"}</span>
      </button>
    </div>
  );
}

export function ShareMenu({
  content,
  className,
  variant = "inline",
  buttonLabel = "Share",
  description = "Each option opens a ready-made message with the link. You can post it as is or edit before sending.",
}: ShareMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (variant === "dropdown") {
    return (
      <div className={cn("relative shrink-0", className)} ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-hx-border bg-hx-card px-3.5 text-sm font-medium text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
        >
          <Share2 className="size-3.5" aria-hidden />
          {buttonLabel}
          <ChevronDown
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-[12px] border border-hx-border bg-hx-card shadow-lg"
          >
            <p className="border-b border-hx-border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
              Share with message
            </p>
            <ShareChannelList
              content={content}
              layout="menu"
              onPick={() => setOpen(false)}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
          Share
        </p>
        {description ? (
          <p className="text-[12px] leading-relaxed text-hx-secondary">{description}</p>
        ) : null}
      </div>
      <ShareChannelList content={content} layout="wrap" />
    </div>
  );
}
