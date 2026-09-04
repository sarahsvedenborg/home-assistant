"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FormModal } from "@/components/form-modal";
import { ShortMessageForm } from "@/components/short-message-form";
import { formatMessageDate, messageRecipientLabel } from "@/lib/messages";
import type { ShortMessage } from "@/lib/types";

export function MessageWidget({
  messages,
  familyMembers,
}: {
  messages: ShortMessage[];
  familyMembers: string[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ShortMessage | null>(
    null,
  );
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [markingMessageId, setMarkingMessageId] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const unreadMessages = messages.filter(
    (message) => !message.isRead && !readMessageIds.has(message.id),
  );

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

  function closeModal() {
    setConfirmation(null);
    setIsOpen(false);
  }

  async function markAsRead(messageId: string) {
    setMarkingMessageId(messageId);
    setReadError(null);

    try {
      const response = await fetch(
        `/api/meldinger/${encodeURIComponent(messageId)}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setReadError(result.error || "Kunne ikke markere meldingen som lest.");
        return;
      }

      setReadMessageIds((current) => new Set(current).add(messageId));
      router.refresh();
    } catch {
      setReadError("Kunne ikke markere meldingen som lest.");
    } finally {
      setMarkingMessageId(null);
    }
  }

  return (
    <>
      <article className="widget wMessages accentCool">
        <div className="widgetHead">
          <h2 className="widgetTitle">
            <span aria-hidden="true">💬</span> Meldinger
          </h2>
          <div className="widgetMessageActions">
            <Link href="/meldinger" className="widgetTextLink">
              Se alle
            </Link>
            <button type="button" className="widgetAddButton" onClick={() => setIsOpen(true)}>
              Ny melding
            </button>
          </div>
        </div>

        {unreadMessages.length === 0 ? (
          <p className="widgetEmpty">Ingen meldinger akkurat nå.</p>
        ) : (
          <ul className="widgetList">
            {unreadMessages.slice(0, 4).map((message) => (
              <li key={message.id} className="widgetItem messageItem">
                <div className="messageItemRow">
                  <button
                    type="button"
                    className="messageItemButton"
                    aria-label={`Vis hele meldingen: ${message.text}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    {message.createdAt ? (
                      <time className="messageDate" dateTime={message.createdAt}>
                        {formatMessageDate(message.createdAt)}
                      </time>
                    ) : null}
                    <strong>{message.text}</strong>
                    {message.recipients.length > 0 ? (
                      <span className="itemMeta">
                        Til: {messageRecipientLabel(message.recipients)}
                      </span>
                    ) : null}
                    <span className="messageDetailsIndicator" aria-hidden="true">
                      ⓘ
                    </span>
                  </button>
                  <button
                    type="button"
                    className="messageReadButton"
                    disabled={markingMessageId === message.id}
                    onClick={() => markAsRead(message.id)}
                  >
                    {markingMessageId === message.id ? "Lagrer…" : "Lest"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {readError ? (
          <p className="feedback feedbackError" role="alert">
            {readError}
          </p>
        ) : null}
      </article>

      <FormModal
        isOpen={isOpen}
        onClose={closeModal}
        title="Ny melding"
        confirmation={confirmation}
      >
        <ShortMessageForm
          familyMembers={familyMembers}
          onSuccess={(message) => setConfirmation(message)}
        />
      </FormModal>

      <FormModal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title="Melding"
      >
        {selectedMessage ? (
          <div className="messageDetails">
            <dl>
              <div>
                <dt>Dato</dt>
                <dd>
                  {selectedMessage.createdAt
                    ? formatMessageDate(selectedMessage.createdAt)
                    : "Ikke angitt"}
                </dd>
              </div>
              <div>
                <dt>Fra</dt>
                <dd>
                  {selectedMessage.sender
                    ? messageRecipientLabel([selectedMessage.sender])
                    : "Ikke angitt"}
                </dd>
              </div>
              <div>
                <dt>Til</dt>
                <dd>
                  {selectedMessage.recipients.length > 0
                    ? messageRecipientLabel(selectedMessage.recipients)
                    : "Ingen bestemt mottaker"}
                </dd>
              </div>
            </dl>
            <div className="messageDetailsText">
              <h3>Melding</h3>
              <p>{selectedMessage.text}</p>
            </div>
          </div>
        ) : null}
      </FormModal>
    </>
  );
}
