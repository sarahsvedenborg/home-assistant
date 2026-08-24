"use client";

import Link from "next/link";
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
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ShortMessage | null>(
    null,
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

        {messages.length === 0 ? (
          <p className="widgetEmpty">Ingen meldinger akkurat nå.</p>
        ) : (
          <ul className="widgetList">
            {messages.slice(0, 4).map((message) => (
              <li key={message.id} className="widgetItem messageItem">
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
              </li>
            ))}
          </ul>
        )}
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
