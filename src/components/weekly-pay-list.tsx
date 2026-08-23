"use client";

import { useEffect, useState } from "react";

import type { FamilyMember } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function WeeklyPayList({ initialMembers }: { initialMembers: FamilyMember[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [pendingAssignment, setPendingAssignment] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  async function changeAmount(memberId: string, assignmentKey: string, delta: -1 | 1) {
    const pendingKey = `${memberId}:${assignmentKey}`;
    const previousMembers = members;

    setMembers((current) =>
      current.map((member) =>
        member.id === memberId
          ? {
              ...member,
              chores: member.chores.map((assignment) =>
                assignment.key === assignmentKey
                  ? {
                      ...assignment,
                      amount: Math.max(0, assignment.amount + delta),
                    }
                  : assignment,
              ),
            }
          : member,
      ),
    );
    setPendingAssignment(pendingKey);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/family-members/${encodeURIComponent(memberId)}/chores/${encodeURIComponent(assignmentKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta }),
        },
      );
      const result = (await response.json()) as { amount?: number; error?: string };

      if (!response.ok || typeof result.amount !== "number") {
        setMembers(previousMembers);
        setFeedback(result.error || "Kunne ikke oppdatere oppgaven.");
        return;
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: member.chores.map((assignment) =>
                  assignment.key === assignmentKey
                    ? { ...assignment, amount: result.amount! }
                    : assignment,
                ),
              }
            : member,
        ),
      );
    } catch {
      setMembers(previousMembers);
      setFeedback("Kunne ikke oppdatere oppgaven. Prøv igjen.");
    } finally {
      setPendingAssignment(null);
    }
  }

  return (
    <section className="weeklyPayMembers" aria-label="Ukelønn per familiemedlem">
      {feedback ? (
        <p className="feedback feedbackError" role="alert">
          {feedback}
        </p>
      ) : null}

      {members.map((member) => {
        const total = member.chores.reduce(
          (sum, assignment) => sum + assignment.chore.pay * assignment.amount,
          0,
        );

        return (
          <article className="weeklyPayMember" key={member.id}>
            <header className="weeklyPayMemberHeader">
              <div className="weeklyPayMemberName">
                <span aria-hidden="true">{member.emoji || "👤"}</span>
                <h2>{member.name}</h2>
              </div>
              <strong className="weeklyPayTotal">{currencyFormatter.format(total)}</strong>
            </header>

            {member.chores.length > 0 ? (
              <ul className="weeklyPayChores">
                {member.chores.map((assignment) => {
                  const pendingKey = `${member.id}:${assignment.key}`;
                  const isPending = pendingAssignment === pendingKey;

                  return (
                    <li className="weeklyPayChore" key={assignment.key}>
                      <div className="weeklyPayChoreCopy">
                        <strong>{assignment.chore.title}</strong>
                        {assignment.chore.text ? <p>{assignment.chore.text}</p> : null}
                        <span>{currencyFormatter.format(assignment.chore.pay)} per gang</span>
                      </div>

                      <div className="weeklyPayCounter" aria-label="Antall utført">
                        <button
                          type="button"
                          aria-label={`Trekk fra én ${assignment.chore.title}`}
                          disabled={isPending || assignment.amount === 0}
                          onClick={() => changeAmount(member.id, assignment.key, -1)}
                        >
                          −
                        </button>
                        <strong aria-live="polite">{assignment.amount}</strong>
                        <button
                          type="button"
                          aria-label={`Legg til én ${assignment.chore.title}`}
                          disabled={isPending}
                          onClick={() => changeAmount(member.id, assignment.key, 1)}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="weeklyPayEmpty">Ingen oppgaver er lagt til for {member.name}.</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
