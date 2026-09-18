"use client";

import Link from "next/link";
import { useState } from "react";

import { FormModal } from "@/components/form-modal";

export function FlagsQuizActions() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="flagsQuizActions">
      <button
        type="button"
        className="buttonSecondary"
        onClick={() => setIsPanelOpen(true)}
      >
        Egendefinert quiz
      </button>
      <Link href="/flags/quiz" className="buttonPrimary">
        Start quiz
      </Link>

      <FormModal
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="Egendefinert quiz"
        className="formModalFlagsQuiz"
      >
        <div className="customQuizPanel">
          <p>Her kan du sette opp en egendefinert quiz.</p>
        </div>
      </FormModal>
    </div>
  );
}
