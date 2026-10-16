"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FlagMedia } from "@/components/flag-media";
import {
  buildFlagQuiz,
  FLAG_QUIZ_AUTO_ADVANCE_MS,
  FLAG_QUIZ_AUTO_REVEAL_MS,
  FLAG_QUIZ_DEFAULT_COUNT,
  FLAG_QUIZ_DEFAULT_MODE,
  FLAG_QUIZ_DEFAULT_SOURCE,
  type FlagQuizCount,
  type FlagQuizMode,
  type FlagQuizQuestion,
  type FlagQuizSource,
} from "@/lib/flag-quiz";
import type { Country } from "@/lib/types";

export function FlagQuiz({
  studiedCountries,
  countries,
  questionCount = FLAG_QUIZ_DEFAULT_COUNT,
  source = FLAG_QUIZ_DEFAULT_SOURCE,
  mode = FLAG_QUIZ_DEFAULT_MODE,
}: {
  studiedCountries: Country[];
  countries: Country[];
  questionCount?: FlagQuizCount;
  source?: FlagQuizSource;
  mode?: FlagQuizMode;
}) {
  const [questions, setQuestions] = useState<FlagQuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const question = questions?.[index];
  const isAuto = mode === "auto";
  const isLastQuestion = questions ? index === questions.length - 1 : false;
  const isCorrect = selectedCode === question?.country.code;

  useEffect(() => {
    setQuestions(
      buildFlagQuiz(studiedCountries, countries, {
        count: questionCount,
        source,
      }),
    );
  }, [studiedCountries, countries, questionCount, source]);

  useEffect(() => {
    if (!isAuto || !questions || questions.length === 0 || isComplete || isNameVisible) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsNameVisible(true);
    }, FLAG_QUIZ_AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timeout);
  }, [isAuto, questions, index, isComplete, isNameVisible]);

  useEffect(() => {
    if (!isAuto || !isNameVisible || isComplete) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsNameVisible(false);

      if (!questions || index >= questions.length - 1) {
        setIsComplete(true);
        return;
      }

      setIndex((current) => current + 1);
    }, FLAG_QUIZ_AUTO_REVEAL_MS);

    return () => window.clearTimeout(timeout);
  }, [isAuto, isNameVisible, isComplete, questions, index]);

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
    setQuestions(
      buildFlagQuiz(studiedCountries, countries, {
        count: questionCount,
        source,
      }),
    );
    setIndex(0);
    setSelectedCode(null);
    setScore(0);
    setIsComplete(false);
    setIsNameVisible(false);
  }

  if (!questions) {
    return <p className="flagBrowserEmpty">Laster quiz...</p>;
  }

  if (!question) {
    return (
      <p className="flagBrowserEmpty">
        {source === "studied"
          ? "Marker minst ett flagg som studert for å starte quizen."
          : "Ingen flagg er tilgjengelige for quizen."}
      </p>
    );
  }

  if (isComplete) {
    return (
      <section className="flagQuiz flagQuizResult" aria-labelledby="flag-quiz-result-title">
        <h2 id="flag-quiz-result-title">{isAuto ? "Ferdig" : "Ferdig!"}</h2>
        {isAuto ? null : (
          <p className="flagQuizScore">
            Du fikk {score} av {questions.length} riktige.
          </p>
        )}
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
        <h2 id="flag-quiz-title" aria-live={isAuto ? "polite" : undefined}>
          {isAuto && isNameVisible ? question.country.name : "Hvilket land er dette?"}
        </h2>
      </div>

      <div className="flagQuizFlag">
        <FlagMedia
          country={question.country}
          showMap={false}
          alt={
            isAuto && isNameVisible
              ? `Flagget til ${question.country.name}`
              : "Hvilket land er dette flagget fra?"
          }
          key={`${index}-${question.country.code}`}
        />
      </div>

      {isAuto ? (
        <div className="flagQuizAutoProgress" aria-hidden="true">
          <span
            key={`${index}-${question.country.code}`}
            className="flagQuizAutoProgressBar"
            style={{ animationDuration: `${FLAG_QUIZ_AUTO_ADVANCE_MS}ms` }}
          />
        </div>
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}
