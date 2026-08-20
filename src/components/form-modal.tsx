"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type FormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // When set, a success confirmation covers the form content.
  confirmation?: string | null;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function FormModal({ isOpen, onClose, title, children, confirmation }: FormModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Remember what was focused before opening so we can restore it on close.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Lock background scroll while the overlay is open.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog once it renders.
    const dialog = dialogRef.current;
    const firstField = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstField ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      // Keep Tab focus cycling inside the dialog.
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.offsetParent !== null,
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  // Portals need the DOM, so bail out until the browser is available.
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="formModalBackdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="formModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="formModalHeader">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="formModalClose"
            aria-label="Lukk"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="formModalBody">{children}</div>

        {confirmation ? (
          <div className="formModalConfirmation" role="status" aria-live="polite">
            <span className="formModalConfirmationIcon" aria-hidden="true">
              ✓
            </span>
            <p>{confirmation}</p>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
