"use client";

import { useEffect, useState } from "react";

import { FormModal } from "@/components/form-modal";
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
  const [payment, setPayment] = useState<{
    memberId: string;
    memberName: string;
    total: number;
  } | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [celebrationName, setCelebrationName] = useState<string | null>(null);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  useEffect(() => {
    if (!celebrationName) {
      return;
    }

    const timer = setTimeout(() => setCelebrationName(null), 3000);
    return () => clearTimeout(timer);
  }, [celebrationName]);

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

  function closePaymentModal() {
    if (isPaying) {
      return;
    }

    setPayment(null);
    setPaymentError(null);
    setCelebrationName(null);
  }

  async function confirmPayment() {
    if (!payment) {
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      const response = await fetch(
        `/api/family-members/${encodeURIComponent(payment.memberId)}/chores`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmed: true }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPaymentError(result.error || "Kunne ikke registrere betalingen.");
        return;
      }

      const paidMemberName = payment.memberName;

      setMembers((current) =>
        current.map((member) =>
          member.id === payment.memberId
            ? {
                ...member,
                chores: member.chores.map((assignment) => ({
                  ...assignment,
                  amount: 0,
                })),
              }
            : member,
        ),
      );
      setPayment(null);
      setCelebrationName(paidMemberName);
    } catch {
      setPaymentError("Kunne ikke registrere betalingen. Prøv igjen.");
    } finally {
      setIsPaying(false);
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
              <div className="weeklyPayMemberActions">
                <strong className="weeklyPayTotal">{currencyFormatter.format(total)}</strong>
                <button
                  type="button"
                  className="weeklyPayButton"
                  disabled={total <= 0}
                  onClick={() => {
                    setPayment({
                      memberId: member.id,
                      memberName: member.name,
                      total,
                    });
                    setPaymentError(null);
                  }}
                >
                  Betal
                </button>
              </div>
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

      <FormModal
        isOpen={Boolean(payment || celebrationName)}
        onClose={closePaymentModal}
        title={celebrationName ? "Ukelønn betalt" : "Bekreft betaling"}
        variant={celebrationName ? "celebration" : "default"}
      >
        {celebrationName ? (
          <div className="weeklyPayCelebration" role="status" aria-live="polite">
            <div className="weeklyPayConfetti" aria-hidden="true">
              <span>●</span>
              <span>◆</span>
              <span>★</span>
              <span>■</span>
              <span>●</span>
              <span>▲</span>
              <span>★</span>
              <span>◆</span>
              <span>■</span>
              <span>●</span>
              <span>▲</span>
              <span>★</span>
            </div>
            <div className="weeklyPayCelebrationMessage">
              <h3>Bra jobba, {celebrationName}!</h3>
              <p>Ukelønnen er betalt.</p>
            </div>
          </div>
        ) : (
          <div className="weeklyPayConfirmation">
            <p>
              En voksen må bekrefte at {payment?.memberName} skal få utbetalt{" "}
              <strong>{currencyFormatter.format(payment?.total || 0)}</strong>.
            </p>
            <p>Etter betalingen blir alle antall satt tilbake til null.</p>

            {paymentError ? (
              <p className="feedback feedbackError" role="alert">
                {paymentError}
              </p>
            ) : null}

            <div className="formActions">
              <button
                type="button"
                className="buttonSecondary"
                disabled={isPaying}
                onClick={closePaymentModal}
              >
                Avbryt
              </button>
              <button
                type="button"
                className="buttonPrimary"
                disabled={isPaying}
                onClick={confirmPayment}
              >
                {isPaying ? "Betaler..." : "Bekreft betaling"}
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </section>
  );
}
