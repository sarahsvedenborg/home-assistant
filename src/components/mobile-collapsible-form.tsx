"use client";

import { useId, useState, type ReactNode } from "react";

type MobileCollapsibleFormProps = {
  title: string;
  children: ReactNode;
};

export function MobileCollapsibleForm({ title, children }: MobileCollapsibleFormProps) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobileCollapsibleForm">
      <button
        type="button"
        className={isOpen ? "mobileFormToggle mobileFormToggleOpen" : "mobileFormToggle"}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="mobileFormToggleLabel">{title}</span>
        <span className="mobileFormToggleMeta">
        {/*   {isOpen ? "Skjul" : "Aapne"} */}
          <span className="mobileFormToggleCaret" aria-hidden="true">
            v
          </span>
        </span>
      </button>

      <div id={contentId} className={isOpen ? "mobileFormContent mobileFormContentOpen" : "mobileFormContent"}>
        {children}
      </div>
    </div>
  );
}
