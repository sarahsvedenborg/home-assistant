"use client";

import { cloneElement, isValidElement, useEffect, useState, type ReactElement } from "react";

import { FormModal } from "@/components/form-modal";

type FormChildProps = {
  onSuccess?: (message: string) => void;
};

type AddButtonProps = {
  // Heading shown at the top of the modal.
  title: string;
  // Text on the floating action button.
  label: string;
  // Optional URL hash (without the "#") that auto-opens the modal, so links
  // like /handleliste#add-item can open the form straight from the dashboard.
  anchor?: string;
  // Keep the modal available to hash links without rendering another floating button.
  hideTrigger?: boolean;
  // The form to render inside the modal; receives an injected onSuccess.
  children: ReactElement<FormChildProps>;
};

export function AddButton({
  title,
  label,
  anchor,
  hideTrigger = false,
  children,
}: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // Open the modal when the URL hash matches our anchor, then strip the hash
  // so the same link can trigger it again on a later visit.
  useEffect(() => {
    if (!anchor) {
      return;
    }

    function openFromHash() {
      if (window.location.hash === `#${anchor}`) {
        setIsOpen(true);
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [anchor]);

  // Once a confirmation shows, auto-close the modal after a beat.
  useEffect(() => {
    if (!confirmation) {
      return;
    }

    const timer = setTimeout(() => {
      setConfirmation(null);
      setIsOpen(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [confirmation]);

  function handleClose() {
    setConfirmation(null);
    setIsOpen(false);
  }

  const form = isValidElement(children)
    ? cloneElement(children, { onSuccess: (message: string) => setConfirmation(message) })
    : children;

  return (
    <>
      {hideTrigger ? null : (
        <button type="button" className="addFab" onClick={() => setIsOpen(true)}>
          <span className="addFabIcon" aria-hidden="true">
            +
          </span>
          <span className="addFabLabel">{label}</span>
        </button>
      )}

      <FormModal isOpen={isOpen} onClose={handleClose} title={title} confirmation={confirmation}>
        {form}
      </FormModal>
    </>
  );
}
