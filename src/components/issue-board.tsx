"use client";

import { useEffect, useState } from "react";

import { BoardIssueForm } from "@/components/board-issue-form";
import { FormModal } from "@/components/form-modal";
import { BOARD_COLUMNS } from "@/lib/board";
import type { BoardIssue, BoardIssueStatus } from "@/lib/types";

type IssueBoardProps = {
  initialIssues: BoardIssue[];
  familyMembers: string[];
};

export function IssueBoard({ initialIssues, familyMembers }: IssueBoardProps) {
  const [issues, setIssues] = useState(initialIssues);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

  useEffect(() => {
    if (!confirmation) {
      return;
    }

    const timer = setTimeout(() => {
      setConfirmation(null);
      setIsFormOpen(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [confirmation]);

  function closeForm() {
    setIsFormOpen(false);
    setConfirmation(null);
  }

  async function moveIssue(issueId: string, status: BoardIssueStatus) {
    const previousIssues = issues;
    setIssues((current) =>
      current.map((issue) => (issue.id === issueId ? { ...issue, status } : issue)),
    );
    setUpdatingIssueId(issueId);
    setFeedback(null);

    try {
      const response = await fetch(`/api/issues/${encodeURIComponent(issueId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setIssues(previousIssues);
        setFeedback(result.error || "Kunne ikke flytte oppgaven.");
      }
    } catch {
      setIssues(previousIssues);
      setFeedback("Kunne ikke flytte oppgaven. Prøv igjen.");
    } finally {
      setUpdatingIssueId(null);
    }
  }

  return (
    <section className="issueBoard" aria-labelledby="issue-board-title">
      <div className="issueBoardToolbar">
        <div>
          <span className="kicker">Familiens oppgaver</span>
          <h2 id="issue-board-title">Board</h2>
        </div>
        <button
          className="buttonPrimary"
          type="button"
          onClick={() => setIsFormOpen(true)}
        >
          + Ny oppgave
        </button>
      </div>

      {feedback ? (
        <p className="feedback feedbackError" role="alert">
          {feedback}
        </p>
      ) : null}

      <div className="issueBoardColumns">
        {BOARD_COLUMNS.map((column) => {
          const columnIssues = issues.filter((issue) => issue.status === column.value);

          return (
            <section
              className={`issueBoardColumn issueBoardColumn-${column.value}`}
              aria-labelledby={`board-column-${column.value}`}
              key={column.value}
            >
              <header className="issueBoardColumnHeader">
                <h3 id={`board-column-${column.value}`}>{column.label}</h3>
                <span>{columnIssues.length}</span>
              </header>

              <div className="issueBoardCards">
                {columnIssues.length > 0 ? (
                  columnIssues.map((issue) => (
                    <article className="issueBoardCard" key={issue.id}>
                      <strong>{issue.title || "Uten tittel"}</strong>
                      {issue.text ? <p>{issue.text}</p> : null}
                      {issue.assigned ? (
                        <span className="issueBoardAssigned">Tildelt: {issue.assigned}</span>
                      ) : null}

                      <label className="issueBoardStatus">
                        <span className="srOnly">Flytt {issue.title || "oppgaven"} til</span>
                        <select
                          value={issue.status}
                          disabled={updatingIssueId === issue.id}
                          onChange={(event) =>
                            moveIssue(issue.id, event.target.value as BoardIssueStatus)
                          }
                        >
                          {BOARD_COLUMNS.map((option) => (
                            <option value={option.value} key={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))
                ) : (
                  <p className="issueBoardEmpty">Ingen oppgaver</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <FormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Ny oppgave"
        confirmation={confirmation}
      >
        <BoardIssueForm
          familyMembers={familyMembers}
          onSuccess={(message) => setConfirmation(message)}
        />
      </FormModal>
    </section>
  );
}
