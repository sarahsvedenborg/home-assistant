"use client";

import Link from "next/link";
import { useState } from "react";

import { FormModal } from "@/components/form-modal";
import {
  FLAG_QUIZ_COUNTS,
  FLAG_QUIZ_DEFAULT_COUNT,
  FLAG_QUIZ_DEFAULT_SOURCE,
  type FlagQuizCount,
  type FlagQuizSource,
} from "@/lib/flag-quiz";

const QUIZ_SOURCES: Array<{ value: FlagQuizSource; label: string }> = [
  { value: "studied", label: "Studerte flagg" },
  { value: "independent", label: "Alle uavhengige land (med England++)" },
  { value: "all", label: "Alle land + territorier" },
];

export function FlagsQuizActions() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [count, setCount] = useState<FlagQuizCount>(FLAG_QUIZ_DEFAULT_COUNT);
  const [source, setSource] = useState<FlagQuizSource>(FLAG_QUIZ_DEFAULT_SOURCE);

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
        <form className="customQuizPanel" action="/flags/quiz">
          <p>Velg antall flagg og hvilke flagg quizen skal trekke fra.</p>

          <fieldset className="field fieldWide checkboxFieldset">
            <legend>Antall flagg</legend>
            <div className="radioRow">
              {FLAG_QUIZ_COUNTS.map((option) => (
                <label className="radioOption" key={option}>
                  <input
                    type="radio"
                    name="count"
                    value={option}
                    checked={count === option}
                    onChange={() => setCount(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field fieldWide checkboxFieldset">
            <legend>Hvilke flagg</legend>
            <div className="radioRow radioRowStacked">
              {QUIZ_SOURCES.map((option) => (
                <label className="radioOption" key={option.value}>
                  <input
                    type="radio"
                    name="source"
                    value={option.value}
                    checked={source === option.value}
                    onChange={() => setSource(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="formActions">
            <button className="buttonPrimary" type="submit">
              Start quiz
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
