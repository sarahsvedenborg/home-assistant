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
  // The form to render inside the modal; receives an injected onSuccess.
  children: ReactElement<FormChildProps>;
};

export function AddButton({ title, label, children }: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

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
      <button type="button" className="addFab" onClick={() => setIsOpen(true)}>
        <span className="addFabIcon" aria-hidden="true">
          +
        </span>
        <span className="addFabLabel">{label}</span>
      </button>

      <FormModal isOpen={isOpen} onClose={handleClose} title={title} confirmation={confirmation}>
        {form}
      </FormModal>
    </>
  );
}
