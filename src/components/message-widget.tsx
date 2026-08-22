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
    </>
  );
}
