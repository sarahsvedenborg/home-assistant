"use client";

import Link from "next/link";
import { useState } from "react";

import { FlagMedia } from "@/components/flag-media";
import { buildFlagQuiz } from "@/lib/flag-quiz";
import type { Country } from "@/lib/types";

export function FlagQuiz({
  studiedCountries,
  countries,
}: {
  studiedCountries: Country[];
  countries: Country[];
}) {
  const [questions, setQuestions] = useState(() =>
    buildFlagQuiz(studiedCountries, countries),
  );
  const [index, setIndex] = useState(0);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const question = questions[index];
  const isLastQuestion = index === questions.length - 1;
  const isCorrect = selectedCode === question?.country.code;

  function selectChoice(code: string) {
    if (selectedCode || !question) {
      return;
    }

    setSelectedCode(code);
    if (code === question.country.code) {
      setScore((current) => current + 1);
    }
  }

  function goToNext() {
    if (!selectedCode) {
      return;
    }

    if (isLastQuestion) {
      setIsComplete(true);
      return;
    }

    setIndex((current) => current + 1);
    setSelectedCode(null);
  }

  function restart() {
    setQuestions(buildFlagQuiz(studiedCountries, countries));
    setIndex(0);
    setSelectedCode(null);
    setScore(0);
    setIsComplete(false);
  }

  if (!question) {
    return (
      <p className="flagBrowserEmpty">
        Marker minst ett flagg som studert for å starte quizen.
      </p>
    );
  }

  if (isComplete) {
    return (
      <section className="flagQuiz" aria-labelledby="flag-quiz-result-title">
        <h2 id="flag-quiz-result-title">Ferdig!</h2>
        <p className="flagQuizScore">
          Du fikk {score} av {questions.length} riktige.
        </p>
        <div className="flagQuizActions">
          <button className="buttonPrimary" type="button" onClick={restart}>
            Ny quiz
          </button>
          <Link href="/flags" className="buttonSecondary">
            Tilbake til flagg
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flagQuiz" aria-labelledby="flag-quiz-title">
      <div className="flagQuizHeader">
        <span className="kicker">
          Spørsmål {index + 1} av {questions.length}
        </span>
        <h2 id="flag-quiz-title">Hvilket land er dette?</h2>
      </div>

      <div className="flagQuizFlag">
        <FlagMedia
          country={question.country}
          showMap={false}
          alt="Hvilket land er dette flagget fra?"
          key={`${index}-${question.country.code}`}
        />
      </div>

      <div className="flagQuizOptions" role="group" aria-label="Svaralternativer">
        {question.choices.map((choice) => {
          const isSelected = selectedCode === choice.code;
          const isAnswer = choice.code === question.country.code;
          const className = [
            "flagQuizChoice",
            selectedCode && isAnswer ? "flagQuizChoiceCorrect" : "",
            selectedCode && isSelected && !isAnswer ? "flagQuizChoiceWrong" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              type="button"
              className={className}
              key={choice.code}
              aria-pressed={isSelected}
              onClick={() => selectChoice(choice.code)}
            >
              {choice.name}
            </button>
          );
        })}
      </div>

      {selectedCode ? (
        <p
          className={isCorrect ? "flagQuizFeedback flagQuizFeedbackCorrect" : "flagQuizFeedback"}
          aria-live="polite"
        >
          {isCorrect
            ? "Riktig!"
            : `Feil. Riktig svar er ${question.country.name}.`}
        </p>
      ) : null}

      {selectedCode ? (
        <div className="flagQuizActions">
          <button className="buttonPrimary" type="button" onClick={goToNext}>
            {isLastQuestion ? "Se resultat" : "Neste"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
